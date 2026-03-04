-- Migrace pro sledování vztahů mezi prospecty, klienty a dealy
-- Prospect si pamatuje, že byl převeden na klienta
-- Klient si pamatuje, z jakého prospectu vznikl

-- Přidání sloupce do prospects - odkaz na klienta, pokud byl převeden
ALTER TABLE prospects
ADD COLUMN IF NOT EXISTS converted_to_client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Přidání sloupce do clients - odkaz na původní prospect
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS original_prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL;

-- Index pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_prospects_converted_to_client ON prospects(converted_to_client_id);
CREATE INDEX IF NOT EXISTS idx_clients_original_prospect ON clients(original_prospect_id);

-- Komentáře
COMMENT ON COLUMN prospects.converted_to_client_id IS 'ID klienta, pokud byl prospect převeden na klienta';
COMMENT ON COLUMN clients.original_prospect_id IS 'ID původního prospectu, ze kterého vznikl klient';
