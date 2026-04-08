import { NextRequest, NextResponse } from 'next/server';
import { requireAuthOrApiKey, createClientForAuth, safeErrorResponse, escapeIlike } from '@/lib/supabase/auth-guard';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthOrApiKey(request, 'crm:read');
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClientForAuth(auth);
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const searchTerm = `%${escapeIlike(query.slice(0, 100))}%`;

    const { data, error } = await supabase
      .from('prospects')
      .select('*, company_segments(name)')
      .ilike('company_name', searchTerm)
      .limit(20);

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}
