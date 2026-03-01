-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro komerční prostory
-- ============================================================================

-- Kanceláře a coworkingová centra
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme klimatizaci a ventilaci', 'Ventilace jen vyměňuje vzduch - ozon ho aktivně čistí od formaldehydu a VOC',
    'Zaměstnanci si nestěžují', 'Sick building syndrom je plíživý - únava, bolesti hlavy, nižší produktivita',
    'Home office vyřešil problém', 'Ale ti co chodí do kanceláře si zaslouží zdravé prostředí',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes nižší nemocnost a vyšší produktivitu',
    'Potřebuji souhlas vedení', 'Připravíme prezentaci s daty o produktivitě a employee wellbeing'
  ),
  success_stories = ARRAY[
    'Coworking Hub Praha: "Členové oceňují certifikát čistého vzduchu - plná obsazenost"',
    'IT firma Brno (150 lidí): Snížení sick days o 25% - úspora 400k Kč ročně',
    'Kanceláře Plzeň: Eliminace formaldehydu z nábytku - konec bolestí hlavy'
  ]
WHERE name = 'Kanceláře a coworkingová centra';

-- Hotely a penziony
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme úklid po každém hostovi', 'Úklid neodstraní viry a pachy z matrací a textilií - ozon ano',
    'Hosté si nestěžují', 'Ale negativní recenze kvůli pachům snižují rating na Booking.com',
    'Příliš drahé pro malý hotel', 'PRO I PLUS mobilní od 45k Kč - použití ve všech pokojích postupně',
    'Ozon může poškodit textilie', 'Certifikované koncentrace - bezpečné pro všechny materiály',
    'Potřebuji vidět výsledky', 'Nabízíme testovací provoz v pilotních pokojích'
  ),
  success_stories = ARRAY[
    'Hotel Grandior Praha: Rating na Booking.com +0.5 bodu díky "certifikovaně čistým pokojům"',
    'Penzion Šumava: Eliminace zápachu z kuřáckých pokojů - možnost pronajmout nekuřákům',
    'Wellness hotel Karlovy Vary: "Hosté oceňují dezinfekci - opakované návštěvy +30%"'
  ]
WHERE name = 'Hotely a penziony';

-- Restaurace a kavárny
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme digestoř', 'Digestoř jen odsává - ozon neutralizuje pachy přímo ve vzduchu',
    'Hosté nepřijdou kvůli vzduchu', 'Ale odejdou kvůli pachům z kuchyně nebo WC - prevence je klíč',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes lepší recenze a opakované návštěvy',
    'Ozon může ovlivnit chuť jídla', 'Instalace mimo kuchyň - jen v sálku a WC',
    'Potřebuji reference z gastra', 'Máme desítky restaurací - pošleme kontakty a případové studie'
  ),
  success_stories = ARRAY[
    'Restaurace U Fleků Praha: Eliminace zápachu z WC - lepší recenze na TripAdvisor',
    'Kavárna Brno: "Hosté oceňují čistý vzduch - nárůst pravidelných zákazníků"',
    'Pizzerie Plzeň: Neutralizace pachů z kuchyně - možnost otevřít letní zahrádku'
  ]
WHERE name = 'Restaurace a kavárny';

-- Fitness centra a posilovny
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme ventilaci', 'Ventilace jen vyměňuje vzduch - ozon odstraňuje pot a bakterie',
    'Klienti jsou zvyklí na pach', 'Ale noví klienti odchází - diferenciace od konkurence',
    'Příliš drahé', 'Clean Up od 80k Kč - ROI přes nové členy a nižší churn rate',
    'Ozon může být nebezpečný při cvičení', 'Aplikace v noci nebo brzy ráno - ne během provozu',
    'Potřebuji vidět výsledky', 'Nabízíme testovací provoz 14 dní - měřitelné výsledky'
  ),
  success_stories = ARRAY[
    'Fitness Brno City: "Členové oceňují čistý vzduch - churn rate -20%"',
    'CrossFit Praha: Eliminace zápachu z šaten - nárůst nových členů o 25%',
    'Yoga studio Plzeň: "Certifikát čistého vzduchu - premium positioning"'
  ]
WHERE name = 'Fitness centra a posilovny';
