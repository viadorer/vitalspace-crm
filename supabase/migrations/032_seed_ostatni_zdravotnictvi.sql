-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro zbývající zdravotnické segmenty
-- ============================================================================

-- Nemocnice a kliniky
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme UV lampy a HEPA', 'UV a HEPA jsou standard - ozon je nadstandard pro eliminaci nozokomiálních infekcí',
    'Potřebujeme certifikaci', 'Máme všechny certifikáty pro zdravotnictví - splňujeme ISO 14644',
    'Příliš drahé', 'Investice vs. náklady na nozokomiální infekce - ROI přes snížení mortality',
    'Potřebujeme souhlas primáře', 'Připravíme prezentaci s medicínskými studiemi a ROI kalkulací',
    'Ozon může reagovat s léky', 'Aplikace mimo ordinační hodiny - validace procesu'
  ),
  success_stories = ARRAY[
    'FN Brno: Snížení nozokomiálních infekcí o 35% - úspora na ATB',
    'Klinika Praha: "Pacienti oceňují certifikát Nově sanitováno - vyšší spokojenost"',
    'Nemocnice Plzeň: Dezinfekce operačních sálů - úspěšný audit ISO'
  ]
WHERE name = 'Nemocnice a kliniky';

-- Domovy seniorů a LDN
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Senioři jsou citliví na ozon', 'Aplikace v noci nebo při aktivitách - žádný kontakt',
    'Máme dezinfekci', 'Chemická dezinfekce jen povrchy - ozon dezinfikuje vzduch',
    'Příliš drahé', 'Investice vs. náklady na léčbu respiračních infekcí - ROI přes zdraví',
    'Potřebujeme souhlas hygieny', 'Máme certifikáty - splňujeme hygienické normy',
    'Rodiny to neocení', 'Certifikát "Nově sanitováno" - důvěra rodin při výběru domova'
  ),
  success_stories = ARRAY[
    'Domov seniorů Brno: Snížení respiračních infekcí o 40% - úspora za léčbu 300k Kč/rok',
    'LDN Praha: "Rodiny oceňují certifikát Nově sanitováno - plná obsazenost"',
    'Senior rezidence Plzeň: Dezinfekce pokojů - vyšší spokojenost obyvatel'
  ]
WHERE name = 'Domovy seniorů a LDN';
