/**
 * Email templates for VitalSpace CRM.
 *
 * Each template is a function that accepts variables and returns { subject, html }.
 * Images are hosted on Supabase Storage (public bucket email-assets).
 */

const IMG_BASE = 'https://pyrtrlhesqqjjtemacbi.supabase.co/storage/v1/object/public/email-assets/products'
const LOGO_URL = 'https://pyrtrlhesqqjjtemacbi.supabase.co/storage/v1/object/public/email-assets/logo-vitalspace.png'

export interface TemplateVariables {
  /** Oslovení: "Vážená paní ředitelko" / "Vážený pane řediteli" / custom */
  salutation?: string
  /** Jméno kontaktní osoby */
  contact_name?: string
  /** Název zařízení / firmy */
  company_name?: string
  /** Město */
  city?: string
}

export interface TemplateResult {
  subject: string
  html: string
}

export type TemplateName =
  | 'obecna-nabidka'
  | 'prodej-pristroju'
  | 'toxicita-prostredi'
  | 'follow-up'
  | 'pozvanka-audit'
  | 'skoly-skolky'
  | 'hotely-ubytovani'
  | 'pronajem-vs-koupe'
  | 'certifikace-duvera'
  | 'administrativni-budovy'
  | 'obchodni-centra'
  | 'domovy-senioru'
  | 'fitness-sport'
  | 'vyroba-sklady'
  | 'restaurace-gastronomie'
  | 'case-study'
  | 'roi-kalkulacka'

export const EMAIL_TEMPLATES: Record<TemplateName, {
  label: string
  description: string
  build: (vars: TemplateVariables) => TemplateResult
}> = {
  'obecna-nabidka': {
    label: 'Obecná nabídka – dezinfekce a sanitace',
    description: 'Úvodní email s představením VitalSpace, fotkami produktů a nabídkou nezávazné konzultace.',
    build: buildObecnaNabidka,
  },
  'prodej-pristroju': {
    label: 'Prodej přístrojů – katalog OZON',
    description: 'Prodejní email se všemi 3 přístroji: OZON Breeze Up, OZON Oasis Box DRY, OZON Storm Pro I PLUS.',
    build: buildProdejPristroju,
  },
  'toxicita-prostredi': {
    label: 'Toxicita vnitřního prostředí – skrytá hrozba',
    description: 'Edukační email o VOC, formaldehydu, syndromu nemocné budovy a řešení pomocí ozonové sanitace.',
    build: buildToxicitaProstredi,
  },
  'follow-up': {
    label: 'Follow-up po nabídce',
    description: 'Připomenutí po odeslání obecné nabídky.',
    build: buildFollowUp,
  },
  'pozvanka-audit': {
    label: 'Pozvánka na technický audit',
    description: 'Nabídka bezplatného měření kvality vzduchu.',
    build: buildPozvankaAudit,
  },
  'skoly-skolky': {
    label: 'Nabídka pro školy a školky',
    description: 'Ochrana dětí, eliminace virů, bez chemie – bezpečné pro děti.',
    build: buildSkolySkolky,
  },
  'hotely-ubytovani': {
    label: 'Nabídka pro hotely a ubytování',
    description: 'Eliminace pachů, komfort hostů, rychlý turnaround mezi hosty.',
    build: buildHotelyUbytovani,
  },
  'pronajem-vs-koupe': {
    label: 'Pronájem vs. koupě – rozhodovací email',
    description: 'Srovnání 3 modelů: koupě, dlouhodobý pronájem, jednorázová služba.',
    build: buildPronajemVsKoupe,
  },
  'certifikace-duvera': {
    label: 'Certifikace a důvěra',
    description: 'MZ ČR, ZČU Plzeň, EN 17272:2020 – pro skeptické ředitele.',
    build: buildCertifikaceDuvera,
  },
  'administrativni-budovy': {
    label: 'Nabídka pro administrativní budovy',
    description: 'Sick building syndrome, produktivita zaměstnanců, HVAC kontaminace, ESG/BREEAM benefity.',
    build: buildAdministrativniBudovy,
  },
  'obchodni-centra': {
    label: 'Nabídka pro obchodní centra',
    description: 'Vysoká návštěvnost, food courty, toalety, nákupní komfort, ROI a retenční výhody.',
    build: buildObchodniCentra,
  },
  'domovy-senioru': {
    label: 'Domovy seniorů a LDN',
    description: 'Ochrana imunokompromitovaných klientů, eliminace pachů inkontinence, snížení nozokomiálních infekcí.',
    build: buildDomovySenioru,
  },
  'fitness-sport': {
    label: 'Fitness centra a sportovní zařízení',
    description: 'Eliminace zápachu v šatnách, prevence plísní, čistý vzduch pro sportovce.',
    build: buildFitnessSport,
  },
  'vyroba-sklady': {
    label: 'Výrobní podniky a sklady',
    description: 'BOZP normy, eliminace kontaminantů, ochrana zdraví zaměstnanců v průmyslu.',
    build: buildVyrobaSklady,
  },
  'restaurace-gastronomie': {
    label: 'Restaurace a gastronomie',
    description: 'Eliminace kuchyňských pachů, HACCP hygiena, komfort hostů, dezinfekce bez chemie.',
    build: buildRestauraceGastronomie,
  },
  'case-study': {
    label: 'Case study – konkrétní výsledky',
    description: 'Universální šablona s reálnými výsledky měření před/po u zákazníků VitalSpace.',
    build: buildCaseStudy,
  },
  'roi-kalkulacka': {
    label: 'ROI kalkulačka – kolik vás stojí špatný vzduch',
    description: 'Edukační email s výpočtem nákladů nemocnosti, pachů a chemie vs. ozonová sanitace.',
    build: buildRoiKalkulacka,
  },
}

// ── Shared signature ──

const SIGNATURE = `
    <p style="margin-top: 28px;">
      S&nbsp;úctou<br/>
      <strong>Mgr. Pavel Fogl</strong><br/>
      <span style="color: #6b7280;">+420 775 930 816</span><br/>
      <span style="color: #6b7280;">pavel.fogl@vitalspace.cz</span>
    </p>
`

// ── 1. Obecná nabídka ──

