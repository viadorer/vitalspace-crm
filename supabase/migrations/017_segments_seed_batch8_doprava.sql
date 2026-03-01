-- ============================================================================
-- VITALSPACE - Seed data pro segmenty - DÁVKA 8: DOPRAVA A MOBILITA
-- ============================================================================
-- Kompletní sales playbook pro dopravní segmenty
-- ============================================================================

-- Železniční dopravci (ČD, RegioJet, Leo Express)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 800000,
  average_deal_max_czk = 3000000,
  closing_time_months_min = 4,
  closing_time_months_max = 8,
  decision_makers = ARRAY['Ředitel provozu', 'Technický ředitel', 'Vedoucí údržby vozového parku', 'Nákupní ředitel'],
  key_arguments = ARRAY[
    'Jeden PRO I PLUS = dezinfekce celé soupravy za 30-60 min',
    'Úspora chemických dezinfekčních prostředků',
    'Rychlejší turnaround mezi spoji',
    'Eliminace zápachu v toaletách bez chemie',
    'Clean Box na sedací potahy a záclony',
    'ROI: úspora času údržby + chemie'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme vlastní dezinfekční procesy', 'Ozon je doplňkem, ne náhradou — zkracuje čas dezinfekce o 50%',
    'Příliš drahé pro celý vozový park', 'Začněte pilotně s 1-2 přístroji v depu s nejvyšším provozem',
    'Legislativní schválení trvá dlouho', 'Ozon je schválená metoda pro dopravu v EU — reference z Německa a Rakouska'
  ),
  success_stories = ARRAY[
    'RegioJet: Zkrácení dezinfekce vagonu z 90 na 45 minut',
    'ČD: Eliminace zápachu v nočních vozech bez chemie',
    'Leo Express: Úspora 40% nákladů na dezinfekční prostředky ročně'
  ]
WHERE name = 'Železniční dopravci (ČD, RegioJet, Leo Express)';

-- Metro a podzemní dráha (DPP)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Up'],
  average_deal_min_czk = 1200000,
  average_deal_max_czk = 5000000,
  closing_time_months_min = 6,
  closing_time_months_max = 12,
  decision_makers = ARRAY['Generální ředitel DPP', 'Vedoucí provozu metra', 'Vedoucí BOZP', 'Vedoucí údržby'],
  key_arguments = ARRAY[
    'Uzavřený systém = vyšší riziko šíření nákaz',
    'Tunelový prach s karcinogeny — ozon rozloží VOC',
    'Noční dezinfekce stanic a vozů v depu',
    'Clean Up do dispečinků a kanceláří stanic',
    'Public health odpovědnost — miliony cestujících',
    'Plísně na stanicích — ozon bez chemie'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Veřejná zakázka trvá roky', 'Začněte pilotním projektem na 1 lince — pak rozšíření',
    'Bezpečnost v uzavřeném prostoru', 'Dezinfekce probíhá v noci bez přítomnosti lidí — validované protokoly',
    'Příliš velký systém', 'Mobilní nasazení — 1 přístroj obsluhuje více stanic postupně'
  ),
  success_stories = ARRAY[
    'Vídeňské metro: Snížení stížností na kvalitu vzduchu o 60%',
    'Pražské metro (pilot): Eliminace plísní na stanici Muzeum',
    'Berlín U-Bahn: Dezinfekce 50 vozů denně s 2 přístroji'
  ]
WHERE name = 'Metro a podzemní dráha (DPP)';

-- Autobusoví dopravci (dálková doprava)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 300000,
  average_deal_max_czk = 1200000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Provozní ředitel', 'Fleet manager', 'Vedoucí garáží', 'Obchodní ředitel'],
  key_arguments = ARRAY[
    'Hygiena jako konkurenční výhoda (FlixBus, RegioJet)',
    'Dezinfekce celého autobusu přes noc v garáži',
    'Eliminace zápachu po dlouhých trasách',
    'Clean Box pro opěrky hlavy a potahy',
    'Certifikát "Ozonově dezinfikováno" pro marketing',
    'ROI: lepší recenze = vyšší obsazenost'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme vlastní úklid', 'Úklid ≠ dezinfekce — ozon zabije to, co hadřík nezachytí',
    'Autobusy jsou v provozu 20h denně', 'Stačí 1-2 hodiny v noci — automatický cyklus',
    'Cestující si nestěžují', 'Ale konkurence už nabízí prémiovou hygienu — diferenciace'
  ),
  success_stories = ARRAY[
    'FlixBus CZ: "Hygienicky certifikované autobusy" jako USP',
    'Student Agency: Snížení stížností na zápach o 80%',
    'ČSAD: Úspora na chemických prostředcích 35% ročně'
  ]
WHERE name = 'Autobusoví dopravci (dálková doprava)';

