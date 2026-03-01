-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro potraviny a zemědělství
-- ============================================================================

-- Potravinářské výroby
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme HACCP', 'HACCP je standard - ozon je nadstandard pro eliminaci kontaminace',
    'Ozon může ovlivnit chuť', 'Aplikace mimo výrobní čas - žádný vliv na produkt',
    'Potřebujeme certifikaci SZPI', 'Máme certifikáty pro potravinářství - splňujeme normy',
    'Příliš drahé', 'Investice vs. náklady na reklamace - ROI přes kvalitu',
    'Potřebujeme validaci procesu', 'Nabízíme kompletní validaci a dokumentaci pro audit'
  ),
  success_stories = ARRAY[
    'Pekárna Brno: Certifikát "Nově sanitováno" - nulová kontaminace plísněmi',
    'Mlékárna Praha: Dezinfekce balírny - prodloužení trvanlivosti o 20%',
    'Masna Plzeň: Sanitace chladíren - úspěšný audit SZPI'
  ]
WHERE name = 'Potravinářské výroby';

-- Supermarkety a obchody
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme klimatizaci', 'Klimatizace jen ochlazuje - ozon dezinfikuje vzduch mezi zákazníky',
    'Zákazníci to neocení', 'Certifikát "Nově sanitováno" u vchodu - důvěra po covidu',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes vyšší návštěvnost',
    'Ozon může ovlivnit potraviny', 'Instalace mimo prodejnu - jen sociální zařízení a sklad',
    'Potřebujeme souhlas centrály', 'Připravíme prezentaci s benefity pro zákazníky'
  ),
  success_stories = ARRAY[
    'Albert Brno: "Zákazníci oceňují certifikát Nově sanitováno - vyšší návštěvnost +10%"',
    'Billa Praha: Dezinfekce sociálních zařízení - lepší recenze',
    'Kaufland Plzeň: Sanitace skladu - nižší ztráty na zkažených potravinách'
  ]
WHERE name = 'Supermarkety a obchody';

-- Farmářské trhy
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Jsme venku', 'Ale stánky a chladící boxy jsou uzavřené - prevence kontaminace',
    'Zákazníci to neocení', 'Certifikát "Nově sanitováno" na stánku - diferenciace',
    'Nemám kde skladovat přístroj', 'Clean Box portable - vejde se do auta',
    'Příliš drahé pro malého farmáře', 'Clean Box od 25k Kč - ROI přes vyšší ceny bio produktů',
    'Ozon může poškodit zeleninu', 'Aplikace na prázdné boxy - ne na potraviny'
  ),
  success_stories = ARRAY[
    'Bio farmář Brno: "Zákazníci oceňují certifikát Nově sanitováno - vyšší prodej +25%"',
    'Farmářský trh Praha: Dezinfekce chladících boxů - prodloužení trvanlivosti',
    'Zelinář Plzeň: Sanitace stánku - diferenciace od konkurence'
  ]
WHERE name = 'Farmářské trhy';

-- Vinotéky a pivovary
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Ozon může ovlivnit chuť vína', 'Instalace mimo sklad - jen degustační místnost',
    'Zákazníci to neocení', 'Certifikát "Nově sanitováno" - premium positioning',
    'Máme klimatizaci', 'Klimatizace jen reguluje teplotu - ozon odstraňuje plísně',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes premium zákazníky',
    'Potřebujeme test na vzorcích', 'Nabízíme testování - žádný vliv na chuť'
  ),
  success_stories = ARRAY[
    'Vinotéka Brno: "Zákazníci oceňují certifikát Nově sanitováno v degustační místnosti"',
    'Pivovar Praha: Dezinfekce výčepu - eliminace plísní',
    'Vinařství Morava: Sanitace skladu - ochrana vín před kontaminací'
  ]
WHERE name = 'Vinotéky a pivovary';
