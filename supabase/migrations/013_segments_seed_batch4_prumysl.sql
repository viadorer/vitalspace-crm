-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 4: PRŮMYSL A LOGISTIKA
-- ============================================================================
-- Kompletní sales playbook pro průmyslové segmenty
-- ============================================================================

-- Výrobní podniky
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Up'],
  average_deal_min_czk = 300000,
  average_deal_max_czk = 2000000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Výrobní ředitel', 'BOZP technik', 'Vedoucí provozu', 'Technický ředitel'],
  key_arguments = ARRAY[
    'VOC z výrobních procesů = BOZP riziko',
    'Eliminace zápachu bez chemie',
    'Kontaminace produktů',
    'BOZP compliance a legislativa',
    'PRO I PLUS: kalkulace dle m³',
    'Clean Up do kancelářské části',
    'Měřitelné snížení VOC a PM2.5'
  ]
WHERE name = 'Výrobní podniky';

-- Potravinářský průmysl
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 400000,
  average_deal_max_czk = 2500000,
  closing_time_months_min = 4,
  closing_time_months_max = 8,
  decision_makers = ARRAY['Výrobní ředitel', 'Vedoucí kvality', 'HACCP manažer', 'Technolog'],
  key_arguments = ARRAY[
    'HACCP legislativa a hygienické požadavky',
    'Ozon ničí plísně a prodlužuje shelf life',
    'Kontaminace potravin = recall riziko',
    'Certifikace klíčová (ISO 22000)',
    'Snížení chemické dezinfekce',
    'ROI: prodloužení trvanlivosti produktů',
    'Dokumentace a protokoly pro audity'
  ]
WHERE name = 'Potravinářský průmysl';

-- Sklady a logistická centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 250000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Vedoucí skladu', 'Logistický manažer', 'Facility Manager'],
  key_arguments = ARRAY[
    'Plísně při dlouhodobém skladování',
    'Ochrana skladovaného zboží',
    'Eliminace zápachu',
    'PRO I PLUS: mobilně mezi sektory',
    'Kalkulace dle celkového objemu m³',
    'Jeden přístroj = velká plocha',
    'Nízké provozní náklady'
  ]
WHERE name = 'Sklady a logistická centra';

-- Autoservisy a autodílny
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 100000,
  average_deal_max_czk = 350000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Majitel servisu', 'Vedoucí dílny', 'Provozní manažer'],
  key_arguments = ARRAY[
    'Výpary z chemikálií, olejů a barev',
    'BOZP ochrana mechaniků',
    'Clean Box: čištění interiérů aut jako doplňková služba',
    'Diferenciace: "Ozonově vyčištěný interiér"',
    'Eliminace zápachu z aut',
    'Nová revenue stream (služba pro zákazníky)',
    'Rychlá návratnost (6-12 měsíců)'
  ]
WHERE name = 'Autoservisy a autodílny';

-- Prádelny a čistírny
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 120000,
  average_deal_max_czk = 400000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Majitel prádelny', 'Provozní manažer'],
  key_arguments = ARRAY[
    'Zápachy a bakterie v textilu',
    'Chemické výpary z čisticích prostředků',
    'PRO I PLUS pro provozní prostory',
    'Clean Box: finální dezinfekce delikátních textilií',
    'Snížení chemie = úspora nákladů',
    'Prémiová služba pro zákazníky',
    'Ekologický argument'
  ]
WHERE name = 'Prádelny a čistírny';
