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
      postal_code,
      website,
      phone,
      email,
      type,
      notes 
    } = body;

    if (!company_name) {
      return NextResponse.json(
        { error: 'company_name is required' },
        { status: 400 }
      );
    }

    // Automatické přiřazení segmentu podle názvu
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
      .from('clients')
      .insert({
        company_name,
        ico,
        dic,
        segment_id: segmentId,
        region: region || 'Plzeňský kraj',
        city,
        address,
        postal_code,
        website,
        phone,
        email,
        type: type || 'B2B',
        notes,
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
    
    const type = searchParams.get('type');
    const segment_name = searchParams.get('segment_name');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('clients')
      .select('*, company_segments(name)');

    if (type) {
      query = query.eq('type', type);
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
