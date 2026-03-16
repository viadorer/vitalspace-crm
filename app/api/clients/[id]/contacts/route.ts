import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, safeErrorResponse, isValidUUID, truncate } from '@/lib/supabase/auth-guard';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClient();
    const body = await request.json();
    const { id: clientId } = await params;

    if (!isValidUUID(clientId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const { contacts } = body;

    if (!Array.isArray(contacts) || contacts.length === 0 || contacts.length > 50) {
      return NextResponse.json(
        { error: 'contacts musí být pole s 1-50 položkami' },
        { status: 400 }
      );
    }

    const contactsToInsert = contacts.map(contact => ({
      client_id: clientId,
      first_name: truncate(contact.first_name, 100),
      last_name: truncate(contact.last_name, 100),
      position: truncate(contact.position, 100),
      email: truncate(contact.email, 255),
      phone: truncate(contact.phone, 30),
      mobile: truncate(contact.mobile, 30),
      linkedin_url: truncate(contact.linkedin_url, 255),
      is_primary: Boolean(contact.is_primary),
      is_decision_maker: Boolean(contact.is_decision_maker),
      notes: truncate(contact.notes, 2000),
    }));

    const { data, error } = await supabase
      .from('client_contacts')
      .insert(contactsToInsert)
      .select();

    if (error) return safeErrorResponse(error);
    return NextResponse.json({ count: data.length, contacts: data });
  } catch (error) {
    return safeErrorResponse(error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const supabase = await createClient();
    const { id: clientId } = await params;

    if (!isValidUUID(clientId)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('client_contacts')
      .select('*')
      .eq('client_id', clientId)
      .order('is_primary', { ascending: false });

    if (error) return safeErrorResponse(error);
    return NextResponse.json(data);
  } catch (error) {
    return safeErrorResponse(error);
  }
}
