-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro zbývající vzdělávací segmenty
-- ============================================================================

-- Střední a vysoké školy (již existuje jako "Univerzity a vysoké školy")
-- Aktualizujeme název pokud existuje starý
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Studenti jsou dospělí', 'Ale sick building syndrom snižuje koncentraci a výsledky',
    'Máme velké prostory', 'Začneme s pilotními učebnami - škálovatelné řešení',
    'Nemáme rozpočet', 'Dotace z MŠMT + leasing - investice do kvality výuky',
    'Potřebujeme souhlas vedení', 'Připravíme business case s daty o produktivitě',
    'Studenti to neocení', 'Certifikát "Nově sanitováno" - konkurenční výhoda'
  ),
  success_stories = ARRAY[
    'Gymnázium Brno: Clean Up v učebnách - studenti oceňují čistý vzduch',
    'VOŠ Praha: Snížení absence o 20% - lepší výsledky',
    'SŠ Plzeň: "Certifikát Nově sanitováno - diferenciace při náboru"'
  ]
WHERE name = 'Střední a vysoké školy';

-- Jazykové školy a vzdělávací centra
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme malé učebny', 'Proto je čistý vzduch klíčový - vysoká koncentrace lidí',
    'Klienti to neocení', 'Certifikát "Nově sanitováno" - diferenciace od konkurence',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes lepší recenze a opakované kurzy',
    'Máme klimatizaci', 'Klimatizace jen ochlazuje - ozon dezinfikuje',
    'Potřebujeme rychlý efekt', 'Instalace za 2 hodiny - okamžitý benefit'
  ),
  success_stories = ARRAY[
    'Jazykovka Brno: "Studenti oceňují certifikát Nově sanitováno - plné kurzy"',
    'Vzdělávací centrum Praha: Eliminace zápachu - lepší recenze',
    'Angličtina Plzeň: Dezinfekce mezi kurzy - nižší nemocnost lektorů'
  ]
WHERE name = 'Jazykové školy a vzdělávací centra';
