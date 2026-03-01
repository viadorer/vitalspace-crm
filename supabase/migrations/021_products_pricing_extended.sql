-- ============================================================================
-- Rozšíření produktů o DPH, nákupní ceny a množstevní slevy
-- ============================================================================

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 21.00,
ADD COLUMN IF NOT EXISTS purchase_price_czk DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS quantity_discounts JSONB DEFAULT '[]';

COMMENT ON COLUMN products.vat_rate IS 'Sazba DPH v procentech (21, 15, 12, 0)';
COMMENT ON COLUMN products.purchase_price_czk IS 'Nákupní cena bez DPH';
COMMENT ON COLUMN products.quantity_discounts IS 'Množstevní slevy - array objektů [{min_quantity: 5, discount_percent: 10}, ...]';

-- Příklad struktury quantity_discounts:
-- [
--   {"min_quantity": 5, "discount_percent": 5},
--   {"min_quantity": 10, "discount_percent": 10},
--   {"min_quantity": 20, "discount_percent": 15}
-- ]
