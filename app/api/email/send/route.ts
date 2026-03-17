import { NextRequest, NextResponse } from 'next/server'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'
import { sendEmail, sendQuoteEmail } from '@/lib/email/brevo'

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

      const result = await sendEmail({
        to: [{ email: to_email, name: to_name || '' }],
        subject,
        htmlContent: html_body,
        tags: ['crm-manual'],
      })

      return NextResponse.json({ success: true, messageId: result.messageId })
    }

    return NextResponse.json({ error: 'Neznámý typ emailu' }, { status: 400 })
  } catch (error) {
    return safeErrorResponse(error, 500)
  }
}
