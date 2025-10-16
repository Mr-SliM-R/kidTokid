USE KidToKid;
GO

-- Buyer table (dev-only, simple)
IF OBJECT_ID('dbo.app_user','U') IS NULL
BEGIN
  CREATE TABLE dbo.app_user (
    user_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) UNIQUE NOT NULL,
    display_name NVARCHAR(120) NULL,
    role NVARCHAR(20) NOT NULL DEFAULT 'buyer',
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- Basket (one-off items → qty = 1)
IF OBJECT_ID('dbo.basket_item','U') IS NULL
BEGIN
  CREATE TABLE dbo.basket_item (
    user_id UNIQUEIDENTIFIER NOT NULL,
    listing_id UNIQUEIDENTIFIER NOT NULL
      REFERENCES dbo.listing(listing_id),
    added_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_basket PRIMARY KEY (user_id, listing_id)
  );
END
GO

-- Orders
IF OBJECT_ID('dbo.[order]','U') IS NULL
BEGIN
  CREATE TABLE dbo.[order] (
    order_id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    buyer_id UNIQUEIDENTIFIER NOT NULL,
    total_cents INT NOT NULL DEFAULT 0,
    status NVARCHAR(20) NOT NULL DEFAULT 'confirmed', -- we confirm on creation
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.order_item','U') IS NULL
BEGIN
  CREATE TABLE dbo.order_item (
    order_id UNIQUEIDENTIFIER NOT NULL
      REFERENCES dbo.[order](order_id),
    listing_id UNIQUEIDENTIFIER NOT NULL
      REFERENCES dbo.listing(listing_id),
    price_cents INT NOT NULL DEFAULT 0,
    CONSTRAINT PK_order_item PRIMARY KEY (order_id, listing_id)
  );
END
GO

-- Seed one dev buyer (use this in local.settings.json)
IF NOT EXISTS (SELECT 1 FROM dbo.app_user WHERE email = 'dev@kidtokid.local')
  INSERT INTO dbo.app_user (email, display_name) VALUES (N'dev@kidtokid.local', N'Dev Buyer');

SELECT TOP 1 user_id AS DEV_BUYER_ID FROM dbo.app_user WHERE email = 'dev@kidtokid.local';
