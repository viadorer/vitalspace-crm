-- ============================================================================
-- VITALSPACE - Seed data pro testování
-- ============================================================================

-- Nejdřív získáme ID segmentů
DO $$
DECLARE
  segment_skoly_id UUID;
  segment_nemocnice_id UUID;
  segment_kancelare_id UUID;
  segment_hotely_id UUID;
  segment_fitness_id UUID;
BEGIN
  -- Získání ID segmentů
  SELECT id INTO segment_skoly_id FROM company_segments WHERE name = 'Základní školy' LIMIT 1;
  SELECT id INTO segment_nemocnice_id FROM company_segments WHERE name = 'Nemocnice a kliniky' LIMIT 1;
  SELECT id INTO segment_kancelare_id FROM company_segments WHERE name = 'Kanceláře a coworkingová centra' LIMIT 1;
  SELECT id INTO segment_hotely_id FROM company_segments WHERE name = 'Hotely' LIMIT 1;
  SELECT id INTO segment_fitness_id FROM company_segments WHERE name = 'Fitness centra a posilovny' LIMIT 1;

  -- PROSPEKTY
  INSERT INTO prospects (company_name, segment_id, city, region, status, priority, source, notes) VALUES
  ('ZŠ Lochotín', segment_skoly_id, 'Plzeň', 'Plzeňský kraj', 'not_contacted', 3, 'Web', 'Ředitelka projevila zájem o Clean Up do tříd'),
  ('Fakultní nemocnice Plzeň', segment_nemocnice_id, 'Plzeň', 'Plzeňský kraj', 'contacted', 3, 'Doporučení', 'Jednání s technickým náměstkem - potřeba certifikace'),
  ('Hotel Marriott', segment_hotely_id, 'Praha', 'Praha', 'meeting_scheduled', 2, 'Cold call', 'Schůzka domluvena na příští týden'),
  ('Fitness World', segment_fitness_id, 'Brno', 'Ostatní', 'qualified', 2, 'Web', 'Kvalifikováno - připraveno k vytvoření dealu'),
  ('Impact Hub', segment_kancelare_id, 'Praha', 'Praha', 'not_contacted', 1, 'LinkedIn', 'Coworking s 200+ členy');

  -- KLIENTI (konvertovaní prospekti)
  INSERT INTO clients (company_name, type, ico, dic, contact_person, email, phone) VALUES
  ('ZŠ Komenského', 'B2B', '12345678', 'CZ12345678', 'Mgr. Eva Svobodová', 'svobodova@zskomenskeho.cz', '+420 777 111 222'),
  ('Wellness Hotel Aurora', 'B2B', '87654321', 'CZ87654321', 'Ing. Pavel Novák', 'novak@aurora.cz', '+420 777 333 444');

END $$;

-- DEALY (s pevnými ID pro snadnější testování)
DO $$
DECLARE
  client_skola_id UUID;
  client_hotel_id UUID;
  product_cleanup_id UUID;
  product_proiplus_id UUID;
  product_cleanbox_id UUID;
  deal1_id UUID := gen_random_uuid();
  deal2_id UUID := gen_random_uuid();
BEGIN
  -- Získání ID klientů a produktů
  SELECT id INTO client_skola_id FROM clients WHERE company_name = 'ZŠ Komenského' LIMIT 1;
  SELECT id INTO client_hotel_id FROM clients WHERE company_name = 'Wellness Hotel Aurora' LIMIT 1;
  SELECT id INTO product_cleanup_id FROM products WHERE name = 'Clean Up' LIMIT 1;
  SELECT id INTO product_proiplus_id FROM products WHERE name = 'PRO I PLUS' LIMIT 1;
  SELECT id INTO product_cleanbox_id FROM products WHERE name = 'Clean Box DRY' LIMIT 1;

  -- Deal 1: ZŠ Komenského - rozšíření
  INSERT INTO deals (id, client_id, title, stage, total_value_czk, final_price_czk, estimated_close_date)
  VALUES (
    deal1_id,
    client_skola_id,
    'Rozšíření do dalších tříd',
    'proposal_sent',
    257000,
    257000,
    CURRENT_DATE + INTERVAL '30 days'
  );

  -- Deal items pro Deal 1
  INSERT INTO deal_items (deal_id, product_id, quantity, unit_price_czk, target_room)
  VALUES
  (deal1_id, product_cleanup_id, 5, 45000, 'Učebny 1-5'),
  (deal1_id, product_cleanbox_id, 1, 32000, 'Sborovna');

  -- Deal 2: Wellness Hotel Aurora - údržba
  INSERT INTO deals (id, client_id, title, stage, total_value_czk, final_price_czk, estimated_close_date)
  VALUES (
    deal2_id,
    client_hotel_id,
    'Roční servisní smlouva',
    'negotiation',
    22000,
    22000,
    CURRENT_DATE + INTERVAL '14 days'
  );

  -- Deal items pro Deal 2
  INSERT INTO deal_items (deal_id, product_id, quantity, unit_price_czk, installation_notes)
  VALUES
  (deal2_id, (SELECT id FROM products WHERE name = 'Technický audit' LIMIT 1), 4, 3500, 'Audit 4x ročně'),
  (deal2_id, (SELECT id FROM products WHERE name = 'Certifikace prostoru' LIMIT 1), 4, 2000, 'Certifikace po každém auditu');

END $$;

-- KONTAKTY pro prospekty
DO $$
DECLARE
  prospect_skoly_id UUID;
  prospect_nemocnice_id UUID;
  prospect_hotel_id UUID;
BEGIN
  SELECT id INTO prospect_skoly_id FROM prospects WHERE company_name = 'ZŠ Lochotín' LIMIT 1;
  SELECT id INTO prospect_nemocnice_id FROM prospects WHERE company_name = 'Fakultní nemocnice Plzeň' LIMIT 1;
  SELECT id INTO prospect_hotel_id FROM prospects WHERE company_name = 'Hotel Marriott' LIMIT 1;

  INSERT INTO prospect_contacts (prospect_id, first_name, last_name, email, phone, position, is_decision_maker) VALUES
  (prospect_skoly_id, 'Jana', 'Nováková', 'novakova@zslochotin.cz', '+420 777 123 456', 'Ředitelka', true),
  (prospect_nemocnice_id, 'MUDr. Petr', 'Svoboda', 'svoboda@fnplzen.cz', '+420 777 234 567', 'Technický náměstek', true),
  (prospect_hotel_id, 'Martin', 'Dvořák', 'dvorak@marriott.com', '+420 777 345 678', 'Provozní ředitel', true);

END $$;

-- Výpis pro kontrolu
SELECT 
  'Prospekty' as typ,
  COUNT(*) as pocet
FROM prospects
UNION ALL
SELECT 
  'Klienti' as typ,
  COUNT(*) as pocet
FROM clients
UNION ALL
SELECT 
  'Dealy' as typ,
  COUNT(*) as pocet
FROM deals
UNION ALL
SELECT 
  'Produkty' as typ,
  COUNT(*) as pocet
FROM products
UNION ALL
SELECT 
  'Segmenty' as typ,
  COUNT(*) as pocet
FROM company_segments;
