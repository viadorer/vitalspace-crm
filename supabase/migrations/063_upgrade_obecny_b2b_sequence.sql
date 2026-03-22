-- =====================================================
-- UPGRADE: Obecný B2B outreach → 7 kroků
-- =====================================================
-- Původní: 4 kroky (email → follow-up → audit → callcentrum)
-- Nový:    7 kroků s AI rozhodováním, čekáním na reakci,
--          certifikacemi a ROI kalkulačkou
-- =====================================================

-- Smaž staré kroky
DELETE FROM sequence_steps
WHERE sequence_id = 'a0000001-0000-0000-0000-000000000001';

-- Aktualizuj popis
UPDATE email_sequences
SET description = 'Univerzální 7-kroková sekvence pro všechny segmenty. Obecná nabídka → čekání na otevření → follow-up → certifikace → AI rozhodnutí → ROI kalkulačka/callcentrum → callcentrum.',
    updated_at = now()
WHERE id = 'a0000001-0000-0000-0000-000000000001';

-- Nové kroky
INSERT INTO sequence_steps (sequence_id, step_order, action_type, email_template_name, email_subject_override, delay_hours, use_ai_personalization, wait_event_type, wait_timeout_hours) VALUES
-- Krok 1: Obecná nabídka (AI personalizovaná per segment)
-- Den 0 — první kontakt
('a0000001-0000-0000-0000-000000000001', 1, 'email', 'obecna-nabidka', NULL, 0, true, NULL, NULL),

-- Krok 2: Čekání na otevření emailu (3 dny)
-- Pokud otevře → pokračuj, pokud ne → pokračuj taky (ale AI to ví)
('a0000001-0000-0000-0000-000000000001', 2, 'wait_for_event', NULL, NULL, 24, false, 'open', 72),

-- Krok 3: Follow-up (Den 3)
-- Pokud otevřel: "Viděl jste naši nabídku?" s konkrétním CTA
-- Pokud neotevřel: jiný předmět aby zaujal
('a0000001-0000-0000-0000-000000000001', 3, 'email', 'follow-up', NULL, 0, true, NULL, NULL),

-- Krok 4: Certifikace a důvěra (Den 6)
-- Budování důvěry: MZ ČR, ZČU Plzeň, EN 17272:2020
('a0000001-0000-0000-0000-000000000001', 4, 'email', 'certifikace-duvera', NULL, 72, false, NULL, NULL),

-- Krok 5: AI rozhodnutí (Den 10)
-- Gemini zhodnotí: otevřel emaily? kliknul? jak reagoval?
-- Rozhodne: pozvánka na audit / ROI kalkulačka / callcentrum / stop
('a0000001-0000-0000-0000-000000000001', 5, 'ai_decide', NULL, NULL, 96, false, NULL, NULL),

-- Krok 6: Pozvánka na bezplatný audit (Den 13)
-- Silné CTA: "Bezplatný audit kvality vzduchu ve vaší provozovně"
('a0000001-0000-0000-0000-000000000001', 6, 'email', 'pozvanka-audit', NULL, 72, true, NULL, NULL),

-- Krok 7: Callcentrum (Den 17)
-- Telefonní kontakt — prospect je "ohřátý" 4 emaily + AI analýzou
('a0000001-0000-0000-0000-000000000001', 7, 'callcenter', NULL, NULL, 96, false, NULL, NULL);
