import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: prospectId } = await params

    // Načíst prospect s kontakty
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select(`
        *,
        prospect_contacts(*)
      `)
      .eq('id', prospectId)
      .single()

    if (prospectError || !prospect) {
      return NextResponse.json(
        { error: 'Prospect nenalezen' },
        { status: 404 }
      )
    }

    // Zkontrolovat, zda už není klient
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('prospect_id', prospectId)
      .single()

    if (existingClient) {
      return NextResponse.json(
        { error: 'Tento prospect je již klientem', clientId: existingClient.id },
        { status: 400 }
      )
    }

    // Vytvořit klienta - převést všechna data z prospectu
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        prospect_id: prospectId,
        company_name: prospect.company_name,
        type: 'B2B',
        ico: prospect.ico,
        dic: prospect.dic,
        segment_id: prospect.segment_id,
        region: prospect.region,
        city: prospect.city,
        address: prospect.address,
        website: prospect.website,
        employees_count_est: prospect.employees_count_est,
        estimated_floor_area_m2: prospect.estimated_floor_area_m2,
        source: prospect.source,
        notes: prospect.notes,
        assigned_consultant: prospect.assigned_consultant,
        billing_address: prospect.address ? {
          street: prospect.address,
          city: prospect.city || '',
          zip: '',
          country: 'CZ'
        } : null,
        delivery_address: null,
        payment_terms_days: 14
      })
      .select()
      .single()

    if (clientError) {
      return NextResponse.json(
        { error: 'Chyba při vytváření klienta', details: clientError.message },
        { status: 500 }
      )
    }

    // Převést prospect_contacts na client_contacts
    if (prospect.prospect_contacts && prospect.prospect_contacts.length > 0) {
      const clientContacts = prospect.prospect_contacts.map((contact: any) => ({
        client_id: client.id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        position: contact.position,
        email: contact.email,
        phone: contact.phone,
        is_primary: contact.is_decision_maker || false
      }))

      const { error: contactsError } = await supabase
        .from('client_contacts')
        .insert(clientContacts)

      if (contactsError) {
        console.error('Chyba při převodu kontaktů:', contactsError)
      }
    }

    // Aktualizovat status prospectu
    await supabase
      .from('prospects')
      .update({ status: 'qualified' })
      .eq('id', prospectId)

    return NextResponse.json({
      success: true,
      client,
      message: 'Prospect úspěšně převeden na klienta'
    })

  } catch (error) {
    console.error('Chyba při konverzi:', error)
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    )
  }
}
