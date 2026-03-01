-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 7: SPECIÁLNÍ SEGMENTY
-- ============================================================================
-- Kompletní sales playbook pro speciální a ostatní segmenty
-- ============================================================================

-- Věznice a detenční zařízení
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 300000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 4,
  closing_time_months_max = 8,
  decision_makers = ARRAY['Ředitel věznice', 'Vedoucí zdravotní péče', 'Technický náměstek'],
  key_arguments = ARRAY[
    'Přeplněné prostory = vysoké riziko nákaz',
    'Omezené možnosti ventilace',
    'Bezchemický přístup klíčový',
    'PRO I PLUS: noční režim do cel',
    'Clean Box: osobní věci vězňů',
    'Ochrana personálu',
    'Legislativní požadavky na hygienu'
  ]
WHERE name = 'Věznice a detenční zařízení';

-- Dopravní podniky (MHD)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 1000000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Ředitel dopravního podniku', 'Vedoucí údržby', 'Technický ředitel'],
  key_arguments = ARRAY[
    'Dezinfekce autobusů/tramvají mezi směnami',
    'Sezónní epidemie = riziko pro cestující',
    'PRO I PLUS: mobilně do dep',
    'Jeden přístroj = desítky vozidel za noc',
    'Ochrana řidičů a cestujících',
    'Public health odpovědnost',
    'ROI: snížení absence řidičů'
  ]
WHERE name = 'Dopravní podniky (MHD)';

-- Taxislužby a carsharing
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Box', 'PRO I PLUS'],
  average_deal_min_czk = 60000,
  average_deal_max_czk = 200000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['Majitel taxislužby', 'Fleet manager'],
  key_arguments = ARRAY[
    'Rychlá dezinfekce mezi jízdami',
    'Očekávání zákazníků post-COVID',
    'Clean Box: sedáky a volant',
    'PRO I PLUS do garáží',
    'Hygienický certifikát pro vozy',
    'Diferenciace: "Ozonově čištěný vůz"',
    'Lepší recenze = více objednávek'
  ]
WHERE name = 'Taxislužby a carsharing';

-- Obchodní centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 400000,
  average_deal_max_czk = 2000000,
  closing_time_months_min = 4,
  closing_time_months_max = 8,
  decision_makers = ARRAY['Facility Manager', 'Technický ředitel', 'Property Manager'],
  key_arguments = ARRAY[
    'Vysoká frekvence návštěvníků',
    'HVAC systémy jako šiřitelé nákaz',
    'Clean Up do HVAC',
    'PRO I PLUS: food courty a zázemí',
    'Ochrana nájemců = nižší sick rate',
    'ESG reporting pro vlastníka',
    'Certifikace BREEAM/LEED'
  ]
WHERE name = 'Obchodní centra';

-- Second handy a charitativní obchody
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Box', 'PRO I PLUS'],
  average_deal_min_czk = 50000,
  average_deal_max_czk = 150000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['Vedoucí obchodu', 'Manažer charity'],
  key_arguments = ARRAY[
    'Zápachy z darovaného oblečení',
    'Plísně a alergeny',
    'Clean Box: dezinfekce před prodejem',
    'PRO I PLUS pro sklad',
    'Zákaznický komfort',
    'Nízkonákladové řešení',
    'Diferenciace: "Ozonově vyčištěné oblečení"'
  ]
WHERE name = 'Second handy a charitativní obchody';

-- Květinářství a zahradní centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 80000,
  average_deal_max_czk = 250000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Majitel květinářství', 'Vedoucí zahradnictví'],
  key_arguments = ARRAY[
    'Plísně na rostlinách',
    'Zvýšená vlhkost ve sklenících',
    'Ozon eliminuje plísně bez pesticidů',
    'Bio argument pro ekologický segment',
    'Ochrana investice do rostlin',
    'Prodloužení životnosti květin',
    'Nízké provozní náklady'
  ]
WHERE name = 'Květinářství a zahradní centra';

-- Pojišťovny (likvidace škod)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 0,
  average_deal_max_czk = 0,
  closing_time_months_min = 2,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Vedoucí likvidace škod', 'Produktový manažer', 'Ředitel pojišťovny'],
  key_arguments = ARRAY[
    'Partnerský model: referral fee',
    'Dekontaminace po požárech a záplavách',
    'Vitalspace jako doporučený dodavatel',
    'Rychlá reakce = spokojený klient pojišťovny',
    'Win-win: pojišťovna šetří, klient má kvalitu',
    'B2B2C model',
    'Dlouhodobá spolupráce'
  ]
