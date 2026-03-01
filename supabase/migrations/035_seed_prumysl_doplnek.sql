-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro zbývající průmyslové segmenty
-- ============================================================================

-- Výrobní podniky
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme průmyslovou ventilaci', 'Ventilace jen vyměňuje vzduch - ozon odstraňuje VOC',
    'Zaměstnanci jsou zvyklí', 'Ale nemocnost stojí peníze - prevence je levnější',
    'Příliš velké prostory', 'PRO I PLUS mobilní - postupná sanitace úseků',
    'Potřebujeme BOZP certifikaci', 'Máme všechny certifikáty - splňujeme BOZP normy',
    'Ozon může reagovat s chemikáliemi', 'Konzultace s technologem - bezpečné použití'
  ),
  success_stories = ARRAY[
    'Výroba plastů Brno: Eliminace VOC - snížení nemocnosti o 30%',
    'Továrna Plzeň: "Certifikát Nově sanitováno v šatnách - zaměstnanci oceňují"',
    'Automotive MB: Dezinfekce mezi směnami - nižší absence'
  ]
WHERE name = 'Výrobní podniky';

-- Potravinářský průmysl
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme HACCP', 'HACCP je standard - ozon je nadstandard pro eliminaci kontaminace',
    'Ozon může ovlivnit chuť', 'Aplikace mimo výrobní čas - žádný vliv na produkt',
    'Potřebujeme certifikaci SZPI', 'Máme certifikáty - splňujeme normy pro potraviny',
    'Příliš drahé', 'Investice vs. náklady na reklamace - ROI přes kvalitu',
    'Potřebujeme validaci', 'Nabízíme kompletní validaci a dokumentaci'
  ),
  success_stories = ARRAY[
    'Pekárna Brno: Nulová kontaminace plísněmi - prodloužení trvanlivosti',
    'Mlékárna Praha: "Certifikát Nově sanitováno - úspěšný audit SZPI"',
    'Masna Plzeň: Dezinfekce chladíren - nižší ztráty'
  ]
WHERE name = 'Potravinářský průmysl';

-- Autoservisy a autodílny
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme ventilaci', 'Ventilace jen odsává - ozon neutralizuje výpary z chemikálií',
    'Zákazníci to neocení', 'Clean Box na čištění interiérů - doplňková služba za příplatek',
    'Příliš drahé', 'PRO I PLUS od 45k Kč - ROI přes doplňkové služby',
    'Ozon může poškodit plasty', 'Certifikované koncentrace - bezpečné pro všechny materiály',
    'Potřebujeme rychlé řešení', 'Clean Box - čištění interiéru za 15 minut'
  ),
  success_stories = ARRAY[
    'Autoservis Brno: Clean Box na interiéry - nový zdroj příjmů 50k Kč/měsíc',
    'Autodílna Praha: "Zákazníci oceňují službu Nově sanitováno"',
    'Pneuservis Plzeň: Eliminace zápachu z díly - lepší prostředí'
  ]
WHERE name = 'Autoservisy a autodílny';

-- Prádelny a čistírny
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme chemickou dezinfekci', 'Chemie poškozuje textilie - ozon je šetrný',
    'Zákazníci to neocení', 'Certifikát "Nově sanitováno" - premium positioning',
    'Příliš drahé', 'PRO I PLUS od 45k Kč - ROI přes premium zákazníky',
    'Ozon může poškodit textilie', 'Certifikované koncentrace - bezpečné pro všechny materiály',
    'Potřebujeme test', 'Nabízíme testování na vzorcích před instalací'
  ),
  success_stories = ARRAY[
    'Prádelna Brno: "Zákazníci oceňují certifikát Nově sanitováno - nárůst +15%"',
    'Čistírna Praha: Dezinfekce delikátních textilií - diferenciace',
    'Prádelna Plzeň: Eliminace zápachu - lepší kvalita služby'
  ]
WHERE name = 'Prádelny a čistírny';
