import jsPDF from 'jspdf'
import type { QuoteItem } from '@/components/crm/QuoteCalculator'

const VAT_RATE = 0.21
const DEFAULT_VALIDITY_DAYS = 30

interface CompanyInfo {
  name: string
  address: string
  city: string
  postalCode: string
  ico: string
  dic: string
  bankAccount?: string
  bankName?: string
  phone?: string
  email?: string
  website?: string
  registrationNote: string
}

interface CustomerInfo {
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

interface QuotePdfOptions {
  items: QuoteItem[]
  total: number
  customer: CustomerInfo
  quoteNumber?: string
  validityDays?: number
  notes?: string
  paymentTerms?: string
  deliveryTerms?: string
}

const SUPPLIER: CompanyInfo = {
  name: 'VitalSpace s.r.o.',
  address: 'Klatovská 123',
  city: 'Plzeň',
  postalCode: '301 00',
  ico: '12345678',
  dic: 'CZ12345678',
  bankAccount: '123456789/0100',
  bankName: 'Komerční banka',
  phone: '+420 777 888 999',
  email: 'info@vitalspace.cz',
  website: 'www.vitalspace.cz',
  registrationNote: 'Společnost zapsaná v obchodním rejstříku vedeném Krajským soudem v Plzni, oddíl C, vložka 12345',
}

function generateQuoteNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `CN-${year}${month}${day}-${random}`
}

function formatCurrencyPdf(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' Kč'
}

