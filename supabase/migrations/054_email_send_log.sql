-- Tabulka pro sledování odeslaných emailů a denní limit (300/den)
CREATE TABLE IF NOT EXISTS email_send_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    template_name TEXT,
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    message_id TEXT,
    sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_send_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_log_prospect ON email_send_log(prospect_id);
CREATE INDEX IF NOT EXISTS idx_email_log_client ON email_send_log(client_id);

ALTER TABLE email_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Full access for all" ON email_send_log FOR ALL USING (true);