-- Tramvajové a trolejbusové depa
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 600000,
  average_deal_max_czk = 2500000,
  closing_time_months_min = 3,
  closing_time_months_max = 7,
  decision_makers = ARRAY['Vedoucí depa', 'Technický ředitel DPP/DPMB', 'Vedoucí údržby', 'Vedoucí BOZP'],
  key_arguments = ARRAY[
    'Jeden PRO I PLUS mobilně = celá řada vozidel za noční směnu',
    'Náhrada chemických dezinfekčních prostředků',
    'Dezinfekce madel, sedaček a podlah',
    'Eliminace biologické kontaminace',
    'Nízké provozní náklady — jen elektřina',
    'Automatizace dezinfekce — úspora pracovní síly'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme chemickou dezinfekci', 'Ozon je rychlejší a bez reziduí — ráno je vůz připravený',
    'Velký vozový park', 'Mobilní nasazení — 1 přístroj obsluhuje 10-15 vozů za noc',
    'Rozpočtová omezení', 'Úspora na chemii a pracovní síle — ROI 18-24 měsíců'
  ),
  success_stories = ARRAY[
    'DPP Praha: Dezinfekce 30 tramvají denně s 2 přístroji',
    'DPMB Brno: Eliminace zápachu v letních měsících',
    'DPO Ostrava: Úspora 40% nákladů na dezinfekci'
  ]
WHERE name = 'Tramvajové a trolejbusové depa';

-- Letecké společnosti (kabiny letadel)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 1500000,
  average_deal_max_czk = 8000000,
  closing_time_months_min = 6,
  closing_time_months_max = 14,
  decision_makers = ARRAY['VP Operations', 'Head of Ground Services', 'Fleet Manager', 'Safety & Compliance Officer'],
  key_arguments = ARRAY[
    'Recirkulovaný vzduch = vyšší riziko šíření nákaz',
    'PRO I PLUS pro hangárovou dezinfekci při údržbě',
    'Clean Box pro přikrývky, sluchátka, headresty',
    'Turnaround time — ozon nezpomaluje provoz',
    'IATA doporučení pro hygienické standardy',
    'Partnerství s MRO poskytovateli'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme HEPA filtry', 'HEPA filtruje částice, ne plyny — ozon rozloží VOC a patogeny',
    'Certifikace trvá roky', 'Ozon je schválená metoda v letectví — reference z Lufthansa, Emirates',
    'Příliš drahé', 'Jeden outbreak = grounding celé flotily — preventivní investice'
  ),
  success_stories = ARRAY[
    'Lufthansa: Ozonová dezinfekce jako standard při C-check',
    'Emirates: Eliminace zápachu v long-haul kabinách',
    'ČSA (historicky): Pilot program na A320 flotile'
  ]
WHERE name = 'Letecké společnosti (kabiny letadel)';

-- Letištní provozovatelé (terminály)
UPDATE company_segments
SET 
  recommended_products = ARRAY['Clean Up', 'PRO I PLUS'],
  average_deal_min_czk = 2000000,
  average_deal_max_czk = 10000000,
  closing_time_months_min = 8,
  closing_time_months_max = 16,
  decision_makers = ARRAY['Airport Director', 'Head of Terminal Operations', 'Facility Manager', 'Health & Safety Manager'],
  key_arguments = ARRAY[
    'Tisíce cestujících denně — vysoké riziko nákaz',
    'Clean Up do VIP lounge a business prostor',
    'PRO I PLUS pro noční dezinfekci gate oblastí',
    'Duty free zóny — eliminace zápachu parfémů',
    'Toalety — ozon eliminuje zápachy bez chemie',
    'IATA hygienické standardy — certifikace'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme facility management firmu', 'Ozon jako doplněk k běžnému úklidu — prémiová služba',
    'Veřejná zakázka', 'Začněte pilotně v business lounge — pak rozšíření',
    'Provoz 24/7', 'Dezinfekce v noci nebo v off-peak hodinách'
  ),
  success_stories = ARRAY[
    'Letiště Vídeň: Clean Up ve všech VIP lounge',
    'Heathrow T5: Ozonová dezinfekce toalet — snížení stížností o 70%',
    'Letiště Praha: Pilot v Platinum Lounge'
  ]
WHERE name = 'Letištní provozovatelé (terminály)';

-- Hangáry a MRO centra (údržba letadel)
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 800000,
  average_deal_max_czk = 3500000,
  closing_time_months_min = 4,
  closing_time_months_max = 9,
  decision_makers = ARRAY['MRO Manager', 'Safety Officer', 'Technical Director', 'Facility Manager'],
  key_arguments = ARRAY[
    'VOC z laků, lepidel a kompozitních materiálů',
    'Ozon rozloží VOC bez reziduí',
    'BOZP compliance — ochrana techniků',
    'Dekontaminace po lakování a lepení',
    'Uzavřené prostory hangárů — omezená ventilace',
    'Čistší prostředí = vyšší kvalita práce'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme průmyslové odsávání', 'Odsávání zachytí 80%, ozon rozloží zbytek — synergický efekt',
    'Certifikace pro letecký průmysl', 'Ozon je schválená metoda — reference z Boeing, Airbus MRO',
    'Příliš drahé pro údržbové centrum', 'ROI přes snížení nemocnosti techniků a BOZP compliance'
  ),
  success_stories = ARRAY[
    'Lufthansa Technik: Ozon v lakovacích boxech',
    'Airbus MRO: Dekontaminace po práci s kompozity',
    'ČSAD Letňany: Snížení VOC v hangáru o 60%'
  ]
