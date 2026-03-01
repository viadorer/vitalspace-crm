-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 9: POTRAVINY A ZEMĚDĚLSTVÍ
-- ============================================================================
-- Kompletní sales playbook pro potravinářské a zemědělské segmenty
-- ============================================================================

-- Pekárny a cukrárny
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 200000,
  average_deal_max_czk = 800000,
  closing_time_months_min = 2,
  closing_time_months_max = 4,
  decision_makers = ARRAY['Majitel pekárny', 'Vedoucí výroby', 'Technolog', 'HACCP manažer'],
  key_arguments = ARRAY[
    'Plísně na stěnách a stropech od vlhkosti',
    'Ozon eliminuje plísně bez chemie — žádné rezidua',
    'Prodloužení shelf life pečiva',
    'HACCP compliance — bezchemická dezinfekce',
    'Noční dezinfekce výrobních prostor',
    'Moučný prach — ozon čistí vzduch'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme HACCP certifikaci', 'Ozon je kompatibilní s HACCP — doplňuje stávající procesy',
    'Plísně se vracejí', 'Pravidelná aplikace — prevence je klíčová',
    'Ozon poškodí suroviny', 'Dezinfekce v noci bez přítomnosti surovin — validované protokoly'
  ),
  success_stories = ARRAY[
    'Pekárna Penam: Eliminace plísní na stěnách za 3 měsíce',
    'Cukrárna Myšák: Prodloužení trvanlivosti dortů o 2 dny',
    'Pekárna Hradec: Úspora na chemii 60% ročně'
  ]
WHERE name = 'Pekárny a cukrárny';

-- Řeznictví a masný průmysl
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 400000,
  average_deal_max_czk = 1800000,
  closing_time_months_min = 3,
  closing_time_months_max = 6,
  decision_makers = ARRAY['Ředitel výroby', 'Veterinární inspektor', 'HACCP manažer', 'Technický ředitel'],
  key_arguments = ARRAY[
    'Bakteriální kontaminace (Salmonella, Listeria, E.coli)',
    'Ozon redukuje bakteriální zátěž na površích',
    'Přísné hygienické normy SVS',
    'Dezinfekce chladíren a bourárny',
    'Eliminace zápachu',
    'Snížení reklamací a odpisů'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'SVS to neschválí', 'Ozon je schválená metoda pro potravinářství — reference z EU',
    'Máme chlorovou dezinfekci', 'Ozon je doplněk — synergický efekt',
    'Příliš drahé', 'ROI přes snížení reklamací a odpisů masa'
  ),
  success_stories = ARRAY[
    'Masokombinát Plzeň: Snížení bakteriální zátěže o 85%',
    'Řeznictví Krahulík: Eliminace zápachu v chladírně',
    'Masna CZ: Úspora na chemii 45% ročně'
  ]
WHERE name = 'Řeznictví a masný průmysl';

-- Mlékárny a sýrárny
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 350000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 3,
  closing_time_months_max = 7,
  decision_makers = ARRAY['Sýrmistr', 'Vedoucí výroby', 'Technolog', 'HACCP manažer'],
  key_arguments = ARRAY[
    'Plísně — žádoucí na sýrech, nežádoucí jinde',
    'Cílená aplikace ozonu',
    'Křížová kontaminace mezi šaržemi',
    'Dezinfekce zracích sklepů',
    'Eliminace zápachu',
    'Čištění zásobníků bez chemie'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Ozon zabije i žádoucí plísně', 'Cílená aplikace — ozon jen tam, kde je potřeba',
    'Máme tradiční metody', 'Ozon jako doplněk — modernizace bez ztráty tradice',
    'Příliš složité', 'Automatické cykly — jednoduchá obsluha'
  ),
  success_stories = ARRAY[
    'Sýrárna Sedlčany: Eliminace nežádoucích plísní bez poškození kultur',
    'Madeta: Dezinfekce skladů bez chemie',
    'Mlékárna Kunín: Snížení křížové kontaminace o 70%'
  ]
WHERE name = 'Mlékárny a sýrárny';

-- Vinné sklepy a ležácké tanky pivovarů
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 250000,
  average_deal_max_czk = 1200000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Sládek/Vinař', 'Majitel vinařství/pivovaru', 'Technolog', 'Sklípmistr'],
  key_arguments = ARRAY[
    'Plísně na stěnách kamenných sklepů',
    'TCA (zátka) ve vinárnách — ozon eliminuje',
    'Octové bakterie v pivovarech',
    'Dezinfekce sudů bez chemie',
    'Ochrana investice do vína',
    'Jedna zkažená šarže = statisíce ztráty'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Tradiční metody fungují', 'Ozon jako pojistka — prevence katastrofických ztrát',
    'Ozon poškodí víno/pivo', 'Dezinfekce prázdných prostor — ne produktu',
    'Příliš drahé pro malé vinařství', 'Nízká investice vs. ztráta celé šarže'
  ),
  success_stories = ARRAY[
    'Vinařství Sonberk: Eliminace TCA — nulové ztráty za 2 roky',
    'Pivovar Matuška: Dezinfekce ležáckých tanků',
    'Vinařství Nové Vinařství: Ochrana investice 2M Kč ročně'
  ]
