import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeErrorResponse, isValidEmail, truncate } from '@/lib/supabase/auth-guard'

// Simple in-memory rate limiter (per IP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Clean up stale entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
  }, 60 * 1000);
}

export async function POST(request: Request) {
  try {
    // Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Příliš mnoho požadavků, zkuste to později' },
        { status: 429 }
      );
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

    if (error) return safeErrorResponse(error);

    if (data && contact_name) {
      const safeName = String(contact_name).slice(0, 100);
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
    return safeErrorResponse(error);
  }
}
