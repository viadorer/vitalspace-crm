-- ============================================================================
-- VITALSPACE - Rozšíření company_segments o sales playbook
-- ============================================================================
-- Přidání detailních informací pro každý segment (pain points, produkty, 
-- argumenty, rozhodovatelé, průměrný deal, doba uzavření)
-- ============================================================================

-- Přidání nových sloupců do company_segments
ALTER TABLE company_segments
ADD COLUMN recommended_products TEXT[], -- Pole doporučených produktů (SKU nebo názvy)
ADD COLUMN average_deal_min_czk INTEGER, -- Minimální hodnota průměrného dealu
ADD COLUMN average_deal_max_czk INTEGER, -- Maximální hodnota průměrného dealu
ADD COLUMN closing_time_months_min INTEGER, -- Minimální doba uzavření v měsících
ADD COLUMN closing_time_months_max INTEGER, -- Maximální doba uzavření v měsících
ADD COLUMN decision_makers TEXT[], -- Typické pozice rozhodovatelů
ADD COLUMN key_arguments TEXT[]; -- Klíčové prodejní argumenty

-- Komentáře k novým sloupcům
COMMENT ON COLUMN company_segments.recommended_products IS 'Doporučené produkty pro tento segment';
COMMENT ON COLUMN company_segments.average_deal_min_czk IS 'Minimální hodnota průměrného dealu v Kč';
COMMENT ON COLUMN company_segments.average_deal_max_czk IS 'Maximální hodnota průměrného dealu v Kč';
COMMENT ON COLUMN company_segments.closing_time_months_min IS 'Minimální doba uzavření dealu v měsících';
COMMENT ON COLUMN company_segments.closing_time_months_max IS 'Maximální doba uzavření dealu v měsících';
COMMENT ON COLUMN company_segments.decision_makers IS 'Typické pozice rozhodovatelů v tomto segmentu';
COMMENT ON COLUMN company_segments.key_arguments IS 'Klíčové prodejní argumenty pro tento segment';

-- Aktualizace existujících segmentů s detailními daty
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 500000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Ředitel školy', 'Zástupce ředitele', 'Ekonom'],
  key_arguments = ARRAY['Snížení absence dětí', 'Bezpečná dezinfekce hraček', 'Certifikace pro rodiče']
WHERE name = 'Školství a školky';

UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 1000000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Facility Manager', 'HR ředitel', 'CEO'],
  key_arguments = ARRAY['ROI přes produktivitu', 'Snížení sick days', 'Sick building syndrom', 'Lepší pracovní prostředí']
WHERE name = 'Kanceláře a IT centra';

UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 300000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Primář', 'Technický náměstek', 'Hygienička'],
  key_arguments = ARRAY['Legislativní požadavky', 'Certifikace', 'Bezpečnostní protokoly', 'Ochrana pacientů']
WHERE name = 'Zdravotnictví';

UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 250000,
  average_deal_max_czk = 2000000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Výrobní ředitel', 'BOZP technik', 'Vedoucí provozu'],
  key_arguments = ARRAY['VOC z výroby', 'Kalkulace dle m³', 'Ochrana produktů', 'BOZP compliance']
WHERE name = 'Průmysl a sklady';

UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 800000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Ředitel hotelu', 'Provozní manažer', 'Revenue manager'],
  key_arguments = ARRAY['Lepší recenze = vyšší occupancy', 'Ozonově čištěný pokoj jako USP', 'Kvalita vzduchu pro hosty', 'Booking.com rating']
WHERE name = 'Hotely a wellness';

UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Majitel fitness', 'Vedoucí provozu', 'Správce'],
  key_arguments = ARRAY['Zápachy v šatnách', 'Dezinfekce přístrojů', 'Hygienické standardy', 'Spokojenost členů']
WHERE name = 'Sport a fitness';