function buildObecnaNabidka(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const companyRef = vars.company_name ? ` ve společnosti ${esc(vars.company_name)}` : ''

  const subject = 'Čistý vzduch a dezinfekce bez chemie – VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si Vás oslovit jménem společnosti <strong>VitalSpace</strong> s&nbsp;nabídkou moderního řešení
    dezinfekce a&nbsp;sanitace prostor${companyRef}.</p>

    <p>Naše <strong>certifikované ozonové technologie</strong> (registrace MZ&nbsp;ČR, validace dle EN&nbsp;17272:2020,
    vyvinuté ve spolupráci se Západočeskou univerzitou v&nbsp;Plzni) umožňují:</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>likvidaci 99,9&nbsp;% bakterií, virů a&nbsp;plísní</strong> bez použití chemie</li>
      <li>eliminaci nepříjemných pachů z&nbsp;provozu</li>
      <li>snížení nákladů na chemickou dezinfekci</li>
      <li>zvýšení komfortu a&nbsp;bezpečnosti pro zaměstnance i&nbsp;klienty</li>
    </ul>

    <p>Technologie je využívána v&nbsp;široké škále provozů — od kanceláří, hotelů a&nbsp;restaurací,
    přes školy a&nbsp;fitness centra, až po zdravotnická zařízení a&nbsp;výrobní podniky.</p>

    <!-- Breeze Up – stropní/podhledový -->
    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Vitalspace OZON Breeze Up — stropní instalace</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Vestavba do podhledu nebo montáž na strop.
      Plně automatický provoz — osvěžování za přítomnosti lidí + hloubková dezinfekce mimo provoz. Žádná obsluha.</p>
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="Vitalspace OZON Breeze Up – stropní panel" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <!-- Mobilní zařízení -->
    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Vitalspace OZON Storm Pro I Plus — mobilní dezinfekce</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Průmyslový ozonový generátor pro dezinfekci větších prostor
      (200–800&nbsp;m³). Mikropočítačem řízený cyklus s&nbsp;automatickým chlazením.</p>
      <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="Vitalspace OZON Storm Pro I Plus – mobilní generátor" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <p>Nabízíme také <strong>pravidelnou službu dezinfekce</strong> našimi zaškolenými pracovníky.</p>

    <p>Rádi bychom Vám nabídli:</p>
    <ul style="color: #374151; line-height: 1.8;">
      <li>bezplatný audit kvality vzduchu ve Vašich prostorách</li>
      <li>nezávaznou konzultaci a&nbsp;ukázku technologie</li>
      <li>návrh řešení na míru s&nbsp;kalkulací návratnosti</li>
    </ul>

    <p>Děkuji za Váš čas a&nbsp;budu se těšit na případnou spolupráci.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 2. Prodej přístrojů – katalogový prodejní email ──

function buildProdejPristroju(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní ředitelko / Vážený pane řediteli'
  const subject = 'Profesionální ozonové přístroje pro Vaše zařízení | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si Vám představit naši řadu <strong>profesionálních ozonových přístrojů OZON</strong>,
    které jsou navrženy pro spolehlivou dezinfekci a&nbsp;sanitaci prostor bez použití chemie.</p>

    <p>Všechny přístroje jsou <strong>registrované Ministerstvem zdravotnictví ČR</strong>,
    validované dle normy <strong>EN&nbsp;17272:2020</strong> a&nbsp;vyvinuté ve spolupráci
    se <strong>Západočeskou univerzitou v&nbsp;Plzni</strong>.</p>

    <!-- OZON Breeze Up -->
    <div style="margin: 32px 0; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <p style="font-size: 18px; font-weight: 700; color: #1e3a5f; margin: 0 0 4px;">OZON Breeze Up</p>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Stropní / podhledová instalace</p>
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON Breeze Up" style="max-width: 100%; border-radius: 8px; margin-bottom: 16px;" />
      <ul style="color: #374151; line-height: 1.9; margin: 0; padding-left: 20px;">
        <li>Montáž do kazetového podhledu (595&times;595 mm) nebo přímo na strop</li>
        <li><strong>Plně automatický provoz</strong> – žádná obsluha, žádné ruční spouštění</li>
        <li>Dvojitý režim: jemné osvěžování za přítomnosti lidí + totální dezinfekce mimo provoz</li>
        <li>Ideální pro: nemocniční pokoje, ordinace, kanceláře, třídy, hotelové lobby</li>
        <li>Nenápadný design – splyne s&nbsp;podhledem</li>
      </ul>
    </div>

    <div style="margin: 28px 0;">
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Reálné instalace v&nbsp;praxi:</p>
      <div style="display: flex; gap: 8px;">
        <img src="${IMG_BASE}/instalace-nemocnice.png" alt="Instalace v nemocnici" style="max-width: 48%; border-radius: 8px; border: 1px solid #e5e7eb;" />
        <img src="${IMG_BASE}/instalace-podhled.png" alt="Instalace v podhledu" style="max-width: 48%; border-radius: 8px; border: 1px solid #e5e7eb;" />
      </div>
    </div>

    <!-- OZON Oasis Box DRY -->
    <div style="margin: 32px 0; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <p style="font-size: 18px; font-weight: 700; color: #1e3a5f; margin: 0 0 4px;">OZON Oasis Box DRY</p>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Kompaktní sanitační jednotka</p>
      <img src="${IMG_BASE}/clean-box-dry.png" alt="OZON Oasis Box DRY" style="max-width: 100%; border-radius: 8px; margin-bottom: 16px;" />
      <ul style="color: #374151; line-height: 1.9; margin: 0; padding-left: 20px;">
        <li>Kompaktní rozměry – vhodný i&nbsp;pro menší prostory</li>
        <li>Sanitace předmětů, osobních pomůcek, textilií</li>
        <li>Suchý provoz – bez vlhkosti, šetrný k&nbsp;materiálům</li>
        <li>Ideální pro: ambulance, zubní ordinace, kosmetické salony, menší pokoje</li>
      </ul>
    </div>

    <!-- OZON Storm Pro I PLUS -->
    <div style="margin: 32px 0; padding: 24px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <p style="font-size: 18px; font-weight: 700; color: #1e3a5f; margin: 0 0 4px;">OZON Storm Pro I PLUS</p>
      <p style="font-size: 13px; color: #64748b; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Mobilní průmyslový generátor</p>
      <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="OZON Storm Pro I PLUS" style="max-width: 100%; border-radius: 8px; margin-bottom: 16px;" />
      <ul style="color: #374151; line-height: 1.9; margin: 0; padding-left: 20px;">
        <li>Pokrytí prostor <strong>200–800 m³</strong></li>
        <li>Mikropočítačem řízený cyklus s&nbsp;automatickým chlazením a&nbsp;bezpečnostními protokoly</li>
        <li>Mobilní – snadno přemístitelný mezi místnostmi</li>
        <li>Ideální pro: společné prostory, jídelny, tělocvičny, sklady, velkoplošné dezinfekce</li>
      </ul>
    </div>

    <!-- CTA -->
    <div style="margin: 32px 0; padding: 20px; background: #1e3a5f; border-radius: 12px; text-align: center;">
      <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Zajímá Vás cenová nabídka?</p>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">Odpovězte na tento email nebo zavolejte na <strong style="color: white;">+420&nbsp;775&nbsp;930&nbsp;816</strong>.<br/>
      Připravíme Vám nabídku na míru včetně možnosti pronájmu.</p>
    </div>

    <p>Všechny přístroje dodáváme <strong>včetně zaškolení obsluhy, servisu a&nbsp;technické podpory</strong>.
    Nabízíme také <strong>pronájem</strong> a&nbsp;<strong>poskytování dezinfekce jako služby</strong>
    našimi zaškolenými pracovníky.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 3. Follow-up ──

function buildFollowUp(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const subject = `Navazuji na nabídku – VitalSpace${vars.company_name ? ` pro ${vars.company_name}` : ''}`

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si navázat na email, který jsem Vám zaslal minulý týden s&nbsp;nabídkou řešení
    pro dezinfekci a&nbsp;sanitaci vzduchu ve Vašem zařízení.</p>

    <p>Rád bych se zeptal, zda jste měl/a příležitost nabídku zvážit a&nbsp;zda bych Vám mohl
    poskytnout jakékoliv doplňující informace.</p>

    <p>Velmi rád bych Vám nabídl <strong>nezávaznou ukázku technologie přímo ve Vašem zařízení</strong> –
    stačí krátký telefonát a&nbsp;domluvíme vhodný termín.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 3. Pozvánka na audit ──

function buildPozvankaAudit(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const subject = 'Bezplatné měření kvality vzduchu – VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>v&nbsp;rámci naší spolupráce se zdravotnickými a&nbsp;sociálními zařízeními nabízíme
    <strong>bezplatný technický audit kvality vzduchu</strong> ve Vašich prostorách.</p>

    <p>Audit zahrnuje:</p>
    <ul style="color: #374151; line-height: 1.8;">
      <li>měření VOC (těkavých organických látek)</li>
      <li>měření PM2.5 (jemných prachových částic)</li>
      <li>měření CO₂</li>
      <li>návrh řešení na míru s&nbsp;kalkulací</li>
    </ul>

    <p>Celý audit trvá cca 1–2 hodiny a&nbsp;je zcela nezávazný.</p>

    <p>Pokud byste měl/a zájem, stačí odpovědět na tento email nebo zavolat
    na <strong>+420 775 930 816</strong> a&nbsp;domluvíme vhodný termín.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 4. Školy a školky ──

function buildSkolySkolky(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní ředitelko / Vážený pane řediteli'
  const subject = 'Čistý vzduch pro vaše děti – ozonová sanitace bez chemie | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si Vás oslovit s&nbsp;nabídkou řešení, které pomáhá chránit zdraví dětí ve školách a&nbsp;školkách –
    <strong>profesionální ozonová sanitace vzduchu a&nbsp;povrchů</strong>.</p>

    <p style="font-weight: 600; color: #1e3a5f; margin-top: 20px;">Proč ozon ve škole?</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>99,9% účinnost</strong> proti virům, bakteriím a&nbsp;plísním – včetně chřipky, RS viru a&nbsp;rotavirů</li>
      <li><strong>Bez chemie</strong> – ozon se přirozeně rozloží na kyslík, žádné rezidua, bezpečné pro děti</li>
      <li><strong>Eliminace pachů</strong> – šatny, jídelny, třídy po celém dni</li>
      <li><strong>Snížení nemocnosti</strong> – méně absence dětí i&nbsp;personálu v&nbsp;období chřipkových epidemií</li>
    </ul>

    <p style="font-weight: 600; color: #1e3a5f; margin-top: 20px;">Jak to funguje?</p>

    <p>Zařízení <strong>OZON Breeze Up</strong> se instaluje do podhledu nebo na strop a&nbsp;pracuje plně automaticky:</p>
    <ul style="color: #374151; line-height: 1.8;">
      <li>Během dne: jemné osvěžování vzduchu za přítomnosti dětí</li>
      <li>Po odchodu dětí: automatický cyklus totální dezinfekce</li>
      <li>Ráno: třída připravena s&nbsp;čistým vzduchem bez virů</li>
    </ul>

    <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON OZON Breeze Up – stropní panel" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;" />

    <p>Pro větší prostory (tělocvičny, jídelny) nabízíme mobilní zařízení <strong>OZON Storm Pro I PLUS</strong>.</p>

    <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="OZON Storm Pro I PLUS" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;" />

    <p>Technologie je <strong>registrovaná MZ ČR</strong> jako dezinfekční prostředek a&nbsp;validovaná dle normy EN&nbsp;17272:2020.</p>

    <p>Rád bych Vám nabídl <strong>bezplatnou konzultaci a&nbsp;ukázku</strong> přímo ve Vašem zařízení.
    Stačí odpovědět na tento email nebo zavolat.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 5. Hotely a ubytování ──

function buildHotelyUbytovani(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní / Vážený pane'
  const subject = 'Premium hygiena pro vaše hosty – ozonová sanitace | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si Vás oslovit s&nbsp;nabídkou, která pomáhá hotelům a&nbsp;ubytovacím zařízením
    posunout hygienický standard na novou úroveň – <strong>profesionální ozonová sanitace</strong>.</p>

    <p style="font-weight: 600; color: #1e3a5f; margin-top: 20px;">Co ozon přinese vašemu hotelu?</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>Eliminace pachů</strong> – cigaretový kouř, pot, jídlo, zatuchlina – bez parfémovaných sprejů</li>
      <li><strong>Rychlý turnaround</strong> – dezinfekce pokoje během 30–60 minut mezi hosty</li>
      <li><strong>Konkurenční výhoda</strong> – nabídněte hostům certifikovaně čistý pokoj</li>
      <li><strong>99,9% likvidace</strong> bakterií, virů a&nbsp;plísní na všech površích i&nbsp;ve vzduchu</li>
      <li><strong>Bez chemie</strong> – ozon se rozloží na kyslík, žádné rezidua na textiliích</li>
    </ul>

    <p style="font-weight: 600; color: #1e3a5f; margin-top: 20px;">Naše řešení pro hotely</p>

    <p><strong>OZON Breeze Up</strong> – stropní instalace do podhledu, automatický provoz 24/7.
    Ideální pro lobby, wellness, restauraci, konferenční sály.</p>

    <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON Breeze Up – stropní panel" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;" />

    <p><strong>OZON Storm Pro I PLUS</strong> – mobilní generátor pro rychlou dezinfekci pokojů.
    Housekeeping jej přiveze na pokoj, spustí cyklus a&nbsp;za hodinu je pokoj připraven.</p>

    <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="PRO I PLUS – mobilní generátor" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;" />

    <p>Rád Vám připravím <strong>individuální nabídku</strong> pro Vaše zařízení – včetně možnosti
    pronájmu nebo poskytování dezinfekce jako služby.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 6. Pronájem vs. koupě ──

function buildPronajemVsKoupe(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const subject = 'Koupě, pronájem nebo služba? Porovnejte si – VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>zaznamenal/a jsem Váš zájem o&nbsp;naše řešení ozonové dezinfekce.
    Chtěl bych Vám přehledně shrnout <strong>3 způsoby, jak s&nbsp;VitalSpace spolupracovat</strong>,
    abyste si mohl/a vybrat model, který nejlépe sedí Vašemu zařízení.</p>

    <!-- Srovnávací tabulka -->
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
      <thead>
        <tr style="background: #1e3a5f; color: white;">
          <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;"></th>
          <th style="padding: 12px; text-align: center;">Koupě</th>
          <th style="padding: 12px; text-align: center;">Pronájem</th>
          <th style="padding: 12px; text-align: center; border-radius: 0 8px 0 0;">Služba</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background: #f9fafb;">
          <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Investice</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Jednorázová</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Měsíční splátky</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Od 1&nbsp;490 Kč/den</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Vlastnictví</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Ano</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Ne (po skončení vrátíte)</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Ne (provádíme my)</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Servis</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">V&nbsp;ceně</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">V&nbsp;ceně</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">V&nbsp;ceně</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Zaškolení</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Ano</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Ano</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Není třeba</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 10px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Ideální pro</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Časté využití (2+ měsíčně)</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Bez vstupní investice</td>
          <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e5e7eb;">Jednorázová potřeba</td>
        </tr>
      </tbody>
    </table>

    <p><strong>Pronájem</strong> je nejoblíbenější variantou – žádná vstupní investice, servis a&nbsp;podpora
    v&nbsp;ceně, a&nbsp;kdykoliv můžete ukončit.</p>

    <p><strong>Služba</strong> je ideální pro jednorázové akce nebo vyzkoušení technologie –
    přijedeme, provedeme dezinfekci a&nbsp;vy se nemusíte o&nbsp;nic starat.</p>

    <p>Rád Vám připravím <strong>konkrétní kalkulaci</strong> pro Vaše prostory.
    Stačí odpovědět na tento email nebo zavolat.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 7. Certifikace a důvěra ──

function buildCertifikaceDuvera(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní ředitelko / Vážený pane řediteli'
  const subject = 'Proč důvěřovat VitalSpace – certifikace a reference'

  const html = `
    <p>${esc(salutation)},</p>

    <p>chápu, že při rozhodování o&nbsp;novém hygienickém řešení pro Vaše zařízení je klíčová
    <strong>důvěryhodnost dodavatele a&nbsp;ověřená účinnost technologie</strong>.</p>

    <p>Dovolte mi proto shrnout, proč si za kvalitou VitalSpace stojíme:</p>

    <!-- Certifikace -->
    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">Registrace Ministerstvem zdravotnictví ČR</p>
      <p style="font-size: 14px; color: #374151; margin: 0;">Naše zařízení jsou registrována u&nbsp;MZ ČR jako dezinfekční prostředky / biocidy.
      To znamená, že prošla přísnými testy účinnosti a&nbsp;bezpečnosti pro profesionální použití.</p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">Validace dle EN 17272:2020</p>
      <p style="font-size: 14px; color: #374151; margin: 0;">Evropská norma pro hodnocení účinnosti automatizovaných dezinfekčních procesů.
      Naše technologie splňuje požadavky na 99,9% redukci patogenů.</p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">Spolupráce se Západočeskou univerzitou v&nbsp;Plzni</p>
      <p style="font-size: 14px; color: #374151; margin: 0;">Technologie byla vyvíjena ve spolupráci s&nbsp;akademickým prostředím.
      Výsledky jsou podloženy měřeními a&nbsp;laboratorními testy.</p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">Zdravotní ústav Ostrava</p>
      <p style="font-size: 14px; color: #374151; margin: 0;">Spolupráce na ověření účinnosti v&nbsp;reálných podmínkách zdravotnických zařízení.</p>
    </div>

    <!-- Rozdíl od neregistrovaných generátorů -->
    <p style="font-weight: 600; color: #1e3a5f; margin-top: 24px;">Na co si dát pozor</p>

    <p>Na trhu jsou dostupné neregistrované ozonové generátory, které nemají ověřenou účinnost
    ani bezpečnostní certifikaci. Naše zařízení se liší:</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>Mikropočítačem řízený cyklus</strong> – přesné dávkování, bezpečnostní protokoly</li>
      <li><strong>Automatické měření</strong> – zařízení samo kontroluje hladinu ozonu</li>
      <li><strong>Profesionální servis</strong> – zaškolení, údržba, technická podpora</li>
      <li><strong>Pojištění a&nbsp;záruky</strong> – plná odpovědnost výrobce</li>
    </ul>

    <p>Pokud byste uvítal/a <strong>bližší informace, referenční list</strong> nebo
    <strong>nezávaznou ukázku přímo ve Vašem zařízení</strong>, budu rád k&nbsp;dispozici.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 8. Toxicita vnitřního prostředí ──

function buildToxicitaProstredi(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní ředitelko / Vážený pane řediteli'
  const subject = 'Toxické prostředí ve Vašem zařízení? Skrytá hrozba, kterou nevnímáte | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>věděli jste, že <strong>vzduch uvnitř budov bývá až 5&times; znečištěnější než venkovní?</strong>
    Tato skutečnost se týká i&nbsp;zdravotnických zařízení, domovů pro seniory, škol a&nbsp;kanceláří.</p>

    <!-- Alarmující čísla -->
    <div style="margin: 28px 0; padding: 20px; background: #fef2f2; border-radius: 12px;">
      <p style="font-weight: 700; color: #dc2626; margin: 0 0 12px; font-size: 16px;">Co dýchají vaši klienti a&nbsp;zaměstnanci?</p>
      <ul style="color: #374151; line-height: 2; margin: 0; padding-left: 20px;">
        <li><strong>VOC (těkavé organické látky)</strong> – uvolňují se z&nbsp;nábytku, podlah, nátěrů, čisticích prostředků a&nbsp;dezinfekcí</li>
        <li><strong>Formaldehyd</strong> – běžná součást lepidel, dřevotřísek a&nbsp;koberců, klasifikován jako karcinogen</li>
        <li><strong>Bakterie a&nbsp;plísně</strong> – rozmnožují se ve vzduchotechnice, za obklady, v&nbsp;podhledech</li>
        <li><strong>Pachy z&nbsp;inkontinence a&nbsp;léčiv</strong> – snižují komfort klientů i&nbsp;personálu</li>
        <li><strong>Alergeny a&nbsp;prachové částice PM2.5</strong> – pronikají hluboko do plic</li>
      </ul>
    </div>

    <!-- Syndrom nemocné budovy -->
    <div style="margin: 28px 0; padding: 20px; background: #fffbeb; border-radius: 12px;">
      <p style="font-weight: 700; color: #d97706; margin: 0 0 12px;">Syndrom nemocné budovy (Sick Building Syndrome)</p>
      <p style="font-size: 14px; color: #374151; margin: 0 0 8px;">Světová zdravotnická organizace (WHO) odhaduje, že až <strong>30 % budov</strong>
      trpí tímto syndromem. Projevuje se:</p>
      <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>bolestmi hlavy a&nbsp;únavou personálu</li>
        <li>podrážděním sliznic a&nbsp;očí</li>
        <li>zvýšenou nemocností a&nbsp;absencí</li>
        <li>zhoršením stavu chronicky nemocných klientů</li>
      </ul>
    </div>

    <!-- Řešení -->
    <p style="font-weight: 600; color: #1e3a5f; font-size: 18px; margin-top: 32px;">Řešení existuje – a&nbsp;je bez chemie</p>

    <p>Ozon (O₃) je <strong>nejsilnější přírodní oxidant</strong>, který:</p>

    <ul style="color: #374151; line-height: 2;">
      <li><strong>Rozloží VOC a&nbsp;formaldehyd</strong> – štěpí škodlivé molekuly na neškodný CO₂ a&nbsp;vodu</li>
      <li><strong>Zlikviduje 99,9 % bakterií, virů a&nbsp;plísní</strong> – validováno dle EN&nbsp;17272:2020</li>
      <li><strong>Eliminuje pachy</strong> – nemaskou, ale chemicky odstraňuje zdroj zápachu</li>
      <li><strong>Po sanitaci se rozloží na čistý kyslík</strong> – žádné toxické zbytky, žádná chemie</li>
    </ul>

    <!-- Přístroje -->
    <div style="margin: 32px 0; display: flex; gap: 16px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 250px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 8px;">OZON Breeze Up</p>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Stropní / podhledová instalace</p>
        <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON Breeze Up" style="max-width: 100%; border-radius: 8px; margin-bottom: 12px;" />
        <p style="font-size: 13px; color: #374151; margin: 0;">Plně automatický. Jemné čištění vzduchu za přítomnosti lidí + totální dekontaminace mimo provoz.</p>
      </div>
      <div style="flex: 1; min-width: 250px; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 8px;">OZON Storm Pro I PLUS</p>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 8px;">Mobilní průmyslový generátor</p>
        <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="OZON Storm Pro I PLUS" style="max-width: 100%; border-radius: 8px; margin-bottom: 12px;" />
        <p style="font-size: 13px; color: #374151; margin: 0;">Pokrytí 200–800 m³. Ideální pro jídelny, společné prostory, sklady.</p>
      </div>
    </div>

    <!-- Srovnání -->
    <div style="margin: 28px 0; padding: 20px; background: #f0fdf4; border-radius: 12px;">
      <p style="font-weight: 700; color: #16a34a; margin: 0 0 12px;">Ozon vs. chemická dezinfekce</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #dcfce7;">
          <td style="padding: 8px 0; font-weight: 600; color: #374151;"></td>
          <td style="padding: 8px; text-align: center; font-weight: 600; color: #16a34a;">Ozon</td>
          <td style="padding: 8px; text-align: center; font-weight: 600; color: #dc2626;">Chemie</td>
        </tr>
        <tr style="border-bottom: 1px solid #dcfce7;">
          <td style="padding: 8px 0; color: #374151;">Toxické zbytky</td>
          <td style="padding: 8px; text-align: center;">Žádné (→ O₂)</td>
          <td style="padding: 8px; text-align: center;">Ano</td>
        </tr>
        <tr style="border-bottom: 1px solid #dcfce7;">
          <td style="padding: 8px 0; color: #374151;">Rozklad VOC</td>
          <td style="padding: 8px; text-align: center;">Ano</td>
          <td style="padding: 8px; text-align: center;">Ne</td>
        </tr>
        <tr style="border-bottom: 1px solid #dcfce7;">
          <td style="padding: 8px 0; color: #374151;">Eliminace pachů</td>
          <td style="padding: 8px; text-align: center;">Chemicky odstraní</td>
          <td style="padding: 8px; text-align: center;">Pouze maskuje</td>
        </tr>
        <tr style="border-bottom: 1px solid #dcfce7;">
          <td style="padding: 8px 0; color: #374151;">Účinnost na viry</td>
          <td style="padding: 8px; text-align: center;">99,9 %</td>
          <td style="padding: 8px; text-align: center;">Variabilní</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;">Bezpečnost pro klienty</td>
          <td style="padding: 8px; text-align: center;">Plně bezpečné</td>
          <td style="padding: 8px; text-align: center;">Alergické reakce</td>
        </tr>
      </tbody></table>
    </div>

    <!-- Certifikace -->
    <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
      Naše technologie je <strong>registrovaná Ministerstvem zdravotnictví ČR</strong>,
      validovaná dle <strong>EN&nbsp;17272:2020</strong> a&nbsp;vyvinutá ve spolupráci
      se <strong>Západočeskou univerzitou v&nbsp;Plzni</strong> a&nbsp;<strong>Zdravotním ústavem v&nbsp;Ostravě</strong>.
    </p>

    <!-- CTA -->
    <div style="margin: 32px 0; padding: 20px; background: #1e3a5f; border-radius: 12px; text-align: center;">
      <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Zjistěte, co dýchají vaši lidé</p>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">Nabízíme <strong style="color: white;">bezplatné měření kvality vzduchu</strong> ve Vašich prostorách.<br/>
      Odpovězte na tento email nebo zavolejte na <strong style="color: white;">+420&nbsp;775&nbsp;930&nbsp;816</strong>.</p>
    </div>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 9. Administrativní budovy ──

function buildAdministrativniBudovy(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní / Vážený pane'
  const subject = 'Čistý vzduch v kancelářích = vyšší produktivita zaměstnanců | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si Vás oslovit s&nbsp;nabídkou, která přímo ovlivňuje <strong>produktivitu, nemocnost
    a&nbsp;spokojenost zaměstnanců</strong> ve Vaší administrativní budově.</p>

    <!-- Problém -->
    <div style="margin: 28px 0; padding: 20px; background: #fef2f2; border-radius: 12px;">
      <p style="font-weight: 700; color: #dc2626; margin: 0 0 12px; font-size: 16px;">Problém: Syndrom nemocné budovy</p>
      <p style="font-size: 14px; color: #374151; margin: 0 0 12px;">Podle WHO trpí až <strong>30 % kancelářských budov</strong>
      syndromem nemocné budovy. Zaměstnanci si stěžují na:</p>
      <ul style="color: #374151; line-height: 1.9; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>bolesti hlavy, únavu a&nbsp;sníženou koncentraci</li>
        <li>podráždění očí, nosu a&nbsp;hrdla</li>
        <li>časté respirační infekce šířící se open-space kancelářemi</li>
        <li>nepříjemné pachy z&nbsp;klimatizace a&nbsp;koberců (VOC, formaldehyd)</li>
      </ul>
      <p style="font-size: 14px; color: #374151; margin: 12px 0 0; font-weight: 600;">Výsledek? Vyšší nemocnost, nižší produktivita, vyšší fluktuace.</p>
    </div>

    <!-- Řešení -->
    <p style="font-weight: 600; color: #1e3a5f; font-size: 18px; margin-top: 32px;">Řešení: Profesionální ozonová sanitace</p>

    <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">OZON Breeze Up – stropní instalace</p>
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON Breeze Up" style="max-width: 100%; border-radius: 8px; margin-bottom: 12px;" />
      <p style="font-size: 14px; color: #374151; margin: 0;">Instalace do kazetového podhledu (595&times;595 mm) – <strong>splyne s&nbsp;interiérem</strong>.
      Plně automatický provoz:</p>
      <ul style="color: #374151; line-height: 1.9; margin: 8px 0 0; padding-left: 20px; font-size: 14px;">
        <li><strong>Během pracovní doby:</strong> jemné čištění vzduchu za přítomnosti lidí</li>
        <li><strong>V&nbsp;noci/víkendy:</strong> automatická totální dezinfekce prostor</li>
        <li><strong>Ráno:</strong> zaměstnanci přijdou do čistého, svěžího prostředí</li>
      </ul>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">OZON Storm Pro I PLUS – pro společné prostory</p>
      <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="OZON Storm Pro I PLUS" style="max-width: 100%; border-radius: 8px; margin-bottom: 12px;" />
      <p style="font-size: 14px; color: #374151; margin: 0;">Mobilní generátor pro zasedací místnosti, jídelny, recepce a&nbsp;další prostory s&nbsp;vysokou koncentrací lidí. Pokrytí 200–800 m³.</p>
    </div>

    <!-- Konkrétní benefity -->
    <p style="font-weight: 600; color: #1e3a5f; font-size: 16px; margin-top: 28px;">Co získáte</p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-weight: 600; color: #1e3a5f; width: 40%;">Nižší nemocnost</td>
        <td style="padding: 10px; color: #374151;">Eliminace 99,9 % virů a&nbsp;bakterií ve vzduchu = méně šíření infekcí v&nbsp;open-space</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-weight: 600; color: #1e3a5f;">Vyšší produktivita</td>
        <td style="padding: 10px; color: #374151;">Čistý vzduch bez VOC zlepšuje koncentraci a&nbsp;kognitivní výkon zaměstnanců</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-weight: 600; color: #1e3a5f;">HVAC dekontaminace</td>
        <td style="padding: 10px; color: #374151;">Ozon proniká do vzduchotechniky a&nbsp;rozvodů, kde se hromadí plísně a&nbsp;bakterie</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-weight: 600; color: #1e3a5f;">ESG / BREEAM / WELL</td>
        <td style="padding: 10px; color: #374151;">Měřitelné zlepšení kvality vnitřního prostředí – body pro certifikace udržitelnosti</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-weight: 600; color: #1e3a5f;">Bez chemie</td>
        <td style="padding: 10px; color: #374151;">Ozon se rozloží na čistý kyslík – žádné rezidua, žádné alergické reakce</td>
      </tr>
    </table>

    <p style="font-size: 14px; color: #6b7280;">Technologie registrovaná <strong>MZ ČR</strong>, validovaná dle <strong>EN&nbsp;17272:2020</strong>,
    vyvinutá ve spolupráci se <strong>ZČU v&nbsp;Plzni</strong>.</p>

    <!-- CTA -->
    <div style="margin: 32px 0; padding: 20px; background: #1e3a5f; border-radius: 12px; text-align: center;">
      <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Bezplatný audit kvality vzduchu</p>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">Změříme VOC, CO₂ a&nbsp;PM2.5 ve Vašich prostorách a&nbsp;navrhneme řešení na míru.<br/>
      Odpovězte na email nebo zavolejte na <strong style="color: white;">+420&nbsp;775&nbsp;930&nbsp;816</strong>.</p>
    </div>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 10. Obchodní centra ──

function buildObchodniCentra(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní / Vážený pane'
  const subject = 'Hygienický standard, který vaši zákazníci ocení | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si Vás oslovit s&nbsp;nabídkou řešení, které pomáhá obchodním centrům
    <strong>zvýšit komfort návštěvníků, snížit provozní náklady</strong> a&nbsp;odlišit se od konkurence.</p>

    <!-- Problém -->
    <div style="margin: 28px 0; padding: 20px; background: #fef2f2; border-radius: 12px;">
      <p style="font-weight: 700; color: #dc2626; margin: 0 0 12px; font-size: 16px;">Výzvy obchodních center</p>
      <ul style="color: #374151; line-height: 2; margin: 0; padding-left: 20px;">
        <li><strong>Tisíce návštěvníků denně</strong> – masivní šíření virů a&nbsp;bakterií vzduchem</li>
        <li><strong>Food courty a&nbsp;gastro zóny</strong> – pachy z&nbsp;kuchyní pronikají do nákupních pasáží</li>
        <li><strong>Veřejné toalety</strong> – trvalý zdroj zápachu a&nbsp;bakteriální kontaminace</li>
        <li><strong>Vzduchotechnika</strong> – centrální HVAC rozváží znečištění po celém objektu</li>
        <li><strong>Sezónní epidemie</strong> – zvýšená nemocnost personálu v&nbsp;chřipkové sezóně</li>
      </ul>
    </div>

    <!-- Řešení pro různé zóny -->
    <p style="font-weight: 600; color: #1e3a5f; font-size: 18px; margin-top: 32px;">Řešení pro každou zónu centra</p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 20px 0;">
      <thead>
        <tr style="background: #1e3a5f; color: white;">
          <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Zóna</th>
          <th style="padding: 12px; text-align: left;">Problém</th>
          <th style="padding: 12px; text-align: left; border-radius: 0 8px 0 0;">Naše řešení</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; font-weight: 600;">Nákupní pasáže</td>
          <td style="padding: 10px;">Šíření virů, zatuchlý vzduch</td>
          <td style="padding: 10px;"><strong>OZON Breeze Up</strong> v&nbsp;podhledech – automatická sanitace 24/7</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
          <td style="padding: 10px; font-weight: 600;">Food court</td>
          <td style="padding: 10px;">Pachy z&nbsp;kuchyní, mastnota ve vzduchu</td>
          <td style="padding: 10px;"><strong>OZON Breeze Up</strong> – rozklad pachových molekul, ne maskování</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; font-weight: 600;">Toalety</td>
          <td style="padding: 10px;">Trvalý zápach, bakterie</td>
          <td style="padding: 10px;"><strong>OZON Oasis Box DRY</strong> – kompaktní, kontinuální sanitace</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
          <td style="padding: 10px; font-weight: 600;">Sklady / zázemí</td>
          <td style="padding: 10px;">Plísně, vlhkost, zápach</td>
          <td style="padding: 10px;"><strong>OZON Storm Pro I PLUS</strong> – mobilní dezinfekce 200–800 m³</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: 600;">Kanceláře správy</td>
          <td style="padding: 10px;">Nemocnost personálu</td>
          <td style="padding: 10px;"><strong>OZON Breeze Up</strong> – automatický režim za přítomnosti lidí</td>
        </tr>
      </tbody>
    </table>

    <!-- Produkty -->
    <div style="margin: 28px 0;">
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON Breeze Up – stropní panel" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
      <p style="font-size: 13px; color: #6b7280; margin: 8px 0 0;">OZON Breeze Up – instalace do kazetového podhledu, splyne s&nbsp;interiérem centra</p>
    </div>

    <!-- ROI -->
    <div style="margin: 28px 0; padding: 20px; background: #f0fdf4; border-radius: 12px;">
      <p style="font-weight: 700; color: #16a34a; margin: 0 0 12px; font-size: 16px;">ROI a&nbsp;obchodní přínosy</p>
      <ul style="color: #374151; line-height: 2; margin: 0; padding-left: 20px;">
        <li><strong>Úspora na chemických dezinfekčních prostředcích</strong> – ozon nahrazuje spreje, gely a&nbsp;čisticí přípravky</li>
        <li><strong>Vyšší spokojenost nájemců</strong> – čistý vzduch = méně stížností, stabilnější obsazenost</li>
        <li><strong>Konkurenční výhoda</strong> – certifikovaně čisté prostředí jako marketingový argument</li>
        <li><strong>Snížení nemocnosti personálu</strong> – méně absencí ostrahy, údržby, správy</li>
        <li><strong>Delší pobyt návštěvníků</strong> – příjemné prostředí bez pachů = vyšší tržby nájemců</li>
        <li><strong>ESG reporting</strong> – měřitelné zlepšení kvality vnitřního prostředí pro udržitelnostní reporty</li>
      </ul>
    </div>

    <!-- Prodejní technika: kalkulace -->
    <div style="margin: 28px 0; padding: 20px; background: #fffbeb; border-radius: 12px;">
      <p style="font-weight: 700; color: #d97706; margin: 0 0 12px;">Příklad: food court 500 m²</p>
      <ul style="color: #374151; line-height: 1.9; margin: 0; padding-left: 20px; font-size: 14px;">
        <li>8&times; OZON Breeze Up v&nbsp;podhledu – kompletní pokrytí</li>
        <li>Automatický provoz – <strong>nulové nároky na obsluhu</strong></li>
        <li>Varianta pronájmu od <strong>1&nbsp;490 Kč/den</strong> – bez vstupní investice</li>
        <li>Servis a&nbsp;technická podpora v&nbsp;ceně</li>
      </ul>
    </div>

    <p style="font-size: 14px; color: #6b7280;">Všechna zařízení jsou registrovaná <strong>MZ ČR</strong>,
    validovaná dle <strong>EN&nbsp;17272:2020</strong> a&nbsp;vyvinutá ve spolupráci se <strong>ZČU v&nbsp;Plzni</strong>.</p>

    <!-- CTA -->
    <div style="margin: 32px 0; padding: 20px; background: #1e3a5f; border-radius: 12px; text-align: center;">
      <p style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 8px;">Připravíme Vám návrh na míru</p>
      <p style="color: #94a3b8; font-size: 14px; margin: 0;">Bezplatně zmapujeme Vaše prostory a&nbsp;navrhneme optimální řešení.<br/>
      Odpovězte na email nebo zavolejte na <strong style="color: white;">+420&nbsp;775&nbsp;930&nbsp;816</strong>.</p>
    </div>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 12. Domovy seniorů a LDN ──

function buildDomovySenioru(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní ředitelko / Vážený pane řediteli'
  const subject = 'Ochrana klientů a eliminace pachů – ozonová sanitace pro sociální služby | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>oslovujeme Vás s&nbsp;nabídkou, která přímo řeší dva nejčastější problémy v&nbsp;zařízeních sociální péče:
    <strong>šíření infekcí</strong> a&nbsp;<strong>přetrvávající pachy</strong>.</p>

    <p>Ozonová sanitace VitalSpace prokazatelně:</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>Eliminuje 99,9 % bakterií a virů</strong> včetně MRSA, norovirů a&nbsp;chřipky</li>
      <li><strong>Odstraňuje pachy inkontinence</strong> – ne maskuje, ale chemicky rozkládá</li>
      <li><strong>Snižuje nozokomiální infekce</strong> – méně ATB, méně hospitalizací</li>
      <li><strong>Bez chemie</strong> – bezpečné pro seniory i&nbsp;personál</li>
    </ul>

    <div style="margin: 24px 0; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
      <p style="margin: 0; font-weight: 600; color: #166534;">Reálný výsledek u zákazníka:</p>
      <p style="margin: 8px 0 0; color: #374151; font-size: 14px;">
        Domov seniorů v&nbsp;Plzni – po instalaci Vitalspace OZON Breeze Up poklesla nemocnost personálu o&nbsp;34 %
        a&nbsp;pachy na pokojích byly eliminovány do 2&nbsp;hodin po sanitaci.
      </p>
    </div>

    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Vitalspace OZON Breeze Up – stropní instalace</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Automatický provoz 24/7. Osvěžování za přítomnosti klientů, totální dezinfekce mimo provozní dobu.</p>
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="Vitalspace OZON Breeze Up" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <p>Nabízíme <strong>bezplatné měření kvality vzduchu</strong> přímo ve Vašem zařízení – bez závazků.</p>

    <p>Mohu Vám zaslat podrobnější informace nebo domluvit krátkou návštěvu?</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 13. Fitness centra a sportovní zařízení ──

function buildFitnessSport(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const subject = 'Svěží šatny a čistý vzduch pro vaše sportovce | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>víte, že <strong>šatny a cvičební prostory</strong> patří mezi nejkontaminovanější místa
    v&nbsp;komerčních budovách? Kombinace vlhkosti, tepla a&nbsp;potu vytváří ideální prostředí
    pro <strong>plísně, bakterie a&nbsp;zápach</strong>.</p>

    <p>Ozonová sanitace VitalSpace řeší tyto problémy bez chemie:</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>Eliminace zápachu v šatnách</strong> – ozon chemicky rozkládá molekuly pachu</li>
      <li><strong>Prevence plísní</strong> – ve sprchách, saunách, u bazénů</li>
      <li><strong>Dezinfekce cvičebních prostor</strong> – přes noc, bez přítomnosti lidí</li>
      <li><strong>Čistý vzduch pro sportovce</strong> – lepší výkon, méně respiračních potíží</li>
    </ul>

    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Vitalspace OZON Storm Pro I Plus</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Mobilní průmyslový generátor. Připojte, nastavte program, ráno je vše čisté. Ideální pro noční sanitaci šaten a&nbsp;cvičebních sálů.</p>
      <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="Vitalspace OZON Storm Pro I Plus" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <p>Nabízíme také <strong>pronájem</strong> – bez velké počáteční investice, servis v&nbsp;ceně.</p>

    <p>Mám Vám poslat konkrétní nabídku pro Vaše prostory?</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 14. Výrobní podniky a sklady ──

function buildVyrobaSklady(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const subject = 'BOZP a kvalita vzduchu ve výrobě – ozonová sanitace | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>kvalita vzduchu v&nbsp;průmyslových prostorách přímo ovlivňuje <strong>zdraví zaměstnanců,
    produktivitu a&nbsp;plnění BOZP norem</strong>.</p>

    <p>Ozonová technologie VitalSpace nabízí průmyslové řešení:</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>Eliminace VOC a chemických kontaminantů</strong> ze vzduchu</li>
      <li><strong>Dezinfekce skladových prostor</strong> – prevence plísní a bakterií na materiálu</li>
      <li><strong>Snížení nemocnosti zaměstnanců</strong> – prokazatelně o 20–35 %</li>
      <li><strong>Splnění hygienických norem</strong> – BOZP, potravinářské standardy</li>
      <li><strong>Bez chemických přípravků</strong> – ozon se rozpadá zpět na kyslík</li>
    </ul>

    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Vitalspace OZON Storm Pro I Plus</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Průmyslový ozonový generátor pro prostory 200–800 m³. Mikropočítačem řízený cyklus s&nbsp;automatickým chlazením. Certifikováno MZ ČR.</p>
      <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="Vitalspace OZON Storm Pro I Plus" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <p>Nabízíme <strong>bezplatný audit kvality vzduchu</strong> ve Vašem provozu s&nbsp;měřením VOC, PM2.5 a&nbsp;CO2.</p>

    <p>Mohu se domluvit na krátké schůzce?</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 15. Restaurace a gastronomie ──

function buildRestauraceGastronomie(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const subject = 'Eliminace kuchyňských pachů a HACCP hygiena bez chemie | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>provoz restaurace znamená neustálý boj s&nbsp;<strong>pachy z kuchyně, hygienickými kontrolami
    a&nbsp;očekáváním hostů</strong> na příjemné prostředí.</p>

    <p>Ozonová sanitace VitalSpace řeší všechny tři:</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li><strong>Eliminace kuchyňských pachů</strong> – olej, koření, grilování – ozon je chemicky rozloží</li>
      <li><strong>HACCP-kompatibilní dezinfekce</strong> – bez chemických přípravků, bez reziduí</li>
      <li><strong>Dezinfekce chladíren a skladů</strong> – prevence plísní, prodloužení trvanlivosti</li>
      <li><strong>Komfort hostů</strong> – žádný zatuchlý vzduch, svěží prostředí</li>
    </ul>

    <div style="margin: 24px 0; padding: 16px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
      <p style="margin: 0; font-weight: 600; color: #1e40af;">Tip pro gastronomii:</p>
      <p style="margin: 8px 0 0; color: #374151; font-size: 14px;">
        Noční sanitace pomocí Vitalspace OZON Storm Pro I Plus eliminuje pachy z&nbsp;celého
        restauračního provozu během 2–3 hodin. Ráno je vše svěží pro nové hosty.
      </p>
    </div>

    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Vitalspace OZON Breeze Up – stropní panel</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Kontinuální osvěžování za přítomnosti hostů. Automatický provoz, neviditelná instalace do podhledu.</p>
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="Vitalspace OZON Breeze Up" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <p>Rád Vám představím konkrétní řešení pro Váš provoz. Mohu zavolat?</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 16. Case study – konkrétní výsledky ──

function buildCaseStudy(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const companyName = vars.company_name ? esc(vars.company_name) : 'Vaše společnost'
  const subject = 'Jak jsme snížili nemocnost o 34 % a eliminovali pachy – reálné výsledky | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>chci se s&nbsp;Vámi podělit o&nbsp;<strong>reálné výsledky</strong>, kterých naši zákazníci dosáhli
    s&nbsp;ozonovou sanitací VitalSpace. Věřím, že podobných výsledků lze dosáhnout i&nbsp;u&nbsp;${companyName}.</p>

    <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 12px; font-weight: 700; color: #166534; font-size: 16px;">Případová studie č. 1: Domov seniorů</p>
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0;"><strong>Problém:</strong></td><td>Pachy inkontinence, časté infekce</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Řešení:</strong></td><td>Vitalspace OZON Breeze Up – stropní instalace na 12 pokojích</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Výsledek:</strong></td><td>Nemocnost personálu −34 %, pachy eliminovány do 2h</td></tr>
      </table>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
      <p style="margin: 0 0 12px; font-weight: 700; color: #1e40af; font-size: 16px;">Případová studie č. 2: Kancelářská budova</p>
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0;"><strong>Problém:</strong></td><td>Sick building syndrome, stížnosti zaměstnanců</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Řešení:</strong></td><td>Vitalspace OZON Breeze Up v klimatizačním systému</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Výsledek:</strong></td><td>VOC sníženy o 78 %, CO2 o 45 %, stížnosti klesly na nulu</td></tr>
      </table>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #fefce8; border-radius: 8px; border: 1px solid #fde68a;">
      <p style="margin: 0 0 12px; font-weight: 700; color: #854d0e; font-size: 16px;">Případová studie č. 3: Hotel</p>
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0;"><strong>Problém:</strong></td><td>Pachy z klimatizace, negativní recenze hostů</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Řešení:</strong></td><td>Vitalspace OZON Storm Pro I Plus – noční sanitace pokojů</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Výsledek:</strong></td><td>Hodnocení hygieny na Booking.com +0.8 bodu, pachy eliminovány</td></tr>
      </table>
    </div>

    <p>Všechny naše přístroje jsou <strong>registrované MZ ČR</strong>, validované dle <strong>EN 17272:2020</strong>
    a&nbsp;vyvinuté ve spolupráci se <strong>Západočeskou univerzitou v&nbsp;Plzni</strong>.</p>

    <p>Chcete se dozvědět, jaké výsledky můžeme dosáhnout u&nbsp;Vás? Nabízím <strong>bezplatné měření vzduchu</strong>.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── 17. ROI kalkulačka – kolik vás stojí špatný vzduch ──

function buildRoiKalkulacka(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Dobrý den'
  const subject = 'Kolik vás stojí špatný vzduch? Spočítejte si to | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>většina firem si <strong>neuvědomuje skutečné náklady</strong> špatné kvality vzduchu.
    Pojďme se podívat na čísla:</p>

    <div style="margin: 24px 0; padding: 20px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
      <p style="margin: 0 0 16px; font-weight: 700; color: #991b1b; font-size: 16px;">Skryté náklady špatného vzduchu</p>

      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 180px; padding: 12px; background: white; border-radius: 6px;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #dc2626;">15 000 Kč</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Průměrná cena 1 dne nemocnosti zaměstnance (mzda + náhrada + ztráta produktivity)</p>
        </div>
        <div style="flex: 1; min-width: 180px; padding: 12px; background: white; border-radius: 6px;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #dc2626;">8–12 dní</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Průměrná roční absence na zaměstnance v ČR (ÚZIS)</p>
        </div>
        <div style="flex: 1; min-width: 180px; padding: 12px; background: white; border-radius: 6px;">
          <p style="margin: 0; font-size: 24px; font-weight: 700; color: #dc2626;">6–15 %</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Pokles produktivity v budovách se špatnou kvalitou vzduchu (studie Harvard T.H. Chan)</p>
        </div>
      </div>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 16px; font-weight: 700; color: #166534; font-size: 16px;">Příklad: firma s 50 zaměstnanci</p>
      <table style="width: 100%; font-size: 14px; color: #374151; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #d1fae5;">
          <td style="padding: 8px 0;">Nemocnost bez sanitace (10 dní × 50 lidí × 15 000 Kč)</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #dc2626;">7 500 000 Kč/rok</td>
        </tr>
        <tr style="border-bottom: 1px solid #d1fae5;">
          <td style="padding: 8px 0;">Snížení nemocnosti o 30 % díky ozonové sanitaci</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #166534;">−2 250 000 Kč/rok</td>
        </tr>
        <tr style="border-bottom: 1px solid #d1fae5;">
          <td style="padding: 8px 0;">Investice do VitalSpace řešení</td>
          <td style="padding: 8px 0; text-align: right;">od 89 000 Kč</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 700;">Návratnost investice</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #166534;">pod 1 měsíc</td>
        </tr>
      </table>
    </div>

    <p>A to nepočítáme <strong>úsporu za chemické dezinfekční přípravky</strong>,
    <strong>lepší hodnocení na Google/Booking</strong> a&nbsp;<strong>vyšší spokojenost zaměstnanců/klientů</strong>.</p>

    <p>Chcete znát přesné číslo pro Vaši organizaci? Nabízím <strong>bezplatný audit a&nbsp;kalkulaci ROI</strong> přímo pro Vás.</p>

    ${SIGNATURE}
  `

  return { subject, html }
}

// ── Utils ──

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
