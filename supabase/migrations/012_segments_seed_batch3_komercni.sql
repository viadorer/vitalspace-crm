-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 3: KOMERČNÍ PROSTORY
-- ============================================================================
-- Kompletní sales playbook pro komerční segmenty
-- ============================================================================

-- Kanceláře a coworkingová centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 1000000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Facility Manager', 'HR ředitel', 'CEO', 'Office Manager'],
  key_arguments = ARRAY[
    'Sick building syndrom = snížená produktivita',
    'ROI přes produktivitu: 1% méně sick days = X Kč úspora',
    'Formaldehyd z nábytku (nové kanceláře)',
    'Employee wellbeing a employer branding',
    'ESG reporting a certifikace WELL/LEED',
    'Clean Up do open-space + PRO I PLUS do meetingů',
    'Měřitelné výsledky: VOC, CO2, PM2.5'
  ]
WHERE name = 'Kanceláře a coworkingová centra';

-- IT a technologické firmy
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 250000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['CTO', 'Facility Manager', 'HR ředitel', 'CFO'],
  key_arguments = ARRAY[
    'Tech firmy slyší na data a měření',
    'ESG závazky a reporting pro investory',
    'Employee wellbeing = nižší fluktuace',
    'Serverovny: prach jako příčina výpadků',
    'Open-space s vysokou hustotou lidí',
    'Premium benefit pro zaměstnance',
    'Integrace s IoT a smart building systémy'
  ]
WHERE name = 'IT a technologické firmy';

-- Call centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Provozní ředitel', 'Facility Manager', 'Team leader'],
  key_arguments = ARRAY[
    'Extrémní hustota lidí na m²',
    'Sdílené headsety = křížová kontaminace',
    'ROI: každý sick day = ztráta X hovorů',
    'Vysoká nemocnost = výpadky směn',
    'Clean Up do každé sekce',
    'Clean Box na headsety a sdílené vybavení',
    'Rychlá návratnost investice (3-6 měsíců)'
  ]
WHERE name = 'Call centra';

-- Banky a finanční instituce
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 800000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Facility Manager', 'CSR manažer', 'Vedoucí poboček', 'Compliance officer'],
  key_arguments = ARRAY[
    'ESG reporting a udržitelnost',
    'Ochrana zaměstnanců na pobočkách',
    'Vysoká frekvence klientů = riziko nákaz',
    'Reprezentativní prostředí',
    'Clean Up do poboček',
    'PRO I PLUS pro archívy a trezorové místnosti',
    'Certifikace pro CSR reporting'
  ]
WHERE name = 'Banky a finanční instituce';
