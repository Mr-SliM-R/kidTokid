USE KidToKid;
GO

-- Deliveries
IF OBJECT_ID('dbo.delivery','U') IS NULL
BEGIN
  CREATE TABLE dbo.delivery (
    delivery_id   UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    order_id      UNIQUEIDENTIFIER NOT NULL
      REFERENCES dbo.[order](order_id),
    deliverer_id  UNIQUEIDENTIFIER NULL,            -- assign later (NULL = unassigned)
    status        NVARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending|in_progress|delivered|canceled|failed
    required_comment NVARCHAR(500) NULL,            -- required when finalizing (delivered/canceled/failed)
    created_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;
GO

-- Trigger to auto-update updated_at
IF OBJECT_ID('dbo.tr_delivery_updated', 'TR') IS NULL
EXEC('CREATE TRIGGER dbo.tr_delivery_updated ON dbo.delivery
AFTER UPDATE AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET updated_at = SYSUTCDATETIME()
  FROM dbo.delivery d
  JOIN inserted i ON i.delivery_id = d.delivery_id;
END');
GO
