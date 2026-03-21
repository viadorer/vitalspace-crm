import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { safeErrorResponse, isValidEmail, truncate } from '@/lib/supabase/auth-guard'

/**
 * In-memory sliding window rate limiter.
 * Note: On serverless (Vercel), this is per-instance and resets on cold starts.
 * For stronger protection, use Upstash Redis or Vercel KV.
 * This still provides meaningful protection on traditional deployments
 * and some protection on serverless (warm instances).
 */
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5 // max 5 requests per minute per IP
const MAX_ENTRIES = 10_000 // prevent memory leak

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS

  // Evict stale entries periodically
  if (rateLimitMap.size > MAX_ENTRIES) {
    for (const [key, timestamps] of rateLimitMap) {
      const recent = timestamps.filter(t => t > windowStart)
      if (recent.length === 0) {
        rateLimitMap.delete(key)
      } else {
        rateLimitMap.set(key, recent)
      }
    }
  }

  const timestamps = rateLimitMap.get(ip) || []
  const recentRequests = timestamps.filter(t => t > windowStart)
  recentRequests.push(now)
  rateLimitMap.set(ip, recentRequests)

  return recentRequests.length > RATE_LIMIT_MAX
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Příliš mnoho požadavků, zkuste to později' },
        { status: 429, headers: { 'Retry-After': '60' } }
      )
    }

    const body = await request.json()
    const { company_name, contact_name, email, phone, city, region, message, source } = body

    // Validace povinných polí
    if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Název firmy je povinný' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Platný email je povinný' },
        { status: 400 }
      )
    }

    // Basic bot detection: reject if honeypot field is filled
    if (body._hp_field) {
      // Silently accept but don't process (honeypot triggered)
      return NextResponse.json({ success: true })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('prospects')
      .insert([
        {
          company_name: truncate(company_name, 255),
          city: truncate(city, 100),
          region: truncate(region, 100) || 'Ostatní',
          source: truncate(source, 50) || 'Web',
          status: 'not_contacted',
          priority: 2,
          notes: truncate(message, 2000) || null,
        },
      ])
      .select()
      .single()

    if (error) return safeErrorResponse(error)

    if (data && contact_name) {
      const safeName = String(contact_name).slice(0, 100)
      const [first_name, ...last_name_parts] = safeName.split(' ')
      await supabase.from('prospect_contacts').insert([
        {
          prospect_id: data.id,
          first_name: truncate(first_name, 50),
          last_name: truncate(last_name_parts.join(' ') || first_name, 50),
          email: truncate(email, 255),
          phone: truncate(phone, 30) || null,
          is_primary: true,
        },
      ])
    }

    // Nevracet data ven - veřejný endpoint
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead capture error:', error)
    return safeErrorResponse(error)
  }
}
