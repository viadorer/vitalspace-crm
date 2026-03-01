-- ============================================================================
-- VITALSPACE - Seed data pro client_contacts
-- ============================================================================
-- Přidání vzorových kontaktních osob pro existující klienty
-- ============================================================================

DO $$
DECLARE
  client_skola_id UUID;
  client_hotel_id UUID;
BEGIN
  -- Získání ID klientů
  SELECT id INTO client_skola_id FROM clients WHERE company_name = 'ZŠ Komenského' LIMIT 1;
  SELECT id INTO client_hotel_id FROM clients WHERE company_name = 'Wellness Hotel Aurora' LIMIT 1;

  -- Aktualizace klientů - přidání segmentu a lokace
  UPDATE clients SET
    segment_id = (SELECT id FROM company_segments WHERE name = 'Základní školy' LIMIT 1),
    region = 'Plzeňský kraj',
    city = 'Plzeň',
    address = 'Komenského 123, 301 00 Plzeň',
    website = 'www.zskomenskeho.cz',
    notes = 'Aktivní klient od 2023, pravidelný servis Clean Up v 10 třídách'
  WHERE id = client_skola_id;

  UPDATE clients SET
    segment_id = (SELECT id FROM company_segments WHERE name = 'Hotely' LIMIT 1),
    region = 'Ostatní',
    city = 'Karlovy Vary',
    address = 'Lázeňská 45, 360 01 Karlovy Vary',
    website = 'www.aurora-hotel.cz',
    notes = 'Clean Up v 50 pokojích, zájem o rozšíření do wellness části'
  WHERE id = client_hotel_id;

  -- Kontakty pro ZŠ Komenského
  INSERT INTO client_contacts (client_id, first_name, last_name, position, email, phone, mobile, is_primary, is_decision_maker, notes) VALUES
  (client_skola_id, 'Eva', 'Svobodová', 'Ředitelka', 'svobodova@zskomenskeho.cz', '+420 377 123 456', '+420 777 111 222', true, true, 'Hlavní kontakt pro všechny záležitosti'),
  (client_skola_id, 'Jan', 'Novák', 'Zástupce ředitele', 'novak@zskomenskeho.cz', '+420 377 123 457', '+420 777 111 223', false, true, 'Řeší technické záležitosti a údržbu'),
  (client_skola_id, 'Marie', 'Dvořáková', 'Ekonomka', 'dvorakova@zskomenskeho.cz', '+420 377 123 458', '+420 777 111 224', false, false, 'Fakturace a platby');

  -- Kontakty pro Wellness Hotel Aurora
  INSERT INTO client_contacts (client_id, first_name, last_name, position, email, phone, mobile, is_primary, is_decision_maker, notes) VALUES
  (client_hotel_id, 'Pavel', 'Novák', 'Generální ředitel', 'novak@aurora-hotel.cz', '+420 353 222 111', '+420 777 333 444', true, true, 'Rozhoduje o všech investicích'),
  (client_hotel_id, 'Petra', 'Malá', 'Provozní ředitelka', 'mala@aurora-hotel.cz', '+420 353 222 112', '+420 777 333 445', false, true, 'Denní provoz a údržba'),
  (client_hotel_id, 'Tomáš', 'Černý', 'Technický manažer', 'cerny@aurora-hotel.cz', '+420 353 222 113', '+420 777 333 446', false, false, 'Kontakt pro servis a technické dotazy'),
  (client_hotel_id, 'Jana', 'Bílá', 'Vedoucí wellness', 'bila@aurora-hotel.cz', '+420 353 222 114', '+420 777 333 447', false, false, 'Zájem o rozšíření do wellness části');

END $$;

-- Výpis pro kontrolu
SELECT 
  c.company_name,
  cc.first_name || ' ' || cc.last_name as kontakt,
  cc.position,
  cc.email,
  cc.is_primary,
  cc.is_decision_maker
FROM clients c
LEFT JOIN client_contacts cc ON c.id = cc.client_id
ORDER BY c.company_name, cc.is_primary DESC, cc.is_decision_maker DESC;
