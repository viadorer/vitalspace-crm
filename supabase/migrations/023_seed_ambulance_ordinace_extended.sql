-- ============================================================================
-- VITALSPACE - Rozšířené seed data pro Ambulance a ordinace
-- ============================================================================
-- Doplnění objections_handling a success_stories
-- ============================================================================

UPDATE company_segments
SET 
  objections_handling = JSONB_BUILD_OBJECT(
    'Máme běžný úklid', 'Úklid neodstraní viry a bakterie z vzduchu - ozon ano',
    'Pacienti si nestěžují', 'Ale vy jako lékař víte, že křížová kontaminace existuje - prevence je klíčová',
    'Příliš drahé pro malou ordinaci', 'Clean Up od 80k Kč - ROI přes snížení nemocnosti personálu a spokojenost pacientů',
    'Nemáme na to rozpočet', 'Leasing nebo rozložení plateb - investice do bezpečnosti pacientů',
    'Potřebuji to schválit se společníky', 'Připravíme prezentaci s medicínskými studiemi a ROI kalkulací'
  ),
  success_stories = ARRAY[
    'Ordinace MUDr. Nováka (Praha): Snížení nemocnosti personálu o 40% za rok',
    'Dětská ambulance Brno: "Rodiče oceňují certifikát čisté ordinace" - nárůst pacientů o 15%',
    'Interní ambulance Plzeň: Eliminace zápachu v čekárně - lepší hodnocení na Znamlekar.cz'
  ]
WHERE name = 'Ambulance a ordinace';
