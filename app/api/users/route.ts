import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: appUser } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (appUser?.role !== 'superadmin') return null
  return user
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireSuperAdmin()
    if (!currentUser) {
      return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 })
    }

    const { email, password, full_name, role, phone } = await request.json()

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: 'Vyplňte email, heslo, jméno a roli' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Uživatel nebyl vytvořen' }, { status: 500 })
    }

    const { error: updateError } = await admin
      .from('app_users')
      .update({ full_name, role, phone: phone || null })
      .eq('id', authData.user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ id: authData.user.id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
