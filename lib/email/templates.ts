/**
 * Email templates for VitalSpace CRM.
 *
 * Each template is a function that accepts variables and returns { subject, html }.
 * Images are hosted on Supabase Storage (public bucket email-assets).
 */

const IMG_BASE = 'https://pyrtrlhesqqjjtemacbi.supabase.co/storage/v1/object/public/email-assets/products'

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

export type TemplateName = 'obecna-nabidka' | 'follow-up' | 'pozvanka-audit'

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
}

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

    <!-- Nástropní instalace -->
    <div style="margin: 28px 0;">
      <p style="font-weight: 600; color: #059669; margin-bottom: 8px;">Nástropní instalace – Clean Up</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Modul do kazetového podhledu (595×595 mm). Dvojitý režim: osvěžování za přítomnosti lidí + totální dezinfekce mimo provoz.</p>
      <img src="${IMG_BASE}/cleanup-nastropni.png" alt="VitalSpace Clean Up – nástropní panel" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
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
      <p style="font-weight: 600; color: #059669; margin-bottom: 8px;">Mobilní zařízení – PRO I PLUS</p>
      <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">Průmyslový ozonový generátor pro dezinfekci větších prostor. Mikropočítačem řízený cyklus s&nbsp;automatickým chlazením.</p>
      <img src="${IMG_BASE}/pro-i-plus-mobilni.png" alt="VitalSpace PRO I PLUS – mobilní generátor" style="max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;" />
    </div>

    <p>Naše společnost nabízí i&nbsp;poskytování služby spočívající v&nbsp;pravidelné dezinfekci našimi zaškolenými pracovníky.</p>

    <p>V&nbsp;případě Vašeho zájmu Vám velmi rádi představíme konkrétní přínosy pro Vaše zařízení
    a&nbsp;připravíme individuální nabídku.</p>

    <p>Děkuji za Váš čas a&nbsp;budu se těšit na případnou spolupráci.</p>

    <p style="margin-top: 24px;">
      S&nbsp;úctou<br/>
      <strong>Mgr. Pavel Fogl</strong><br/>
      <span style="color: #6b7280;">+420 775 930 816</span><br/>
      <span style="color: #6b7280;">pavel.fogl@vitalspace.cz</span>
    </p>
  `

  return { subject, html }
}

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

    <p style="margin-top: 24px;">
      S&nbsp;pozdravem<br/>
      <strong>Mgr. Pavel Fogl</strong><br/>
      <span style="color: #6b7280;">+420 775 930 816</span><br/>
      <span style="color: #6b7280;">pavel.fogl@vitalspace.cz</span>
    </p>
  `

  return { subject, html }
}

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

    <p style="margin-top: 24px;">
      S&nbsp;pozdravem<br/>
      <strong>Mgr. Pavel Fogl</strong><br/>
      <span style="color: #6b7280;">+420 775 930 816</span><br/>
      <span style="color: #6b7280;">pavel.fogl@vitalspace.cz</span>
    </p>
  `

  return { subject, html }
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
