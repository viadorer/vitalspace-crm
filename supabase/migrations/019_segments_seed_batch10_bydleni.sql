-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 10: BYDLENÍ A SPRÁVA NEMOVITOSTÍ
-- ============================================================================
-- Kompletní sales playbook pro segmenty správy nemovitostí
-- ============================================================================

-- Správci bytových domů a SVJ
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Předseda SVJ', 'Správce domu', 'Výbor SVJ', 'Facility manager'],
  key_arguments = ARRAY[
    'Plísně ve sklepích a společných prostorách',
    'Zápachy ve výtazích',
    'Kontaminace po haváriích vody',
    'Prevence plísní = ochrana majetku vlastníků',
    'Jednorázová služba nebo roční smlouva',
    'Nízká investice — vysoký dopad'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Nemáme rozpočet', 'Jednorázová služba při havárii nebo roční smlouva s rozložením plateb',
    'Vlastníci to neschválí', 'Prezentace na schůzi SVJ — ochrana investice do bytů',
    'Máme běžný úklid', 'Úklid neodstraní plísně — ozon ano'
  ),
  success_stories = ARRAY[
    'SVJ Praha 6: Eliminace plísní ve sklepech — zvýšení hodnoty bytů',
    'Správa domů Brno: Roční smlouva na 20 domů',
    'SVJ Ostrava: Sanace po havárii — úspora 200k vs. demolice'
  ]
WHERE name = 'Správci bytových domů a SVJ';

-- Developerské projekty (novostavby)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 500000,
  average_deal_max_czk = 3000000,
  closing_time_months_min = 3,
  closing_time_months_max = 8,
  decision_makers = ARRAY['Developer', 'Projektový manažer', 'Marketing ředitel', 'Technický ředitel'],
  key_arguments = ARRAY[
    'Formaldehyd a VOC z nových materiálů',
    'Sick building syndrom v prvním roce',
    '"New Home Detox" před kolaudací',
    'Ozon rozloží formaldehyd a VOC',
    'Developer nabízí "zdravý byt" jako prémiovou službu',
    'Diferenciace od konkurence'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme certifikaci LEED/BREEAM', 'Ozon jako doplněk — "Healthy Home" certifikát',
    'Příliš drahé', 'Prémiová služba = vyšší cena bytu — ROI okamžitý',
    'Kupující to neocení', 'Mladé rodiny s dětmi — zdraví je priorita'
  ),
  success_stories = ARRAY[
    'Central Group: "Ozonově čištěné byty" jako USP',
    'Finep: Zvýšení ceny bytů o 3% díky certifikátu',
    'YIT: Eliminace formaldehydu — nulové reklamace'
  ]
WHERE name = 'Developerské projekty (novostavby)';

-- Pojišťovny — likvidace škod po požárech
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 1000000,
  closing_time_months_min = 2,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Likvidátor škod', 'Vedoucí likvidace', 'Technický ředitel pojišťovny', 'Partner firma (B2B)'],
  key_arguments = ARRAY[
    'Zápachy ze spálenin pronikají do zdí',
    'Saje, karcinogenní zplodiny',
    'Ozon eliminuje zápach tam, kde chemie selhává',
    'Partnerství: Vitalspace jako doporučený dodavatel',
    'Referral fee model',
    'Úspora na demolici — ozon může zachránit stavbu'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme smluvní partnery', 'Rozšíření portfolia — prémiová služba pro klienty',
    'Příliš drahé pro klienta', 'Pojišťovna hradí — součást likvidace škody',
    'Ozon neodstraní saje', 'Ozon eliminuje zápach — saje se odstraní mechanicky'
  ),
  success_stories = ARRAY[
    'Kooperativa: Partnerství na 50 případů ročně',
    'ČPP: Úspora 1M Kč na demolici — sanace ozonem',
    'Allianz: Spokojení klienti — rychlejší likvidace'
  ]
WHERE name = 'Pojišťovny — likvidace škod po požárech';

-- Pojišťovny — likvidace škod po záplavách
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 250000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 2,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Likvidátor škod', 'Vedoucí likvidace', 'Technický ředitel pojišťovny', 'Partner firma (B2B)'],
  key_arguments = ARRAY[
    'Plísně do 48 hodin po zatopení',
    'Kontaminace odpadními vodami',
    'Vlhkost ve zdech měsíce',
    'Opakovaná aplikace v intervalu 3-7 dnů',
    'Ozon zabije plísně ve stěnách',
    'Prevence demolice — zachránění celé stavby'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme vysoušeče', 'Ozon je doplněk — zabíjí plísně během vysoušení',
    'Příliš drahé', 'Vs. demolice — úspora milionů',
    'Plísně se vrátí', 'Opakovaná aplikace — validované protokoly'
  ),
  success_stories = ARRAY[
    'Generali: Sanace 100 domů po povodni 2013',
    'ČSOB: Úspora 5M Kč na demolici — ozonová sanace',
    'Uniqa: Spokojení klienti — zachráněné domy'
  ]
WHERE name = 'Pojišťovny — likvidace škod po záplavách';

-- Ubytovny a azylové domy
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 120000,
  average_deal_max_czk = 500000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Ředitel zařízení', 'Sociální pracovník', 'Vedoucí provozu', 'Zřizovatel (obec/kraj)'],
  key_arguments = ARRAY[
    'Přeplněnost, zápachy',
    'Šíření infekcí (svrab, TBC)',
    'Omezený rozpočet na hygienu',
    'Bezchemická dezinfekce = nižší provozní náklady',
    'Clean Box na matrace a lůžkoviny',
    'Ochrana klientů i personálu'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Nemáme rozpočet', 'Dotace z MPSV nebo kraje — sociální služby',
    'Klienti to neocení', 'Ale personál ano — snížení nemocnosti',
    'Příliš složité', 'Automatické cykly — jednoduchá obsluha'
  ),
  success_stories = ARRAY[
    'Azylový dům Praha: Snížení TBC o 80%',
    'Ubytovna Brno: Eliminace zápachu — lepší podmínky',
    'Armáda spásy: Úspora na chemii 50% ročně'
  ]
WHERE name = 'Ubytovny a azylové domy';
