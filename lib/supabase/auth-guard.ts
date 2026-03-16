import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export type AuthUser = {
  id: string
  email?: string
  role: string
}

const GENERIC_ERROR = 'Došlo k chybě při zpracování požadavku'

/**
 * Verifies the user is authenticated and returns their info.
 * Returns null if unauthenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: appUser } = await supabase
    .from('app_users')
    .select('role')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    role: appUser?.role || 'viewer',
  }
}

/**
 * Requires authentication. Returns 401 response if not authenticated.
 */
export async function requireAuth(): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Přístup odepřen' }, { status: 401 })
  }
  return user
}

/**
 * Requires a specific role (or higher). Returns 403 if insufficient permissions.
 */
export async function requireRole(
  ...allowedRoles: string[]
): Promise<AuthUser | NextResponse> {
  const result = await requireAuth()
  if (result instanceof NextResponse) return result

  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 })
  }
  return result
}

/**
 * Returns a safe error response that doesn't leak internal details.
 */
export function safeErrorResponse(error: unknown, status = 500): NextResponse {
  if (process.env.NODE_ENV === 'development') {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status })
  }
  return NextResponse.json({ error: GENERIC_ERROR }, { status })
}

/**
 * Escapes ilike wildcards in user input to prevent pattern injection.
 */
export function escapeIlike(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}

/**
 * Clamps a limit query parameter to a safe maximum.
 */
export function clampLimit(value: string | null, defaultVal = 50, max = 200): number {
  const parsed = parseInt(value || String(defaultVal))
  if (isNaN(parsed) || parsed < 1) return defaultVal
  return Math.min(parsed, max)
}

/**
 * Validates that a string looks like a UUID.
 */
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Validates email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Truncates a string to max length.
 */
export function truncate(str: string | undefined | null, maxLen: number): string | null {
  if (!str) return null
  return str.slice(0, maxLen)
}
