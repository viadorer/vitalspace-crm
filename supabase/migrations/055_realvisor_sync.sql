-- Mapping columns for bidirectional sync with Realvisor
-- Realvisor contact ID → VitalSpace prospect_contacts / client_contacts
-- Realvisor lead ID → VitalSpace deals

ALTER TABLE prospect_contacts ADD COLUMN IF NOT EXISTS realvisor_contact_id UUID;
ALTER TABLE client_contacts ADD COLUMN IF NOT EXISTS realvisor_contact_id UUID;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS realvisor_lead_id UUID;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS realvisor_contact_id UUID;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS realvisor_contact_id UUID;

CREATE INDEX IF NOT EXISTS idx_prospect_contacts_rv ON prospect_contacts(realvisor_contact_id) WHERE realvisor_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_client_contacts_rv ON client_contacts(realvisor_contact_id) WHERE realvisor_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_rv_lead ON deals(realvisor_lead_id) WHERE realvisor_lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_rv ON prospects(realvisor_contact_id) WHERE realvisor_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_rv ON clients(realvisor_contact_id) WHERE realvisor_contact_id IS NOT NULL;

-- Sync log for tracking changes
CREATE TABLE IF NOT EXISTS realvisor_sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    direction TEXT NOT NULL CHECK (direction IN ('from_realvisor', 'to_realvisor')),
    entity_type TEXT NOT NULL,
    realvisor_id UUID,
    local_id UUID,
    action TEXT NOT NULL,
    payload JSONB,
    synced_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE realvisor_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access for all" ON realvisor_sync_log FOR ALL USING (true);
