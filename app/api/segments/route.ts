import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const name = searchParams.get('name');

    let query = supabase
      .from('company_segments')
      .select('*')
      .order('name');

    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      target_pain_point,
      recommended_approach,
      recommended_products,
      average_deal_min_czk,
      average_deal_max_czk,
      closing_time_months_min,
      closing_time_months_max,
      decision_makers,
      key_arguments,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('company_segments')
      .insert({
        name,
        target_pain_point,
        recommended_approach,
        recommended_products,
        average_deal_min_czk,
        average_deal_max_czk,
        closing_time_months_min,
        closing_time_months_max,
        decision_makers,
        key_arguments,
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
