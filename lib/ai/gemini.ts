/**
 * Gemini AI Brain pro VitalSpace CRM Orchestrátor
 *
 * Tři funkce:
 * 1. personalizeEmail — personalizuje email šablonu pro konkrétní prospect
 * 2. decideNextAction — rozhodne co dělat dál s prospectem v sekvenci
 * 3. scoreLeadWithAI — AI adjustment lead skóre
 *
 * Fallback: Pokud Gemini není dostupné nebo překročí rate limit,
 * vrátí se rule-based výchozí hodnoty. Systém NIKDY nespadne kvůli AI.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { canCall, recordCall } from './rate-limiter'
import { EMAIL_TEMPLATES } from '@/lib/email/templates'
import type { TemplateName, TemplateVariables, TemplateResult } from '@/lib/email/templates'
import type { AIDecision, AIScoreAdjustment } from '@/lib/supabase/sequence-types'

const RATE_LIMIT_KEY = 'gemini'
const MAX_RPM = 14 // necháváme 1 RPM rezervu

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenerativeAI(apiKey)
}

// ─── 1. Personalizace emailu ─────────────────────

interface PersonalizeContext {
  companyName: string
  segmentName: string
  segmentPainPoint: string | null
  decisionMakerRole: string | null
  city: string | null
  contactName: string | null
}

/**
 * Personalizuje email šablonu pomocí Gemini.
 * Přidá 1-2 věty relevantní pro segment a firmu.
 * Fallback: vrátí originální šablonu bez úprav.
 */
export async function personalizeEmail(
  templateName: TemplateName,
  variables: TemplateVariables,
  context: PersonalizeContext
): Promise<TemplateResult> {
  // Vždy nejdřív vygeneruj base template
  const template = EMAIL_TEMPLATES[templateName]
  if (!template) {
    return { subject: 'VitalSpace nabídka', html: '' }
  }
  const baseResult = template.build(variables)

  // Zkus AI personalizaci
  const client = getClient()
  if (!client || !canCall(RATE_LIMIT_KEY, MAX_RPM)) {
    return baseResult
  }

  try {
    recordCall(RATE_LIMIT_KEY)
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Jsi expert na B2B prodej ozonové sanitace pro firmu VitalSpace.
Personalizuj tento email pro konkrétního příjemce.

KONTEXT PŘÍJEMCE:
- Firma: ${context.companyName}
- Segment: ${context.segmentName}
- Pain point segmentu: ${context.segmentPainPoint || 'obecný'}
- Role decision makera: ${context.decisionMakerRole || 'ředitel'}
- Město: ${context.city || 'neuvedeno'}
- Kontaktní osoba: ${context.contactName || 'neuvedeno'}

PRODUKTY VITALSPACE:
- Vitalspace OZON Breeze Uo — jednorázová hloubková sanitace
- Vitalspace OZON Storm Pro I Plus — pravidelná prevence
- Vitalspace OZON Oasis Box — certifikované řešení pro zdravotnictví

PŘEDMĚT EMAILU: ${baseResult.subject}

ÚKOL:
1. Napiš nový, personalizovaný předmět emailu (max 60 znaků, česky)
2. Napiš 1-2 věty, které se vloží na ZAČÁTEK emailu (po oslovení) a odkazují na:
   - Konkrétní pain point segmentu
   - Proč je to relevantní právě pro tuto firmu
   - Přirozený, profesionální tón

FORMÁT ODPOVĚDI (JSON):
{"subject": "nový předmět", "intro": "1-2 personalizované věty"}

Odpověz POUZE JSON, nic jiného.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return baseResult

    const parsed = JSON.parse(jsonMatch[0]) as { subject: string; intro: string }

    if (!parsed.subject || !parsed.intro) return baseResult

    // Vlož personalizovaný intro za první <p> nebo za oslovení
    const personalizedHtml = baseResult.html.replace(
      /(<\/p>)/,
      `</p><p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.6;">${escapeHtml(parsed.intro)}</p>`
    )

    return {
      subject: parsed.subject.slice(0, 100),
      html: personalizedHtml,
    }
  } catch {
    // AI selhalo — vrať originál
    return baseResult
  }
}

// ─── 2. Rozhodnutí o dalším kroku ────────────────

interface DecisionContext {
  companyName: string
  segmentName: string
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  callResults: string[]
  daysSinceFirstContact: number
  currentStep: number
  totalSteps: number
}

/**
 * AI rozhodne co dělat dál s prospectem.
 * Fallback: po 2 emailech bez reakce → callcentrum.
 */
