import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type McpApiKeyRecord = {
  id: string
  name: string
  permissions: string[]
}

/**
 * Validates an MCP API key from the X-API-Key header against `mcp_api_keys`.
 *
 * Returns the key record on success, or null if no key header is present
 * (so callers can fall back to session auth). Throws a NextResponse if the
 * header is present but invalid, so the route handler should short-circuit.
 */
export async function validateMcpApiKey(
  request: NextRequest
): Promise<McpApiKeyRecord | NextResponse | null> {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey) return null

  if (apiKey.length < 32) {
    return NextResponse.json({ error: 'Neplatný API klíč' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('mcp_api_keys')
    .select('id, name, permissions')
    .eq('key_hash', hashApiKey(apiKey))
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Neplatný API klíč' }, { status: 401 })
  }

  // Fire-and-forget last_used_at update; ignore failures.
  admin
    .from('mcp_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then(() => {})

  return data as McpApiKeyRecord
}

/**
 * Checks if an MCP API key has the required permission scope.
 * Supports wildcard ownership like `crm:*` implying `crm:read` and `crm:write`.
 */
export function hasScope(key: McpApiKeyRecord, required: string): boolean {
  if (key.permissions.includes(required)) return true
  const [namespace] = required.split(':')
  return key.permissions.includes(`${namespace}:*`)
}

/**
 * Hashes an API key using HMAC-SHA256 with a server-side pepper.
 * Must match `lib/supabase/callcenter-auth.ts#hashApiKey` semantics.
 */
function hashApiKey(key: string): string {
  const pepper = process.env.API_KEY_PEPPER
  if (pepper) {
    return crypto.createHmac('sha256', pepper).update(key).digest('hex')
  }
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Generates a new MCP API key. Prefix `vs_mcp_` distinguishes MCP keys
 * from callcenter keys (`vs_cc_`) in logs and UIs.
 */
export function generateMcpApiKey(): { key: string; hash: string } {
  const key = `vs_mcp_${crypto.randomBytes(32).toString('hex')}`
  const hash = hashApiKey(key)
  return { key, hash }
}
