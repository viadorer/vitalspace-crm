import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import PDFDocument from 'pdfkit'
import path from 'path'

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
        deal_items(*)
      `)
      .eq('id', id)
      .single()

    if (error || !deal) {
      return NextResponse.json({ error: 'Nabídka nenalezena' }, { status: 404 })
    }

    // Připrav data pro PDF
    const customer = deal.client || deal.prospect
    const quoteData: QuoteData = {
      id: deal.id,
      deal_id: deal.id,
      quote_number: deal.deal_number || `CN-${Date.now()}`,
      items: deal.deal_items.map((item: any) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
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
      notes: deal.notes || '',
      created_at: deal.created_at,
    }

    // Vytvoř PDF
    const pdfBuffer = await generatePDF(quoteData)

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
      { error: 'Chyba při generování PDF' },
      { status: 500 }
    )
  }
}

async function generatePDF(data: QuoteData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Registrace fontů
      const fontPath = path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf')
      const fontBoldPath = path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf')
      
      doc.registerFont('Roboto', fontPath)
      doc.registerFont('Roboto-Bold', fontBoldPath)

      // Nastavení fontu
      doc.font('Roboto')

      // Header
      doc.font('Roboto-Bold').fontSize(24).text('CENOVÁ NABÍDKA', { align: 'left' })
      doc.font('Roboto').fontSize(10).fillColor('#666666')
        .text(SUPPLIER.name, { align: 'left' })
      
      doc.fontSize(10).fillColor('#666666')
        .text(data.quote_number, 500, 50, { align: 'right' })

      doc.moveDown(2)

      // Modrá linka
      doc.strokeColor('#2563eb').lineWidth(2)
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      
      doc.moveDown(1)

      // Dodavatel a Odběratel
      const startY = doc.y
      
      // Dodavatel (levá strana)
      doc.font('Roboto-Bold').fontSize(9).fillColor('#2563eb')
        .text('DODAVATEL', 50, startY)
      
      doc.font('Roboto-Bold').fontSize(11).fillColor('#000000')
        .text(SUPPLIER.name, 50, startY + 20)
      
      doc.font('Roboto').fontSize(9).fillColor('#000000')
        .text(SUPPLIER.address, 50, startY + 35)
        .text(`${SUPPLIER.postalCode} ${SUPPLIER.city}`, 50, startY + 50)
        .text(`IČO: ${SUPPLIER.ico}`, 50, startY + 75)
        .text(`DIČ: ${SUPPLIER.dic}`, 50, startY + 90)
        .text(`Tel: ${SUPPLIER.phone}`, 50, startY + 115)
        .text(`E-mail: ${SUPPLIER.email}`, 50, startY + 130)
        .text(SUPPLIER.website, 50, startY + 145)

      // Odběratel (pravá strana)
      doc.font('Roboto-Bold').fontSize(9).fillColor('#2563eb')
        .text('ODBĚRATEL', 320, startY)
      
      doc.font('Roboto-Bold').fontSize(11).fillColor('#000000')
        .text(data.customer.companyName, 320, startY + 20)
      
      let customerY = startY + 35
      if (data.customer.address) {
        doc.font('Roboto').fontSize(9).fillColor('#000000')
          .text(data.customer.address, 320, customerY)
        customerY += 15
      }
      if (data.customer.postalCode && data.customer.city) {
        doc.text(`${data.customer.postalCode} ${data.customer.city}`, 320, customerY)
        customerY += 25
      }
      if (data.customer.ico) {
        doc.text(`IČO: ${data.customer.ico}`, 320, customerY)
        customerY += 15
      }
      if (data.customer.dic) {
        doc.text(`DIČ: ${data.customer.dic}`, 320, customerY)
      }

      doc.y = Math.max(doc.y, startY + 170)
      doc.moveDown(2)

      // Metadata
      doc.strokeColor('#dcdcdc').lineWidth(0.5)
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      
      doc.moveDown(0.5)

      const metaY = doc.y
      doc.font('Roboto-Bold').fontSize(9).fillColor('#666666')
        .text('Datum vystavení:', 50, metaY)
        .text('Platnost nabídky:', 200, metaY)
        .text('Číslo nabídky:', 350, metaY)
      
      doc.font('Roboto-Bold').fontSize(9).fillColor('#000000')
        .text(new Date(data.created_at).toLocaleDateString('cs-CZ'), 50, metaY + 15)
        .text(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ'), 200, metaY + 15)
        .text(data.quote_number, 350, metaY + 15)

      doc.y = metaY + 35
      doc.strokeColor('#dcdcdc').lineWidth(0.5)
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke()
      
      doc.moveDown(1)

      // Položky nabídky
      doc.font('Roboto-Bold').fontSize(12).fillColor('#000000')
        .text('Položky nabídky', { align: 'left' })
      
      doc.moveDown(0.5)

      // Tabulka header
      const tableTop = doc.y
      const col1 = 50
      const col2 = 80
      const col3 = 380
      const col4 = 430
      const col5 = 480

      doc.font('Roboto-Bold').fontSize(8).fillColor('#505050')
        .text('#', col1, tableTop)
        .text('Název položky', col2, tableTop)
        .text('Počet', col3, tableTop)
        .text('Cena/ks', col4, tableTop)
        .text('Celkem', col5, tableTop)

      doc.moveDown(0.5)

      // Tabulka řádky
      let itemY = doc.y
      doc.font('Roboto').fontSize(9).fillColor('#1e1e1e')
      
      data.items.forEach((item, index) => {
        if (itemY > 700) {
          doc.addPage()
          itemY = 50
        }

        doc.text(String(index + 1), col1, itemY)
        doc.text(item.product_name, col2, itemY, { width: 290 })
        doc.text(String(item.quantity), col3, itemY)
        doc.text(`${item.unit_price.toLocaleString('cs-CZ')} Kč`, col4, itemY)
        doc.text(`${item.line_total.toLocaleString('cs-CZ')} Kč`, col5, itemY)
        
        itemY += 20
      })

      doc.y = itemY + 10

      // Souhrn cen
      const totalWithoutVat = data.total
      const vatAmount = Math.round(data.total * VAT_RATE * 100) / 100
      const totalWithVat = Math.round((data.total + vatAmount) * 100) / 100

      doc.font('Roboto').fontSize(9).fillColor('#3c3c3c')
        .text('Celkem bez DPH:', 400, doc.y, { align: 'right', width: 100 })
        .text(`${totalWithoutVat.toLocaleString('cs-CZ')} Kč`, 510, doc.y, { align: 'right' })
      
      doc.moveDown(0.5)
      doc.text(`DPH ${VAT_RATE * 100} %:`, 400, doc.y, { align: 'right', width: 100 })
        .text(`${vatAmount.toLocaleString('cs-CZ')} Kč`, 510, doc.y, { align: 'right' })
      
      doc.moveDown(0.5)
      doc.font('Roboto-Bold').fontSize(12).fillColor('#2563eb')
        .text('Celkem s DPH:', 400, doc.y, { align: 'right', width: 100 })
        .text(`${totalWithVat.toLocaleString('cs-CZ')} Kč`, 510, doc.y, { align: 'right' })

      doc.moveDown(2)

      // Podmínky
      doc.font('Roboto-Bold').fontSize(10).fillColor('#000000')
        .text('Podmínky nabídky')
      
      doc.moveDown(0.5)
      doc.font('Roboto').fontSize(9).fillColor('#3c3c3c')
        .text('Platební podmínky: 14 dnů od vystavení faktury')
        .text('Dodací podmínky: Dle dohody, obvykle 2–4 týdny od potvrzení objednávky')
        .text('Platnost nabídky: 30 dnů od data vystavení')
        .text('Ceny jsou uvedeny bez DPH, není-li uvedeno jinak.')
        .text('Součástí nabídky je doprava a instalace, pokud není uvedeno jinak.')
        .text('Záruční doba: dle specifikace jednotlivých produktů.')

      // Poznámky
      if (data.notes) {
        doc.moveDown(1)
        doc.font('Roboto-Bold').fontSize(10).fillColor('#000000')
          .text('Poznámky')
        doc.moveDown(0.5)
        doc.font('Roboto').fontSize(9).fillColor('#3c3c3c')
          .text(data.notes)
      }

      // Patička
      doc.fontSize(7).fillColor('#8c8c8c')
        .text(SUPPLIER.registrationNote, 50, 780, { align: 'center', width: 500 })
        .text(`${SUPPLIER.name} | ${SUPPLIER.phone} | ${SUPPLIER.email}`, 50, 790, { align: 'center', width: 500 })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
