-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro hospitality segmenty
-- ============================================================================

-- Hotely (již má data jako "Hotely a penziony", ale aktualizujeme pokud existuje samostatně)
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme úklid po každém hostovi', 'Úklid neodstraní viry a pachy z matrací - ozon ano',
    'Hosté si nestěžují', 'Ale negativní recenze kvůli pachům snižují rating',
    'Příliš drahé', 'PRO I PLUS od 45k Kč - ROI přes lepší recenze',
    'Ozon může poškodit textilie', 'Certifikované koncentrace - bezpečné',
    'Potřebujeme rychlou sanitaci', 'PRO I PLUS - sanitace pokoje za 20 minut'
  ),
  success_stories = ARRAY[
    'Hotel Brno: Rating na Booking.com +0.5 bodu díky "Nově sanitováno"',
    'Wellness hotel KV: "Hosté oceňují dezinfekci - opakované návštěvy +30%"',
    'Boutique hotel Praha: Eliminace pachů - premium positioning'
  ]
WHERE name = 'Hotely';

-- Penziony a Airbnb
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme malý penzion', 'PRO I PLUS mobilní - sanitace postupně všech pokojů',
    'Hosté to neocení', 'Certifikát "Nově sanitováno" na Airbnb - vyšší cena',
    'Příliš drahé', 'PRO I PLUS od 45k Kč - ROI přes vyšší ceny a obsazenost',
    'Potřebujeme rychlý turnaround', 'Sanitace za 20 minut mezi hosty',
    'Ozon může vadit hostům', 'Aplikace mezi hosty - žádný kontakt'
  ),
  success_stories = ARRAY[
    'Penzion Šumava: Rating na Airbnb +0.4 bodu díky "Nově sanitováno"',
    'Airbnb Praha: "Hosté oceňují certifikát - možnost zvýšit cenu o 15%"',
    'Penzion Krkonoše: Eliminace pachů z kuřáckých pokojů'
  ]
WHERE name = 'Penziony a Airbnb';

-- Vinařství a pivovary
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Ozon může ovlivnit chuť', 'Instalace mimo sklady - jen degustační místnost',
    'Máme klimatizaci', 'Klimatizace jen reguluje teplotu - ozon ničí plísně',
    'Příliš drahé', 'PRO I PLUS od 45k Kč - ROI přes ochranu produktu',
    'Potřebujeme test', 'Nabízíme testování - žádný vliv na chuť',
    'Bio výroba - chemie zakázána', 'Ozon je přírodní - ideální pro bio'
  ),
  success_stories = ARRAY[
    'Vinařství Morava: Ochrana vín před plísněmi - nulové ztráty',
    'Pivovar Praha: "Certifikát Nově sanitováno v degustační místnosti"',
    'Vinařství JM: Dezinfekce skladu - bio certifikace zachována'
  ]
WHERE name = 'Vinařství a pivovary';

-- Jóga a pilates studia
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme malé studio', 'Proto je čistý vzduch klíčový - intimní prostředí',
    'Klienti to neocení', 'Wellness segment očekává prémiovou hygienu',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes premium positioning',
    'Clean Box na podložky?', 'Ano - dezinfekce sdíleného vybavení bez chemie',
    'Ozon může vadit při józe', 'Aplikace v noci - ne během lekcí'
  ),
  success_stories = ARRAY[
    'Jóga studio Brno: "Klienti oceňují certifikát Nově sanitováno - plné lekce"',
    'Hot jóga Praha: Eliminace zápachu - lepší prostředí',
    'Pilates Plzeň: Clean Box na podložky - diferenciace'
  ]
WHERE name = 'Jóga a pilates studia';
