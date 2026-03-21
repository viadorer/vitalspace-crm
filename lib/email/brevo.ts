/**
 * Brevo (formerly Sendinblue) email integration.
 *
 * Env vars required:
 *   BREVO_API_KEY       — API key from Brevo dashboard
 *   BREVO_SENDER_EMAIL  — verified sender address (e.g. info@vitalspace.cz)
 *   BREVO_SENDER_NAME   — sender display name (e.g. VitalSpace CRM)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

interface EmailRecipient {
  email: string
  name?: string
}

interface SendEmailOptions {
  to: EmailRecipient[]
  subject: string
  htmlContent: string
  textContent?: string
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
  replyTo?: EmailRecipient
  tags?: string[]
}

interface BrevoResponse {
  messageId: string
}

export async function sendEmail(options: SendEmailOptions): Promise<BrevoResponse> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || 'VitalSpace CRM'

  if (!senderEmail) {
    throw new Error('BREVO_SENDER_EMAIL is not configured')
  }

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured')
  }

  const body: Record<string, unknown> = {
    sender: { email: senderEmail, name: senderName },
    to: options.to,
    subject: options.subject,
    htmlContent: options.htmlContent,
  }

  if (options.textContent) body.textContent = options.textContent
  if (options.cc?.length) body.cc = options.cc
  if (options.bcc?.length) body.bcc = options.bcc
  if (options.replyTo) body.replyTo = options.replyTo
  if (options.tags?.length) body.tags = options.tags

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(`Brevo API error ${res.status}: ${error.message || JSON.stringify(error)}`)
  }

  return res.json()
}

/**
 * Send a simple CRM notification email (e.g. deal stage change, activity reminder).
 */
export async function sendCrmNotification(
  recipientEmail: string,
  recipientName: string,
  subject: string,
  bodyHtml: string
): Promise<BrevoResponse> {
  return sendEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent: wrapInTemplate(subject, bodyHtml),
    tags: ['crm-notification'],
  })
}

/**
 * Send a quote/proposal email with the PDF as context.
 */
export async function sendQuoteEmail(
  recipientEmail: string,
  recipientName: string,
  companyName: string,
  quoteNumber: string,
  message?: string
): Promise<BrevoResponse> {
  const subject = `Cenová nabídka ${quoteNumber} – VitalSpace`
  const html = `
    <p>Dobrý den${recipientName ? `, ${recipientName}` : ''},</p>
    <p>děkujeme za Váš zájem o naše řešení ozónové sanitace.</p>
    ${message ? `<p>${escapeHtml(message)}</p>` : ''}
    <p>V příloze zasíláme cenovou nabídku <strong>${escapeHtml(quoteNumber)}</strong>
    pro společnost <strong>${escapeHtml(companyName)}</strong>.</p>
    <p>V případě dotazů nás neváhejte kontaktovat.</p>
    <p>S pozdravem,<br/>Tým VitalSpace</p>
  `

  return sendEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent: wrapInTemplate(subject, html),
    tags: ['quote'],
  })
}

/**
 * Send an email using a named template with variable substitution.
 */
export async function sendTemplateEmail(
  recipientEmail: string,
  recipientName: string,
  templateName: string,
  variables: Record<string, string>
): Promise<BrevoResponse> {
  const { EMAIL_TEMPLATES } = await import('./templates')
  const tpl = EMAIL_TEMPLATES[templateName as keyof typeof EMAIL_TEMPLATES]
  if (!tpl) throw new Error(`Neznámá šablona: ${templateName}`)

  const { subject, html } = tpl.build(variables)

  return sendEmail({
    to: [{ email: recipientEmail, name: recipientName }],
    subject,
    htmlContent: wrapInTemplate(subject, html),
    replyTo: { email: process.env.BREVO_SENDER_EMAIL!, name: process.env.BREVO_SENDER_NAME || 'VitalSpace CRM' },
    tags: ['crm-template', templateName],
  })
}

const LOGO_URL = 'https://pyrtrlhesqqjjtemacbi.supabase.co/storage/v1/object/public/email-assets/logo-vitalspace.png'

function wrapInTemplate(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="padding-bottom: 16px; margin-bottom: 24px;">
    <img src="${LOGO_URL}" alt="VitalSpace" width="44" height="44" style="vertical-align: middle; margin-right: 10px;" />
    <span style="font-size: 22px; font-weight: 700; color: #1e3a5f; vertical-align: middle;">VitalSpace</span>
  </div>
  ${body}
  <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #6b7280;">
    <img src="${LOGO_URL}" alt="VitalSpace" width="20" height="20" style="vertical-align: middle; margin-right: 6px;" />
    <strong style="color: #1e3a5f;">VitalSpace s.r.o.</strong><br/>
    <span style="color: #9ca3af;">Mgr. Pavel Fogl · +420 775 930 816 · pavel.fogl@vitalspace.cz</span><br/>
    <span style="color: #9ca3af;">Radyňská 463/33, 326 00 Plzeň · IČO: 24614068</span>
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
