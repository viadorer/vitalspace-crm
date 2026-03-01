-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro školství
-- ============================================================================

-- Základní školy
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Nemáme rozpočet', 'Dotace z kraje na zdravé prostředí + leasing - investice do zdraví dětí',
    'Rodiče to neocení', 'Certifikát "Nově sanitováno" na dveřích třídy - známka kvalitní péče',
    'Máme pravidelný úklid', 'Úklid neodstraní viry z vzduchu - děti se stejně nakazí od sebe',
    'Potřebujeme souhlas zřizovatele', 'Připravíme prezentaci pro zastupitelstvo s daty o absencích',
    'Ozon může být nebezpečný pro děti', 'Aplikace v noci nebo o víkendu - certifikované a bezpečné'
  ),
  success_stories = ARRAY[
    'ZŠ Brno-Líšeň: Snížení absence žáků o 28% - úspora za zastupování učitelů 150k Kč/rok',
    'ZŠ Praha 6: "Rodiče oceňují certifikát Nově sanitováno - plné třídy i v chřipkové sezóně"',
    'ZŠ Plzeň-Doubravka: Eliminace zápachu ze šaten - lepší prostředí pro výuku'
  ]
WHERE name = 'Základní školy';

-- Mateřské školy
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Děti jsou malé, bojí se strojů', 'Instalace nástropní - děti ji nevidí, Clean Box vypadá jako skříňka',
    'Rodiče se bojí chemie', 'Ozon je přírodní - žádná chemie, bezpečné pro děti',
    'Nemáme rozpočet', 'Clean Up od 80k Kč + dotace - investice do zdraví dětí',
    'Hračky stejně dezinfikujeme', 'Ale vzduch ne - Clean Box dezinfikuje hračky bez chemie',
    'Potřebujeme souhlas zřizovatele', 'Připravíme prezentaci s benefity pro rodiče a děti'
  ),
  success_stories = ARRAY[
    'MŠ Sluníčko Brno: "Rodiče oceňují certifikát Nově sanitováno - plná třída bez čekací listiny"',
    'MŠ Praha-Vinohrady: Snížení nemocnosti dětí o 35% - spokojenější rodiče',
    'MŠ Plzeň: Clean Box na hračky - diferenciace od konkurence'
  ]
WHERE name = 'Mateřské školy';

-- Univerzity a vysoké školy
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Studenti jsou dospělí, zvládnou to', 'Ale sick building syndrom snižuje koncentraci a výsledky',
    'Máme velké prostory', 'Začneme s pilotními učebnami a knihovnou - škálovatelné řešení',
    'Nemáme rozpočet', 'Dotace z MŠMT + leasing - investice do kvality výuky',
    'Potřebujeme souhlas rektora', 'Připravíme business case s daty o produktivitě studentů',
    'Studenti to neocení', 'Certifikát "Nově sanitováno" - konkurenční výhoda při náboru'
  ),
  success_stories = ARRAY[
    'VUT Brno: Clean Up v knihovně - studenti oceňují čistý vzduch při učení',
    'UK Praha: Snížení nemocnosti vyučujících o 20% - úspora za zastupování',
    'ZČU Plzeň: "Certifikát Nově sanitováno v učebnách - diferenciace od konkurence"'
  ]
WHERE name = 'Univerzity a vysoké školy';
