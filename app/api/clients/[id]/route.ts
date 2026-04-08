import { NextRequest, NextResponse } from 'next/server';
import { requireAuthOrApiKey, createClientForAuth, safeErrorResponse, escapeIlike, isValidUUID, truncate } from '@/lib/supabase/auth-guard';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:write');
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClientForAuth(auth);
    const body = await request.json();
    const { id: clientId } = await params;

    if (!isValidUUID(clientId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (body.company_name !== undefined) updates.company_name = truncate(body.company_name, 255);
    if (body.ico !== undefined) updates.ico = truncate(body.ico, 20);
    if (body.dic !== undefined) updates.dic = truncate(body.dic, 20);
    if (body.region !== undefined) updates.region = truncate(body.region, 100);
    if (body.city !== undefined) updates.city = truncate(body.city, 100);
    if (body.address !== undefined) updates.address = truncate(body.address, 255);
    if (body.postal_code !== undefined) updates.postal_code = truncate(body.postal_code, 10);
    if (body.website !== undefined) updates.website = truncate(body.website, 255);
    if (body.phone !== undefined) updates.phone = truncate(body.phone, 30);
    if (body.email !== undefined) updates.email = truncate(body.email, 255);
    if (body.type !== undefined) updates.type = body.type;
    if (body.notes !== undefined) updates.notes = truncate(body.notes, 5000);

    if (body.segment_name) {
      const { data: segment } = await supabase
        .from('company_segments')
        .select('id')
        .ilike('name', `%${escapeIlike(String(body.segment_name))}%`)
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

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:read');
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClientForAuth(auth);
    const { id: clientId } = await params;

    if (!isValidUUID(clientId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*, company_segments(name)')
      .eq('id', clientId)
      .single();

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}
