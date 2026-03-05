import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs/promises'
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

async function generatePDF(data: QuoteData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  
  const page = pdfDoc.addPage([595, 842])
  
  const fontPath = path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf')
  const fontBoldPath = path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf')
  const fontBytes = await fs.readFile(fontPath)
  const fontBoldBytes = await fs.readFile(fontBoldPath)
  
  const font = await pdfDoc.embedFont(fontBytes)
  const fontBold = await pdfDoc.embedFont(fontBoldBytes)
  
  const { width, height } = page.getSize()
  let y = height - 50
  
  page.drawText('CENOVÁ NABÍDKA', { x: 50, y, size: 24, font: fontBold })
  y -= 15
  page.drawText(SUPPLIER.name, { x: 50, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
  page.drawText(data.quote_number, { x: 500, y: height - 50, size: 10, font, color: rgb(0.4, 0.4, 0.4) })
  
  y -= 30
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 2, color: rgb(0.15, 0.39, 0.92) })
  
  y -= 30
  const startY = y
  
  page.drawText('DODAVATEL', { x: 50, y, size: 9, font: fontBold, color: rgb(0.15, 0.39, 0.92) })
  y -= 15
  page.drawText(SUPPLIER.name, { x: 50, y, size: 11, font: fontBold })
  y -= 12
  page.drawText(SUPPLIER.address, { x: 50, y, size: 9, font })
  y -= 12
  page.drawText(`${SUPPLIER.postalCode} ${SUPPLIER.city}`, { x: 50, y, size: 9, font })
  y -= 20
  page.drawText(`IČO: ${SUPPLIER.ico}`, { x: 50, y, size: 9, font })
  y -= 12
  page.drawText(`DIČ: ${SUPPLIER.dic}`, { x: 50, y, size: 9, font })
  y -= 20
  page.drawText(`Tel: ${SUPPLIER.phone}`, { x: 50, y, size: 9, font })
  y -= 12
  page.drawText(`E-mail: ${SUPPLIER.email}`, { x: 50, y, size: 9, font })
  y -= 12
  page.drawText(SUPPLIER.website, { x: 50, y, size: 9, font })
  
  let customerY = startY
  page.drawText('ODBĚRATEL', { x: 320, y: customerY, size: 9, font: fontBold, color: rgb(0.15, 0.39, 0.92) })
  customerY -= 15
  page.drawText(data.customer.companyName, { x: 320, y: customerY, size: 11, font: fontBold })
  customerY -= 12
  if (data.customer.address) {
    page.drawText(data.customer.address, { x: 320, y: customerY, size: 9, font })
    customerY -= 12
  }
  if (data.customer.postalCode && data.customer.city) {
    page.drawText(`${data.customer.postalCode} ${data.customer.city}`, { x: 320, y: customerY, size: 9, font })
    customerY -= 20
  }
  if (data.customer.ico) {
    page.drawText(`IČO: ${data.customer.ico}`, { x: 320, y: customerY, size: 9, font })
    customerY -= 12
  }
  if (data.customer.dic) {
    page.drawText(`DIČ: ${data.customer.dic}`, { x: 320, y: customerY, size: 9, font })
  }
  
  y = Math.min(y, customerY) - 30
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 0.5, color: rgb(0.86, 0.86, 0.86) })
  
  y -= 20
  const metaY = y
  page.drawText('Datum vystavení:', { x: 50, y: metaY, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) })
  page.drawText('Platnost nabídky:', { x: 200, y: metaY, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) })
  page.drawText('Číslo nabídky:', { x: 350, y: metaY, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) })
  
  y -= 12
  page.drawText(new Date(data.created_at).toLocaleDateString('cs-CZ'), { x: 50, y, size: 9, font: fontBold })
  page.drawText(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ'), { x: 200, y, size: 9, font: fontBold })
  page.drawText(data.quote_number, { x: 350, y, size: 9, font: fontBold })
  
  y -= 20
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 0.5, color: rgb(0.86, 0.86, 0.86) })
  
  y -= 25
  page.drawText('Položky nabídky', { x: 50, y, size: 12, font: fontBold })
  
  y -= 20
  page.drawText('#', { x: 50, y, size: 8, font: fontBold, color: rgb(0.31, 0.31, 0.31) })
  page.drawText('Název položky', { x: 80, y, size: 8, font: fontBold, color: rgb(0.31, 0.31, 0.31) })
  page.drawText('Počet', { x: 380, y, size: 8, font: fontBold, color: rgb(0.31, 0.31, 0.31) })
  page.drawText('Cena/ks', { x: 430, y, size: 8, font: fontBold, color: rgb(0.31, 0.31, 0.31) })
  page.drawText('Celkem', { x: 480, y, size: 8, font: fontBold, color: rgb(0.31, 0.31, 0.31) })
  
  y -= 15
  
  data.items.forEach((item, index) => {
    page.drawText(String(index + 1), { x: 50, y, size: 9, font })
    page.drawText(item.product_name.substring(0, 40), { x: 80, y, size: 9, font })
    page.drawText(String(item.quantity), { x: 380, y, size: 9, font })
    page.drawText(`${item.unit_price.toLocaleString('cs-CZ')} Kč`, { x: 430, y, size: 9, font })
    page.drawText(`${item.line_total.toLocaleString('cs-CZ')} Kč`, { x: 480, y, size: 9, font })
    y -= 15
  })
  
  y -= 20
  const totalWithoutVat = data.total
  const vatAmount = Math.round(data.total * VAT_RATE * 100) / 100
  const totalWithVat = Math.round((data.total + vatAmount) * 100) / 100
  
  page.drawText('Celkem bez DPH:', { x: 400, y, size: 9, font })
  page.drawText(`${totalWithoutVat.toLocaleString('cs-CZ')} Kč`, { x: 510, y, size: 9, font })
  y -= 12
  page.drawText(`DPH ${VAT_RATE * 100} %:`, { x: 400, y, size: 9, font })
  page.drawText(`${vatAmount.toLocaleString('cs-CZ')} Kč`, { x: 510, y, size: 9, font })
  y -= 15
  page.drawText('Celkem s DPH:', { x: 400, y, size: 12, font: fontBold, color: rgb(0.15, 0.39, 0.92) })
  page.drawText(`${totalWithVat.toLocaleString('cs-CZ')} Kč`, { x: 510, y, size: 12, font: fontBold, color: rgb(0.15, 0.39, 0.92) })
  
  y -= 30
  page.drawText('Podmínky nabídky', { x: 50, y, size: 10, font: fontBold })
  y -= 15
  page.drawText('Platební podmínky: 14 dnů od vystavení faktury', { x: 50, y, size: 9, font, color: rgb(0.24, 0.24, 0.24) })
  y -= 12
  page.drawText('Dodací podmínky: Dle dohody, obvykle 2-4 týdny od potvrzení objednávky', { x: 50, y, size: 9, font, color: rgb(0.24, 0.24, 0.24) })
  y -= 12
  page.drawText('Platnost nabídky: 30 dnů od data vystavení', { x: 50, y, size: 9, font, color: rgb(0.24, 0.24, 0.24) })
  y -= 12
  page.drawText('Ceny jsou uvedeny bez DPH, není-li uvedeno jinak.', { x: 50, y, size: 9, font, color: rgb(0.24, 0.24, 0.24) })
  y -= 12
  page.drawText('Součástí nabídky je doprava a instalace, pokud není uvedeno jinak.', { x: 50, y, size: 9, font, color: rgb(0.24, 0.24, 0.24) })
  y -= 12
  page.drawText('Záruční doba: dle specifikace jednotlivých produktů.', { x: 50, y, size: 9, font, color: rgb(0.24, 0.24, 0.24) })
  
  if (data.notes) {
    y -= 20
    page.drawText('Poznámky', { x: 50, y, size: 10, font: fontBold })
    y -= 15
    page.drawText(data.notes.substring(0, 100), { x: 50, y, size: 9, font, color: rgb(0.24, 0.24, 0.24) })
  }
  
  page.drawText(SUPPLIER.registrationNote.substring(0, 80), { x: 50, y: 40, size: 7, font, color: rgb(0.55, 0.55, 0.55) })
  page.drawText(`${SUPPLIER.name} | ${SUPPLIER.phone} | ${SUPPLIER.email}`, { x: 50, y: 30, size: 7, font, color: rgb(0.55, 0.55, 0.55) })
  
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
