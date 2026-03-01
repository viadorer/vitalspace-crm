-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 5: HOSPITALITY A GASTRO
-- ============================================================================
-- Kompletní sales playbook pro hospitality segmenty
-- ============================================================================

-- Hotely
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 800000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Ředitel hotelu', 'Provozní manažer', 'Revenue manager', 'Housekeeping manager'],
  key_arguments = ARRAY[
    'Lepší recenze = vyšší occupancy',
    '"Ozonově čištěný pokoj" jako USP',
    'Eliminace zápachu po hostech (kouř, jídlo)',
    'Booking.com a Google rating',
    'Clean Up: režim osvěžovač během dne',
    'PRO I PLUS: lobby a konferenční sály',
    'ROI: zvýšení ADR o 5-10%'
  ]
WHERE name = 'Hotely';

-- Restaurace a kavárny
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 80000,
  average_deal_max_czk = 300000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['Majitel restaurace', 'Šéfkuchař', 'Provozní manažer'],
  key_arguments = ARRAY[
    'Eliminace zápachu z kuchyně',
    'Noční dezinfekce prostor bez chemie',
    'Clean Box: jídelní lístky a sdílené předměty',
    'Hygienický certifikát pro hosty',
    'Diferenciace: "Certifikovaně čisté prostředí"',
    'Lepší recenze na Google a TripAdvisor',
    'Rychlá instalace, nízké náklady'
  ]
WHERE name = 'Restaurace a kavárny';

-- Penziony a Airbnb
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 60000,
  average_deal_max_czk = 200000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['Majitel penzionu', 'Provozní manažer', 'Airbnb host'],
  key_arguments = ARRAY[
    'Rychlý turnaround mezi hosty',
    'Eliminace pachů bez parfémů',
    'PRO I PLUS: mobilně mezi jednotkami',
    '"Ozonově čištěný pokoj" v inzerátu',
    'Diferenciace od konkurence',
    'Lepší recenze = vyšší cena',
    'Nízká investice, okamžitý efekt'
  ]
WHERE name = 'Penziony a Airbnb';

-- Vinařství a pivovary
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Majitel vinařství', 'Sládek', 'Technolog', 'Sklep mistr'],
  key_arguments = ARRAY[
    'Plísně v sudových skladech',
    'Kontaminace kvasných procesů',
    'Ozon eliminuje plísně bez chemie',
    'Klíčové pro bio producenty',
    'Ochrana investice do vína/piva',
    'Prodloužení životnosti produktů',
    'Certifikace pro prémiový segment'
  ]
WHERE name = 'Vinařství a pivovary';
