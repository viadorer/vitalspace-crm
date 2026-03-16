import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, safeErrorResponse, isValidEmail, truncate } from '@/lib/supabase/auth-guard'

const VALID_ROLES = ['superadmin', 'admin', 'consultant', 'technician', 'viewer']

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole('superadmin')
    if (auth instanceof NextResponse) return auth

    const { email, password, full_name, role, phone } = await request.json()

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Vyplňte email, heslo, jméno a roli' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Neplatný email' }, { status: 400 })
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Heslo musí mít alespoň 8 znaků' }, { status: 400 })
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Neplatná role' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: truncate(full_name, 100) },
    })

    if (authError) {
      return NextResponse.json({ error: 'Chyba při vytváření uživatele' }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Uživatel nebyl vytvořen' }, { status: 500 })
    }

    const { error: updateError } = await admin
      .from('app_users')
      .update({ full_name: truncate(full_name, 100), role, phone: truncate(phone, 30) || null })
      .eq('id', authData.user.id)

    if (updateError) {
      return safeErrorResponse(updateError)
    }

    return NextResponse.json({ id: authData.user.id })
  } catch (error) {
    return safeErrorResponse(error)
  }
}
