import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id: clientId } = await params;

    const updates: any = {};
    
    if (body.company_name !== undefined) updates.company_name = body.company_name;
    if (body.ico !== undefined) updates.ico = body.ico;
    if (body.dic !== undefined) updates.dic = body.dic;
    if (body.region !== undefined) updates.region = body.region;
    if (body.city !== undefined) updates.city = body.city;
    if (body.address !== undefined) updates.address = body.address;
    if (body.postal_code !== undefined) updates.postal_code = body.postal_code;
    if (body.website !== undefined) updates.website = body.website;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.email !== undefined) updates.email = body.email;
    if (body.type !== undefined) updates.type = body.type;
    if (body.notes !== undefined) updates.notes = body.notes;

    // Automatické přiřazení segmentu podle názvu
    if (body.segment_name) {
      const { data: segment } = await supabase
        .from('company_segments')
        .select('id')
        .ilike('name', `%${body.segment_name}%`)
        .limit(1)
        .single();
      
      if (segment) updates.segment_id = segment.id;
    }

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: clientId } = await params;

    const { data, error } = await supabase
      .from('clients')
      .select('*, company_segments(name)')
      .eq('id', clientId)
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
