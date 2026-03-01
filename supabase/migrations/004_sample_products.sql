-- ============================================================================
-- VITALSPACE - Vzorová data produktů
-- ============================================================================

INSERT INTO products (name, category, description, ozone_output_gh, coverage_m3, unit_price, is_active) VALUES
(
    'Clean Up',
    'nastropni',
    'Nástropní ozonový generátor do kazetových podhledů. Ideální pro kanceláře a administrativní prostory.',
    20,
    80,
    45000,
    true
),
(
    'PRO I PLUS',
    'mobilni',
    'Mobilní průmyslový generátor s vysokým výkonem. Vhodný pro velké prostory, sklady, výrobní haly.',
    40,
    200,
    58000,
    true
),
(
    'Clean Box DRY',
    'box',
    'Dezinfekční box pro sanitaci předmětů, nářadí, ochranných pomůcek.',
    10,
    NULL,
    32000,
    true
),
(
    'Montáž a instalace',
    'sluzba',
    'Profesionální montáž zařízení včetně zapojení a zaškolení obsluhy.',
    NULL,
    NULL,
    5000,
    true
),
(
    'Technický audit',
    'sluzba',
    'Zaměření prostor, výpočet potřebného výkonu, měření VOC/PM2.5/CO2.',
    NULL,
    NULL,
    3500,
    true
),
(
    'Certifikace prostoru',
    'sluzba',
    'Výstupní měření a certifikát o provedené sanitaci.',
    NULL,
    NULL,
    2000,
    true
);
