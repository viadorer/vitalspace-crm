import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('/logo-vitalspace.png')
    if (!response.ok) return null
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export interface QuotePdfResult {
  blob: Blob
  fileName: string
  quoteNumber: string
}

export async function generateQuotePdf(options: QuotePdfOptions): Promise<QuotePdfResult> {
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

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })
  
  const pageWidth = 210
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let finalY = 20

  // ============================================================
  // HEADER S LOGEM
  // ============================================================
  const logoBase64 = await loadLogoAsBase64()
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', margin, finalY - 5, 18, 18)
  }

  // Použijeme autoTable pro header s UTF-8 podporou
  autoTable(doc, {
    startY: finalY,
    head: [],
    body: [
      [{ content: 'CENOVÁ NABÍDKA', styles: { fontSize: 18, fontStyle: 'bold', halign: 'left' } }],
      [{ content: SUPPLIER.name, styles: { fontSize: 8, textColor: [100, 100, 100] } }],
    ],
    theme: 'plain',
    margin: { left: logoBase64 ? margin + 22 : margin, right: margin },
    styles: { cellPadding: 0, lineColor: [255, 255, 255], lineWidth: 0 },
  })

  // Číslo nabídky vpravo
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(quoteNumber, pageWidth - margin, finalY + 2, { align: 'right' })

  finalY = (doc as any).lastAutoTable.finalY + 8

  // Modrá linka
  doc.setDrawColor(37, 99, 235)
  doc.setLineWidth(0.8)
  doc.line(margin, finalY, pageWidth - margin, finalY)
  finalY += 10

  // ============================================================
  // DODAVATEL & ODBĚRATEL - použijeme autoTable pro UTF-8
  // ============================================================
  const supplierData = [
    [{ content: 'DODAVATEL', styles: { fontStyle: 'bold' as const, textColor: [37, 99, 235], fontSize: 9 } }],
    [{ content: SUPPLIER.name, styles: { fontStyle: 'bold' as const, fontSize: 11 } }],
    [SUPPLIER.address],
    [`${SUPPLIER.postalCode} ${SUPPLIER.city}`],
    [''],
    [`IČO: ${SUPPLIER.ico}`],
    [`DIČ: ${SUPPLIER.dic}`],
    [''],
    ...(SUPPLIER.phone ? [[`Tel: ${SUPPLIER.phone}`]] : []),
    ...(SUPPLIER.email ? [[`E-mail: ${SUPPLIER.email}`]] : []),
    ...(SUPPLIER.website ? [[SUPPLIER.website]] : []),
  ]

  const customerData = [
    [{ content: 'ODBĚRATEL', styles: { fontStyle: 'bold' as const, textColor: [37, 99, 235], fontSize: 9 } }],
    [{ content: customer.companyName || '—', styles: { fontStyle: 'bold' as const, fontSize: 11 } }],
    ...(customer.address ? [[customer.address]] : []),
    ...(customer.postalCode || customer.city ? [[`${customer.postalCode || ''} ${customer.city || ''}`.trim()]] : []),
    [''],
    ...(customer.ico ? [[`IČO: ${customer.ico}`]] : []),
    ...(customer.dic ? [[`DIČ: ${customer.dic}`]] : []),
    [''],
    ...(customer.contactPerson ? [[`Kontakt: ${customer.contactPerson}`]] : []),
    ...(customer.email ? [[`E-mail: ${customer.email}`]] : []),
    ...(customer.phone ? [[`Tel: ${customer.phone}`]] : []),
  ]

  // Sloučíme do dvou sloupců
  const maxRows = Math.max(supplierData.length, customerData.length)
  const combinedData = []
  for (let i = 0; i < maxRows; i++) {
    combinedData.push([
      supplierData[i]?.[0] || '',
      customerData[i]?.[0] || '',
    ])
  }

  autoTable(doc, {
    startY: finalY,
    head: [],
    body: combinedData,
    theme: 'plain',
    styles: {
      fontSize: 9,
      textColor: [60, 60, 60],
      cellPadding: { top: 1, bottom: 1, left: 0, right: 0 },
    },
    columnStyles: {
      0: { cellWidth: 85 },
      1: { cellWidth: 85 },
    },
    margin: { left: margin, right: margin },
  })

  finalY = (doc as any).lastAutoTable.finalY + 8

  // ============================================================
  // METADATA
  // ============================================================
  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(margin, finalY, pageWidth - margin, finalY)
  finalY += 6

  autoTable(doc, {
    startY: finalY,
    head: [],
    body: [
      [
        { content: 'Datum vystavení:', styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 9 } },
        { content: 'Platnost nabídky:', styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 9 } },
        { content: 'Číslo nabídky:', styles: { fontStyle: 'bold', textColor: [100, 100, 100], fontSize: 9 } },
      ],
      [
        { content: formatDatePdf(issueDate), styles: { fontStyle: 'bold', fontSize: 9 } },
        { content: formatDatePdf(validUntil), styles: { fontStyle: 'bold', fontSize: 9 } },
        { content: quoteNumber, styles: { fontStyle: 'bold', fontSize: 9 } },
      ],
    ],
    theme: 'plain',
    styles: { cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 55 },
      2: { cellWidth: 60 },
    },
    margin: { left: margin, right: margin },
  })

  finalY = (doc as any).lastAutoTable.finalY + 6
  doc.line(margin, finalY, pageWidth - margin, finalY)
  finalY += 8

  // ============================================================
  // TABULKA POLOŽEK - autoTable s UTF-8
  // ============================================================
  autoTable(doc, {
    startY: finalY,
    head: [[{ content: 'Položky nabídky', colSpan: 6, styles: { fontSize: 12, fontStyle: 'bold' } }]],
    body: [],
    theme: 'plain',
    styles: { cellPadding: 0 },
    margin: { left: margin, right: margin },
  })

  finalY = (doc as any).lastAutoTable.finalY + 7

  const tableData = items.map((item, index) => [
    String(index + 1),
    item.product_name,
    String(item.quantity),
    'ks',
    formatCurrencyPdf(item.unit_price),
    formatCurrencyPdf(item.line_total),
  ])

  autoTable(doc, {
    startY: finalY,
    head: [['#', 'Název položky', 'Počet', 'MJ', 'Cena/ks', 'Celkem']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [245, 247, 250],
      textColor: [80, 80, 80],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 87 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  finalY = (doc as any).lastAutoTable.finalY + 5

  // ============================================================
  // SOUHRN CEN
  // ============================================================
  autoTable(doc, {
    startY: finalY,
    head: [],
    body: [
      ['Celkem bez DPH:', formatCurrencyPdf(totalWithoutVat)],
      [`DPH ${VAT_RATE * 100} %:`, formatCurrencyPdf(vatAmount)],
      [
        { content: 'Celkem s DPH:', styles: { fontStyle: 'bold', fontSize: 12, textColor: [37, 99, 235] } },
        { content: formatCurrencyPdf(totalWithVat), styles: { fontStyle: 'bold', fontSize: 12, textColor: [37, 99, 235] } },
      ],
    ],
    theme: 'plain',
    styles: {
      fontSize: 9,
      textColor: [60, 60, 60],
      cellPadding: { top: 2, bottom: 2 },
    },
    columnStyles: {
      0: { cellWidth: 125, halign: 'right' },
      1: { cellWidth: 45, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  })

  finalY = (doc as any).lastAutoTable.finalY + 10

  // ============================================================
  // PODMÍNKY
  // ============================================================
  const conditions = [
    [`Platební podmínky: ${paymentTerms}`],
    [`Dodací podmínky: ${deliveryTerms}`],
    [`Platnost nabídky: ${validityDays} dnů od data vystavení (do ${formatDatePdf(validUntil)})`],
    ['Ceny jsou uvedeny bez DPH, není-li uvedeno jinak.'],
    ['Součástí nabídky je doprava a instalace, pokud není uvedeno jinak.'],
    ['Záruční doba: dle specifikace jednotlivých produktů.'],
  ]

  autoTable(doc, {
    startY: finalY,
    head: [[{ content: 'Podmínky nabídky', styles: { fontSize: 10, fontStyle: 'bold' } }]],
    body: conditions,
    theme: 'plain',
    styles: {
      fontSize: 9,
      textColor: [60, 60, 60],
      cellPadding: { top: 2, bottom: 2 },
    },
    margin: { left: margin, right: margin },
  })

  finalY = (doc as any).lastAutoTable.finalY + 5

  // ============================================================
  // POZNÁMKY
  // ============================================================
  if (notes) {
    autoTable(doc, {
      startY: finalY,
      head: [[{ content: 'Poznámky', styles: { fontSize: 10, fontStyle: 'bold' } }]],
      body: [[notes]],
      theme: 'plain',
      styles: {
        fontSize: 9,
        textColor: [60, 60, 60],
        cellPadding: { top: 2, bottom: 2 },
      },
      margin: { left: margin, right: margin },
    })
    finalY = (doc as any).lastAutoTable.finalY + 8
  }

  // ============================================================
  // BANKOVNÍ ÚDAJE
  // ============================================================
  const bankData = []
  if (SUPPLIER.bankAccount) bankData.push([`Číslo účtu: ${SUPPLIER.bankAccount}`])
  if (SUPPLIER.bankName) bankData.push([`Banka: ${SUPPLIER.bankName}`])

  if (bankData.length > 0) {
    autoTable(doc, {
      startY: finalY,
      head: [[{ content: 'Bankovní spojení', styles: { fontSize: 10, fontStyle: 'bold' } }]],
      body: bankData,
      theme: 'plain',
      styles: {
        fontSize: 9,
        textColor: [60, 60, 60],
        cellPadding: { top: 2, bottom: 2 },
      },
      margin: { left: margin, right: margin },
    })
    finalY = (doc as any).lastAutoTable.finalY + 10
  }

  // ============================================================
  // PODPISY
  // ============================================================
  const signY = finalY + 5
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
  doc.text(SUPPLIER.registrationNote, pageWidth / 2, footerY, { align: 'center', maxWidth: contentWidth })
  doc.text(
    `${SUPPLIER.name} | ${SUPPLIER.phone} | ${SUPPLIER.email}`,
    pageWidth / 2,
    footerY + 3,
    { align: 'center' }
  )

  // ============================================================
  // VRÁTIT BLOB + STÁHNOUT
  // ============================================================
  const fileName = `Nabidka_${quoteNumber}_${customer.companyName?.replace(/[^a-zA-Z0-9]/g, '_') || 'klient'}.pdf`
  const pdfBlob = doc.output('blob')
  doc.save(fileName)

  return { blob: pdfBlob, fileName, quoteNumber }
}
