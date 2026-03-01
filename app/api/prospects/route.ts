import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { 
      company_name, 
      ico, 
      dic, 
      segment_name,
      region, 
      city, 
      address, 
      website,
      source,
      priority,
      notes 
    } = body;

    if (!company_name) {
      return NextResponse.json(
        { error: 'company_name is required' },
        { status: 400 }
      );
    }

    let segmentId = null;
    if (segment_name) {
      const { data: segment } = await supabase
        .from('company_segments')
        .select('id')
        .ilike('name', `%${segment_name}%`)
        .limit(1)
        .single();
      
      if (segment) segmentId = segment.id;
    }

    const { data, error } = await supabase
      .from('prospects')
      .insert({
        company_name,
        ico,
        dic,
        segment_id: segmentId,
        region: region || 'Plzeňský kraj',
        city,
        address,
        website,
        source: source || 'API',
        priority: priority || 3,
        notes,
        status: 'not_contacted',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const segment_name = searchParams.get('segment_name');
    const limit = parseInt(searchParams.get('limit') || '50');

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
        .ilike('name', `%${segment_name}%`)
        .limit(1)
        .single();
      
      if (segment) {
        query = query.eq('segment_id', segment.id);
      }
    }

    query = query.limit(limit).order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
