USE KidToKid;
GO

-- Favorites (many-to-many: user ↔ listing)
IF OBJECT_ID('dbo.favorite','U') IS NULL
BEGIN
  CREATE TABLE dbo.favorite (
    user_id    UNIQUEIDENTIFIER NOT NULL,
    listing_id UNIQUEIDENTIFIER NOT NULL REFERENCES dbo.listing(listing_id),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_favorite PRIMARY KEY (user_id, listing_id)
  );
END
GO

-- Saved searches (store filters as JSON; we’ll parse in API)
IF OBJECT_ID('dbo.saved_search','U') IS NULL
BEGIN
  CREATE TABLE dbo.saved_search (
    saved_search_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    user_id   UNIQUEIDENTIFIER NOT NULL,
    name      NVARCHAR(120) NOT NULL,
    query_json NVARCHAR(MAX) NOT NULL,   -- {category,size,condition,city,lat,lng,radiusKm}
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- Convenience: ensure our dev buyer exists
IF NOT EXISTS (SELECT 1 FROM dbo.app_user WHERE email='dev@kidtokid.local')
  INSERT INTO dbo.app_user (email, display_name) VALUES (N'dev@kidtokid.local', N'Dev Buyer');
GO
