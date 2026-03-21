import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Povolené origin domény pro callcenter API
const ALLOWED_ORIGINS = [
  'https://webnabidky.cz',
  'https://www.webnabidky.cz',
]

/**
 * Validates API key from X-API-Key header for callcenter integration.
 * Origin is validated only as a CORS measure, not as a security control.
 * The API key is the sole authentication mechanism.
 * Returns the key record if valid, or a 401/403 response.
 */
export async function requireCallcenterApiKey(
  request: NextRequest
): Promise<{ id: string; name: string; permissions: string[] } | NextResponse> {
  // CORS origin check — informational only, not a security boundary
  const origin = request.headers.get('origin')
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Nepovolený origin' }, { status: 403 })
  }

  const apiKey = request.headers.get('x-api-key')

  if (!apiKey || apiKey.length < 32) {
    return NextResponse.json({ error: 'Chybí API klíč' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('callcenter_api_keys')
    .select('id, name, permissions')
    .eq('key_hash', hashApiKey(apiKey))
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Neplatný API klíč' }, { status: 401 })
  }

  // Update last_used_at
  await admin
    .from('callcenter_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return data
}

/**
 * Hash API key using HMAC-SHA256 with a server-side pepper.
 * Falls back to plain SHA-256 if pepper is not configured (for backwards compatibility).
 */
function hashApiKey(key: string): string {
  const pepper = process.env.API_KEY_PEPPER
  if (pepper) {
    return crypto.createHmac('sha256', pepper).update(key).digest('hex')
  }
  // Fallback for existing keys — migrate to peppered hashes over time
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Generates a new API key and returns both the raw key and its hash.
 */
export function generateApiKey(): { key: string; hash: string } {
  const key = `vs_cc_${crypto.randomBytes(32).toString('hex')}`
  const hash = hashApiKey(key)
  return { key, hash }
}
