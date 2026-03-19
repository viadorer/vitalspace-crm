#!/usr/bin/env node
/**
 * Import kontaktů z dokumentu: LDN, hospice, domovy seniorů
 * Okresy: Kladno, Mělník, Litoměřice, Roudnice n.L., Praha-východ, Mladá Boleslav
 *
 * Každý kontakt se vloží jako:
 * 1. Prospect (status: contacted)
 * 2. Client (s vazbou na prospect)
 * 3. Touchpoint (email - nabídka služeb)
 * 4. Activity (email na prospect i client)
 * 5. Prospect_contact (kde máme jméno vedoucího)
 */

const SUPABASE_URL = 'https://pyrtrlhesqqjjtemacbi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cnRybGhlc3Fxamp0ZW1hY2JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMyMDg0MiwiZXhwIjoyMDg3ODk2ODQyfQ.ML2QadVJfzcDgttYpFPNneuarirVCP4IOKjXlQqaeoo';

const SEGMENT_ID = 'fe1ebc5a-ec59-4234-ac64-1d059399bcb8'; // Domovy seniorů a LDN
const NEMOCNICE_SEGMENT_ID = '1caacb42-0934-47f4-9dc1-44c1b1891f0b'; // Nemocnice a kliniky

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Data extrahovaná z .pages souboru
const contacts = [
  // === OKRES KLADNO - DOMOVY ===
  {
    company_name: 'Domov Kladno - Švermov',
    city: 'Kladno',
    address: 'Vojtěcha Dundra 1032, 273 09 Kladno',
    phone: '312 292 930',
    email: null,
    contact_person: 'Bc. Tomáš Abrham',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Kladno'
  },
  {
    company_name: 'Domov seniorů Kladno - Fr. Kloze',
    city: 'Kladno',
    address: 'Fr. Kloze 1178, 272 01 Kladno',
    phone: '312 452 095',
    email: null,
    contact_person: 'JUDr. Miroslav Petrák',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Kladno'
  },
  {
    company_name: 'Domov Pod Lipami Smečno',
    city: 'Smečno',
    address: 'Smečno, 273 05',
    phone: '312 547 855',
    email: 'sala@dpodlipami.cz',
    contact_person: 'Dana Dernerová',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Kladno'
  },
  {
    company_name: 'Domov Unhošť',
    city: 'Unhošť',
    address: 'Berounská 500, Unhošť',
    phone: '774 414 040',
    email: 'info@ddunhost.cz',
    contact_person: 'Ing. Lenka Ungermanová',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Kladno'
  },
  {
    company_name: 'Domov Velvary',
    city: 'Velvary',
    address: 'Bezručova 484, 273 24 Velvary',
    phone: '315 720 275',
    email: null,
    contact_person: 'Marcel Zhorný',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Kladno'
  },
  {
    company_name: 'Domov Slaný - Žižice',
    city: 'Slaný',
    address: 'Žižice, Slaný',
    phone: '312 525 710',
    email: 'pssslany@pssslany.cz',
    contact_person: 'Václav Váňa',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Kladno'
  },

  // === OKRES KLADNO - LDN ===
  {
    company_name: 'GARC Kladno s.r.o. - geriatrické a rehabilitační centrum',
    city: 'Kladno',
    address: 'Fr. Kloze 37, 272 01 Kladno',
    phone: '312 256 500',
    email: 'info@garc.cz',
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'Následná lůžková péče; okres Kladno; jméno lékaře veřejně neuvedeno'
  },
  {
    company_name: 'Nemocnice Slaný - oddělení LDN',
    city: 'Slaný',
    address: 'Politických vězňů 576, Slaný',
    phone: '312 575 111',
    email: null,
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'LDN / následná péče; okres Kladno'
  },

  // === OKRES KLADNO - HOSPICE ===
  {
    company_name: 'Hospic svaté Hedviky, o.p.s.',
    city: 'Kladno',
    address: 'Saskova 1625, 272 01 Kladno',
    phone: '774 951 755',
    email: 'info@hospicsvaTehedviky.cz',
    contact_person: 'Mgr. Lucia Řepová',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Kladno',
    type: 'hospic',
    segment_id: SEGMENT_ID,
    notes: 'Lůžkový i domácí hospic; okres Kladno'
  },

  // === OKRES MĚLNÍK - DOMOVY ===
  {
    company_name: 'Senior-komplex s.r.o. - pobočka Lužec nad Vltavou',
    city: 'Lužec nad Vltavou',
    address: '1. máje 22, 277 06 Lužec nad Vltavou',
    phone: '733 189 006',
    email: 'tauchman@senior-komplex.cz',
    contact_person: 'Ing. Ondřej Ptáček',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mělník'
  },
  {
    company_name: 'Domov Mělník',
    city: 'Mělník',
    address: 'Bezručova 409, 276 01 Mělník',
    phone: null,
    email: null,
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mělník'
  },
  {
    company_name: 'Penzion Fügnerova Mělník',
    city: 'Mělník',
    address: 'Fügnerova 3343, Mělník',
    phone: '315 630 040',
    email: 'd.pavlikova@ssm-melnik.cz',
    contact_person: 'PhDr. Drahomíra Pavlíková',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Penzion pro seniory; okres Mělník'
  },
  {
    company_name: 'Amfion sanatorium',
    city: 'Mělník',
    address: 'Českolipská 3444, Mělník',
    phone: '731 443 174',
    email: null,
    contact_person: 'Jaroslav Novotný',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov se zvláštním režimem / následná péče; okres Mělník'
  },
  {
    company_name: 'Domov Mšeno',
    city: 'Mšeno',
    address: 'Mšeno, 277 35',
    phone: null,
    email: 'smseno@seznam.cz',
    contact_person: 'Mgr. et Bc. Blanka Dvorščáková, MBA',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mělník'
  },
  {
    company_name: 'Dům kněžny Emmy',
    city: 'Neratovice',
    address: 'Kojetice 141, 277 11 Neratovice',
    phone: '315 305 100',
    email: 'dke@demmy.cz',
    contact_person: 'Ingrid Podrouženská',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mělník'
  },
  {
    company_name: 'Domov Vidim',
    city: 'Vidim',
    address: 'Vidim, 277 01',
    phone: '315 695 464',
    email: null,
    contact_person: 'Milan Hrubec',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mělník'
  },
  {
    company_name: 'Červený Mlýn Všestudy',
    city: 'Všestudy',
    address: 'Všestudy, 277 46',
    phone: '607 850 800',
    email: null,
    contact_person: 'Aneta Heřmanová, DiS.',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mělník'
  },

  // === OKRES MĚLNÍK - LDN ===
  {
    company_name: 'Nemocnice Mělník - oddělení dlouhodobé lůžkové péče',
    city: 'Mělník',
    address: 'Fügnerova 715/14, 276 01 Mělník',
    phone: '315 639 430',
    email: 'irena.zavadova@nemmelnik.cz',
    contact_person: 'MUDr. Irena Závadová',
    contact_position: 'primářka',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'ODLP / LDN; okres Mělník'
  },

  // === OKRES MĚLNÍK - HOSPICE ===
  {
    company_name: 'Hospic Tempus, z.s.',
    city: 'Mělník',
    address: 'Bezručova 108, 276 01 Mělník',
    phone: '728 885 695',
    email: 'info@hospictempus.cz',
    contact_person: 'Mgr. Dita Brezováková',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Mělník',
    type: 'hospic',
    segment_id: SEGMENT_ID,
    notes: 'Mobilní i specializovaná paliativní péče; obsluhuje i část okresu Praha-východ; okres Mělník'
  },

  // === OKRES LITOMĚŘICE - DOMOVY ===
  {
    company_name: 'Diakonie ČCE - středisko v Krabčicích',
    city: 'Krabčice',
    address: 'Krabčice 57, 411 87',
    phone: '417 639 680',
    email: 'domov@diakonie-krabcice.cz',
    contact_person: 'Bc. Jana Sedláková',
    contact_position: 'ředitelka',
    region: 'Ostatní',
    district: 'Litoměřice',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Litoměřice (Ústecký kraj)'
  },
  {
    company_name: 'Domov důchodců Libochovice',
    city: 'Libochovice',
    address: 'Vrchlického 574, Libochovice',
    phone: '603 585 127',
    email: 'dd.libochovice@csplitomerice.cz',
    contact_person: 'Mgr. Lydie Hrdličková',
    contact_position: 'ředitelka',
    region: 'Ostatní',
    district: 'Litoměřice',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Litoměřice (Ústecký kraj)'
  },
  {
    company_name: 'Charita na Dómském pahorku - pracoviště Zahradní',
    city: 'Litoměřice',
    address: 'Zahradní 1534/5, 412 01 Litoměřice',
    phone: '416 770 013',
    email: 'ds@charita-litomerice.cz',
    contact_person: 'Iveta Šerberová',
    contact_position: 'vedoucí',
    region: 'Ostatní',
    district: 'Litoměřice',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; Charita Litoměřice; okres Litoměřice (Ústecký kraj)'
  },
  {
    company_name: 'Domov U Trati Litoměřice',
    city: 'Litoměřice',
    address: 'U Trati 2041/3, Litoměřice',
    phone: '416 735 292',
    email: null,
    contact_person: 'Libuše Horáková',
    contact_position: 'vedoucí',
    region: 'Ostatní',
    district: 'Litoměřice',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Litoměřice (Ústecký kraj)'
  },
  {
    company_name: 'Senevida Terezín',
    city: 'Terezín',
    address: 'Terezín 301, 411 55',
    phone: '727 980 306',
    email: 'info@senecura.cz',
    contact_person: 'David Grbavčík',
    contact_position: 'ředitel',
    region: 'Ostatní',
    district: 'Litoměřice',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Litoměřice (Ústecký kraj)'
  },

  // === OKRES LITOMĚŘICE - LDN ===
  {
    company_name: 'Městská nemocnice v Litoměřicích - LDN',
    city: 'Litoměřice',
    address: 'Žitenická 18, 412 01 Litoměřice',
    phone: '416 723 583',
    email: null,
    contact_person: 'MUDr. Jaroslav Pršala',
    contact_position: 'primář',
    region: 'Ostatní',
    district: 'Litoměřice',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'Léčebna dlouhodobě nemocných; okres Litoměřice (Ústecký kraj)'
  },

  // === OKRES LITOMĚŘICE - HOSPICE ===
  {
    company_name: 'Hospic sv. Štěpána',
    city: 'Litoměřice',
    address: 'Rybářské náměstí 662/4, 412 01 Litoměřice',
    phone: '416 733 185',
    email: 'info@hospic-litomerice.cz',
    contact_person: 'Mgr. Monika Marková',
    contact_position: 'ředitelka',
    region: 'Ostatní',
    district: 'Litoměřice',
    type: 'hospic',
    segment_id: SEGMENT_ID,
    notes: 'Lůžkový i domácí hospic; primářka MUDr. Jana Adamčíková; okres Litoměřice (Ústecký kraj)'
  },

  // === ROUDNICE NAD LABEM - DOMOVY ===
  {
    company_name: 'Domov důchodců Roudnice nad Labem',
    city: 'Roudnice nad Labem',
    address: 'Sámova 2481, 413 01 Roudnice nad Labem',
    phone: '416 807 111',
    email: 'info@dd-senioru.cz',
    contact_person: 'Bc. Lenka Nová',
    contact_position: 'ředitelka',
    region: 'Ostatní',
    district: 'Roudnice nad Labem',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Roudnice nad Labem (Ústecký kraj)'
  },

  // === ROUDNICE NAD LABEM - LDN ===
  {
    company_name: 'Podřipská nemocnice s poliklinikou Roudnice n. L. - LDN',
    city: 'Roudnice nad Labem',
    address: 'Alej 17. listopadu 1101, 413 01 Roudnice nad Labem',
    phone: '416 858 829',
    email: 'kamila.sedlackova@pnsp-roudnice.cz',
    contact_person: null,
    contact_position: null,
    region: 'Ostatní',
    district: 'Roudnice nad Labem',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'LDN / následná péče; vedoucí oddělení veřejně neuveden; okres Roudnice nad Labem (Ústecký kraj)'
  },

  // === ROUDNICE NAD LABEM - HOSPICE ===
  {
    company_name: 'Domácí hospicová péče OPORA',
    city: 'Roudnice nad Labem',
    address: 'Jungmannova 1024, 413 01 Roudnice nad Labem',
    phone: '776 067 074',
    email: 'info@opora-os.cz',
    contact_person: null,
    contact_position: null,
    region: 'Ostatní',
    district: 'Roudnice nad Labem',
    type: 'hospic',
    segment_id: SEGMENT_ID,
    notes: 'Domácí hospicová péče; okres Roudnice nad Labem (Ústecký kraj)'
  },

  // === PRAHA-VÝCHOD - DOMOVY ===
  {
    company_name: 'Hortenzie',
    city: 'Bořanovice',
    address: 'K Ubytovně 65, 250 65 Bořanovice',
    phone: '283 981 100',
    email: 'info@hortenzie.cz',
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Praha-východ'
  },
  {
    company_name: 'Dřevčický Park',
    city: 'Brandýs nad Labem - Stará Boleslav',
    address: 'Dřevčice, 250 01 Brandýs nad Labem',
    phone: '326 329 158',
    email: 'socialni@drevcickypark.com',
    contact_person: 'Bc. Lukáš Porubský',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Praha-východ'
  },
  {
    company_name: 'Domov Jenštejn',
    city: 'Jenštejn',
    address: 'Vinořská 78, Jenštejn',
    phone: '605 422 484',
    email: 'info@dsjenstejn.cz',
    contact_person: 'Mgr. Jiří Ploner',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Praha-východ'
  },
  {
    company_name: 'DS kardinála Berana Mukařov',
    city: 'Mukařov',
    address: 'Charitní 26, 251 62 Mukařov',
    phone: '323 612 611',
    email: 'dsmukarov@praha.charita.cz',
    contact_person: 'Alena Hanková',
    contact_position: 'vedoucí',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; Charita Praha; okres Praha-východ'
  },
  {
    company_name: 'Domov Hačka',
    city: 'Kostelec nad Černými lesy',
    address: 'Oleška 153, 281 63 Kostelec nad Černými lesy',
    phone: '321 697 631',
    email: null,
    contact_person: 'Ivana Želízková',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Praha-východ'
  },
  {
    company_name: 'Pod Kavčí Skálou Říčany',
    city: 'Říčany',
    address: 'Marie Pujmanové 2045/2, 251 01 Říčany',
    phone: '323 632 423',
    email: 'pks@pks-ricany.cz',
    contact_person: 'Ing. Václav Brácha',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Praha-východ'
  },
  {
    company_name: 'Domov Světice',
    city: 'Světice',
    address: 'Zahradní 36, Světice',
    phone: '603 113 770',
    email: null,
    contact_person: 'Zdeňka Pelišková',
    contact_position: 'vedoucí',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Praha-východ'
  },
  {
    company_name: 'Zátiší Úvaly',
    city: 'Úvaly',
    address: 'Modřanská 152, 250 82 Úvaly',
    phone: '281 207 100',
    email: 'zatisi@email.cz',
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Praha-východ'
  },
  {
    company_name: 'Felicita Vyžlovka',
    city: 'Vyžlovka',
    address: 'Pražská, Vyžlovka',
    phone: '775 100 040',
    email: 'pension.felicita@email.cz',
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Penzion pro seniory; okres Praha-východ'
  },

  // === PRAHA-VÝCHOD - LDN ===
  {
    company_name: 'Nemocnice následné a rehabilitační péče Vojkov (LDN na Vojkově)',
    city: 'Tehovec - Vojkov',
    address: 'Vojkov 83, 251 01 Tehovec',
    phone: '323 627 111',
    email: 'ldnvojkov@nkolin.cz',
    contact_person: 'Jana Dítětová',
    contact_position: 'zástupce',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'LDN; okres Praha-východ'
  },
  {
    company_name: 'Nemocnice AGEL Říčany - LDN',
    city: 'Říčany',
    address: 'Smiřických 315, Říčany',
    phone: '323 601 511',
    email: 'sekretariat@nrc.agel.cz',
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'LDN; vedoucí oddělení veřejně neuveden; okres Praha-východ'
  },
  {
    company_name: 'LDN Brandýs nad Labem - Stará Boleslav',
    city: 'Brandýs nad Labem - Stará Boleslav',
    address: 'Brázdimská 1000/3, Brandýs nad Labem',
    phone: '326 746 553',
    email: 'ar.lnp@bnl.com',
    contact_person: 'MUDr. Abdul Rasool Mohamed',
    contact_position: 'primář',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'LDN / lůžka následné péče; okres Praha-východ'
  },

  // === PRAHA-VÝCHOD - HOSPICE ===
  {
    company_name: 'Hospic Tempus, z.s. - mobilní hospic pro část okresu Praha-východ',
    city: 'Mělník',
    address: 'Bezručova 108, 276 01 Mělník',
    phone: '728 885 695',
    email: 'info@hospictempus.cz',
    contact_person: 'Mgr. Dita Brezováková',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Praha-východ',
    type: 'hospic',
    segment_id: SEGMENT_ID,
    notes: 'Mobilní hospicová služba výslovně obsluhuje také okres Praha-východ; sídlo Mělník'
  },

  // === MLADÁ BOLESLAV - DOMOVY ===
  {
    company_name: 'Městské centrum komplexní péče Benátky nad Jizerou',
    city: 'Benátky nad Jizerou',
    address: 'ul. 17. listopadu 593, 294 71 Benátky nad Jizerou',
    phone: '326 362 283',
    email: 'meglicova@mestske-centrum-benatky.cz',
    contact_person: 'Bc. Monika Meglicová, DiS.',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mladá Boleslav'
  },
  {
    company_name: 'U Anežky',
    city: 'Mladá Boleslav',
    address: 'Mladá Boleslav',
    phone: '733 736 485',
    email: null,
    contact_person: 'Ing. Petr Kordula',
    contact_position: 'ředitel',
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mladá Boleslav'
  },
  {
    company_name: 'Domov Vlčí Pole',
    city: 'Dolní Bousov',
    address: 'Vlčí Pole, 294 04 Dolní Bousov',
    phone: '721 817 677',
    email: null,
    contact_person: 'Eva Pešková',
    contact_position: 'vedoucí',
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mladá Boleslav'
  },
  {
    company_name: 'Dům Mladá Boleslav',
    city: 'Mladá Boleslav',
    address: 'Olbrachtova 1390, 293 01 Mladá Boleslav',
    phone: '326 718 620',
    email: 'dmb@dmb.cz',
    contact_person: 'Mgr. Marie Nežalová',
    contact_position: 'ředitelka',
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mladá Boleslav'
  },
  {
    company_name: 'Modrý kámen Mnichovo Hradiště',
    city: 'Mnichovo Hradiště',
    address: 'Nerudova 47, Mnichovo Hradiště',
    phone: '326 774 051',
    email: 'info@modry-kamen.cz',
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mladá Boleslav'
  },
  {
    company_name: 'Domov Cetno',
    city: 'Niměřice',
    address: 'Niměřice, 294 02',
    phone: '326 356 216',
    email: 'dccetno@seznam.cz',
    contact_person: 'Vendulka Háková',
    contact_position: 'vedoucí',
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'domov',
    segment_id: SEGMENT_ID,
    notes: 'Domov pro seniory; okres Mladá Boleslav'
  },

  // === MLADÁ BOLESLAV - LDN ===
  {
    company_name: 'Klaudiánova nemocnice - oddělení následné péče Na Celně',
    city: 'Mladá Boleslav',
    address: 'Na Celně 1405, 293 01 Mladá Boleslav',
    phone: null,
    email: null,
    contact_person: 'MUDr. Mojmír Koščál, MBA, BBA',
    contact_position: 'vrchní lékař (od 1. 3. 2026)',
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'LDN / následná péče; okres Mladá Boleslav'
  },
  {
    company_name: 'LDN Mnichovo Hradiště',
    city: 'Mnichovo Hradiště',
    address: 'Turnovská 500, Mnichovo Hradiště',
    phone: '326 771 602',
    email: 'jiri.jansa@onmb.cz',
    contact_person: null,
    contact_position: null,
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'LDN',
    segment_id: NEMOCNICE_SEGMENT_ID,
    notes: 'LDN / následná péče; okres Mladá Boleslav'
  },

  // === MLADÁ BOLESLAV - HOSPICE ===
  {
    company_name: 'Dům péče Českého červeného kříže Mladá Boleslav',
    city: 'Mladá Boleslav',
    address: 'Na Celně 1405, 293 01 Mladá Boleslav',
    phone: '326 320 250',
    email: 'mladaboleslav@cervenykriz.eu',
    contact_person: 'Mgr. Michaela Mittnerová',
    contact_position: 'koordinátorka OS ČČK MB',
    region: 'Středočeský kraj',
    district: 'Mladá Boleslav',
    type: 'hospic',
    segment_id: SEGMENT_ID,
    notes: 'Zařízení hospicového / paliativního typu; Český červený kříž; okres Mladá Boleslav'
  }
];

