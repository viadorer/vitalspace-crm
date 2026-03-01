-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 1: VZDĚLÁVÁNÍ
-- ============================================================================
-- Kompletní sales playbook pro vzdělávací segmenty
-- ============================================================================

-- Základní školy
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box', 'PRO I PLUS'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Ředitel školy', 'Zástupce ředitele', 'Ekonom', 'Zřizovatel (obec/kraj)'],
  key_arguments = ARRAY[
    'Snížení absence žáků o 20-30% = úspora za náhrady',
    'Bezchemická dezinfekce bezpečná pro děti',
    'Argumentace k rodičům a zřizovateli',
    'Certifikát "Zdravá škola"',
    'ROI: 1 Clean Up = cca 25 žáků chráněno',
    'Dotační možnosti z EU fondů na zdravé prostředí'
  ]
WHERE name = 'Základní školy';

-- Mateřské školy
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 80000,
  average_deal_max_czk = 250000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Ředitelka MŠ', 'Zřizovatel (obec)', 'Rada rodičů'],
  key_arguments = ARRAY[
    'Bezchemická dezinfekce hraček a lůžkovin',
    'Snížení nemocnosti dětí = méně absence rodičů v práci',
    'Legislativní požadavky na hygienu',
    'Clean Box: dezinfekce plyšáků a hraček bez praní',
    'Argument pro rodiče: "Ozonově čištěné hračky"',
    'Rychlá instalace, nízká údržba'
  ]
WHERE name = 'Mateřské školy';

-- Střední a vysoké školy
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Up'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 1000000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Rektor/ředitel', 'Kvestor', 'Technický náměstek', 'Vedoucí kolejí'],
  key_arguments = ARRAY[
    'Velké přednáškové sály: PRO I PLUS mobilně',
    'Koleje: snížení šíření nákaz mezi studenty',
    'Laboratoře: sterilní prostředí bez chemie',
    'ESG reporting pro univerzity',
    'Studentská spokojenost = lepší ranking školy',
    'Kalkulace dle m³ pro velké prostory'
  ]
WHERE name = 'Střední a vysoké školy';

-- Jazykové školy a vzdělávací centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 60000,
  average_deal_max_czk = 200000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['Majitel školy', 'Provozní manažer'],
  key_arguments = ARRAY[
    'Malé učebny s vysokou rotací = vysoké riziko nákaz',
    'Zdravé prostředí = lepší recenze na Google',
    'Clean Box na sdílené učebnice a pomůcky',
    'Diferenciace od konkurence',
    'Nízká investice, rychlý ROI',
    'Argument pro klienty: "Certifikovaně čistý vzduch"'
  ]
WHERE name = 'Jazykové školy a vzdělávací centra';
