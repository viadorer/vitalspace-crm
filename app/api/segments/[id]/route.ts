import { NextRequest, NextResponse } from 'next/server';
import { requireAuthOrApiKey, createClientForAuth, safeErrorResponse, isValidUUID, truncate } from '@/lib/supabase/auth-guard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:read');
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClientForAuth(auth);
    const { id: segmentId } = await params;

    if (!isValidUUID(segmentId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('company_segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:write');
    if (auth instanceof NextResponse) return auth;
    if (auth.kind === 'user' && !['superadmin', 'admin'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 });
    }

    const supabase = await createClientForAuth(auth);
    const body = await request.json();
    const { id: segmentId } = await params;

    if (!isValidUUID(segmentId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const updates: Record<string, any> = {};

    if (body.name !== undefined) updates.name = truncate(body.name, 100);
    if (body.target_pain_point !== undefined) updates.target_pain_point = truncate(body.target_pain_point, 2000);
    if (body.recommended_approach !== undefined) updates.recommended_approach = truncate(body.recommended_approach, 2000);
    if (body.recommended_products !== undefined) updates.recommended_products = body.recommended_products;
    if (body.average_deal_min_czk !== undefined) updates.average_deal_min_czk = body.average_deal_min_czk;
    if (body.average_deal_max_czk !== undefined) updates.average_deal_max_czk = body.average_deal_max_czk;
    if (body.closing_time_months_min !== undefined) updates.closing_time_months_min = body.closing_time_months_min;
    if (body.closing_time_months_max !== undefined) updates.closing_time_months_max = body.closing_time_months_max;
    if (body.decision_makers !== undefined) updates.decision_makers = body.decision_makers;
    if (body.key_arguments !== undefined) updates.key_arguments = body.key_arguments;

    const { data, error } = await supabase
      .from('company_segments')
      .update(updates)
      .eq('id', segmentId)
      .select()
      .single();

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:write');
    if (auth instanceof NextResponse) return auth;
    if (auth.kind === 'user' && !['superadmin', 'admin'].includes(auth.user.role)) {
      return NextResponse.json({ error: 'Nedostatečná oprávnění' }, { status: 403 });
    }

    const supabase = await createClientForAuth(auth);
    const { id: segmentId } = await params;

    if (!isValidUUID(segmentId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('company_segments')
      .delete()
      .eq('id', segmentId);

    if (error) return safeErrorResponse(error);
    return NextResponse.json({ success: true });
  } catch (error) {
    return safeErrorResponse(error);
  }
}