async function supabaseRequest(table, data, method = 'POST') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method,
    headers,
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${table}: ${res.status} ${err}`);
  }
  return res.json();
}

async function main() {
  console.log(`Importing ${contacts.length} contacts...`);

  let successCount = 0;
  let errorCount = 0;

  for (const c of contacts) {
    try {
      // 1. Create prospect
      const [prospect] = await supabaseRequest('prospects', {
        company_name: c.company_name,
        segment_id: c.segment_id,
        region: c.region,
        city: c.city,
        address: c.address,
        website: null,
        source: 'Seznam LDN/hospice/domovy - manuální výběr',
        priority: 2,
        status: 'contacted',
        notes: c.notes + ` | Okres: ${c.district} | Typ: ${c.type}`
      });

      // 2. Create prospect_contact (if we have contact info)
      let prospectContact = null;
      if (c.contact_person) {
        const nameParts = c.contact_person.replace(/^(Bc\.|Mgr\.|Ing\.|JUDr\.|MUDr\.|PhDr\.|Mgr\. et Bc\.)?\s*/, '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || c.contact_person;

        [prospectContact] = await supabaseRequest('prospect_contacts', {
          prospect_id: prospect.id,
          first_name: firstName,
          last_name: lastName || c.contact_person,
          position: c.contact_position,
          email: c.email,
          phone: c.phone,
          is_decision_maker: true
        });
      }

      // 3. Create touchpoint (email sent)
      await supabaseRequest('touchpoints', {
        prospect_id: prospect.id,
        contact_id: prospectContact?.id || null,
        type: 'email',
        subject: 'Nabídka služeb Vitalspace - čištění a sanitace vzduchu',
        summary: 'Odeslán email s nabídkou služeb Vitalspace pro zařízení péče o seniory. Nabídka zahrnuje řešení pro čištění vzduchu v prostorách domovů, hospiců a LDN.',
        outcome: 'Email odeslán',
        next_action: 'Follow-up telefonát',
        next_action_date: '2026-03-26',
        consultant_name: 'Import'
      });

      // 4. Create client (no contact_person/email/phone columns - those go to client_contacts)
      const [client] = await supabaseRequest('clients', {
        prospect_id: prospect.id,
        original_prospect_id: prospect.id,
        company_name: c.company_name,
        type: 'B2B',
        segment_id: c.segment_id,
        region: c.region,
        city: c.city,
        address: c.address,
        source: 'Seznam LDN/hospice/domovy - manuální výběr',
        notes: c.notes + ` | Okres: ${c.district} | Typ: ${c.type}`
      });

      // 4b. Create client_contact (if we have contact info)
      if (c.contact_person) {
        const nameParts = c.contact_person.replace(/^(Bc\.|Mgr\.|Ing\.|JUDr\.|MUDr\.|PhDr\.|Mgr\. et Bc\.)?\s*/, '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || c.contact_person;
        await supabaseRequest('client_contacts', {
          client_id: client.id,
          first_name: firstName,
          last_name: lastName || c.contact_person,
          position: c.contact_position,
          email: c.email,
          phone: c.phone,
          is_primary: true,
          is_decision_maker: true
        });
      }

      // 5. Update prospect with converted_to_client_id
      await fetch(`${SUPABASE_URL}/rest/v1/prospects?id=eq.${prospect.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ converted_to_client_id: client.id })
      });

      // 6. Create activity on prospect (email)
      await supabaseRequest('activities', {
        entity_type: 'prospect',
        entity_id: prospect.id,
        type: 'email',
        subject: 'Nabídka služeb Vitalspace - čištění a sanitace vzduchu',
        body: `Odeslán email s nabídkou služeb pro ${c.company_name}. Zařízení typu: ${c.type}, okres ${c.district}.`,
        is_completed: true
      });

      // 7. Create activity on client (email)
      await supabaseRequest('activities', {
        entity_type: 'client',
        entity_id: client.id,
        type: 'email',
        subject: 'Nabídka služeb Vitalspace - čištění a sanitace vzduchu',
        body: `Odeslán email s nabídkou služeb pro ${c.company_name}. Zařízení typu: ${c.type}, okres ${c.district}.`,
        is_completed: true
      });

      successCount++;
      console.log(`✓ ${c.company_name} (${c.city}) - prospect + client + touchpoint + activities`);
    } catch (err) {
      errorCount++;
      console.error(`✗ ${c.company_name}: ${err.message}`);
    }
  }

  console.log(`\nDone! Success: ${successCount}, Errors: ${errorCount}`);
}

main().catch(console.error);
