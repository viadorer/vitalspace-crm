-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro kanceláře a IT firmy
-- ============================================================================

-- IT a technologické firmy
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme home office', 'Ale ti co chodí do kanceláře si zaslouží zdravé prostředí',
    'Zaměstnanci si nestěžují', 'Sick building syndrom je plíživý - únava, nižší produktivita',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes produktivitu a employee wellbeing',
    'Potřebujeme data', 'Nabízíme měření kvality vzduchu před/po - tech firmy oceňují data',
    'Máme ESG reporting', 'Ozon je součást ESG - employee health & wellbeing'
  ),
  success_stories = ARRAY[
    'IT firma Brno (200 lidí): Snížení sick days o 25% - úspora 500k Kč/rok',
    'Startup hub Praha: "Zaměstnanci oceňují certifikát Nově sanitováno - nižší fluktuace"',
    'Software house Plzeň: Eliminace formaldehydu - konec bolestí hlavy'
  ]
WHERE name = 'IT a technologické firmy';

-- Call centra
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme ventilaci', 'Ventilace jen vyměňuje vzduch - ozon odstraňuje bakterie z headsetů',
    'Zaměstnanci jsou zvyklí', 'Ale vysoká nemocnost = výpadky směn = ztráty',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI: každý sick day = ztráta X hovorů',
    'Potřebujeme rychlé řešení', 'Instalace za 2 hodiny - okamžitý benefit',
    'Clean Box na headsety?', 'Ano - dezinfekce sdíleného vybavení bez chemie'
  ),
  success_stories = ARRAY[
    'Call centrum Brno: Snížení nemocnosti o 30% - úspora za zastupování',
    'Zákaznická linka Praha: "Operátoři oceňují Clean Box na headsety"',
    'Support centrum Plzeň: Dezinfekce mezi směnami - nižší fluktuace'
  ]
WHERE name = 'Call centra';

-- Banky a finanční instituce
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme klimatizaci', 'Klimatizace jen ochlazuje - ozon dezinfikuje vzduch mezi klienty',
    'Klienti to neocení', 'Certifikát "Nově sanitováno" - důvěra po covidu',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes ESG reporting a ochrana zaměstnanců',
    'Potřebujeme souhlas centrály', 'Připravíme prezentaci s ESG benefity',
    'Máme reprezentativní prostředí', 'Proto je certifikát "Nově sanitováno" klíčový'
  ),
  success_stories = ARRAY[
    'Pobočka ČS Brno: "Klienti oceňují certifikát Nově sanitováno - vyšší spokojenost"',
    'Komerční banka Praha: Dezinfekce mezi klienty - ochrana zaměstnanců',
    'Raiffeisenbank Plzeň: ESG reporting - employee health & wellbeing'
  ]
WHERE name = 'Banky a finanční instituce';
