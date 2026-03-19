#!/usr/bin/env node
/**
 * Seed script: Hospice, LDN, domovy pro seniory - Kladno a okolí
 *
 * Vloží kontakty z dokumentu "Seznam LDN, hospiců a zařízení pro seniory"
 * jako prospekty (status: contacted) i klienty (type: B2B).
 * Ke každému prospektu přidá touchpoint "email" (nabídka služeb).
 *
 * Spuštění:
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-hospice-kladno.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pyrtrlhesqqjjtemacbi.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('❌ Chybí SUPABASE_SERVICE_ROLE_KEY. Spusťte:');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-hospice-kladno.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// ---------------------------------------------------------------------------
// DATA z dokumentu "seznam_formatovany hospic kladno okolí.pages"
// Zpracováno k: 19. 3. 2026
// ---------------------------------------------------------------------------

const facilities = [
  // === KLADNO - Domovy pro seniory ===
  {
    company_name: 'Domov Kladno - Švermov',
    city: 'Kladno',
    address: 'Vojtěcha Dundra 1032, 273 09 Kladno - Švermov',
    phone: '312 292 930',
    email: 'reditel@domovkladno-svermov.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Kladno',
    contact: { name: 'Bc. Tomáš Abrham', position: 'Ředitel' }
  },
  {
    company_name: 'Domov pro seniory Kladno',
    city: 'Kladno',
    address: 'Fr. Kloze 1178, 272 01 Kladno',
    phone: '312 242 452',
    email: 'dskladno@dskladno.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Kladno',
    contact: { name: 'JUDr. Miroslav Petrák', position: 'Ředitel' }
  },
  {
    company_name: 'Domov Pod Lipami Smečno',
    city: 'Smečno',
    address: 'Smečno 1, 273 05 Smečno',
    phone: '312 547 855',
    email: 'sala@dpodlipami.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Kladno',
    contact: { name: 'Petra Dernerová', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Unhošť',
    city: 'Unhošť',
    address: 'Berounská 500, 273 51 Unhošť',
    phone: '774 412 140',
    email: 'info@ddunhost.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Kladno',
    contact: { name: 'Ing. Lenka Ungerová', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Velvary',
    city: 'Velvary',
    address: 'Petra Bezruče 484, 273 24 Velvary',
    phone: '315 720 275',
    email: 'reditel@domovvelary.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Kladno',
    contact: { name: 'Ing. Marcel Zhorný', position: 'Ředitel' }
  },
  {
    company_name: 'Domov Slaný',
    city: 'Slaný',
    address: 'Žižice 93, 274 01 Slaný',
    phone: '312 525 710',
    email: 'reditel@dpsslany.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Kladno',
    contact: { name: 'Ing. Václav Váňa', position: 'Ředitel' }
  },

  // === KLADNO - LDN / následná péče ===
  {
    company_name: 'GARC Kladno s.r.o.',
    city: 'Kladno',
    address: 'Fr. Kloze 37, 272 01 Kladno',
    phone: '312 256 500',
    email: 'info@garc.cz',
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'geriatrické a rehabilitační centrum; následná lůžková a rehabilitační péče; okres Kladno',
    contact: null
  },
  {
    company_name: 'Nemocnice Slaný - oddělení následné péče / LDN',
    city: 'Slaný',
    address: 'Politických vězňů 576, 274 01 Slaný',
    phone: '312 575 111',
    email: 'reditelstvi@nemsl.cz',
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'LDN / následná péče; okres Kladno',
    contact: null
  },

  // === KLADNO - Hospice ===
  {
    company_name: 'Hospic svaté Hedviky, o.p.s.',
    city: 'Kladno',
    address: 'Saskova 1625, 272 01 Kladno',
    phone: '774 951 755',
    email: 'info@hospicsvatehedviky.cz',
    region: 'Středočeský kraj',
    category: 'hospic',
    notes: 'lůžkový i domácí hospic; okres Kladno',
    contact: { name: 'Mgr. Lucia Řepová', position: 'Ředitelka' }
  },

  // === MĚLNÍK - Domovy pro seniory ===
  {
    company_name: 'Senior-komplex s.r.o. - pobočka Lužec nad Vltavou',
    city: 'Lužec nad Vltavou',
    address: '1. máje 22, 277 06 Lužec nad Vltavou',
    phone: '733 189 006',
    email: 'tauchman@senior-komplex.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'Ing. Ondřej Ptáček', position: 'Ředitel' }
  },
  {
    company_name: 'Senior-komplex s.r.o. - pobočka Mělník',
    city: 'Mělník',
    address: 'Bezručova 4095, 276 01 Mělník',
    phone: '733 189 006',
    email: 'tauchman@senior-komplex.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'Ing. Ondřej Ptáček', position: 'Ředitel' }
  },
  {
    company_name: 'Domov Penzion',
    city: 'Mělník',
    address: 'Fügnerova 3343, 276 01 Mělník',
    phone: '315 630 040',
    email: 'd.pavlikova@ssmm.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'PhDr. Drahomíra Pavlíková', position: 'Ředitelka' }
  },
  {
    company_name: 'Amfion sanatorium',
    city: 'Mělník',
    address: 'Českolipská 3444, 276 01 Mělník',
    phone: '731 443 174',
    email: 'reditel@amfion.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov se zvláštním režimem / seniorní péče; okres Mělník',
    contact: { name: 'Jaroslav Novotný', position: 'Ředitel' }
  },
  {
    company_name: 'Domov Ludmila',
    city: 'Mělník',
    address: 'Fügnerova 3523, 276 01 Mělník',
    phone: '315 630 040',
    email: 'd.pavlikova@ssmm.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'PhDr. Drahomíra Pavlíková', position: 'Ředitelka' }
  },
  {
    company_name: 'Senlife Mělník',
    city: 'Mělník',
    address: 'Českolipská 1111/19, 276 01 Mělník',
    phone: '731 708 090',
    email: 'melnik@senlife.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'Lukáš Drásta', position: 'Ředitel' }
  },
  {
    company_name: 'Domov seniorů Mšeno',
    city: 'Mšeno',
    address: 'Boleslavská 451, 277 35 Mšeno',
    phone: '315 694 722',
    email: 'dsmseno@seznam.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'Mgr. et Bc. Blanka Dvorščíková, MBA', position: 'Ředitelka' }
  },
  {
    company_name: 'Dům kněžny Emmy',
    city: 'Neratovice',
    address: 'Kojetická 1414, 277 11 Neratovice',
    phone: '315 630 511',
    email: 'dke@demmy.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'Ing. Ingrid Podroužková', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov seniorů Vidim',
    city: 'Vidim',
    address: 'Vidim 1, 277 21 Vidim',
    phone: '315 695 464',
    email: 'ddvidim@seznam.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'PhDr. Milan Hrubeš', position: 'Ředitel' }
  },
  {
    company_name: 'Červený Mlýn Všestudy',
    city: 'Všestudy',
    address: 'Všestudy 23, 277 46 Všestudy',
    phone: '315 781 149',
    email: 'ekonom@seniori-vsestudy.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mělník',
    contact: { name: 'Mgr. Aneta Heřmanová, DiS.', position: 'Ředitelka' }
  },

  // === MĚLNÍK - LDN ===
  {
    company_name: 'Nemocnice Mělník - oddělení dlouhodobé lůžkové péče',
    city: 'Mělník',
    address: 'Fügnerova 715/14, 276 01 Mělník',
    phone: '315 639 430',
    email: 'irena.zavadova@mediterra.cz',
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'ODLP / LDN; okres Mělník',
    contact: { name: 'MUDr. Irena Závadová', position: 'Primářka' }
  },

  // === MĚLNÍK - Hospice ===
  {
    company_name: 'Hospic Tempus, z.s.',
    city: 'Mělník',
    address: 'Bezručova 108, 276 01 Mělník',
    phone: '728 885 695',
    email: 'hospic@hospictempus.cz',
    region: 'Středočeský kraj',
    category: 'hospic',
    notes: 'mobilní specializovaná paliativní péče; obsluhuje také část okresu Praha-východ; okres Mělník',
    contact: { name: 'Mgr. Dita Brezováková', position: 'Ředitelka' }
  },

  // === LITOMĚŘICE - Domovy pro seniory ===
  {
    company_name: 'Diakonie ČCE - středisko v Krabčicích',
    city: 'Krabčice',
    address: 'Krabčice 57, 411 87 Krabčice',
    phone: '417 639 680',
    email: 'domov@diakoniekrabcice.cz',
    region: 'Ústecký kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Litoměřice',
    contact: { name: 'Bc. Jana Sedláková', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov důchodců Libochovice',
    city: 'Libochovice',
    address: 'Vrchlického 574, 411 17 Libochovice',
    phone: '603 585 127',
    email: 'dd.libochovice@csplitomerice.cz',
    region: 'Ústecký kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Litoměřice',
    contact: { name: 'Mgr. Lydie Hrdličková', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov na Dómském pahorku - pracoviště Zahradnická 5',
    city: 'Litoměřice',
    address: 'Zahradnická 1534/5, 412 01 Litoměřice',
    phone: '417 770 013',
    email: 'ds@litomerice.charita.cz',
    region: 'Ústecký kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Litoměřice',
    contact: { name: 'Bc. Iveta Šerberová', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov na Dómském pahorku - pracoviště Zahradnická 4',
    city: 'Litoměřice',
    address: 'Zahradnická 1534/4, 412 01 Litoměřice',
    phone: '417 770 011',
    email: 'ds@litomerice.charita.cz',
    region: 'Ústecký kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Litoměřice',
    contact: { name: 'Bc. Iveta Šerberová', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov U Trati Litoměřice',
    city: 'Litoměřice',
    address: 'U Trati 2041/3, 412 01 Litoměřice',
    phone: '416 735 294',
    email: 'dut.litomerice@csplitomerice.cz',
    region: 'Ústecký kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Litoměřice',
    contact: { name: 'Libuše Horčicová', position: 'Ředitelka' }
  },
  {
    company_name: 'Senevida Terezín',
    city: 'Terezín',
    address: 'Kréta 301, 411 55 Terezín',
    phone: '727 980 306',
    email: 'terezin@senecura.cz',
    region: 'Ústecký kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Litoměřice',
    contact: { name: 'David Grbavčic', position: 'Ředitel' }
  },

  // === LITOMĚŘICE - LDN ===
  {
    company_name: 'Městská nemocnice v Litoměřicích - LDN',
    city: 'Litoměřice',
    address: 'Žitenická 18, 412 01 Litoměřice',
    phone: '416 723 583',
    email: null,
    region: 'Ústecký kraj',
    category: 'ldn',
    notes: 'léčebna dlouhodobě nemocných; okres Litoměřice',
    contact: { name: 'prim. MUDr. Jaroslav Pršala', position: 'Primář' }
  },

  // === LITOMĚŘICE - Hospice ===
  {
    company_name: 'Hospic sv. Štěpána',
    city: 'Litoměřice',
    address: 'Rybářské náměstí 662/4, 412 01 Litoměřice',
    phone: '416 733 185',
    email: 'reditel@hospiclitomerice.cz',
    region: 'Ústecký kraj',
    category: 'hospic',
    notes: 'lůžkový i domácí hospic; okres Litoměřice',
    contact: { name: 'Mgr. Monika Marková', position: 'Ředitelka' }
  },

  // === ROUDNICE NAD LABEM - Domovy pro seniory ===
  {
    company_name: 'Domov důchodců Roudnice nad Labem',
    city: 'Roudnice nad Labem',
    address: 'Sámova 2481, 413 01 Roudnice nad Labem',
    phone: '416 807 111',
    email: 'reditel@domovsenioru.cz',
    region: 'Ústecký kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Roudnice nad Labem (admin. Litoměřice)',
    contact: { name: 'Bc. Lenka Nová', position: 'Ředitelka' }
  },

  // === ROUDNICE NAD LABEM - LDN ===
  {
    company_name: 'Podřipská nemocnice s poliklinikou Roudnice n. L. - LDN',
    city: 'Roudnice nad Labem',
    address: 'Alej 17. listopadu 1101, 413 01 Roudnice nad Labem',
    phone: '416 858 829',
    email: 'kamila.sedlackova@nemocniceroudnice.cz',
    region: 'Ústecký kraj',
    category: 'ldn',
    notes: 'LDN / následná péče; okres Roudnice nad Labem (admin. Litoměřice)',
    contact: null
  },

  // === ROUDNICE NAD LABEM - Hospice ===
  {
    company_name: 'Domácí hospicová péče OPORA',
    city: 'Roudnice nad Labem',
    address: 'Jungmannova 1024, 413 01 Roudnice nad Labem',
    phone: '776 067 074',
    email: 'roudnice@opora-os.cz',
    region: 'Ústecký kraj',
    category: 'hospic',
    notes: 'domácí hospicová péče; okres Roudnice nad Labem (admin. Litoměřice)',
    contact: null
  },

  // === PRAHA-VÝCHOD - Domovy pro seniory ===
  {
    company_name: 'Hortenzie',
    city: 'Bořanovice',
    address: 'K Ubytovně 65, 250 65 Bořanovice',
    phone: '283 981 100',
    email: 'reditel@hortenzie.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: null
  },
  {
    company_name: 'Dřevčický Park',
    city: 'Dřevčice',
    address: 'Dřevčice 15, 250 01 Brandýs nad Labem - Stará Boleslav',
    phone: '326 329 158',
    email: 'socialni@drevcickypark.com',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Bc. Lukáš Porubský', position: 'Ředitel' }
  },
  {
    company_name: 'Domov seniorů Jenštejn',
    city: 'Jenštejn',
    address: 'Vinořská 78, 250 73 Jenštejn',
    phone: '605 422 484',
    email: 'info@dsjenstejn.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Mgr. Jiří Ploner', position: 'Ředitel' }
  },
  {
    company_name: 'Domov pro seniory kardinála Berana',
    city: 'Mukařov',
    address: 'Charitní 26, 251 62 Mukařov',
    phone: '323 612 611',
    email: 'dsmukarov@praha.charita.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Bc. Alena Hanková', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Hačka',
    city: 'Oleška',
    address: 'Oleška 153, 281 63 Kostelec nad Černými lesy',
    phone: '321 697 631',
    email: 'reditel@hacka.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Mgr. Ivana Želízková', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Pod Kavčí Skálou',
    city: 'Říčany',
    address: 'Marie Pujmanové 2045/2, 251 01 Říčany',
    phone: '323 632 423',
    email: 'reditel@domovpks.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Ing. Bc. Václav Brácha', position: 'Ředitel' }
  },
  {
    company_name: 'Senior dům Marta - pracoviště Černokostelecká 326/25',
    city: 'Říčany',
    address: 'Černokostelecká 326/25, 251 01 Říčany',
    phone: '323 604 124',
    email: 'senior.dum.marta@seznam.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: null
  },
  {
    company_name: 'Senior dům Marta - pracoviště Černokostelecká 544/27',
    city: 'Říčany',
    address: 'Černokostelecká 544/27, 251 01 Říčany',
    phone: '323 604 124',
    email: 'senior.dum.marta@seznam.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: null
  },
  {
    company_name: 'Domov seniorů Světice',
    city: 'Světice',
    address: 'V Zahradách 363, 251 01 Světice',
    phone: '603 113 771',
    email: 'info@domovseniorusvetice.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Zdeňka Pelinková', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Zátiší',
    city: 'Úvaly',
    address: 'Modřínová 1522, 250 82 Úvaly',
    phone: '777 207 104',
    email: 'domov.zatisi@email.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Zuzana Černoušková', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov seniorů Úvaly',
    city: 'Úvaly',
    address: 'nám. Svobody 1475, 250 82 Úvaly',
    phone: '281 980 919',
    email: 'jordanova@dduvaly.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Bc. Zdenka Jordánová', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Felicita',
    city: 'Vyžlovka',
    address: 'Pražská 336, 281 63 Vyžlovka',
    phone: '775 122 404',
    email: 'pension.felicita@seznam.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Praha-východ',
    contact: { name: 'Martin Strouhal', position: 'Ředitel' }
  },

  // === PRAHA-VÝCHOD - LDN ===
  {
    company_name: 'Nemocnice následné a rehabilitační péče Vojkov',
    city: 'Tehovec - Vojkov',
    address: 'K Nemocnici 83, 251 01 Tehovec - Vojkov',
    phone: '323 627 111',
    email: 'ldnvojkov@ldnvojkov.cz',
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'LDN / rehabilitační následná péče; okres Praha-východ',
    contact: { name: 'Jana Dítětová', position: 'Zástupce osoby pověřené řízením' }
  },
  {
    company_name: 'Nemocnice AGEL Říčany - LDN',
    city: 'Říčany',
    address: 'Smiřických 315, 251 01 Říčany',
    phone: '323 627 511',
    email: 'sekretariat@nrc.agel.cz',
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'LDN; primář / vedoucí oddělení veřejně neuveden; okres Praha-východ',
    contact: null
  },
  {
    company_name: 'Nemocnice Brandýs nad Labem - lůžka následné péče / LDN',
    city: 'Brandýs nad Labem - Stará Boleslav',
    address: 'Brázdimská 1000/3, 250 01 Brandýs nad Labem - Stará Boleslav',
    phone: '326 746 553',
    email: 'primar.lnp@nembnl.com',
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'následná lůžková péče / LDN; okres Praha-východ',
    contact: { name: 'MUDr. Abdul Rasool Mohamed', position: 'Primář' }
  },

  // === PRAHA-VÝCHOD - Hospice ===
  {
    company_name: 'Hospic Tempus, z.s. - mobilní hospic pro okres Praha-východ',
    city: 'Mělník',
    address: 'Bezručova 108, 276 01 Mělník',
    phone: '728 885 695',
    email: 'hospic@hospictempus.cz',
    region: 'Středočeský kraj',
    category: 'hospic',
    notes: 'mobilní hospic; služba výslovně obsluhuje také okres Praha-východ; sídlo v Mělníku',
    contact: { name: 'Mgr. Dita Brezováková', position: 'Ředitelka' }
  },

  // === MLADÁ BOLESLAV - Domovy pro seniory ===
  {
    company_name: 'Městské centrum komplexní péče',
    city: 'Benátky nad Jizerou',
    address: 'nám. 17. listopadu 593, 294 71 Benátky nad Jizerou',
    phone: '326 362 283',
    email: 'meglicova@mestske-centrum-benatky.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mladá Boleslav',
    contact: { name: 'Bc. Monika Megličová, DiS.', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov U Anežky',
    city: 'Benátky nad Jizerou',
    address: 'nám. 17. listopadu 703, 294 71 Benátky nad Jizerou',
    phone: '733 736 485',
    email: 'reditel@domovuanezky.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mladá Boleslav',
    contact: { name: 'Ing. Petr Kordule', position: 'Ředitel' }
  },
  {
    company_name: 'Domov seniorů Vlčí Pole',
    city: 'Dolní Bousov',
    address: 'Dolní Bousov 5, 294 04 Dolní Bousov',
    phone: '721 817 677',
    email: 'eva.peskova@vlcipole.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mladá Boleslav',
    contact: { name: 'Bc. Eva Pešková', position: 'Ředitelka' }
  },
  {
    company_name: 'Dům seniorů Mladá Boleslav',
    city: 'Mladá Boleslav',
    address: 'Olbrachtova 1390, 293 01 Mladá Boleslav',
    phone: '326 718 628',
    email: 'reditel@ddmb.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mladá Boleslav',
    contact: { name: 'Mgr. Marie Doležalová', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Modrý kámen',
    city: 'Mnichovo Hradiště',
    address: 'Nerudova 1470, 295 01 Mnichovo Hradiště',
    phone: '326 774 051',
    email: 'info@modry-kamen.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mladá Boleslav',
    contact: { name: 'Bc. Renata Poláková, DiS.', position: 'Ředitelka' }
  },
  {
    company_name: 'Domov Dolní Cetno',
    city: 'Niměřice',
    address: 'Niměřice 28, 294 30 Dolní Cetno',
    phone: '326 356 216',
    email: 'ddcetno@seznam.cz',
    region: 'Středočeský kraj',
    category: 'domov_senioru',
    notes: 'domov pro seniory; okres Mladá Boleslav',
    contact: { name: 'Vendulka Hálová, DiS.', position: 'Ředitelka' }
  },

  // === MLADÁ BOLESLAV - LDN ===
  {
    company_name: 'Klaudiánova nemocnice - oddělení následné péče Na Celně',
    city: 'Mladá Boleslav',
    address: 'Na Celně 1405, 293 01 Mladá Boleslav',
    phone: null,
    email: null,
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'oddělení následné péče / LDN; veřejně dohledány jen obecné informace; okres Mladá Boleslav',
    contact: { name: 'MUDr. Mojmír Koščál, MBA, BBA', position: 'Vedoucí lékař (od 1. 3. 2026)' }
  },
  {
    company_name: 'Klaudiánova nemocnice - oddělení následné péče Mnichovo Hradiště',
    city: 'Mnichovo Hradiště',
    address: 'Turnovská 500, 295 01 Mnichovo Hradiště',
    phone: '326 771 602',
    email: 'jiri.janovsky@onmb.cz',
    region: 'Středočeský kraj',
    category: 'ldn',
    notes: 'oddělení následné péče; okres Mladá Boleslav',
    contact: { name: 'MUDr. Jiří Janovský', position: 'Primář' }
  },

  // === MLADÁ BOLESLAV - Hospice ===
  {
    company_name: 'Dům péče Českého červeného kříže',
    city: 'Mladá Boleslav',
    address: 'Na Celně 1405, 293 01 Mladá Boleslav',
    phone: '326 320 250',
    email: 'mladaboleslav@cervenykriz.eu',
    region: 'Středočeský kraj',
    category: 'hospic',
    notes: 'zařízení hospicového / paliativního typu; okres Mladá Boleslav',
    contact: { name: 'Mgr. Michaela Mittnerová', position: 'Ředitelka OS ČČK MB' }
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseContactName(fullName) {
  // Remove titles like Bc., Mgr., Ing., JUDr., PhDr., MUDr., prim., MBA, DiS., BBA
  const cleaned = fullName
    .replace(/^(prim\.\s+)/i, '')
    .replace(/,?\s*(MBA|DiS\.|BBA)$/g, '')
    .trim();

  const titles = ['Bc.', 'Mgr.', 'Ing.', 'JUDr.', 'PhDr.', 'MUDr.', 'Mgr. et Bc.', 'Ing. Bc.'];
  let name = cleaned;
  for (const t of titles) {
    if (name.startsWith(t + ' ')) {
      name = name.slice(t.length).trim();
    }
  }

  const parts = name.split(/\s+/);
  if (parts.length === 1) {
    return { first_name: '', last_name: parts[0] };
  }
  return {
    first_name: parts.slice(0, -1).join(' '),
    last_name: parts[parts.length - 1]
  };
}

function segmentForCategory(cat) {
  if (cat === 'domov_senioru') return 'Domovy seniorů a LDN';
  if (cat === 'ldn') return 'Domovy seniorů a LDN';
  if (cat === 'hospic') return 'Domovy seniorů a LDN';
  return 'Zdravotnictví';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`📋 Celkem zařízení k importu: ${facilities.length}`);

  // Resolve segment IDs
  const segmentNames = [...new Set(facilities.map(f => segmentForCategory(f.category)))];
  const { data: segments, error: segErr } = await supabase
    .from('company_segments')
    .select('id, name')
    .in('name', segmentNames);

  if (segErr) {
    console.error('❌ Chyba při načítání segmentů:', segErr.message);
    process.exit(1);
  }

  const segmentMap = {};
  for (const s of segments) segmentMap[s.name] = s.id;
  console.log('✅ Segmenty nalezeny:', Object.keys(segmentMap).join(', '));

  let prospectCount = 0;
  let clientCount = 0;
  let contactCount = 0;
  let touchpointCount = 0;
  let errorCount = 0;

  for (const f of facilities) {
    const segmentName = segmentForCategory(f.category);
    const segmentId = segmentMap[segmentName] || null;

    // 1. Create PROSPECT (status: contacted - email was sent)
    const { data: prospect, error: pErr } = await supabase
      .from('prospects')
      .insert({
        company_name: f.company_name,
        segment_id: segmentId,
        region: f.region,
        city: f.city,
        address: f.address,
        source: 'Vlastní výzkum',
        priority: 3,
        status: 'contacted',
        notes: f.notes
      })
      .select('id')
      .single();

    if (pErr) {
      console.error(`❌ Prospect "${f.company_name}": ${pErr.message}`);
      errorCount++;
      continue;
    }
    prospectCount++;

    // 2. Add prospect CONTACT if available
    if (f.contact) {
      const { first_name, last_name } = parseContactName(f.contact.name);
      const { error: pcErr } = await supabase
        .from('prospect_contacts')
        .insert({
          prospect_id: prospect.id,
          first_name,
          last_name,
          position: f.contact.position,
          email: f.email,
          phone: f.phone,
          is_decision_maker: true
        });
      if (pcErr) {
        console.error(`  ⚠️  Kontakt prospect "${f.company_name}": ${pcErr.message}`);
      } else {
        contactCount++;
      }
    }

    // 3. Create TOUCHPOINT (email sent with service offer)
    const { error: tErr } = await supabase
      .from('touchpoints')
      .insert({
        prospect_id: prospect.id,
        type: 'email',
        subject: 'Nabídka služeb VitalSpace - ozonová dezinfekce pro vaše zařízení',
        summary: 'Odeslán úvodní email s nabídkou služeb ozonové dezinfekce a sanitace prostor. Zaměřeno na zlepšení kvality ovzduší a snížení infekčních rizik v zařízení sociální / zdravotní péče.',
        outcome: 'Čekáme na odpověď',
        next_action: 'Follow-up telefonát',
        next_action_date: '2026-03-26'
      });
    if (tErr) {
      console.error(`  ⚠️  Touchpoint "${f.company_name}": ${tErr.message}`);
    } else {
      touchpointCount++;
    }

    // 4. Create CLIENT (they received the email = are clients)
    const { data: client, error: cErr } = await supabase
      .from('clients')
      .insert({
        company_name: f.company_name,
        prospect_id: prospect.id,
        original_prospect_id: prospect.id,
        type: 'B2B',
        segment_id: segmentId,
        region: f.region,
        city: f.city,
        address: f.address,
        phone: f.phone,
        email: f.email,
        notes: f.notes
      })
      .select('id')
      .single();

    if (cErr) {
      console.error(`❌ Client "${f.company_name}": ${cErr.message}`);
      errorCount++;
      continue;
    }
    clientCount++;

    // 5. Add client CONTACT if available
    if (f.contact) {
      const { first_name, last_name } = parseContactName(f.contact.name);
      const { error: ccErr } = await supabase
        .from('client_contacts')
        .insert({
          client_id: client.id,
          first_name,
          last_name,
          position: f.contact.position,
          email: f.email,
          phone: f.phone,
          is_primary: true,
          is_decision_maker: true
        });
      if (ccErr) {
        console.error(`  ⚠️  Kontakt client "${f.company_name}": ${ccErr.message}`);
      }
    }

    console.log(`  ✅ ${f.company_name} (prospect + client)`);
  }

  console.log('\n========================================');
  console.log(`📊 Výsledek importu:`);
  console.log(`   Prospekty:   ${prospectCount} vytvořeno`);
  console.log(`   Klienti:     ${clientCount} vytvořeno`);
  console.log(`   Kontakty:    ${contactCount} přidáno`);
  console.log(`   Touchpointy: ${touchpointCount} (email odeslán)`);
  if (errorCount > 0) {
    console.log(`   ❌ Chyby:    ${errorCount}`);
  }
  console.log('========================================');
}

main().catch(err => {
  console.error('Fatální chyba:', err);
  process.exit(1);
});
