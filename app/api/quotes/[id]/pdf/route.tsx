import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, safeErrorResponse, isValidUUID } from '@/lib/supabase/auth-guard'
import { PDFDocument, rgb, grayscale } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import fs from 'fs/promises'
import path from 'path'

const VAT_RATE = 0.21

// Brand colors — matching email template (#1e3a5f)
const BRAND = {
  primary: rgb(0.118, 0.227, 0.373),     // #1e3a5f
  primaryLight: rgb(0.118, 0.227, 0.373), // for accents
  text: rgb(0.1, 0.1, 0.1),
  textSecondary: rgb(0.42, 0.45, 0.49),   // #6b7280
  textMuted: rgb(0.61, 0.64, 0.67),       // #9ca3af
  border: rgb(0.90, 0.91, 0.92),          // #e5e7eb
  bgLight: rgb(0.97, 0.98, 0.99),         // #f8fafc
  white: rgb(1, 1, 1),
}

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
  address: 'Radyňská 463/33',
  city: 'Plzeň',
  postalCode: '326 00',
  ico: '24614068',
  dic: 'CZ24614068',
  phone: '+420 775 930 816',
  email: 'pavel.fogl@vitalspace.cz',
  website: 'www.vitalspace.cz',
  registrationNote: 'Spisová značka: C 48188 vedená u Krajského soudu v Plzni',
  contact: 'Mgr. Pavel Fogl',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params

    if (!isValidUUID(id)) {
      return NextResponse.json({ error: 'Neplatné ID' }, { status: 400 });
    }

    const supabase = await createClient()

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
      return NextResponse.json({ error: 'Nabídka nenalezena' }, { status: 404 })
    }

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

    let pdfBuffer: Buffer
    try {
      pdfBuffer = await generatePDF(quoteData)
    } catch (pdfError) {
      console.error('Error in generatePDF:', pdfError)
      return safeErrorResponse(pdfError);
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="nabidka-${quoteData.quote_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return safeErrorResponse(error);
  }
}

// ── Helper: draw rounded rectangle ──

function drawRoundedRect(
  page: any,
  x: number, y: number, w: number, h: number, r: number,
  options: { color?: any; borderColor?: any; borderWidth?: number }
) {
  // Fill
  if (options.color) {
    page.drawRectangle({ x, y, width: w, height: h, color: options.color })
  }
  // Border
  if (options.borderColor) {
    page.drawRectangle({
      x, y, width: w, height: h,
      borderColor: options.borderColor,
      borderWidth: options.borderWidth || 0.5,
    })
  }
}

// ── Helper: right-aligned text ──

function drawTextRight(page: any, text: string, rightX: number, y: number, opts: any) {
  const font = opts.font
  const size = opts.size || 9
  const width = font.widthOfTextAtSize(text, size)
  page.drawText(text, { ...opts, x: rightX - width, y, size })
}

