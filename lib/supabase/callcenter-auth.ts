import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

// Povolené origin domény pro callcenter API
const ALLOWED_ORIGINS = [
  'https://webnabidky.cz',
  'https://www.webnabidky.cz',
]

/**
 * Validates API key from X-API-Key header for callcenter integration.
 * Also validates Origin header against whitelist (server-to-server calls skip this).
 * Returns the key record if valid, or a 401 response.
 */
export async function requireCallcenterApiKey(
  request: NextRequest
): Promise<{ id: string; name: string; permissions: string[] } | NextResponse> {
  // Origin check — pokud je Origin header přítomen, musí být povolený
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
 * Simple hash for API key storage (SHA-256).
 * In production, use a proper key derivation function.
 */
function hashApiKey(key: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Generates a new API key and returns both the raw key and its hash.
 */
export function generateApiKey(): { key: string; hash: string } {
  const crypto = require('crypto')
  const key = `vs_cc_${crypto.randomBytes(32).toString('hex')}`
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  return { key, hash }
}
