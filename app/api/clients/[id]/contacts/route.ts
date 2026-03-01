import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const clientId = params.id;

    const { contacts } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'contacts array is required' },
        { status: 400 }
      );
    }

    const contactsToInsert = contacts.map(contact => ({
      client_id: clientId,
      first_name: contact.first_name,
      last_name: contact.last_name,
      position: contact.position,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      linkedin_url: contact.linkedin_url,
      is_primary: contact.is_primary || false,
      is_decision_maker: contact.is_decision_maker || false,
      notes: contact.notes,
    }));

    const { data, error } = await supabase
      .from('client_contacts')
      .insert(contactsToInsert)
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      count: data.length,
      contacts: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const clientId = params.id;

    const { data, error } = await supabase
      .from('client_contacts')
      .select('*')
      .eq('client_id', clientId)
      .order('is_primary', { ascending: false });

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
