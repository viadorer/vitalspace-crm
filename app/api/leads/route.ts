import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      company_name,
      contact_name,
      email,
      phone,
      city,
      region,
      message,
      source,
    } = body

    if (!company_name || !email) {
      return NextResponse.json(
        { error: 'Název firmy a email jsou povinné' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('prospects')
      .insert([
        {
          company_name,
          city,
          region: region || 'Ostatní',
          source: source || 'Web',
          status: 'not_contacted',
          priority: 2,
          notes: message || null,
        },
      ])
      .select()
      .single()

    if (error) throw error

    if (data && contact_name) {
      const [first_name, ...last_name_parts] = contact_name.split(' ')
      await supabase.from('prospect_contacts').insert([
        {
          prospect_id: data.id,
          first_name,
          last_name: last_name_parts.join(' ') || first_name,
          email,
          phone: phone || null,
          is_primary: true,
        },
      ])
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Lead capture error:', error)
    return NextResponse.json(
      { error: 'Chyba při zpracování poptávky' },
      { status: 500 }
    )
  }
}
