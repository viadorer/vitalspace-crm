import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer'

const VAT_RATE = 0.21

interface QuoteData {
  id: string
  deal_id: string
  quote_number: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    line_total: number
  }>
  total: number
  customer: {
    companyName: string
    address?: string
    city?: string
    postalCode?: string
    ico?: string
    dic?: string
    contactPerson?: string
    email?: string
    phone?: string
  }
  notes?: string
  created_at: string
}

const SUPPLIER = {
  name: 'VitalSpace s.r.o.',
  address: 'Klatovská 123',
  city: 'Plzeň',
  postalCode: '301 00',
  ico: '12345678',
  dic: 'CZ12345678',
  phone: '+420 777 888 999',
  email: 'info@vitalspace.cz',
  website: 'www.vitalspace.cz',
  registrationNote: 'Zapsána v obchodním rejstříku vedeném Krajským soudem v Plzni, oddíl C, vložka 12345',
  bankAccount: '123456789/0100',
  bankName: 'Komerční banka',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Načti data nabídky z databáze
    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        client:clients(*),
        prospect:prospects(*),
        deal_items(*, product:products(name))
      `)
      .eq('id', id)
      .single()

    if (error || !deal) {
      console.error('Error loading deal:', error)
      return NextResponse.json({ error: 'Nabídka nenalezena', details: error?.message }, { status: 404 })
    }

    // Připrav data pro PDF
    const customer = deal.client || deal.prospect
    const quoteData: QuoteData = {
      id: deal.id,
      deal_id: deal.id,
      quote_number: deal.deal_number || `CN-${Date.now()}`,
      items: (deal.deal_items || []).map((item: any) => ({
        product_name: item.product?.name || 'Neznámý produkt',
        quantity: item.quantity || 1,
        unit_price: item.unit_price_czk || 0,
        line_total: item.line_total_czk || 0,
      })),
      total: deal.total_value_czk || 0,
      customer: {
        companyName: customer?.company_name || '',
        address: customer?.address || '',
        city: customer?.city || '',
        postalCode: customer?.postal_code || '',
        ico: customer?.ico || '',
        dic: customer?.dic || '',
        contactPerson: customer?.contact_person || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
      },
      notes: '',
      created_at: deal.created_at,
    }

    // Vytvoř PDF
    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generatePDF(quoteData)
    } catch (pdfError) {
      console.error('Error in generatePDF:', pdfError)
      return NextResponse.json(
        { 
          error: 'Chyba při generování PDF', 
          details: pdfError instanceof Error ? pdfError.message : String(pdfError),
          stack: pdfError instanceof Error ? pdfError.stack : undefined
        },
        { status: 500 }
      )
    }

    // Vrať PDF jako response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nabidka-${quoteData.quote_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { 
        error: 'Chyba při generování PDF',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 20,
  },
  quoteNumber: {
    position: 'absolute',
    right: 50,
    top: 50,
    fontSize: 10,
    color: '#666666',
  },
  blueLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 9,
    marginBottom: 3,
  },
  grayLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#dcdcdc',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666666',
  },
  metaValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    paddingBottom: 5,
    marginBottom: 10,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#505050',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    fontSize: 9,
  },
  col1: { width: '5%' },
  col2: { width: '50%' },
  col3: { width: '15%' },
  col4: { width: '15%' },
  col5: { width: '15%' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    fontSize: 9,
  },
  totalLabel: {
    width: 120,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
  },
  totalFinal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  conditions: {
    marginTop: 20,
  },
  conditionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  conditionText: {
    fontSize: 9,
    color: '#3c3c3c',
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 7,
    color: '#8c8c8c',
    textAlign: 'center',
  },
})

const QuotePDF = ({ data }: { data: QuoteData }) => {
  const totalWithoutVat = data.total
  const vatAmount = Math.round(data.total * VAT_RATE * 100) / 100
  const totalWithVat = Math.round((data.total + vatAmount) * 100) / 100

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>CENOVÁ NABÍDKA</Text>
        <Text style={styles.subheader}>{SUPPLIER.name}</Text>
        <Text style={styles.quoteNumber}>{data.quote_number}</Text>
        
        <View style={styles.blueLine} />
        
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>DODAVATEL</Text>
            <Text style={styles.companyName}>{SUPPLIER.name}</Text>
            <Text style={styles.text}>{SUPPLIER.address}</Text>
            <Text style={styles.text}>{SUPPLIER.postalCode} {SUPPLIER.city}</Text>
            <Text style={styles.text}>IČO: {SUPPLIER.ico}</Text>
            <Text style={styles.text}>DIČ: {SUPPLIER.dic}</Text>
            <Text style={styles.text}>Tel: {SUPPLIER.phone}</Text>
            <Text style={styles.text}>E-mail: {SUPPLIER.email}</Text>
            <Text style={styles.text}>{SUPPLIER.website}</Text>
          </View>
          
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>ODBĚRATEL</Text>
            <Text style={styles.companyName}>{data.customer.companyName}</Text>
            {data.customer.address && <Text style={styles.text}>{data.customer.address}</Text>}
            {data.customer.postalCode && data.customer.city && (
              <Text style={styles.text}>{data.customer.postalCode} {data.customer.city}</Text>
            )}
            {data.customer.ico && <Text style={styles.text}>IČO: {data.customer.ico}</Text>}
            {data.customer.dic && <Text style={styles.text}>DIČ: {data.customer.dic}</Text>}
          </View>
        </View>
        
        <View style={styles.grayLine} />
        
        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Datum vystavení:</Text>
            <Text style={styles.metaValue}>{new Date(data.created_at).toLocaleDateString('cs-CZ')}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Platnost nabídky:</Text>
            <Text style={styles.metaValue}>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ')}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Číslo nabídky:</Text>
            <Text style={styles.metaValue}>{data.quote_number}</Text>
          </View>
        </View>
        
        <View style={styles.grayLine} />
        
        <Text style={styles.conditionTitle}>Položky nabídky</Text>
        
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>#</Text>
          <Text style={styles.col2}>Název položky</Text>
          <Text style={styles.col3}>Počet</Text>
          <Text style={styles.col4}>Cena/ks</Text>
          <Text style={styles.col5}>Celkem</Text>
        </View>
        
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.col1}>{index + 1}</Text>
            <Text style={styles.col2}>{item.product_name}</Text>
            <Text style={styles.col3}>{item.quantity}</Text>
            <Text style={styles.col4}>{item.unit_price.toLocaleString('cs-CZ')} Kč</Text>
            <Text style={styles.col5}>{item.line_total.toLocaleString('cs-CZ')} Kč</Text>
          </View>
        ))}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Celkem bez DPH:</Text>
          <Text style={styles.totalValue}>{totalWithoutVat.toLocaleString('cs-CZ')} Kč</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>DPH {VAT_RATE * 100} %:</Text>
          <Text style={styles.totalValue}>{vatAmount.toLocaleString('cs-CZ')} Kč</Text>
        </View>
        
        <View style={[styles.totalRow, styles.totalFinal]}>
          <Text style={styles.totalLabel}>Celkem s DPH:</Text>
          <Text style={styles.totalValue}>{totalWithVat.toLocaleString('cs-CZ')} Kč</Text>
        </View>
        
        <View style={styles.conditions}>
          <Text style={styles.conditionTitle}>Podmínky nabídky</Text>
          <Text style={styles.conditionText}>Platební podmínky: 14 dnů od vystavení faktury</Text>
          <Text style={styles.conditionText}>Dodací podmínky: Dle dohody, obvykle 2–4 týdny od potvrzení objednávky</Text>
          <Text style={styles.conditionText}>Platnost nabídky: 30 dnů od data vystavení</Text>
          <Text style={styles.conditionText}>Ceny jsou uvedeny bez DPH, není-li uvedeno jinak.</Text>
          <Text style={styles.conditionText}>Součástí nabídky je doprava a instalace, pokud není uvedeno jinak.</Text>
          <Text style={styles.conditionText}>Záruční doba: dle specifikace jednotlivých produktů.</Text>
        </View>
        
        {data.notes && (
          <View style={styles.conditions}>
            <Text style={styles.conditionTitle}>Poznámky</Text>
            <Text style={styles.conditionText}>{data.notes}</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <Text>{SUPPLIER.registrationNote}</Text>
          <Text>{SUPPLIER.name} | {SUPPLIER.phone} | {SUPPLIER.email}</Text>
        </View>
      </Page>
    </Document>
  )
}

async function generatePDF(data: QuoteData): Promise<Buffer> {
  const doc = <QuotePDF data={data} />
  const asPdf = pdf(doc)
  const blob = await asPdf.toBlob()
  const arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
