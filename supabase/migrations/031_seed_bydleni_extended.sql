-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro bydlení a správu nemovitostí
-- ============================================================================

-- Bytové domy a SVJ
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme úklid společných prostor', 'Úklid neodstraní viry ze vzduchu - ozon ano',
    'Vlastníci to neocení', 'Certifikát "Nově sanitováno" ve výtahu - zvýšení hodnoty nemovitosti',
    'Příliš drahé pro SVJ', 'Clean Up od 80k Kč do společných prostor - investice do hodnoty',
    'Potřebujeme souhlas shromáždění', 'Připravíme prezentaci s benefity pro vlastníky',
    'Ozon může vadit obyvatelům', 'Aplikace v noci - žádný kontakt s obyvateli'
  ),
  success_stories = ARRAY[
    'SVJ Brno-Líšeň: "Vlastníci oceňují certifikát Nově sanitováno - nárůst cen bytů +3%"',
    'Bytový dům Praha 6: Dezinfekce výtahů a chodeb - eliminace zápachu',
    'Rezidence Plzeň: Sanitace fitness centra - diferenciace od konkurence'
  ]
WHERE name = 'Bytové domy a SVJ';

-- Realitní kanceláře
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Klienti chodí na krátko', 'Ale první dojem rozhoduje - čistý vzduch = důvěra',
    'Nemáme rozpočet', 'Clean Up od 80k Kč - ROI přes uzavřené dealy',
    'Máme klimatizaci', 'Klimatizace jen ochlazuje - ozon odstraňuje pachy a dezinfikuje',
    'Klienti to neocení', 'Certifikát "Nově sanitováno" - premium positioning',
    'Potřebuji vidět výsledky', 'Nabízíme testovací provoz 14 dní'
  ),
  success_stories = ARRAY[
    'Realitka Brno: "Klienti oceňují certifikát Nově sanitováno - vyšší důvěra"',
    'RE/MAX Praha: Dezinfekce kanceláře - eliminace zápachu',
    'Century 21 Plzeň: Sanitace jednacích místností - profesionální dojem'
  ]
WHERE name = 'Realitní kanceláře';

-- Správcovské firmy
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme úklid', 'Úklid neodstraní viry - ozon ano, navíc snižuje náklady na úklid',
    'Vlastníci nechtějí platit', 'Certifikát "Nově sanitováno" zvyšuje hodnotu nemovitosti',
    'Příliš drahé pro portfolio', 'Postupná implementace - začít s prémiovými objekty',
    'Potřebujeme souhlas vlastníků', 'Připravíme prezentaci s ROI kalkulací',
    'Ozon může poškodit vybavení', 'Certifikované koncentrace - bezpečné pro všechny materiály'
  ),
  success_stories = ARRAY[
    'Správa Brno: "Vlastníci oceňují certifikát Nově sanitováno - nárůst hodnoty +5%"',
    'Property management Praha: Dezinfekce společných prostor - nižší fluktuace nájemníků',
    'Facility Plzeň: Sanitace kanceláří - konkurenční výhoda'
  ]
WHERE name = 'Správcovské firmy';

-- Domovy důchodců
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme dezinfekci', 'Chemická dezinfekce jen povrchy - ozon dezinfikuje vzduch',
    'Senioři jsou citliví', 'Proto je prevence klíčová - ozon chrání před nákazami',
    'Příliš drahé', 'Investice vs. náklady na léčbu nákaz - ROI přes zdraví seniorů',
    'Potřebujeme souhlas hygieny', 'Máme certifikáty - splňujeme hygienické normy',
    'Ozon může vadit seniorům', 'Aplikace v noci nebo při aktivitách - žádný kontakt'
  ),
  success_stories = ARRAY[
    'Domov seniorů Brno: Snížení respiračních infekcí o 40% - úspora za léčbu',
    'Senior rezidence Praha: "Rodiny oceňují certifikát Nově sanitováno - plná obsazenost"',
    'Penzion pro seniory Plzeň: Dezinfekce pokojů - vyšší spokojenost'
  ]
WHERE name = 'Domovy důchodců';