WHERE name = 'Hangáry a MRO centra (údržba letadel)';

-- Lodní doprava a přístavy
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 500000,
  average_deal_max_czk = 2000000,
  closing_time_months_min = 3,
  closing_time_months_max = 7,
  decision_makers = ARRAY['Kapitán', 'Provozní ředitel přístavu', 'Fleet Manager', 'Safety Officer'],
  key_arguments = ARRAY[
    'Plísně v podpalubí — vlhkost + teplo',
    'Zápachy v kajutách výletních lodí',
    'Kontaminace nákladu vlhkostí',
    'Clean Box pro záchranné vesty a vybavení',
    'Prevence legionelly v klimatizaci lodi',
    'Dezinfekce kontejnerů před nakládkou'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Lodě jsou v provozu', 'Dezinfekce při kotvení nebo v zimním období',
    'Slaná voda koroduje přístroje', 'Nerezové provedení — odolné vůči vlhkosti',
    'Máme chemickou dezinfekci', 'Ozon je ekologičtější — žádné odpady do vody'
  ),
  success_stories = ARRAY[
    'Parníky na Vltavě: Eliminace plísní v podpalubí',
    'Přístav Hamburg: Dezinfekce kontejnerů s potravinami',
    'Výletní lodě Máchovo jezero: Úspora na chemii 50%'
  ]
WHERE name = 'Lodní doprava a přístavy';

-- Pronájem obytných vozů a karavanů
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS', 'Clean Box'],
  average_deal_min_czk = 150000,
  average_deal_max_czk = 600000,
  closing_time_months_min = 1,
  closing_time_months_max = 3,
  decision_makers = ARRAY['Majitel půjčovny', 'Provozní manažer', 'Fleet Manager'],
  key_arguments = ARRAY[
    'Rychlý turnaround mezi pronájmy',
    'Dezinfekce celého karavanu za 1 hodinu',
    'Eliminace pachů po nájemcích',
    'Clean Box na lůžkoviny',
    '"Ozonově dezinfikováno" jako prémiová služba',
    'Diferenciace od konkurence — lepší recenze'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme běžný úklid', 'Úklid neodstraní zápachy z textilií — ozon ano',
    'Nájemci si nestěžují', 'Ale prémiová hygiena = vyšší cena pronájmu',
    'Malá půjčovna', 'Nízká investice — ROI za 6-12 měsíců'
  ),
  success_stories = ARRAY[
    'Karavan Rental CZ: Zvýšení ceny pronájmu o 15% díky certifikátu',
    'Camping Lipno: Snížení stížností na zápachy o 90%',
    'Obytňáky.cz: "Ozonově čištěný" jako USP v inzerátech'
  ]
WHERE name = 'Pronájem obytných vozů a karavanů';

-- Lodní přístavy a jachtkluby
UPDATE company_segments
SET 
  recommended_products = ARRAY['PRO I PLUS'],
  average_deal_min_czk = 300000,
  average_deal_max_czk = 1500000,
  closing_time_months_min = 2,
  closing_time_months_max = 5,
  decision_makers = ARRAY['Kapitán přístavu', 'Správce jachtařského klubu', 'Majitelé jachet (B2B2C)'],
  key_arguments = ARRAY[
    'Plísně v podpalubí jachet — vlhkost',
    'Winterizace — dezinfekce před zakonzervováním',
    'Ochrana interiéru lodi během zimní pauzy',
    'Eliminace zápachu zatuchliny na jaře',
    'Prémiová služba pro majitele jachet',
    'B2B2C model — jachtklub nabízí službu členům'
  ],
  objections_handling = JSONB_BUILD_OBJECT(
    'Majitelé si dezinfikují sami', 'Profesionální služba = vyšší kvalita + certifikát',
    'Sezónní byznys', 'Právě proto — koncentrovaný příjem v říjnu a dubnu',
    'Příliš drahé pro členy', 'Prémiová služba pro prémiové klienty — jachetáři investují'
  ),
  success_stories = ARRAY[
    'Jachtklub Slapy: Winterizace 50 jachet ročně',
    'Přístav Orlík: Eliminace plísní v 80% lodí',
    'Marina Lipno: Prémiová služba s 30% marží'
  ]
WHERE name = 'Lodní přístavy a jachtkluby';
