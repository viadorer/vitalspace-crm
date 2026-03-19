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
  | 'follow-up'
  | 'pozvanka-audit'
  | 'skoly-skolky'
  | 'hotely-ubytovani'
  | 'pronajem-vs-koupe'
  | 'certifikace-duvera'

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
  const salutation = vars.salutation || 'Vážená paní ředitelko / Vážený pane řediteli'

  const subject = 'Nabídka spolupráce – moderní dezinfekce a hygiena vzduchu | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>dovoluji si Vás oslovit jménem společnosti <strong>VitalSpace / Health City</strong> s&nbsp;nabídkou spolupráce
    v&nbsp;oblasti moderní dezinfekce a&nbsp;zajištění hygienického standardu Vašeho zařízení.</p>

    <p>Naše společnost se specializuje na dodávky profesionálních ozonových technologií, které umožňují:</p>

    <ul style="color: #374151; line-height: 1.8;">
      <li>efektivní likvidaci bakterií, virů a&nbsp;plísní</li>
      <li>eliminaci pachů (inkontinence, infekční oddělení apod.)</li>
      <li>snížení provozních nákladů na chemickou dezinfekci</li>
      <li>zvýšení hygienického standardu a&nbsp;komfortu klientů i&nbsp;personálu</li>
    </ul>

    <p>Technologie je vhodná zejména pro:</p>
    <ul style="color: #374151; line-height: 1.8;">
      <li>domovy pro seniory</li>
      <li>LDN a&nbsp;zdravotnická zařízení</li>
      <li>hospice a&nbsp;zařízení dlouhodobé péče</li>
    </ul>

    <p>Rádi bychom Vám nabídli:</p>
    <ul style="color: #374151; line-height: 1.8;">
      <li>nezávaznou konzultaci</li>
      <li>ukázku technologie přímo ve Vašem zařízení</li>
      <li>návrh konkrétního řešení na míru</li>
    </ul>

    <!-- Breeze Up – stropní/podhledový -->
    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Stropní instalace – OZON Breeze Up</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Vestavba do podhledu nebo montáž na strop. Plně automatický provoz – osvěžování za přítomnosti lidí + totální dezinfekce mimo provoz. Žádná obsluha.</p>
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON OZON Breeze Up – stropní panel" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <div style="margin: 28px 0;">
      <p style="font-size: 14px; color: #6b7280;">Příklad reálné instalace v&nbsp;nemocničním pokoji:</p>
      <div style="display: flex; gap: 8px;">
        <img src="${IMG_BASE}/instalace-nemocnice.png" alt="Instalace v nemocnici" style="max-width: 48%; border-radius: 8px; border: 1px solid #e5e7eb;" />
        <img src="${IMG_BASE}/instalace-podhled.png" alt="Instalace v podhledu" style="max-width: 48%; border-radius: 8px; border: 1px solid #e5e7eb;" />
      </div>
    </div>

    <!-- Mobilní zařízení -->
    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #1e3a5f; margin-bottom: 8px;">Mobilní zařízení – OZON Storm Pro I PLUS</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Průmyslový ozonový generátor pro dezinfekci větších prostor (200–800 m³). Mikropočítačem řízený cyklus s&nbsp;automatickým chlazením.</p>
      <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="OZON Storm Pro I PLUS – mobilní generátor" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <p>Naše společnost nabízí i&nbsp;poskytování služby spočívající v&nbsp;pravidelné dezinfekci našimi zaškolenými pracovníky.</p>

    <p>V&nbsp;případě Vašeho zájmu Vám velmi rádi představíme konkrétní přínosy pro Vaše zařízení
    a&nbsp;připravíme individuální nabídku.</p>

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
    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #1e3a5f;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">Registrace Ministerstvem zdravotnictví ČR</p>
      <p style="font-size: 14px; color: #374151; margin: 0;">Naše zařízení jsou registrována u&nbsp;MZ ČR jako dezinfekční prostředky / biocidy.
      To znamená, že prošla přísnými testy účinnosti a&nbsp;bezpečnosti pro profesionální použití.</p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #1e3a5f;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">Validace dle EN 17272:2020</p>
      <p style="font-size: 14px; color: #374151; margin: 0;">Evropská norma pro hodnocení účinnosti automatizovaných dezinfekčních procesů.
      Naše technologie splňuje požadavky na 99,9% redukci patogenů.</p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #1e3a5f;">
      <p style="font-weight: 700; color: #1e3a5f; margin: 0 0 12px;">Spolupráce se Západočeskou univerzitou v&nbsp;Plzni</p>
      <p style="font-size: 14px; color: #374151; margin: 0;">Technologie byla vyvíjena ve spolupráci s&nbsp;akademickým prostředím.
      Výsledky jsou podloženy měřeními a&nbsp;laboratorními testy.</p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #1e3a5f;">
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

// ── Utils ──

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
