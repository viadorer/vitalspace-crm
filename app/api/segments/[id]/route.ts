import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: segmentId } = await params;

    const { data, error } = await supabase
      .from('company_segments')
      .select('*')
      .eq('id', segmentId)
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id: segmentId } = await params;

    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.target_pain_point !== undefined) updates.target_pain_point = body.target_pain_point;
    if (body.recommended_approach !== undefined) updates.recommended_approach = body.recommended_approach;
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: segmentId } = await params;

    const { error } = await supabase
      .from('company_segments')
      .delete()
      .eq('id', segmentId);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
