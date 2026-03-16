import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, safeErrorResponse, escapeIlike, clampLimit, truncate } from '@/lib/supabase/auth-guard';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClient();
    const body = await request.json();

    const {
      company_name, ico, dic, segment_name,
      region, city, address, website, source, priority, notes
    } = body;

    if (!company_name || typeof company_name !== 'string' || company_name.trim().length === 0) {
      return NextResponse.json({ error: 'company_name je povinný' }, { status: 400 });
    }

    if (priority !== undefined && (typeof priority !== 'number' || priority < 1 || priority > 5)) {
      return NextResponse.json({ error: 'priority musí být číslo 1-5' }, { status: 400 });
    }

    let segmentId = null;
    if (segment_name) {
      const { data: segment } = await supabase
        .from('company_segments')
        .select('id')
        .ilike('name', `%${escapeIlike(String(segment_name))}%`)
        .limit(1)
        .single();
      if (segment) segmentId = segment.id;
    }

    const { data, error } = await supabase
      .from('prospects')
      .insert({
        company_name: truncate(company_name, 255),
        ico: truncate(ico, 20),
        dic: truncate(dic, 20),
        segment_id: segmentId,
        region: truncate(region, 100) || 'Plzeňský kraj',
        city: truncate(city, 100),
        address: truncate(address, 255),
        website: truncate(website, 255),
        source: truncate(source, 50) || 'API',
        priority: priority || 3,
        notes: truncate(notes, 5000),
        status: 'not_contacted',
      })
      .select()
      .single();

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const segment_name = searchParams.get('segment_name');
    const limit = clampLimit(searchParams.get('limit'));

    let query = supabase
      .from('prospects')
      .select('*, company_segments(name)');

    if (status) {
      query = query.eq('status', status);
    }

    if (segment_name) {
      const { data: segment } = await supabase
        .from('company_segments')
        .select('id')
        .ilike('name', `%${escapeIlike(segment_name)}%`)
        .limit(1)
        .single();
      if (segment) {
        query = query.eq('segment_id', segment.id);
      }
    }

    query = query.limit(limit).order('created_at', { ascending: false });
    const { data, error } = await query;

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}
