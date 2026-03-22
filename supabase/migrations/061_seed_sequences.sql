-- =====================================================
-- SEED DATA: 4 výchozí email sekvence
-- =====================================================
-- Tyto sekvence pokrývají hlavní segmenty VitalSpace.
-- Každá sekvence má 3-4 kroky: email → follow-up → callcentrum
-- =====================================================

-- 1. Obecný B2B outreach (pro segmenty bez specifické sekvence)
INSERT INTO email_sequences (id, name, description, segment_ids, is_active)
VALUES (
  'a0000001-0000-0000-0000-000000000001',
  'Obecný B2B outreach',
  'Univerzální sekvence pro všechny segmenty. Email obecná nabídka → follow-up → pozvánka na audit → callcentrum.',
  '{}',
  true
);

INSERT INTO sequence_steps (sequence_id, step_order, action_type, email_template_name, delay_hours, use_ai_personalization) VALUES
('a0000001-0000-0000-0000-000000000001', 1, 'email', 'obecna-nabidka', 0, true),
('a0000001-0000-0000-0000-000000000001', 2, 'email', 'follow-up', 72, false),
('a0000001-0000-0000-0000-000000000001', 3, 'email', 'pozvanka-audit', 96, true),
('a0000001-0000-0000-0000-000000000001', 4, 'callcenter', NULL, 168, false);

-- 2. Školy a školky
INSERT INTO email_sequences (id, name, description, segment_ids, is_active)
VALUES (
  'a0000001-0000-0000-0000-000000000002',
  'Školy a školky',
  'Sekvence pro vzdělávací segment. Email zaměřený na bezpečnost dětí → certifikace → callcentrum.',
  '{}',
  true
);

INSERT INTO sequence_steps (sequence_id, step_order, action_type, email_template_name, delay_hours, use_ai_personalization) VALUES
('a0000001-0000-0000-0000-000000000002', 1, 'email', 'skoly-skolky', 0, true),
('a0000001-0000-0000-0000-000000000002', 2, 'email', 'certifikace-duvera', 72, false),
('a0000001-0000-0000-0000-000000000002', 3, 'callcenter', NULL, 120, false);

-- 3. Hotely a ubytování
INSERT INTO email_sequences (id, name, description, segment_ids, is_active)
VALUES (
  'a0000001-0000-0000-0000-000000000003',
  'Hotely a ubytování',
  'Sekvence pro hospitality segment. Email zaměřený na komfort hostů → pronájem vs. koupě → callcentrum.',
  '{}',
  true
);

INSERT INTO sequence_steps (sequence_id, step_order, action_type, email_template_name, delay_hours, use_ai_personalization) VALUES
('a0000001-0000-0000-0000-000000000003', 1, 'email', 'hotely-ubytovani', 0, true),
('a0000001-0000-0000-0000-000000000003', 2, 'email', 'pronajem-vs-koupe', 72, false),
('a0000001-0000-0000-0000-000000000003', 3, 'callcenter', NULL, 120, false);

-- 4. Kanceláře a administrativní budovy
INSERT INTO email_sequences (id, name, description, segment_ids, is_active)
VALUES (
  'a0000001-0000-0000-0000-000000000004',
  'Kanceláře a administrativní budovy',
  'Sekvence pro komerční segment. Email zaměřený na sick building syndrome → toxicita prostředí → callcentrum.',
  '{}',
  true
);

INSERT INTO sequence_steps (sequence_id, step_order, action_type, email_template_name, delay_hours, use_ai_personalization) VALUES
('a0000001-0000-0000-0000-000000000004', 1, 'email', 'administrativni-budovy', 0, true),
('a0000001-0000-0000-0000-000000000004', 2, 'email', 'toxicita-prostredi', 72, false),
('a0000001-0000-0000-0000-000000000004', 3, 'callcenter', NULL, 120, false);
