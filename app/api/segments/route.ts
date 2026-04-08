import { NextRequest, NextResponse } from 'next/server';
import { requireAuthOrApiKey, createClientForAuth, safeErrorResponse, escapeIlike, truncate } from '@/lib/supabase/auth-guard';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:read');
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClientForAuth(auth);
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name');

    let query = supabase
      .from('company_segments')
      .select('*')
      .order('name');

    if (name) {
      query = query.ilike('name', `%${escapeIlike(name)}%`);
    }

    const { data, error } = await query;

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:write');
    if (auth instanceof NextResponse) return auth;
    // Session users must additionally hold an admin role; API keys with
    // `crm:write` are trusted backend actors and bypass the role check.
    if (auth.kind === 'user' && !['superadmin', 'admin'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 });
    }

    const supabase = await createClientForAuth(auth);
    const body = await request.json();

    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'name je povinný' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('company_segments')
      .insert({
        name: truncate(name, 100),
        target_pain_point: truncate(body.target_pain_point, 2000),
        recommended_approach: truncate(body.recommended_approach, 2000),
        recommended_products: body.recommended_products,
        average_deal_min_czk: body.average_deal_min_czk,
        average_deal_max_czk: body.average_deal_max_czk,
        closing_time_months_min: body.closing_time_months_min,
        closing_time_months_max: body.closing_time_months_max,
        decision_makers: body.decision_makers,
        key_arguments: body.key_arguments,
      })
      .select()
      .single();

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}
