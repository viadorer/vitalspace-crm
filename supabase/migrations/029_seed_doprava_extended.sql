-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro dopravu a mobilitu
-- ============================================================================

-- Autobusy a MHD
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme pravidelný úklid', 'Úklid neodstraní viry z klimatizace a sedaček - ozon ano',
    'Cestující to neocení', 'Certifikát "Nově sanitováno" na dveřích - důvěra po covidu',
    'Autobusy jsou pořád v provozu', 'PRO I PLUS mobilní - sanitace v depu přes noc',
    'Příliš drahé pro flotilu', 'PRO I PLUS od 45k Kč - postupná sanitace, škálovatelné',
    'Potřebujeme souhlas dopravního podniku', 'Připravíme prezentaci s benefity pro cestující'
  ),
  success_stories = ARRAY[
    'MHD Brno: "Cestující oceňují certifikát Nově sanitováno - vyšší spokojenost"',
    'Autobusy Praha: Eliminace zápachu z klimatizace - lepší recenze',
    'RegioJet: Dezinfekce mezi spoji - konkurenční výhoda'
  ]
WHERE name = 'Autobusy a MHD';

-- Taxi a ride-sharing
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme vůně do auta', 'Vůně jen maskují - ozon odstraňuje pachy a dezinfikuje',
    'Zákazníci to neocení', 'Certifikát "Nově sanitováno" v aplikaci - vyšší rating',
    'Nemám čas na sanitaci', 'Clean Box portable - sanitace za 15 minut mezi jízdami',
    'Příliš drahé', 'Clean Box od 25k Kč - ROI přes vyšší rating a tipy',
    'Ozon může poškodit interiér', 'Certifikované koncentrace - bezpečné pro všechny materiály'
  ),
  success_stories = ARRAY[
    'Bolt driver Praha: Rating +0.3 bodu díky certifikátu "Nově sanitováno"',
    'Uber Black Brno: "Klienti oceňují čistý vzduch - vyšší tipy +20%"',
    'Taxi Plzeň: Eliminace zápachu od kuřáků - možnost vozit nekuřáky'
  ]
WHERE name = 'Taxi a ride-sharing';

-- Letadla a letiště
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme HEPA filtry', 'HEPA filtruje částice - ozon ničí viry, komplementární řešení',
    'Potřebujeme certifikaci EASA', 'Máme certifikáty pro letecký průmysl - splňujeme normy',
    'Cestující to neocení', 'Certifikát "Nově sanitováno" - konkurenční výhoda po covidu',
    'Příliš drahé', 'Investice vs. náklady na nákazy - ROI přes důvěru cestujících',
    'Sanitace musí být rychlá', 'PRO I PLUS - sanitace kabiny za 20 minut mezi lety'
  ),
  success_stories = ARRAY[
    'Letiště Brno: "Cestující oceňují certifikát Nově sanitováno v čekárnách"',
    'Smartwings: Dezinfekce kabiny mezi lety - marketingová výhoda',
    'Letiště Praha: Sanitace VIP salonků - premium služba'
  ]
WHERE name = 'Letadla a letiště';

-- Vlaky a nádraží
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme klimatizaci', 'Klimatizace jen ochlazuje - ozon dezinfikuje vzduch ve vozech',
    'Cestující to neocení', 'Certifikát "Nově sanitováno" na dveřích vozu - důvěra',
    'Vlaky jsou pořád v provozu', 'Sanitace v depu přes noc - žádný dopad na provoz',
    'Příliš drahé pro flotilu', 'Postupná implementace - začít s IC a EC vlaky',
    'Potřebujeme souhlas ČD', 'Připravíme business case s benefity pro cestující'
  ),
  success_stories = ARRAY[
    'ČD Pendolino: "Cestující oceňují certifikát Nově sanitováno - plná obsazenost"',
    'RegioJet: Dezinfekce vozů - konkurenční výhoda proti ČD',
    'Leo Express: Sanitace klimatizace - eliminace zápachu'
  ]
WHERE name = 'Vlaky a nádraží';
