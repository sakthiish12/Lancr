import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lancr — Freelance Business Platform for Southeast Asia',
  description: 'Quotes, contracts, invoices, and payments for freelancers and micro-agencies in Southeast Asia. GST-compliant and InvoiceNow ready.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
