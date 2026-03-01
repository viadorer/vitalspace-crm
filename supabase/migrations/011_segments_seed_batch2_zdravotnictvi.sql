-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 2: ZDRAVOTNICTVÍ
-- ============================================================================
-- Kompletní sales playbook pro zdravotnické segmenty
-- ============================================================================

-- Nemocnice a kliniky
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 500000,
  average_deal_max_czk = 3000000,
  closing_time_months_min = 4,
  closing_time_months_max = 8,
  decision_makers = ARRAY['Primář', 'Technický náměstek', 'Hygienička', 'Nákupčí', 'Ředitel nemocnice'],
  key_arguments = ARRAY[
    'Snížení nozokomiálních infekcí',
    'Legislativní požadavky na kvalitu vzduchu',
    'Certifikace a měřitelné výsledky (VOC, PM2.5)',
    'Clean Up: kontinuální ochrana pacientů',
    'PRO I PLUS: dezinfekce operačních sálů mezi zákroky',
    'ROI: snížení ATB spotřeby a délky hospitalizace',
    'Bezpečnostní protokoly a školení personálu'
  ]
WHERE name = 'Nemocnice a kliniky';

-- Ambulance a ordinace
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 80000,
  average_deal_max_czk = 250000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['MUDr. - majitel ordinace', 'Provozní sestra'],
  key_arguments = ARRAY[
    'Ochrana personálu před nákazami od pacientů',
    'Čekárna jako ohnisko křížové kontaminace',
    'Clean Box na nástroje a pomůcky',
    'Argument pro pacienty: "Certifikovaně čistá ordinace"',
    'Rychlá instalace bez stavebních úprav',
    'Nízké provozní náklady'
  ]
WHERE name = 'Ambulance a ordinace';

-- Stomatologické ordinace
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 100000,
  average_deal_max_czk = 300000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['MUDr. stomatolog - majitel', 'Dentální hygienistka'],
  key_arguments = ARRAY[
    'Aerosoly při zákrocích = vysoké riziko',
    'Obavy pacientů z nákazy post-COVID',
    'Premium positioning: "Ozonově čištěný vzduch"',
    'Clean Box: sterilizace otiskových lžic',
    'Diferenciace od konkurence',
    'Marketingový argument pro nové pacienty'
  ]
WHERE name = 'Stomatologické ordinace';

-- Lékárny
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 60000,
  average_deal_max_czk = 150000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['Majitel lékárny', 'Vedoucí lékárník'],
  key_arguments = ARRAY[
    'Ochrana farmaceutů před nemocnými zákazníky',
    'Vysoká rotace nemocných lidí v prostoru',
    'Clean Up: kontinuální ochrana prodejny',
    'Clean Box: dezinfekce vrácených pomůcek',
    'Jednoduchá instalace, rychlý ROI',
    'Certifikát hygieny jako konkurenční výhoda'
  ]
WHERE name = 'Lékárny';

-- Domovy seniorů a LDN
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 300000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Ředitel zařízení', 'Hlavní sestra', 'Zřizovatel', 'Hygienička'],
  key_arguments = ARRAY[
    'Imunokompromitovaní obyvatelé = vysoké riziko',
    'Snížení mortality a spotřeby ATB',
    'Legislativní kontroly a hygienické standardy',
    'Eliminace zápachu bez chemie',
    'Clean Up do pokojů + PRO I PLUS do jídelen',
    'ROI: snížení hospitalizací a nákladů na léky',
    'Argument pro příbuzné: "Certifikovaně čisté prostředí"'
  ]
WHERE name = 'Domovy seniorů a LDN';

-- Veterinární kliniky
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 80000,
  average_deal_max_czk = 250000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['MVDr. - majitel kliniky', 'Provozní manažer'],
  key_arguments = ARRAY[
    'Eliminace zápachu bez parfémů',
    'Dezinfekce mezi pacienty (psi, kočky, exoti)',
    'PRO I PLUS: mobilní mezi ordinacemi',
    'Clean Box: transportní boxy a vodítka',
    'Ochrana personálu před zoonózami',
    'Argument pro majitele zvířat: "Sterilní prostředí"'
  ]
WHERE name = 'Veterinární kliniky';
