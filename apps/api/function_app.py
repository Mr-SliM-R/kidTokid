import os
import json
import logging
from uuid import UUID
import math
import pyodbc
import azure.functions as func

# ---------- App ----------
app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# ---------- Helpers ----------
def _conn():
    conn_str = os.getenv("SQL_CONN_STR")
    if not conn_str:
        raise RuntimeError("Missing SQL_CONN_STR")
    return pyodbc.connect(conn_str)

def _buyer_id() -> str:
    val = os.getenv("DEV_BUYER_ID")
    if not val:
        raise RuntimeError("Missing DEV_BUYER_ID")
    return str(UUID(val))  # validate GUID

# ---------- Health ----------
@app.route(route="ping", methods=["GET"])
def ping(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse("pong")

# ---------- Listings ----------
@app.route(route="listings", methods=["GET"])
def get_listings(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("GET /api/listings")
    try:
        with _conn() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT TOP 12
                    listing_id, title, price_cents, city,
                    CASE WHEN price_cents IS NULL OR price_cents = 0 THEN 1 ELSE 0 END AS is_free
                FROM dbo.listing
                WHERE is_active = 1
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()
            data = [
                {
                    "listing_id": str(r[0]),
                    "title": r[1],
                    "price_cents": r[2],
                    "city": r[3],
                    "is_free": int(r[4]),
                }
                for r in rows
            ]
            return func.HttpResponse(json.dumps(data), mimetype="application/json")
    except Exception as e:
        logging.exception(e)
        return func.HttpResponse(f"Error: {e}", status_code=500)

# ---------- Basket ----------
@app.route(route="basket", methods=["GET"])
def get_basket(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("GET /api/basket")
    try:
        with _conn() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT bi.listing_id, l.title, l.price_cents, l.city
                FROM dbo.basket_item bi
                JOIN dbo.listing l ON l.listing_id = bi.listing_id
                WHERE bi.user_id = ?
            """, _buyer_id())
            rows = cur.fetchall()
            data = [
                {"listing_id": str(r[0]), "title": r[1], "price_cents": r[2], "city": r[3]}
                for r in rows
            ]
            return func.HttpResponse(json.dumps(data), mimetype="application/json")
    except Exception as e:
        logging.exception(e)
        return func.HttpResponse(f"Error: {e}", status_code=500)

@app.route(route="basket/{listingId}", methods=["POST"])
def add_to_basket(req: func.HttpRequest) -> func.HttpResponse:
    listing_id = req.route_params.get("listingId")
    logging.info("POST /api/basket/%s", listing_id)
    try:
        with _conn() as conn:
            cur = conn.cursor()
            # Only active items can be added
            cur.execute("SELECT 1 FROM dbo.listing WHERE listing_id = ? AND is_active = 1", listing_id)
            if not cur.fetchone():
                return func.HttpResponse("Listing not available", status_code=409)

            # Upsert behavior
            cur.execute("""
                MERGE dbo.basket_item AS t
                USING (SELECT CAST(? AS UNIQUEIDENTIFIER) AS user_id,
                              CAST(? AS UNIQUEIDENTIFIER) AS listing_id) AS s
                ON t.user_id = s.user_id AND t.listing_id = s.listing_id
                WHEN NOT MATCHED THEN
                  INSERT (user_id, listing_id) VALUES (s.user_id, s.listing_id);
            """, _buyer_id(), listing_id)
            conn.commit()
            return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.exception(e)
        return func.HttpResponse(f"Error: {e}", status_code=500)

@app.route(route="basket/{listingId}", methods=["DELETE"])
def remove_from_basket(req: func.HttpRequest) -> func.HttpResponse:
    listing_id = req.route_params.get("listingId")
    logging.info("DELETE /api/basket/%s", listing_id)
    try:
        with _conn() as conn:
            cur = conn.cursor()
            cur.execute(
                "DELETE FROM dbo.basket_item WHERE user_id = ? AND listing_id = ?",
                _buyer_id(), listing_id
            )
            conn.commit()
            return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.exception(e)
        return func.HttpResponse(f"Error: {e}", status_code=500)

# ---------- Orders ----------
@app.route(route="orders/confirm", methods=["POST"])
def confirm_order(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("POST /api/orders/confirm")
    buyer = _buyer_id()
    try:
        with _conn() as conn:
            cur = conn.cursor()

            # Gather basket items still active
            cur.execute("""
                SELECT l.listing_id, l.price_cents
                FROM dbo.basket_item bi
                JOIN dbo.listing l ON l.listing_id = bi.listing_id
                WHERE bi.user_id = ? AND l.is_active = 1
            """, buyer)
            items = cur.fetchall()
            if not items:
                return func.HttpResponse("Basket empty or items unavailable", status_code=409)

            total = sum((r[1] or 0) for r in items)

            # Begin transaction
            cur.execute("BEGIN TRAN")

            # Create order
            cur.execute("""
                INSERT INTO dbo.[order] (buyer_id, total_cents, status)
                OUTPUT inserted.order_id
                VALUES (?, ?, 'confirmed')
            """, buyer, total)
            order_id = str(cur.fetchone()[0])

            # Insert order items
            for listing_id, price in items:
                cur.execute("""
                    INSERT INTO dbo.order_item (order_id, listing_id, price_cents)
                    VALUES (?, ?, ?)
                """, order_id, listing_id, price or 0)

            # Mark listings inactive & clear basket
            id_list = [str(i[0]) for i in items]
            cur.execute(
                "UPDATE dbo.listing SET is_active = 0 WHERE listing_id IN (" +
                ",".join("?" for _ in id_list) + ")",
                id_list
            )
            cur.execute("DELETE FROM dbo.basket_item WHERE user_id = ?", buyer)

            # Commit
            cur.execute("COMMIT")
            conn.commit()

            return func.HttpResponse(
                json.dumps({"order_id": order_id, "total_cents": total}),
                mimetype="application/json",
                status_code=201
            )
    except Exception as e:
        logging.exception(e)
        try:
            cur.execute("ROLLBACK")
        except Exception:
            pass
        return func.HttpResponse(f"Error: {e}", status_code=500)

# ---------- Favorites ----------
@app.route(route="favorites", methods=["GET"])
def get_favorites(req: func.HttpRequest) -> func.HttpResponse:
    try:
        with _conn() as c:
            cur = c.cursor()
            cur.execute("""
              SELECT f.listing_id, l.title, l.price_cents, l.city
              FROM dbo.favorite f
              JOIN dbo.listing l ON l.listing_id = f.listing_id
              WHERE f.user_id = ? AND l.is_active = 1
              ORDER BY f.created_at DESC
            """, _buyer_id())
            rows = cur.fetchall()
            data = [{"listing_id": str(r[0]), "title": r[1], "price_cents": r[2], "city": r[3]} for r in rows]
            return func.HttpResponse(json.dumps(data), mimetype="application/json")
    except Exception as e:
        logging.exception(e); return func.HttpResponse(f"Error: {e}", status_code=500)

@app.route(route="favorites/{listingId}", methods=["POST"])
def add_favorite(req: func.HttpRequest) -> func.HttpResponse:
    lid = req.route_params["listingId"]
    try:
        with _conn() as c:
            cur = c.cursor()
            cur.execute("""
              MERGE dbo.favorite AS t
              USING (SELECT CAST(? AS UNIQUEIDENTIFIER) uid, CAST(? AS UNIQUEIDENTIFIER) lid) AS s
              ON t.user_id=s.uid AND t.listing_id=s.lid
              WHEN NOT MATCHED THEN INSERT (user_id, listing_id) VALUES (s.uid, s.lid);
            """, _buyer_id(), lid)
            c.commit()
            return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.exception(e); return func.HttpResponse(f"Error: {e}", status_code=500)

@app.route(route="favorites/{listingId}", methods=["DELETE"])
def remove_favorite(req: func.HttpRequest) -> func.HttpResponse:
    lid = req.route_params["listingId"]
    try:
        with _conn() as c:
            cur = c.cursor()
            cur.execute("DELETE FROM dbo.favorite WHERE user_id=? AND listing_id=?", _buyer_id(), lid)
            c.commit()
            return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.exception(e); return func.HttpResponse(f"Error: {e}", status_code=500)


def _build_listing_filter(q: dict):
    # Build WHERE clause + params from whitelisted fields
    clauses, params = ["l.is_active = 1"], []
    if cat := q.get("category"):
        clauses.append("l.category = ?"); params.append(cat)
    if sz := q.get("size"):
        clauses.append("l.size = ?"); params.append(sz)
    if cond := q.get("condition"):
        clauses.append("l.[condition] = ?"); params.append(cond)
    if city := q.get("city"):
        clauses.append("l.city = ?"); params.append(city)
    # NOTE: For radius search you'd need Haversine with stored lat/lng; skipping for MVP
    where_sql = " AND ".join(clauses)
    return where_sql, params

@app.route(route="saved-searches", methods=["GET"])
def list_saved_searches(req: func.HttpRequest) -> func.HttpResponse:
    try:
        with _conn() as c:
            cur = c.cursor()
            cur.execute("""
              SELECT saved_search_id, name, query_json, is_active, created_at
              FROM dbo.saved_search
              WHERE user_id = ?
              ORDER BY created_at DESC
            """, _buyer_id())
            rows = cur.fetchall()
            data = [{
                "saved_search_id": str(r[0]),
                "name": r[1],
                "query": json.loads(r[2]),
                "is_active": int(r[3]),
                "created_at": r[4].isoformat(),
            } for r in rows]
            return func.HttpResponse(json.dumps(data), mimetype="application/json")
    except Exception as e:
        logging.exception(e); return func.HttpResponse(f"Error: {e}", status_code=500)

@app.route(route="saved-searches", methods=["POST"])
def create_saved_search(req: func.HttpRequest) -> func.HttpResponse:
    try:
        body = req.get_json() if req.get_body() else {}
        name = body.get("name") or "My search"
        # Only whitelist expected keys
        q = {k: body.get(k) for k in ["category","size","condition","city","lat","lng","radiusKm"] if body.get(k) is not None}
        q_json = json.dumps(q)
        with _conn() as c:
            cur = c.cursor()
            cur.execute("""
              INSERT INTO dbo.saved_search (user_id, name, query_json, is_active)
              OUTPUT inserted.saved_search_id
              VALUES (?, ?, ?, 1)
            """, _buyer_id(), name, q_json)
            sid = str(cur.fetchone()[0])
            c.commit()
            return func.HttpResponse(json.dumps({"saved_search_id": sid}), mimetype="application/json", status_code=201)
    except Exception as e:
        logging.exception(e); return func.HttpResponse(f"Error: {e}", status_code=500)

@app.route(route="saved-searches/{sid}/run", methods=["POST"])
def run_saved_search(req: func.HttpRequest) -> func.HttpResponse:
    sid = req.route_params["sid"]
    try:
        with _conn() as c:
            cur = c.cursor()
            cur.execute("SELECT query_json FROM dbo.saved_search WHERE saved_search_id = ? AND user_id = ?", sid, _buyer_id())
            row = cur.fetchone()
            if not row:
                return func.HttpResponse("Not found", status_code=404)
            q = json.loads(row[0])

            where_sql, params = _build_listing_filter(q)
            sql = f"""
              SELECT TOP 24 l.listing_id, l.title, l.price_cents, l.city,
                     CASE WHEN l.price_cents IS NULL OR l.price_cents=0 THEN 1 ELSE 0 END AS is_free
              FROM dbo.listing l
              WHERE {where_sql}
              ORDER BY l.created_at DESC
            """
            cur.execute(sql, *params)
            rows = cur.fetchall()
            data = [{"listing_id": str(r[0]), "title": r[1], "price_cents": r[2], "city": r[3], "is_free": int(r[4])} for r in rows]
            return func.HttpResponse(json.dumps({"results": data, "query": q}), mimetype="application/json")
    except Exception as e:
        logging.exception(e); return func.HttpResponse(f"Error: {e}", status_code=500)

@app.route(route="saved-searches/{sid}/toggle", methods=["POST"])
def toggle_saved_search(req: func.HttpRequest) -> func.HttpResponse:
    sid = req.route_params["sid"]
    try:
        with _conn() as c:
            cur = c.cursor()
            # flip is_active (1→0 or 0→1)
            cur.execute("""
              UPDATE dbo.saved_search
                SET is_active = CASE WHEN is_active=1 THEN 0 ELSE 1 END
              WHERE saved_search_id=? AND user_id=?
            """, sid, _buyer_id())
            if cur.rowcount == 0:
                return func.HttpResponse("Not found", status_code=404)
            c.commit()
            return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.exception(e); return func.HttpResponse(f"Error: {e}", status_code=500)