WHERE name = 'Vinné sklepy a ležácké tanky pivovarů';

-- Sklady ovoce a zeleniny
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 500000,
  average_deal_max_czk = 2500000,
  closing_time_months_min = 3,
  closing_time_months_max = 7,
  decision_makers = ARRAY['Vedoucí skladu', 'Technický ředitel', 'Nákupní ředitel', 'Provozní ředitel'],
  key_arguments = ARRAY[
    'Ethylen urychluje zrání — ozon ho rozkládá',
    'Plísně na ovoci — ztráty 10-30%',
    'Prodloužení trvanlivosti o 30-50%',
    'Kontrolované atmosféry',
    'ROI spočitatelný v tunách zachráněného zboží',
    'Úspora na odpisech'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme chladicí systémy', 'Ozon je doplněk — synergický efekt s chlazením',
    'Příliš drahé', 'ROI za 12-18 měsíců přes snížení odpisů',
    'Ozon poškodí ovoce', 'Kontrolované dávky — validované protokoly'
  ),
  success_stories = ARRAY[
    'Sklady Makro: Prodloužení trvanlivosti jablek o 40%',
    'Zelenina CZ: Snížení odpisů o 25% ročně',
    'Ovoce Vysočina: Úspora 1,5M Kč za sezónu'
  ]
WHERE name = 'Sklady ovoce a zeleniny';

-- Chovy a farmy (drůbež, prasata)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 600000,
  average_deal_max_czk = 3000000,
  closing_time_months_min = 4,
  closing_time_months_max = 8,
  decision_makers = ARRAY['Majitel farmy', 'Vedoucí chovu', 'Veterinář', 'Technický ředitel'],
  key_arguments = ARRAY[
    'Amoniak, sirovodík — BOZP rizika',
    'Patogeny (ptačí chřipka, salmonela)',
    'Snížení mortality kuřat o 5-10%',
    'Dezinfekce hal mezi turnusy',
    'Ozon bez reziduí na krmivech',
    'Obrovská úspora na úmrtnosti'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme vakcinace', 'Ozon je doplněk — prevence environmentální kontaminace',
    'Příliš drahé', 'ROI přes snížení mortality — 5% = statisíce',
    'Veterinář to neschválí', 'Ozon je schválená metoda — reference z EU'
  ),
  success_stories = ARRAY[
    'Drůbežárna Klatovy: Snížení mortality o 8%',
    'Prasečák Vysočina: Eliminace amoniaků — BOZP compliance',
    'Farma Bohemia: Úspora 2M Kč ročně na úmrtnosti'
  ]
WHERE name = 'Chovy a farmy (drůbež, prasata)';

-- Skleníky a indoor farmy
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 300000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Majitel farmy', 'Agronom', 'Technolog', 'Bio certifikační auditor'],
  key_arguments = ARRAY[
    'Padlí, plísně, škůdci',
    'Alternativa k pesticidům',
    'Bio certifikace — bezchemické metody',
    'Noční dezinfekce skleníků',
    'Nulové rezidua na produktech',
    'Kompatibilní s bio certifikací'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme bio pesticidy', 'Ozon je ještě ekologičtější — nulové rezidua',
    'Ozon poškodí rostliny', 'Noční aplikace — rostliny v klidu',
    'Bio certifikace to nepovolí', 'Ozon je schválená metoda pro bio — reference'
  ),
  success_stories = ARRAY[
    'Indoor Farm Praha: Eliminace padlí bez chemie',
    'Skleníky Znojmo: Bio certifikace s ozonem',
    'Vertical Farm Brno: Nulové rezidua — prémiová cena'
  ]
WHERE name = 'Skleníky a indoor farmy';

-- Včelařské provozy
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Box', 'PRO I PLUS'],
  average_deal_min_czk = 80000,
  average_deal_max_czk = 350000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Včelař', 'Vedoucí včelína', 'Předseda spolku včelařů'],
  key_arguments = ARRAY[
    'Varroáza, nosematóza — nemoci včel',
    'Dezinfekce úlů a rámků',
    'Clean Box pro rámky a vybavení',
    'PRO I PLUS pro dezinfekci zimovišť',
    'Bez chemie — bezpečné pro včely',
    'Plísně na mezistěnách'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme kyselinu mravenčí', 'Ozon jako doplněk — dezinfekce vybavení',
    'Příliš drahé pro hobby včelaře', 'Sdílení v rámci spolku — kooperativní nákup',
    'Ozon zabije včely', 'Dezinfekce prázdných úlů — ne s včelami uvnitř'
  ),
  success_stories = ARRAY[
    'Včelařský spolek Plzeň: Snížení nosematózy o 60%',
    'Včelín Vysočina: Dezinfekce 200 úlů ročně',
    'Bio med CZ: Certifikace bez chemie'
  ]
WHERE name = 'Včelařské provozy';