function formatDatePdf(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function generateQuotePdf(options: QuotePdfOptions): void {
  const {
    items,
    total,
    customer,
    quoteNumber = generateQuoteNumber(),
    validityDays = DEFAULT_VALIDITY_DAYS,
    notes,
    paymentTerms = '14 dnů od vystavení faktury',
    deliveryTerms = 'Dle dohody, obvykle 2–4 týdny od potvrzení objednávky',
  } = options

  const issueDate = new Date()
  const validUntil = new Date(issueDate.getTime() + validityDays * 24 * 60 * 60 * 1000)

  const totalWithoutVat = total
  const vatAmount = Math.round(total * VAT_RATE * 100) / 100
  const totalWithVat = Math.round((total + vatAmount) * 100) / 100

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let y = 20

  // ============================================================
  // HEADER
  // ============================================================
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('CENOVÁ NABÍDKA', margin, y)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(quoteNumber, pageWidth - margin, y, { align: 'right' })
  y += 4

  // Modrá linka pod headerem
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 10

  // ============================================================
  // DODAVATEL & ODBĚRATEL
  // ============================================================
  const colWidth = (contentWidth - 10) / 2

  // Dodavatel
  doc.setTextColor(37, 99, 235)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('DODAVATEL', margin, y)

  // Odběratel
  doc.text('ODBĚRATEL', margin + colWidth + 10, y)
  y += 5

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(SUPPLIER.name, margin, y)
  doc.text(customer.companyName || '—', margin + colWidth + 10, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  const supplierLines = [
    SUPPLIER.address,
    `${SUPPLIER.postalCode} ${SUPPLIER.city}`,
    '',
    `IČO: ${SUPPLIER.ico}`,
    `DIČ: ${SUPPLIER.dic}`,
    '',
    ...(SUPPLIER.phone ? [`Tel: ${SUPPLIER.phone}`] : []),
    ...(SUPPLIER.email ? [`E-mail: ${SUPPLIER.email}`] : []),
    ...(SUPPLIER.website ? [SUPPLIER.website] : []),
  ]

  const customerLines = [
    ...(customer.address ? [customer.address] : []),
    ...(customer.postalCode || customer.city
      ? [`${customer.postalCode || ''} ${customer.city || ''}`.trim()]
      : []),
    '',
    ...(customer.ico ? [`IČO: ${customer.ico}`] : []),
    ...(customer.dic ? [`DIČ: ${customer.dic}`] : []),
    '',
    ...(customer.contactPerson ? [`Kontakt: ${customer.contactPerson}`] : []),
    ...(customer.email ? [`E-mail: ${customer.email}`] : []),
    ...(customer.phone ? [`Tel: ${customer.phone}`] : []),
  ]

  const maxLines = Math.max(supplierLines.length, customerLines.length)
  for (let i = 0; i < maxLines; i++) {
    if (supplierLines[i]) {
      doc.text(supplierLines[i], margin, y)
    }
    if (customerLines[i]) {
      doc.text(customerLines[i], margin + colWidth + 10, y)
    }
    y += 4
  }

  y += 6

  // ============================================================
  // METADATA NABÍDKY
  // ============================================================
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')

  const metaCol1X = margin
  const metaCol2X = margin + 55
  const metaCol3X = margin + 110

  doc.text('Datum vystavení:', metaCol1X, y)
  doc.text('Platnost nabídky:', metaCol2X, y)
  doc.text('Číslo nabídky:', metaCol3X, y)
  y += 4

  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(formatDatePdf(issueDate), metaCol1X, y)
  doc.text(formatDatePdf(validUntil), metaCol2X, y)
  doc.text(quoteNumber, metaCol3X, y)
  y += 8

  doc.setDrawColor(220, 220, 220)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // ============================================================
  // TABULKA POLOŽEK
  // ============================================================
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Položky nabídky', margin, y)
  y += 7

  // Header tabulky
  const colX = {
    num: margin,
    name: margin + 8,
    qty: margin + 95,
    unit: margin + 110,
    unitPrice: margin + 125,
    total: pageWidth - margin,
  }

  doc.setFillColor(245, 247, 250)
  doc.rect(margin, y - 4, contentWidth, 8, 'F')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(80, 80, 80)
  doc.text('#', colX.num, y)
  doc.text('Název položky', colX.name, y)
  doc.text('Počet', colX.qty, y)
  doc.text('MJ', colX.unit, y)
  doc.text('Cena/ks', colX.unitPrice, y)
  doc.text('Celkem', colX.total, y, { align: 'right' })
  y += 7

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)

  // Položky
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(9)

  items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    doc.line(margin, y - 4, pageWidth - margin, y - 4)

    doc.text(String(index + 1), colX.num, y)
    doc.text(item.product_name, colX.name, y)
    doc.text(String(item.quantity), colX.qty, y)
    doc.text('ks', colX.unit, y)
    doc.text(formatCurrencyPdf(item.unit_price), colX.unitPrice, y)
    doc.text(formatCurrencyPdf(item.line_total), colX.total, y, { align: 'right' })
    y += 7
  })

  doc.line(margin, y - 4, pageWidth - margin, y - 4)
  y += 2

  // ============================================================
  // SOUHRN CEN
  // ============================================================
  const summaryX = margin + 95
  const summaryValueX = pageWidth - margin

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  doc.text('Celkem bez DPH:', summaryX, y)
  doc.text(formatCurrencyPdf(totalWithoutVat), summaryValueX, y, { align: 'right' })
  y += 5

  doc.text(`DPH ${VAT_RATE * 100} %:`, summaryX, y)
  doc.text(formatCurrencyPdf(vatAmount), summaryValueX, y, { align: 'right' })
  y += 2

  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.5)
  doc.line(summaryX, y, pageWidth - margin, y)
  y += 5

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(37, 99, 235)
  doc.text('Celkem s DPH:', summaryX, y)
  doc.text(formatCurrencyPdf(totalWithVat), summaryValueX, y, { align: 'right' })
  y += 12

  // ============================================================
  // PODMÍNKY
  // ============================================================
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Podmínky nabídky', margin, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  const conditions = [
    `Platební podmínky: ${paymentTerms}`,
    `Dodací podmínky: ${deliveryTerms}`,
    `Platnost nabídky: ${validityDays} dnů od data vystavení (do ${formatDatePdf(validUntil)})`,
    'Ceny jsou uvedeny bez DPH, není-li uvedeno jinak.',
    'Součástí nabídky je doprava a instalace, pokud není uvedeno jinak.',
    'Záruční doba: dle specifikace jednotlivých produktů.',
  ]

  conditions.forEach((line) => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
    doc.text(`• ${line}`, margin, y)
    y += 5
  })

  y += 3

  // ============================================================
  // POZNÁMKY
  // ============================================================
  if (notes) {
    if (y > 255) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Poznámky', margin, y)
    y += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const noteLines = doc.splitTextToSize(notes, contentWidth)
    doc.text(noteLines, margin, y)
    y += noteLines.length * 4 + 6
  }

  // ============================================================
  // BANKOVNÍ ÚDAJE
  // ============================================================
  if (y > 255) {
    doc.addPage()
    y = 20
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Bankovní spojení', margin, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)

  if (SUPPLIER.bankAccount) {
    doc.text(`Číslo účtu: ${SUPPLIER.bankAccount}`, margin, y)
    y += 4
  }
  if (SUPPLIER.bankName) {
    doc.text(`Banka: ${SUPPLIER.bankName}`, margin, y)
    y += 4
  }
  y += 8

  // ============================================================
  // PODPISY
  // ============================================================
  if (y > 245) {
    doc.addPage()
    y = 20
  }

  const signY = y + 5
  doc.setDrawColor(180, 180, 180)
  doc.setLineWidth(0.3)

  doc.line(margin, signY + 15, margin + 60, signY + 15)
  doc.line(pageWidth - margin - 60, signY + 15, pageWidth - margin, signY + 15)

  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Za dodavatele', margin, signY + 20)
  doc.text('Za odběratele', pageWidth - margin - 60, signY + 20)

  doc.text('Datum a podpis', margin, signY + 24)
  doc.text('Datum a podpis', pageWidth - margin - 60, signY + 24)

  // ============================================================
  // PATIČKA
  // ============================================================
  const footerY = 285
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.2)
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3)

  doc.setFontSize(7)
  doc.setTextColor(140, 140, 140)
  doc.setFont('helvetica', 'normal')
  doc.text(SUPPLIER.registrationNote, pageWidth / 2, footerY, { align: 'center' })
  doc.text(
    `${SUPPLIER.name} | ${SUPPLIER.phone} | ${SUPPLIER.email}`,
    pageWidth / 2,
    footerY + 3,
    { align: 'center' }
  )

  // ============================================================
  // STÁHNOUT
  // ============================================================
  const fileName = `Nabidka_${quoteNumber}_${customer.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'klient'}.pdf`
  doc.save(fileName)
}
