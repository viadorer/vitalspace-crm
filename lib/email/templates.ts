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
  | 'skolky-rozsirena'
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
  'skolky-rozsirena': {
    label: 'Mateřské školy – rozšířená prodejní nabídka',
    description: 'Obsáhlá prodejní nabídka pro ředitelky MŠ: produkty, ROI, instalace, FAQ a kontakt David Choc.',
    build: buildSkolkyRozsirena,
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

// ── 4b. Mateřské školy – rozšířená prodejní nabídka (David Choc) ──

const SIGNATURE_DAVID = `
    <div style="margin-top: 32px; padding: 22px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: top; padding-right: 16px; width: 64px;">
            <img src="${LOGO_URL}" alt="VitalSpace" width="48" height="48" style="display: block; border-radius: 8px;" />
          </td>
          <td style="vertical-align: top;">
            <p style="margin: 0 0 4px; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">S úctou</p>
            <p style="margin: 0; font-size: 16px; font-weight: 700; color: #1e3a5f;">Bc. David Choc</p>
            <p style="margin: 2px 0 14px; font-size: 13px; color: #64748b;">jednatel · VitalSpace s.r.o.</p>
            <p style="margin: 0 0 2px; font-size: 13px; color: #374151; line-height: 1.7;">
              Tel.: <a href="tel:+420774052232" style="color: #1e3a5f; text-decoration: none; font-weight: 600;">+420 774 052 232</a>
            </p>
            <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.7;">
              E‑mail: <a href="mailto:david.choc@vitalspace.cz" style="color: #1e3a5f; text-decoration: none; font-weight: 600;">david.choc@vitalspace.cz</a>
            </p>
          </td>
        </tr>
      </table>

      <div style="margin-top: 18px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 12px;">
              <p style="margin: 0 0 4px; font-size: 11px; color: #00A5CF; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Pobočka Praha</p>
              <p style="margin: 0; font-size: 12px; color: #374151; line-height: 1.6;">
                Pod turnovskou tratí 182/18<br/>
                198 00 Praha – Hloubětín
              </p>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 12px;">
              <p style="margin: 0 0 4px; font-size: 11px; color: #00A5CF; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Pobočka Plzeň</p>
              <p style="margin: 0; font-size: 12px; color: #374151; line-height: 1.6;">
                Radyňská 463/33<br/>
                326 00 Plzeň
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 14px 0 0; font-size: 11px; color: #9ca3af;">VitalSpace s.r.o. · IČO: 24614068 · www.vitalspace.cz</p>
      </div>
    </div>
`

function buildSkolkyRozsirena(vars: TemplateVariables): TemplateResult {
  const salutation = vars.salutation || 'Vážená paní ředitelko'
  const subject = 'Zdravé prostředí pro ty nejmenší — ozonová sanitace bez chemie | VitalSpace'

  const html = `
    <!-- Hero -->
    <div style="background: linear-gradient(135deg, #0F4C5C 0%, #00A5CF 100%); padding: 32px 24px; border-radius: 12px; margin-bottom: 28px; text-align: center;">
      <img src="${LOGO_URL}" alt="VitalSpace" width="56" height="56" style="display: inline-block; margin-bottom: 12px; border-radius: 8px;" />
      <p style="margin: 0; font-size: 11px; color: #9FD356; text-transform: uppercase; letter-spacing: 3px; font-weight: 700;">Pro mateřské školy a jesle</p>
      <h1 style="margin: 12px 0 8px; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">Zdravé prostředí<br/>pro ty nejmenší</h1>
      <p style="margin: 0; font-size: 14px; color: #CADCFC;">Stropní sanitace OZON Breeze Up — bez chemie, bez obsluhy, 99,99 % účinnost</p>
    </div>

    <p>${esc(salutation)},</p>

    <p>obracím se na Vás s&nbsp;nabídkou, která pomáhá ředitelkám mateřských škol řešit dva
    největší dlouhodobé problémy provozu: <strong>vysokou nemocnost dětí v&nbsp;chřipkové
    sezóně</strong> a&nbsp;<strong>rostoucí počet alergiků</strong>.</p>

    <!-- Quick wins / 4 hooks -->
    <div style="margin: 24px 0; padding: 20px; background: #F4F8FA; border-radius: 12px;">
      <p style="margin: 0 0 12px; font-weight: 700; color: #0F4C5C; font-size: 15px;">Co řeší ozonová sanitace v mateřské škole</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="width: 50%; padding: 6px 12px 6px 0; vertical-align: top;">
            <p style="margin: 0; font-size: 14px; color: #1A2332; line-height: 1.5;">
              <strong style="color: #0F4C5C;">↓ 20–40 %</strong> méně absencí dětí v&nbsp;chřipkové sezóně
            </p>
          </td>
          <td style="width: 50%; padding: 6px 0 6px 12px; vertical-align: top;">
            <p style="margin: 0; font-size: 14px; color: #1A2332; line-height: 1.5;">
              <strong style="color: #0F4C5C;">99,99 %</strong> likvidace virů, bakterií, plísní a&nbsp;roztočů
            </p>
          </td>
        </tr>
        <tr>
          <td style="width: 50%; padding: 6px 12px 6px 0; vertical-align: top;">
            <p style="margin: 0; font-size: 14px; color: #1A2332; line-height: 1.5;">
              <strong style="color: #0F4C5C;">Bez chemie</strong> — bezpečné pro děti i&nbsp;alergiky
            </p>
          </td>
          <td style="width: 50%; padding: 6px 0 6px 12px; vertical-align: top;">
            <p style="margin: 0; font-size: 14px; color: #1A2332; line-height: 1.5;">
              <strong style="color: #0F4C5C;">Bez obsluhy</strong> — plně automatický noční cyklus
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- HERO product — OZON Breeze Up -->
    <h2 style="margin: 32px 0 8px; font-size: 22px; color: #0F4C5C;">OZON Breeze Up — stropní sanitační systém</h2>
    <p style="margin: 0 0 16px; color: #5A6C7A; font-size: 14px;">
      Skrytá instalace do podhledu 595×595 mm. Splyne s běžnou stropní kazetou.
      Funguje automaticky podle týdenního harmonogramu — bez zásahu personálu školky.
    </p>
    <img src="${IMG_BASE}/cleanup-nastropni.png" alt="OZON Breeze Up — stropní sanitační panel" style="display: block; max-width: 100%; border-radius: 12px; border: 1px solid #e5e7eb; margin: 0 0 20px;" />

    <!-- Two modes -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; margin: 24px 0; border-collapse: separate; border-spacing: 0;">
      <tr>
        <td style="width: 50%; padding-right: 8px; vertical-align: top;">
          <div style="padding: 18px; background: #ECFDF5; border: 1px solid #9FD356; border-radius: 10px; height: 100%;">
            <p style="margin: 0 0 6px; font-size: 11px; color: #166534; font-weight: 700; letter-spacing: 1.5px;">REŽIM 1 · DEN</p>
            <p style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #0F4C5C;">Bezpečný osvěžovač</p>
            <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
              Velmi nízká koncentrace ozonu (pod hygienickým limitem). Děti i&nbsp;personál mohou
              být v&nbsp;prostoru, vzduch se průběžně čistí, mizí zápachy.
            </p>
          </div>
        </td>
        <td style="width: 50%; padding-left: 8px; vertical-align: top;">
          <div style="padding: 18px; background: #0F4C5C; border-radius: 10px; height: 100%;">
            <p style="margin: 0 0 6px; font-size: 11px; color: #9FD356; font-weight: 700; letter-spacing: 1.5px;">REŽIM 2 · NOC</p>
            <p style="margin: 0 0 8px; font-size: 15px; font-weight: 700; color: #ffffff;">Plná sanitace 99,99 %</p>
            <p style="margin: 0; font-size: 13px; color: #CADCFC; line-height: 1.6;">
              Vysoká koncentrace mimo provozní dobu. Plně dezinfikuje hračky, koberce,
              matrace. Do rána se ozon rozloží zpět na O₂.
            </p>
          </div>
        </td>
      </tr>
    </table>

    <!-- Where to install -->
    <h2 style="margin: 32px 0 8px; font-size: 22px; color: #0F4C5C;">Kam OZON Breeze Up ve školce umístit</h2>
    <p style="margin: 0 0 16px; color: #5A6C7A; font-size: 14px;">Jedno zařízení na třídu — stropní rastr 600×600 nahradí běžnou kazetu.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate; border-spacing: 0 8px;">
      <tr>
        <td style="width: 50%; padding-right: 8px; vertical-align: top;">
          <div style="padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0F4C5C;">Herny</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Hračky, koberce, polstrování — dezinfekce přes noc.</p>
          </div>
        </td>
        <td style="width: 50%; padding-left: 8px; vertical-align: top;">
          <div style="padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0F4C5C;">Ložnice a lehárny</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Matrace, polštáře, lehátka. Žádná chemická rezidua.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="width: 50%; padding-right: 8px; vertical-align: top;">
          <div style="padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0F4C5C;">Sociální zařízení</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">WC a&nbsp;přebalovací pulty — automatická noční dezinfekce.</p>
          </div>
        </td>
        <td style="width: 50%; padding-left: 8px; vertical-align: top;">
          <div style="padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0F4C5C;">Šatny</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Skříňky, lavičky, podlahy — eliminace bakterií i&nbsp;zápachu.</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="width: 50%; padding-right: 8px; vertical-align: top;">
          <div style="padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0F4C5C;">Jídelna</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Bezpečné prostředí pro stravu nejcitlivější populace.</p>
          </div>
        </td>
        <td style="width: 50%; padding-left: 8px; vertical-align: top;">
          <div style="padding: 12px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0F4C5C;">Třída pro alergiky</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Pravidelná likvidace roztočů a&nbsp;plísňových alergenů.</p>
          </div>
        </td>
      </tr>
    </table>

    <!-- Real installation gallery -->
    <h2 style="margin: 32px 0 8px; font-size: 22px; color: #0F4C5C;">Reálné instalace v praxi</h2>
    <p style="margin: 0 0 16px; color: #5A6C7A; font-size: 14px;">Stejný princip jako v&nbsp;ordinacích, nemocnicích a&nbsp;klinikách — beze stopy v&nbsp;interiéru.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
      <tr>
        <td style="width: 50%; padding-right: 6px; vertical-align: top;">
          <img src="${IMG_BASE}/instalace-podhled.png" alt="Stropní instalace v podhledu" style="display: block; max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
          <p style="margin: 8px 0 0; font-size: 12px; color: #64748b; text-align: center; font-style: italic;">Stropní instalace v&nbsp;podhledu</p>
        </td>
        <td style="width: 50%; padding-left: 6px; vertical-align: top;">
          <img src="${IMG_BASE}/instalace-nemocnice.png" alt="Klinické prostředí — stejná technologie" style="display: block; max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
          <p style="margin: 8px 0 0; font-size: 12px; color: #64748b; text-align: center; font-style: italic;">Klinické prostředí — stejná technologie</p>
        </td>
      </tr>
    </table>

    <!-- Companion products -->
    <h2 style="margin: 32px 0 8px; font-size: 22px; color: #0F4C5C;">Co k&nbsp;tomu nabízíme navíc</h2>
    <p style="margin: 0 0 16px; color: #5A6C7A; font-size: 14px;">
      Pro speciální situace — větší prostory (tělocvična, jídelna) a&nbsp;sanitace předmětů.
    </p>

    <!-- OZON Storm Pro I PLUS -->
    <div style="margin: 16px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="width: 130px; vertical-align: top; padding-right: 16px;">
            <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="OZON Storm Pro I PLUS" style="display: block; max-width: 130px; border-radius: 8px;" />
          </td>
          <td style="vertical-align: top;">
            <p style="margin: 0 0 4px; font-size: 11px; color: #E5A823; font-weight: 700; letter-spacing: 1.5px;">MOBILNÍ PRŮMYSLOVÝ GENERÁTOR</p>
            <p style="margin: 0 0 6px; font-size: 17px; font-weight: 700; color: #0F4C5C;">OZON Storm Pro I PLUS</p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #374151; line-height: 1.6;">
              Pro tělocvičnu, velkou jídelnu, víceúčelovou halu nebo celou budovu při generálním úklidu.
              Pokrytí 200–800 m³, mikropočítačem řízený cyklus.
            </p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Mobilní mezi místnostmi &nbsp;·&nbsp; automatické chlazení &nbsp;·&nbsp; bezpečnostní protokoly
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- OZON Oasis Box DRY -->
    <div style="margin: 16px 0; padding: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="width: 130px; vertical-align: top; padding-right: 16px;">
            <img src="${IMG_BASE}/clean-box-dry.png" alt="OZON Oasis Box DRY" style="display: block; max-width: 130px; border-radius: 8px;" />
          </td>
          <td style="vertical-align: top;">
            <p style="margin: 0 0 4px; font-size: 11px; color: #9FD356; font-weight: 700; letter-spacing: 1.5px;">KOMPAKTNÍ SANITAČNÍ BOX</p>
            <p style="margin: 0 0 6px; font-size: 17px; font-weight: 700; color: #0F4C5C;">OZON Oasis Box DRY</p>
            <p style="margin: 0 0 8px; font-size: 13px; color: #374151; line-height: 1.6;">
              Pro plyšáky, oblečení, hračky a&nbsp;didaktické pomůcky. Suchý cyklus 15–45 minut,
              bez vlhkosti, šetrný k&nbsp;materiálům.
            </p>
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              Plyšáci a&nbsp;textil &nbsp;·&nbsp; plastové hračky &nbsp;·&nbsp; pomůcky před a&nbsp;po pobytu
            </p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Safety -->
    <h2 style="margin: 32px 0 8px; font-size: 22px; color: #0F4C5C;">Bezpečnost pro děti — vícenásobné pojistky</h2>
    <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8; font-size: 14px;">
      <li><strong>PIR detekce pohybu</strong> — sanitační cyklus se vypne při vstupu osoby do prostoru.</li>
      <li><strong>Tepelná pojistka</strong> + ochrana proti chodu naprázdno — nikdy nehrozí zvýšená dávka.</li>
      <li><strong>Hygienické limity</strong> — denní režim je pod limitem 0,1&nbsp;ppm (dlouhodobá expozice).</li>
      <li><strong>Poločas rozkladu ~30 minut</strong> — sanitace končí 4–6&nbsp;hodin před otevřením školky.</li>
    </ul>

    <!-- ROI block -->
    <div style="margin: 28px 0; padding: 24px; background: linear-gradient(135deg, #0F4C5C 0%, #1A2332 100%); border-radius: 12px; color: #ffffff;">
      <p style="margin: 0 0 6px; font-size: 11px; color: #9FD356; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Návratnost investice</p>
      <p style="margin: 0 0 12px; font-size: 22px; font-weight: 700;">Modelově ≈ 6 měsíců</p>
      <p style="margin: 0; font-size: 14px; color: #CADCFC; line-height: 1.6;">
        Pro typickou školku s&nbsp;60&nbsp;dětmi ve 3 třídách: úspora ze sníženého počtu absencí
        + úspora na suplování + úspora chemie + vyšší retence vede modelově k&nbsp;úspoře
        <strong style="color: #ffffff;">100&nbsp;000+&nbsp;Kč ročně</strong>. Konkrétní výpočet
        Vám připravím podle Vaší kapacity.
      </p>
    </div>

    <!-- FAQ -->
    <h2 style="margin: 32px 0 8px; font-size: 22px; color: #0F4C5C;">Časté dotazy ředitelek</h2>

    <p style="margin: 16px 0 6px; font-size: 14px; font-weight: 700; color: #0F4C5C;">Není ozon nebezpečný pro děti?</p>
    <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
      Bezpečnostní cyklus probíhá v&nbsp;noci, kdy nejsou děti přítomny. PIR čidlo detekuje pohyb
      a&nbsp;okamžitě vypne sanitaci. Přes den jen osvěžovací režim pod hygienickým limitem.
    </p>

    <p style="margin: 16px 0 6px; font-size: 14px; font-weight: 700; color: #0F4C5C;">Co když děti přijdou ráno do třídy?</p>
    <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
      Ozon má poločas rozkladu ~30&nbsp;minut. Cyklus končí typicky 4–6&nbsp;hodin před otevřením školky —
      ráno je v&nbsp;prostoru pouze čistý kyslík.
    </p>

    <p style="margin: 16px 0 6px; font-size: 14px; font-weight: 700; color: #0F4C5C;">Můžeme to vyzkoušet před koupí?</p>
    <p style="margin: 0; font-size: 13px; color: #374151; line-height: 1.6;">
      Ano — nabízíme <strong>pilotní instalaci na 1 zařízení do 1 třídy</strong> s&nbsp;vrácením peněz
      do 30&nbsp;dnů, pokud nebudete spokojeni.
    </p>

    <!-- Certifications strip -->
    <div style="margin: 28px 0; padding: 18px; background: #F4F8FA; border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 11px; color: #00A5CF; font-weight: 700; letter-spacing: 2px;">CERTIFIKACE A ZÁRUKY</p>
      <p style="margin: 0; font-size: 13px; color: #1A2332; line-height: 1.8;">
        Registrace <strong>MZ ČR</strong> · norma <strong>EN 17272:2020</strong> · prohlášení o&nbsp;shodě <strong>CE</strong> · biocidní <strong>BPR 528/2012</strong> · vývoj se Západočeskou univerzitou v&nbsp;Plzni · záruka <strong>24 měsíců</strong>
      </p>
    </div>

    <!-- CTA -->
    <div style="margin: 28px 0; padding: 24px; background: #ffffff; border: 2px solid #00A5CF; border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #0F4C5C;">Připravím nabídku přesně podle velikosti Vaší školky</p>
      <p style="margin: 0 0 16px; font-size: 13px; color: #5A6C7A;">
        Bezplatná konzultace, návrh rozmístění a&nbsp;cenová nabídka do 24&nbsp;hodin.
      </p>
      <a href="tel:+420774052232" style="display: inline-block; padding: 12px 22px; margin: 4px; background: #0F4C5C; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 8px;">+420 774 052 232</a>
      <a href="mailto:david.choc@vitalspace.cz?subject=Poptávka%20OZON%20Breeze%20Up%20pro%20MŠ" style="display: inline-block; padding: 12px 22px; margin: 4px; background: #00A5CF; color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 8px;">Napsat e‑mail</a>
    </div>

    <p style="margin: 24px 0 0; font-size: 14px; color: #374151; line-height: 1.7;">
      Budu se těšit na případnou spolupráci a&nbsp;jsem připraven Vám zodpovědět jakékoli otázky.
    </p>

    ${SIGNATURE_DAVID}
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

    <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="OZON Storm Pro I PLUS – mobilní generátor" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; margin: 16px 0;" />

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
  const subject = 'Kolik vás stojí špatný vzduch? | VitalSpace'

  const html = `
    <p>${esc(salutation)},</p>

    <p>zamysleli jste se někdy, kolik vaši firmu <strong>skutečně stojí nekvalitní vzduch</strong> v&nbsp;prostorách?</p>

    <div style="margin: 24px 0; padding: 20px; background: #fef2f2; border-radius: 8px; border: 1px solid #fecaca;">
      <p style="margin: 0 0 16px; font-weight: 700; color: #991b1b; font-size: 16px;">Otázky, které stojí za zvážení</p>

      <ul style="color: #374151; line-height: 2; margin: 0; padding-left: 20px;">
        <li>Kolik dní ročně chybí vaši zaměstnanci kvůli respiračním onemocněním?</li>
        <li>Kolik vás stojí každý den absence — mzda, náhrada, ztráta produktivity?</li>
        <li>Kolik utrácíte za chemické dezinfekční prostředky?</li>
        <li>Jaký dopad mají pachy nebo špatný vzduch na spokojenost klientů?</li>
      </ul>
    </div>

    <div style="margin: 24px 0; padding: 20px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
      <p style="margin: 0 0 16px; font-weight: 700; color: #166534; font-size: 16px;">Co přináší ozonová sanitace VitalSpace</p>

      <ul style="color: #374151; line-height: 2; margin: 0; padding-left: 20px;">
        <li><strong>Snížení nemocnosti</strong> — prokazatelná eliminace bakterií, virů a&nbsp;plísní</li>
        <li><strong>Úspora za chemii</strong> — dezinfekce bez chemických přípravků</li>
        <li><strong>Eliminace pachů</strong> — čistý vzduch pro zaměstnance i&nbsp;klienty</li>
        <li><strong>Žádná obsluha</strong> — plně automatický provoz</li>
      </ul>
    </div>

    <p>Rádi vám <strong>bezplatně spočítáme konkrétní přínos</strong> pro vaši provozovnu —
    na základě měření kvality vzduchu přímo u&nbsp;vás.</p>

    <p>Stačí odpovědět na tento email nebo zavolat — domluvíme nezávazný audit.</p>

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
