-- 1) Create DB (if not exists)
IF DB_ID('KidToKid') IS NULL
BEGIN
  CREATE DATABASE KidToKid;
END
GO
USE KidToKid;
GO

-- 2) Core table: listing
IF OBJECT_ID('dbo.listing','U') IS NULL
BEGIN
  CREATE TABLE dbo.listing (
    listing_id UNIQUEIDENTIFIER NOT NULL 
      CONSTRAINT PK_listing PRIMARY KEY DEFAULT NEWID(),
    seller_id   UNIQUEIDENTIFIER NULL,                 -- later FK to app_user
    title       NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    category    NVARCHAR(50) NULL,                     -- clothes, toys, gear...
    size        NVARCHAR(30) NULL,
    condition   NVARCHAR(20) NULL,                     -- new, like-new, good, fair
    price_cents INT NULL,                              -- NULL or 0 => free
    city        NVARCHAR(80) NULL,
    country     NVARCHAR(80) NULL,
    latitude    DECIMAL(9,6) NULL,
    longitude   DECIMAL(9,6) NULL,
    is_active   BIT NOT NULL DEFAULT 1,
    created_at  DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- 3) Optional images table (safe to add now)
IF OBJECT_ID('dbo.listing_image','U') IS NULL
BEGIN
  CREATE TABLE dbo.listing_image (
    image_id   UNIQUEIDENTIFIER NOT NULL 
      CONSTRAINT PK_listing_image PRIMARY KEY DEFAULT NEWID(),
    listing_id UNIQUEIDENTIFIER NOT NULL 
      CONSTRAINT FK_listing_image_listing REFERENCES dbo.listing(listing_id),
    blob_url   NVARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0
  );
END
GO

-- 4) Seed a few listings
INSERT INTO dbo.listing (title, category, size, [condition], price_cents, city, country)
VALUES
(N'Winter Jacket 3–4y', N'clothes', N'3-4y', N'good', 1500, N'Lisbon', N'Portugal'),
(N'Wooden Train Set',   N'toys',    NULL,    N'like-new',  0,    N'Lisbon', N'Portugal'),
(N'Baby Stroller',      N'gear',    NULL,    N'good',   7500,   N'Porto',  N'Portugal'),
(N'Boots 24–36m',       N'clothes', N'24-36m', N'fair',  500,   N'Faro',   N'Portugal');
GO

-- 5) Check
SELECT TOP 10 listing_id, title, price_cents, city, is_active, created_at
FROM dbo.listing
ORDER BY created_at DESC;
