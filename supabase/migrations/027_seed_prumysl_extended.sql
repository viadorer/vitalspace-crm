-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro průmysl a sklady
-- ============================================================================

-- Výrobní haly a továrny
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme průmyslovou ventilaci', 'Ventilace jen vyměňuje vzduch - ozon odstraňuje VOC a pachy z výroby',
    'Zaměstnanci jsou zvyklí', 'Ale nemocnost stojí peníze - prevence je levnější',
    'Příliš velké prostory', 'PRO I PLUS mobilní - postupná sanitace jednotlivých úseků',
    'Potřebujeme certifikaci BOZP', 'Máme všechny certifikáty - splňujeme normy pro průmysl',
    'Ozon může reagovat s chemikáliemi', 'Konzultace s technologem - bezpečné použití'
  ),
  success_stories = ARRAY[
    'Výroba plastů Brno: Eliminace VOC z výroby - snížení nemocnosti o 30%',
    'Továrna Plzeň: "Certifikát Nově sanitováno v šatnách - zaměstnanci oceňují"',
    'Automotive Mladá Boleslav: Dezinfekce mezi směnami - nižší absence'
  ]
WHERE name = 'Výrobní haly a továrny';

-- Sklady a logistická centra
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme velké prostory', 'PRO I PLUS mobilní - sanitace po úsecích, škálovatelné řešení',
    'Zaměstnanci jsou venku', 'Ale šatny a odpočívárny jsou uzavřené - prevence nákaz',
    'Nemáme rozpočet', 'PRO I PLUS od 45k Kč - ROI přes nižší nemocnost',
    'Potřebujeme souhlas vedení', 'Připravíme kalkulaci úspor za sick days',
    'Skladové zboží může být citlivé', 'Ozon nepoškozuje balené zboží - certifikované použití'
  ),
  success_stories = ARRAY[
    'Logistika Brno: Snížení nemocnosti skladníků o 25% - úspora 200k Kč/rok',
    'Sklad Plzeň: "Certifikát Nově sanitováno v odpočívárně - zaměstnanci oceňují"',
    'E-commerce Praha: Dezinfekce šaten mezi směnami - nižší fluktuace'
  ]
WHERE name = 'Sklady a logistická centra';

-- Čisté prostory (cleanroom)
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme HEPA filtry', 'HEPA filtruje částice - ozon ničí viry a bakterie, komplementární řešení',
    'Potřebujeme certifikaci ISO', 'Máme certifikáty pro cleanroom - splňujeme ISO normy',
    'Ozon může kontaminovat výrobu', 'Aplikace mimo výrobní čas - validace procesu',
    'Příliš drahé', 'Investice vs. náklady na reklamace - ROI přes kvalitu výroby',
    'Potřebujeme validaci', 'Nabízíme kompletní validaci a dokumentaci pro audit'
  ),
  success_stories = ARRAY[
    'Farma výroba Brno: Certifikace cleanroom s ozonem - splnění ISO 14644',
    'Elektronika Praha: "Nově sanitováno mezi výrobními cykly - nulová kontaminace"',
    'Medical devices Plzeň: Validace procesu - úspěšný audit FDA'
  ]
WHERE name = 'Čisté prostory (cleanroom)';