async function generatePDF(data: QuoteData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const page = pdfDoc.addPage([595, 842])

  // Load fonts
  const fontPath = path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf')
  const fontBoldPath = path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf')
  const fontBytes = await fs.readFile(fontPath)
  const fontBoldBytes = await fs.readFile(fontBoldPath)
  const font = await pdfDoc.embedFont(fontBytes)
  const fontBold = await pdfDoc.embedFont(fontBoldBytes)

  // Load logo
  const logoPath = path.join(process.cwd(), 'public/logo-vitalspace.png')
  const logoBytes = await fs.readFile(logoPath)
  const logoImage = await pdfDoc.embedPng(logoBytes)

  const { width, height } = page.getSize()
  const marginL = 50
  const marginR = 545
  const contentWidth = marginR - marginL

  let y = height - 45

  // ═══════════════════════════════════════════
  // HEADER: Dark blue bar with logo + name
  // ═══════════════════════════════════════════

  const headerH = 60
  page.drawRectangle({
    x: 0, y: height - headerH,
    width, height: headerH,
    color: BRAND.primary,
  })

  // Logo in header
  const logoSize = 32
  page.drawImage(logoImage, {
    x: marginL,
    y: height - headerH + (headerH - logoSize) / 2,
    width: logoSize,
    height: logoSize,
  })

  // "VitalSpace" text
  page.drawText('VitalSpace', {
    x: marginL + logoSize + 12,
    y: height - headerH + (headerH - 18) / 2,
    size: 22,
    font: fontBold,
    color: BRAND.white,
  })

  // Quote number in header right
  drawTextRight(page, data.quote_number, marginR, height - headerH + (headerH - 9) / 2 + 5, {
    font, size: 10, color: rgb(0.75, 0.82, 0.90),
  })
  drawTextRight(page, 'CENOVÁ NABÍDKA', marginR, height - headerH + (headerH - 9) / 2 - 8, {
    font: fontBold, size: 9, color: rgb(0.75, 0.82, 0.90),
  })

  // ═══════════════════════════════════════════
  // DATE BAR
  // ═══════════════════════════════════════════

  y = height - headerH - 30

  const issueDate = new Date(data.created_at).toLocaleDateString('cs-CZ')
  const validDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ')

  page.drawText('Datum vystavení:', { x: marginL, y, size: 8, font, color: BRAND.textSecondary })
  page.drawText(issueDate, { x: marginL + 80, y, size: 9, font: fontBold, color: BRAND.text })

  page.drawText('Platnost do:', { x: 250, y, size: 8, font, color: BRAND.textSecondary })
  page.drawText(validDate, { x: 310, y, size: 9, font: fontBold, color: BRAND.text })

  drawTextRight(page, `Č. nabídky: ${data.quote_number}`, marginR, y, {
    font, size: 8, color: BRAND.textSecondary,
  })

  y -= 8
  page.drawLine({ start: { x: marginL, y }, end: { x: marginR, y }, thickness: 0.5, color: BRAND.border })

  // ═══════════════════════════════════════════
  // SUPPLIER & CUSTOMER CARDS
  // ═══════════════════════════════════════════

  y -= 25
  const cardTop = y
  const cardWidth = (contentWidth - 20) / 2
  const cardH = 120

  // Supplier card background
  drawRoundedRect(page, marginL, cardTop - cardH, cardWidth, cardH, 6, {
    color: BRAND.bgLight, borderColor: BRAND.border,
  })

  // Customer card background
  drawRoundedRect(page, marginL + cardWidth + 20, cardTop - cardH, cardWidth, cardH, 6, {
    color: BRAND.bgLight, borderColor: BRAND.border,
  })

  // Supplier content
  let sy = cardTop - 16
  page.drawText('DODAVATEL', { x: marginL + 14, y: sy, size: 7, font: fontBold, color: BRAND.primary })
  sy -= 16
  page.drawText(SUPPLIER.name, { x: marginL + 14, y: sy, size: 11, font: fontBold, color: BRAND.text })
  sy -= 13
  page.drawText(SUPPLIER.address, { x: marginL + 14, y: sy, size: 9, font, color: BRAND.text })
  sy -= 11
  page.drawText(`${SUPPLIER.postalCode} ${SUPPLIER.city}`, { x: marginL + 14, y: sy, size: 9, font, color: BRAND.text })
  sy -= 16
  page.drawText(`IČO: ${SUPPLIER.ico}  ·  DIČ: ${SUPPLIER.dic}`, { x: marginL + 14, y: sy, size: 8, font, color: BRAND.textSecondary })
  sy -= 13
  page.drawText(`${SUPPLIER.phone}  ·  ${SUPPLIER.email}`, { x: marginL + 14, y: sy, size: 8, font, color: BRAND.textSecondary })

  // Customer content
  const cx = marginL + cardWidth + 34
  let cy = cardTop - 16
  page.drawText('ODBĚRATEL', { x: cx, y: cy, size: 7, font: fontBold, color: BRAND.primary })
  cy -= 16
  page.drawText(data.customer.companyName || '—', { x: cx, y: cy, size: 11, font: fontBold, color: BRAND.text })
  cy -= 13
  if (data.customer.address) {
    page.drawText(data.customer.address, { x: cx, y: cy, size: 9, font, color: BRAND.text })
    cy -= 11
  }
  if (data.customer.postalCode || data.customer.city) {
    page.drawText(`${data.customer.postalCode || ''} ${data.customer.city || ''}`.trim(), { x: cx, y: cy, size: 9, font, color: BRAND.text })
    cy -= 16
  }
  if (data.customer.ico) {
    const dicPart = data.customer.dic ? `  ·  DIČ: ${data.customer.dic}` : ''
    page.drawText(`IČO: ${data.customer.ico}${dicPart}`, { x: cx, y: cy, size: 8, font, color: BRAND.textSecondary })
    cy -= 13
  }
  if (data.customer.contactPerson) {
    page.drawText(data.customer.contactPerson, { x: cx, y: cy, size: 8, font, color: BRAND.textSecondary })
    cy -= 13
  }
  if (data.customer.email || data.customer.phone) {
    const parts = [data.customer.phone, data.customer.email].filter(Boolean).join('  ·  ')
    page.drawText(parts, { x: cx, y: cy, size: 8, font, color: BRAND.textSecondary })
  }

  // ═══════════════════════════════════════════
  // ITEMS TABLE
  // ═══════════════════════════════════════════

  y = cardTop - cardH - 30

  page.drawText('POLOŽKY NABÍDKY', { x: marginL, y, size: 9, font: fontBold, color: BRAND.primary })
  y -= 18

  // Table header
  const tableHeaderH = 24
  page.drawRectangle({
    x: marginL, y: y - tableHeaderH + 12,
    width: contentWidth, height: tableHeaderH,
    color: BRAND.primary,
  })

  const thY = y - 2
  page.drawText('#', { x: marginL + 10, y: thY, size: 8, font: fontBold, color: BRAND.white })
  page.drawText('Název položky', { x: marginL + 35, y: thY, size: 8, font: fontBold, color: BRAND.white })
  page.drawText('Počet', { x: 340, y: thY, size: 8, font: fontBold, color: BRAND.white })
  drawTextRight(page, 'Cena/ks', 450, thY, { font: fontBold, size: 8, color: BRAND.white })
  drawTextRight(page, 'Celkem', marginR - 10, thY, { font: fontBold, size: 8, color: BRAND.white })

  y -= tableHeaderH + 2

  // Table rows
  data.items.forEach((item, index) => {
    const rowH = 22
    // Alternating row background
    if (index % 2 === 0) {
      page.drawRectangle({
        x: marginL, y: y - rowH + 15,
        width: contentWidth, height: rowH,
        color: BRAND.bgLight,
      })
    }

    const rowY = y
    page.drawText(String(index + 1), { x: marginL + 10, y: rowY, size: 9, font, color: BRAND.textSecondary })
    page.drawText(item.product_name.substring(0, 40), { x: marginL + 35, y: rowY, size: 9, font, color: BRAND.text })
    page.drawText(String(item.quantity), { x: 345, y: rowY, size: 9, font, color: BRAND.text })
    drawTextRight(page, `${item.unit_price.toLocaleString('cs-CZ')} Kč`, 450, rowY, { font, size: 9, color: BRAND.text })
    drawTextRight(page, `${item.line_total.toLocaleString('cs-CZ')} Kč`, marginR - 10, rowY, { font: fontBold, size: 9, color: BRAND.text })

    y -= rowH
  })

  // Bottom line of table
  y -= 2
  page.drawLine({ start: { x: marginL, y }, end: { x: marginR, y }, thickness: 0.5, color: BRAND.border })

  // ═══════════════════════════════════════════
  // FINANCIAL SUMMARY
  // ═══════════════════════════════════════════

  y -= 20
  const totalWithoutVat = data.total
  const vatAmount = Math.round(data.total * VAT_RATE * 100) / 100
  const totalWithVat = Math.round((data.total + vatAmount) * 100) / 100

  // Summary box
  const summaryW = 220
  const summaryX = marginR - summaryW
  const summaryH = 70

  drawRoundedRect(page, summaryX, y - summaryH + 15, summaryW, summaryH, 4, {
    color: BRAND.bgLight, borderColor: BRAND.border,
  })

  const sumRowY = y
  page.drawText('Celkem bez DPH:', { x: summaryX + 12, y: sumRowY, size: 9, font, color: BRAND.textSecondary })
  drawTextRight(page, `${totalWithoutVat.toLocaleString('cs-CZ')} Kč`, marginR - 12, sumRowY, {
    font, size: 9, color: BRAND.text,
  })

  page.drawText(`DPH ${VAT_RATE * 100} %:`, { x: summaryX + 12, y: sumRowY - 15, size: 9, font, color: BRAND.textSecondary })
  drawTextRight(page, `${vatAmount.toLocaleString('cs-CZ')} Kč`, marginR - 12, sumRowY - 15, {
    font, size: 9, color: BRAND.text,
  })

  // Separator in summary
  page.drawLine({
    start: { x: summaryX + 12, y: sumRowY - 28 },
    end: { x: marginR - 12, y: sumRowY - 28 },
    thickness: 0.5, color: BRAND.border,
  })

  // Total with VAT — prominent
  page.drawText('CELKEM S DPH:', { x: summaryX + 12, y: sumRowY - 42, size: 10, font: fontBold, color: BRAND.primary })
  drawTextRight(page, `${totalWithVat.toLocaleString('cs-CZ')} Kč`, marginR - 12, sumRowY - 42, {
    font: fontBold, size: 12, color: BRAND.primary,
  })

  // ═══════════════════════════════════════════
  // CONDITIONS
  // ═══════════════════════════════════════════

  y = y - summaryH - 15

  page.drawText('PODMÍNKY NABÍDKY', { x: marginL, y, size: 9, font: fontBold, color: BRAND.primary })
  y -= 5
  page.drawLine({ start: { x: marginL, y }, end: { x: marginL + 120, y }, thickness: 1.5, color: BRAND.primary })
  y -= 16

  const conditions = [
    ['Platební podmínky:', '14 dnů od vystavení faktury'],
    ['Dodací podmínky:', 'dle dohody, obvykle 2–4 týdny'],
    ['Platnost nabídky:', '30 dnů od data vystavení'],
    ['Ceny:', 'uvedeny bez DPH, není-li uvedeno jinak'],
    ['Doprava a instalace:', 'zahrnuta v ceně'],
    ['Záruční doba:', 'dle specifikace jednotlivých produktů'],
  ]

  conditions.forEach(([label, value]) => {
    page.drawText(label, { x: marginL, y, size: 8, font: fontBold, color: BRAND.textSecondary })
    page.drawText(value, { x: marginL + 100, y, size: 8, font, color: BRAND.text })
    y -= 13
  })

  // Notes
  if (data.notes) {
    y -= 10
    page.drawText('POZNÁMKY', { x: marginL, y, size: 9, font: fontBold, color: BRAND.primary })
    y -= 15
    page.drawText(data.notes.substring(0, 200), { x: marginL, y, size: 9, font, color: BRAND.text })
  }

  // ═══════════════════════════════════════════
  // FOOTER — matching email style
  // ═══════════════════════════════════════════

  const footerY = 50
  page.drawLine({ start: { x: marginL, y: footerY }, end: { x: marginR, y: footerY }, thickness: 0.5, color: BRAND.border })

  // Small logo in footer
  const fLogoSize = 14
  page.drawImage(logoImage, {
    x: marginL,
    y: footerY - 20,
    width: fLogoSize,
    height: fLogoSize,
  })

  page.drawText(SUPPLIER.name, {
    x: marginL + fLogoSize + 6,
    y: footerY - 14,
    size: 8, font: fontBold, color: BRAND.primary,
  })

  page.drawText(`${SUPPLIER.contact}  ·  ${SUPPLIER.phone}  ·  ${SUPPLIER.email}`, {
    x: marginL + fLogoSize + 6,
    y: footerY - 24,
    size: 7, font, color: BRAND.textMuted,
  })

  page.drawText(`${SUPPLIER.address}, ${SUPPLIER.postalCode} ${SUPPLIER.city}  ·  IČO: ${SUPPLIER.ico}`, {
    x: marginL,
    y: footerY - 36,
    size: 7, font, color: BRAND.textMuted,
  })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
