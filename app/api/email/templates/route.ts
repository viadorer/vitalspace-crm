import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/supabase/auth-guard'
import { EMAIL_TEMPLATES } from '@/lib/email/templates'

export const dynamic = 'force-dynamic'

/**
 * GET /api/email/templates
 * Returns list of available email templates with preview.
 * Requires authentication (consultant+).
 */
export async function GET() {
  const authResult = await requireRole('superadmin', 'admin', 'consultant')
  if (authResult instanceof NextResponse) return authResult

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