export async function decideNextAction(
  context: DecisionContext
): Promise<AIDecision> {
  // Fallback rule-based rozhodnutí
  const fallback: AIDecision = {
    action: context.emailsSent >= 2 && context.emailsOpened === 0
      ? 'queue_callcenter'
      : 'send_email',
    template_name: 'follow-up',
    reasoning: 'Rule-based: AI nedostupné',
  }

  const client = getClient()
  if (!client || !canCall(RATE_LIMIT_KEY, MAX_RPM)) {
    return fallback
  }

  try {
    recordCall(RATE_LIMIT_KEY)
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Jsi AI sales advisor pro VitalSpace (ozonová sanitace, B2B).
Rozhoduj o dalším kroku pro prospect.

PROSPECT:
- Firma: ${context.companyName}
- Segment: ${context.segmentName}
- Emailů odesláno: ${context.emailsSent}
- Emailů otevřeno: ${context.emailsOpened}
- Emailů prokliknuto: ${context.emailsClicked}
- Výsledky volání: ${context.callResults.length > 0 ? context.callResults.join(', ') : 'žádné'}
- Dní od prvního kontaktu: ${context.daysSinceFirstContact}
- Aktuální krok: ${context.currentStep}/${context.totalSteps}

DOSTUPNÉ AKCE:
- send_email (template_name: obecna-nabidka, follow-up, pozvanka-audit, toxicita-prostredi, certifikace-duvera, pronajem-vs-koupe)
- queue_callcenter
- wait (wait_days: 1-14)
- skip_step
- stop_sequence

ROZHODOVACÍ LOGIKA:
- Otevřel email ale nekliknul? → follow-up nebo audit pozvánka
- Nereaguje na emaily? → callcentrum
- Callcentrum: zájem? → personalizovaný email
- Callcentrum: nezájem? → stop
- Příliš mnoho kontaktů bez reakce (>5)? → stop
- Prokliknul link? → pozvánka na audit

Odpověz POUZE jako JSON:
{"action": "...", "template_name": "...", "wait_days": null, "reasoning": "krátké vysvětlení"}

Odpověz POUZE JSON.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallback

    const parsed = JSON.parse(jsonMatch[0])

    const validActions = ['send_email', 'queue_callcenter', 'wait', 'skip_step', 'stop_sequence']
    if (!validActions.includes(parsed.action)) return fallback

    return {
      action: parsed.action,
      template_name: parsed.template_name || undefined,
      wait_days: parsed.wait_days || undefined,
      reasoning: parsed.reasoning || 'AI decision',
    }
  } catch {
    return fallback
  }
}

// ─── 3. AI Score Adjustment ──────────────────────

/**
 * AI posoudí prospect a doporučí adjustment skóre (-10 to +10).
 * Fallback: 0 (žádná úprava).
 */
export async function scoreLeadWithAI(
  companyName: string,
  segmentName: string,
  painPoint: string | null,
  priority: number,
  emailsOpened: number,
  callResults: string[]
): Promise<AIScoreAdjustment> {
  const fallback: AIScoreAdjustment = { adjustment: 0, reasoning: 'AI nedostupné' }

  const client = getClient()
  if (!client || !canCall(RATE_LIMIT_KEY, MAX_RPM)) {
    return fallback
  }

  try {
    recordCall(RATE_LIMIT_KEY)
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `Jsi AI scoring advisor pro VitalSpace (B2B ozonová sanitace).
Posud tohoto prospekta a doporuč adjustment lead skóre.

PROSPECT:
- Firma: ${companyName}
- Segment: ${segmentName}
- Pain point: ${painPoint || 'neznámý'}
- Priorita: P${priority}
- Emailů otevřeno: ${emailsOpened}
- Callcentrum výsledky: ${callResults.length > 0 ? callResults.join(', ') : 'žádné'}

Odpověz POUZE JSON:
{"adjustment": číslo od -10 do 10, "reasoning": "krátké zdůvodnění"}

Pozitivní adjustment: firma dobře sedí na ozon, je v segmentu s vysokým potenciálem.
Negativní adjustment: firma pravděpodobně nekoupí (segment s nízkou konverzí, mnoho odmítnutí).`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallback

    const parsed = JSON.parse(jsonMatch[0])
    const adj = Math.min(10, Math.max(-10, Math.round(parsed.adjustment || 0)))

    return {
      adjustment: adj,
      reasoning: parsed.reasoning || 'AI adjustment',
    }
  } catch {
    return fallback
  }
}

// ─── Utils ───────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
