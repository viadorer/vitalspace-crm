import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, safeErrorResponse } from '@/lib/supabase/auth-guard'
import { generateApiKey } from '@/lib/supabase/callcenter-auth'

/**
 * POST /api/callcenter/api-keys
 * Vytvoření nového API klíče pro callcentrum.
 * Pouze superadmin. Vrací raw klíč JEN jednou.
 *
 * Body:
 *   name        - název klíče (např. "Web-nabídky production")
 *   permissions - pole oprávnění (prospects:read, prospects:write, callresult:write)
 */
export async function POST(request: NextRequest) {
  const auth = await requireRole('superadmin')
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { name, permissions } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'name je povinný' }, { status: 400 })
    }

    const validPerms = ['prospects:read', 'prospects:write', 'callresult:write']
    if (!Array.isArray(permissions) || !permissions.every(p => validPerms.includes(p))) {
      return NextResponse.json({
        error: `permissions musí být pole z: ${validPerms.join(', ')}`,
      }, { status: 400 })
    }

    const { key, hash } = generateApiKey()
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('callcenter_api_keys')
      .insert({
        name: name.slice(0, 100),
        key_hash: hash,
        permissions,
        created_by: auth.id,
      })
      .select('id, name, permissions, created_at')
      .single()

    if (error) return safeErrorResponse(error)

    return NextResponse.json({
      ...data,
      api_key: key,
      warning: 'Tento klíč se zobrazí pouze jednou. Uložte si ho bezpečně.',
    })
  } catch (error) {
    return safeErrorResponse(error)
  }
}

/**
 * GET /api/callcenter/api-keys
 * Seznam API klíčů (bez raw klíčů).
 */
export async function GET(request: NextRequest) {
  const auth = await requireRole('superadmin')
  if (auth instanceof NextResponse) return auth

  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('callcenter_api_keys')
      .select('id, name, permissions, is_active, created_at, last_used_at')
      .order('created_at', { ascending: false })

    if (error) return safeErrorResponse(error)
    return NextResponse.json(data)
  } catch (error) {
    return safeErrorResponse(error)
  }
}
