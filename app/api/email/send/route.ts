import { NextRequest, NextResponse } from 'next/server'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'
import { sendEmail, sendQuoteEmail, sendTemplateEmail } from '@/lib/email/brevo'
import { sanitizeHtml, validateEmailContent } from '@/lib/utils/sanitize-html'

export const dynamic = 'force-dynamic'

/**
 * POST /api/email/send
 * Send email via Brevo. Auth required (consultant+).
 *
 * Body:
 *   type: 'custom' | 'quote'
 *
 *   For type='custom':
 *     to_email, to_name, subject, html_body
 *
 *   For type='quote':
 *     to_email, to_name, company_name, quote_number, message?
 */
export async function POST(_request: NextRequest) {
  try {
    const authResult = await requireRole('superadmin', 'admin', 'consultant')
    if (authResult instanceof NextResponse) return authResult

    if (!process.env.BREVO_API_KEY) {
      return NextResponse.json(
        { error: 'Email služba není nakonfigurována (chybí BREVO_API_KEY)' },
        { status: 503 }
      )
    }

    const body = await _request.json()
    const { type } = body

    if (type === 'quote') {
      const { to_email, to_name, company_name, quote_number, message } = body

      if (!to_email || !company_name || !quote_number) {
        return NextResponse.json(
          { error: 'Chybí povinná pole: to_email, company_name, quote_number' },
          { status: 400 }
        )
      }

      const result = await sendQuoteEmail(
        to_email,
        to_name || '',
        company_name,
        quote_number,
        message
      )

      return NextResponse.json({ success: true, messageId: result.messageId })
    }

    if (type === 'custom') {
      const { to_email, to_name, subject, html_body } = body

      if (!to_email || !subject || !html_body) {
        return NextResponse.json(
          { error: 'Chybí povinná pole: to_email, subject, html_body' },
          { status: 400 }
        )
      }

      // Validate content size
      const validationError = validateEmailContent(subject, html_body)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }

      // Sanitize HTML to prevent XSS/phishing
      const sanitizedHtml = sanitizeHtml(html_body)

      const result = await sendEmail({
        to: [{ email: to_email, name: to_name || '' }],
        subject: subject.slice(0, 200),
        htmlContent: sanitizedHtml,
        tags: ['crm-manual'],
      })

      return NextResponse.json({ success: true, messageId: result.messageId })
    }

    if (type === 'template') {
      const { to_email, to_name, template_name, variables } = body

      if (!to_email || !template_name) {
        return NextResponse.json(
          { error: 'Chybí povinná pole: to_email, template_name' },
          { status: 400 }
        )
      }

      const result = await sendTemplateEmail(
        to_email,
        to_name || '',
        template_name,
        variables || {}
      )

      return NextResponse.json({ success: true, messageId: result.messageId })
    }

    return NextResponse.json({ error: 'Neznámý typ emailu' }, { status: 400 })
  } catch (error) {
    return safeErrorResponse(error, 500)
  }
}
