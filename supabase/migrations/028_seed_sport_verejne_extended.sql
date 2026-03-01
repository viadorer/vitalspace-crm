-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro sport a veřejné prostory
-- ============================================================================

-- Bazény a aquaparky
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme chlor', 'Chlor jen ve vodě - ozon dezinfikuje vzduch v šatnách a odpočívárně',
    'Návštěvníci to neocení', 'Certifikát "Nově sanitováno" - diferenciace od konkurence',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes opakované návštěvy',
    'Ozon může reagovat s chlorem', 'Instalace mimo bazén - jen šatny a sociální zařízení',
    'Potřebujeme souhlas hygieny', 'Máme certifikáty - splňujeme hygienické normy'
  ),
  success_stories = ARRAY[
    'Aquapark Brno: "Návštěvníci oceňují certifikát Nově sanitováno - nárůst +15%"',
    'Bazén Praha: Eliminace zápachu ze šaten - lepší recenze',
    'Wellness Karlovy Vary: Dezinfekce odpočívárny - premium positioning'
  ]
WHERE name = 'Bazény a aquaparky';

-- Sportovní haly
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme ventilaci', 'Ventilace jen vyměňuje vzduch - ozon odstraňuje pot a bakterie',
    'Sportovci jsou zvyklí', 'Ale rodiče dětí oceňují čistý vzduch - konkurenční výhoda',
    'Nemáme rozpočet', 'Clean Up od 80k Kč + dotace z kraje na sport',
    'Ozon může ovlivnit výkon', 'Aplikace v noci - ne během tréninků',
    'Potřebujeme souhlas svazu', 'Máme reference z profesionálních klubů'
  ),
  success_stories = ARRAY[
    'Hokejová hala Brno: "Rodiče oceňují certifikát Nově sanitováno - plné tréninky"',
    'Basketbalová hala Praha: Eliminace zápachu ze šaten - lepší prostředí',
    'Volejbalový klub Plzeň: Dezinfekce mezi zápasy - diferenciace'
  ]
WHERE name = 'Sportovní haly';

-- Divadla a kina
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme klimatizaci', 'Klimatizace jen ochlazuje - ozon dezinfikuje vzduch mezi představeními',
    'Diváci to neocení', 'Certifikát "Nově sanitováno" - důvěra po covidu',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes vyšší návštěvnost',
    'Ozon může ovlivnit akustiku', 'Instalace nástropní - žádný vliv na zvuk',
    'Potřebujeme rychlou sanitaci', 'PRO I PLUS - sanitace za 30 minut mezi představeními'
  ),
  success_stories = ARRAY[
    'Divadlo Brno: "Diváci oceňují certifikát Nově sanitováno - plná sezóna"',
    'Kino Praha: Dezinfekce sálu mezi projekcemi - důvěra návštěvníků',
    'Multikino Plzeň: Eliminace pachů - lepší zážitek'
  ]
WHERE name = 'Divadla a kina';

-- Knihovny a archivy
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Ozon může poškodit knihy', 'Certifikované koncentrace - bezpečné pro papír a kůži',
    'Máme klimatizaci', 'Klimatizace jen reguluje teplotu - ozon ničí plísně a roztoče',
    'Návštěvníci to neocení', 'Certifikát "Nově sanitováno" - důvěra po covidu',
    'Nemáme rozpočet', 'Clean Up od 80k Kč + dotace z MŠMT na kulturu',
    'Potřebujeme test na vzorcích', 'Nabízíme testování na vzorcích před instalací'
  ),
  success_stories = ARRAY[
    'Městská knihovna Brno: "Čtenáři oceňují certifikát Nově sanitováno - nárůst návštěv +20%"',
    'Národní archiv Praha: Ochrana dokumentů před plísněmi - validace procesu',
    'Knihovna Plzeň: Eliminace zápachu ze starých knih - lepší prostředí'
  ]
WHERE name = 'Knihovny a archivy';
