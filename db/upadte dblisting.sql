UPDATE dbo.listing
SET category = CASE
  WHEN title LIKE '%Jacket%' OR title LIKE '%Boots%' THEN 'clothing'
  WHEN title LIKE '%Stroller%' THEN 'mobility'
  WHEN title LIKE '%Train%' THEN 'toys'
  ELSE COALESCE(category,'toys')
END
WHERE category IS NULL OR category NOT IN ('clothing','furniture','hygiene','feeding','mobility','safety','toys','health');