WHERE name = 'Pojišťovny (likvidace škod)';

-- Realitní kanceláře
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 0,
  average_deal_max_czk = 0,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Majitel RK', 'Vedoucí prodeje', 'Property manager'],
  key_arguments = ARRAY[
    'Partnerský model: služba před prodejem',
    'Byty po problémových nájemnících',
    '"Ozonově certifikovaný byt" jako USP',
    'Rychlejší prodej/pronájem',
    'Vyšší cena nemovitosti',
    'B2B2C model',
    'Referral fee nebo revenue share'
  ]
WHERE name = 'Realitní kanceláře';

-- Pohřební služby
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Up'],
  average_deal_min_czk = 100000,
  average_deal_max_czk = 300000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Majitel pohřební služby', 'Vedoucí provozu'],
  key_arguments = ARRAY[
    'Dezinfekce prostor a vozidel',
    'Důstojné prostředí pro pozůstalé',
    'Eliminace zápachu diskrétně',
    'PRO I PLUS pro zázemí',
    'Clean Up do obřadních síní',
    'Profesionalita a diskrétnost',
    'Certifikace hygieny'
  ]
WHERE name = 'Pohřební služby';

-- Muzea a galerie
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Ředitel muzea', 'Vedoucí depozitáře', 'Konzervátorka'],
  key_arguments = ARRAY[
    'Plísně na exponátech = ztráta kulturního dědictví',
    'Klimatizace jako šiřitel spor',
    'Clean Up: nízká koncentrace, kontinuální',
    'PRO I PLUS pro depozitáře',
    'Ochrana sbírek bez chemie',
    'Certifikace pro grant aplikace',
    'Dotace z MK ČR'
  ]
WHERE name = 'Muzea a galerie';

-- Filmová a TV studia
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Box', 'PRO I PLUS'],
  average_deal_min_czk = 120000,
  average_deal_max_czk = 400000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Produkční', 'Vedoucí kostýmů', 'Studio manager'],
  key_arguments = ARRAY[
    'Sdílené kostýmy a rekvizity',
    'Make-up prostory s vysokou rotací',
    'Clean Box: kostýmy mezi natáčením',
    'PRO I PLUS pro studia',
    'Ochrana herců a štábu',
    'Hygienické standardy',
    'Rychlá dezinfekce mezi scénami'
  ]
WHERE name = 'Filmová a TV studia';

-- Svatební a eventové prostory
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Up'],
  average_deal_min_czk = 100000,
  average_deal_max_czk = 350000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Majitel prostoru', 'Event manager', 'Wedding planner'],
  key_arguments = ARRAY[
    'Rychlý turnaround mezi akcemi',
    'Eliminace zápachu (kouř, jídlo, květiny)',
    'Prémiová hygiena pro prémiové akce',
    'PRO I PLUS: dezinfekce mezi eventy',
    'Clean Up do přípravných místností',
    'Diferenciace: "Certifikovaně čisté prostředí"',
    'Lepší recenze = více rezervací'
  ]
WHERE name = 'Svatební a eventové prostory';

-- Datacentra a serverovny
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['IT ředitel', 'Datacenter manager', 'Facility Manager'],
  key_arguments = ARRAY[
    'Prach jako příčina výpadků',
    'Kontaminace filtrů = vyšší náklady',
    'Požární riziko z prachu',
    'Clean Up: nízký výkon, kontinuální',
    'PRO I PLUS pro údržbové cykly',
    'Uptime a ochrana investice',
    'SLA compliance'
  ]
WHERE name = 'Datacentra a serverovny';

-- Laboratoře a výzkumná centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 800000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Vedoucí laboratoře', 'Vedoucí kvality', 'Safety officer'],
  key_arguments = ARRAY[
    'Křížová kontaminace vzorků',
    'Sterilita prostředí bez chemie',
    'Chemické výpary = zdravotní riziko',
    'Clean Up do laboratoří',
    'PRO I PLUS pro dekontaminační cykly',
    'Certifikace ISO 17025',
    'Měření a dokumentace jako standard'
  ]
WHERE name = 'Laboratoře a výzkumná centra';
