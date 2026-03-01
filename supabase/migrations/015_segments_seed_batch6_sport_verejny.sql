-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 6: SPORT A VEŘEJNÝ SEKTOR
-- ============================================================================
-- Kompletní sales playbook pro sport a veřejný sektor
-- ============================================================================

-- Fitness centra a posilovny
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Majitel fitness', 'Vedoucí provozu', 'Správce'],
  key_arguments = ARRAY[
    'Zápachy v šatnách = negativní zkušenost',
    'Bakterie na strojích a podložkách',
    'PRO I PLUS: noční dezinfekce',
    'Clean Box: rukavice, pásky, ručníky',
    'Členové ocení čisté prostředí',
    'Diferenciace: "Ozonově dezinfikováno denně"',
    'Snížení churn rate členů'
  ]
WHERE name = 'Fitness centra a posilovny';

-- Sportovní haly a stadiony
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 1000000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Ředitel sportovního zařízení', 'Správce', 'Vedoucí údržby', 'Zřizovatel'],
  key_arguments = ARRAY[
    'Velké prostory: kalkulace dle m³',
    'Šatny: vysoká rotace sportovců',
    'PRO I PLUS: mobilně mezi halami',
    'Clean Box: chrániče, helmy, sdílené vybavení',
    'Ochrana sportovců před nákazami',
    'Legislativní požadavky na hygienu',
    'Dotační možnosti z rozpočtu obce/kraje'
  ]
WHERE name = 'Sportovní haly a stadiony';

-- Bazény a aquaparky
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 800000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Ředitel aquaparku', 'Technický manažer', 'Vedoucí provozu'],
  key_arguments = ARRAY[
    'Plísně v šatnách a sprchách',
    'Chlorové výpary = zdravotní riziko',
    'Ozon jako doplněk k chloru',
    'Snížení potřeby chemie',
    'Lepší kvalita vzduchu v hale',
    'Ochrana personálu',
    'Ekologický argument'
  ]
WHERE name = 'Bazény a aquaparky';

-- Jóga a pilates studia
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'Clean Box'],
  average_deal_min_czk = 50000,
  average_deal_max_czk = 150000,
  closing_time_months_min = 1,
  closing_time_months_max = 2,
  decision_makers = ARRAY['Majitel studia', 'Hlavní instruktor'],
  key_arguments = ARRAY[
    'Sdílené podložky a pomůcky',
    'Zápachy při hot józe',
    'Wellness klienti očekávají prémiovou hygienu',
    'Clean Box: podložky a bloky',
    'Clean Up: kontinuální čistý vzduch',
    'Diferenciace: "Certifikovaně čisté studio"',
    'Premium positioning'
  ]
WHERE name = 'Jóga a pilates studia';

-- Městské a krajské úřady
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Tajemník úřadu', 'Vedoucí majetku', 'Starosta/hejtman'],
  key_arguments = ARRAY[
    'Přepážky s vysokou frekvencí občanů',
    'Staré budovy, špatná ventilace',
    'Ochrana úředníků',
    'Public health odpovědnost',
    'Clean Up do klientských prostor',
    'PRO I PLUS pro archivy',
    'Dotace z rozpočtu na zdravé prostředí'
  ]
WHERE name = 'Městské a krajské úřady';

-- Knihovny a kulturní centra
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 100000,
  average_deal_max_czk = 400000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Ředitel knihovny', 'Vedoucí depozitáře', 'Zřizovatel'],
  key_arguments = ARRAY[
    'Plísně na knihách = ztráta kulturního dědictví',
    'Staré budovy, vlhkost',
    'Ozon eliminuje plísně bez poškození papíru',
    'PRO I PLUS pro depozitáře',
    'Clean Box pro vzácné knihy',
    'Ochrana sbírek',
    'Dotační možnosti z MK ČR'
  ]
WHERE name = 'Knihovny a kulturní centra';

-- Hasiči a záchranné složky
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Box', 'PRO I PLUS'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 500000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Velitel stanice', 'Vedoucí BOZP', 'Krajský ředitel HZS'],
  key_arguments = ARRAY[
    'Kontaminovaná výstroj po zásazích',
    'Karcinogeny v oblečení = zdravotní riziko',
    'Clean Box XL: dezinfekce výstroje',
    'PRO I PLUS: šatny a garáže',
    'Ochrana zdraví hasičů',
    'BOZP legislativa',
    'Dotace z rozpočtu HZS'
  ]
WHERE name = 'Hasiči a záchranné složky';
