import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vitalspace CRM',
  description: 'B2B platforma pro prodej a správu ozonových sanitačních řešení',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  )
}
