-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro zdravotnické segmenty
-- ============================================================================

-- Stomatologické ordinace
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme UV lampy', 'UV neničí viry ve vzduchu - ozon ano, navíc dezinfikuje i povrchy',
    'Pacienti se bojí ozonu', 'Ozon se aplikuje mezi pacienty, ne během ošetření - bezpečné a certifikované',
    'Příliš drahé', 'Clean Up od 80k Kč - premium positioning přitáhne nové pacienty',
    'Nemáme kde instalovat', 'Nástropní Clean Up - žádné stavební úpravy, instalace za 2 hodiny',
    'Potřebuji reference', 'Máme desítky stomatologů - pošleme kontakty a případové studie'
  ),
  success_stories = ARRAY[
    'Stomatologie Dr. Svobody (Brno): "Pacienti oceňují certifikát - nárůst nových pacientů o 20%"',
    'Dentální klinika Praha 5: Eliminace aerosolu při zákrocích - personál bez respirátorů',
    'Ortodoncie Plzeň: "Rodiče si vybírají nás kvůli certifikátu čistého vzduchu"'
  ]
WHERE name = 'Stomatologické ordinace';

-- Lékárny
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme klimatizaci', 'Klimatizace jen ochlazuje vzduch - ozon ho dezinfikuje a odstraňuje viry',
    'Nemocní lidé stejně přijdou', 'Ale ochráníte farmaceuty a snížíte jejich nemocnost o 30-40%',
    'Malá lékárna, malý rozpočet', 'Clean Box od 25k Kč - ROI přes zdraví personálu',
    'Zákazníci to neocení', 'Certifikát "Dezinfikovaný prostor" - konkurenční výhoda',
    'Potřebuji schválení majitele', 'Připravíme kalkulaci ROI a prezentaci pro majitele'
  ),
  success_stories = ARRAY[
    'Lékárna U Anděla (Praha): Snížení nemocnosti farmaceutů o 35% - úspora za zastupování',
    'Lékárna Centrum (Ostrava): "Zákazníci oceňují certifikát - cítí se bezpečněji"',
    'Lékárna Plzeň: Eliminace zápachu od nemocných - příjemnější prostředí'
  ]
WHERE name = 'Lékárny';

-- Veterinární kliniky
UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Zvířata jsou zvyklá na pachy', 'Ale personál ne - ochrana před zoonózami je klíčová',
    'Máme dezinfekci', 'Chemická dezinfekce jen povrchy - ozon dezinfikuje vzduch i těžko dostupná místa',
    'Příliš drahé pro malou kliniku', 'PRO I PLUS mobilní od 45k Kč - použití ve více ordinacích',
    'Ozon může být nebezpečný pro zvířata', 'Aplikace mezi pacienty, ne během ošetření - certifikované a bezpečné',
    'Potřebuji vidět demo', 'Nabízíme testovací provoz 14 dní zdarma'
  ),
  success_stories = ARRAY[
    'Veterina Brno-střed: Eliminace zápachu z čekárny - majitelé zvířat oceňují',
    'Klinika pro exoty Praha: "Ochrana personálu před zoonózami - žádná nemocnost za rok"',
    'Veterina Plzeň: Clean Box na transportní boxy - diferenciace od konkurence'
  ]
WHERE name = 'Veterinární kliniky';
