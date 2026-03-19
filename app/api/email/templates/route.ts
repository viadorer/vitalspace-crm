import { NextResponse } from 'next/server'
import { EMAIL_TEMPLATES } from '@/lib/email/templates'

export const dynamic = 'force-dynamic'

/**
 * GET /api/email/templates
 * Returns list of available email templates with preview.
 */
export async function GET() {
  const templates = Object.entries(EMAIL_TEMPLATES).map(([key, tpl]) => ({
    name: key,
    label: tpl.label,
    description: tpl.description,
    preview: tpl.build({
      salutation: 'Vážená paní ředitelko',
      company_name: 'Domov seniorů',
      contact_name: 'Ing. Jana Nováková',
      city: 'Praha',
    }),
  }))

  return NextResponse.json(templates)
}
