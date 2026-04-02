import type { Currency } from '@/types'
import { CURRENCIES } from '@/lib/constants'

export function formatCurrency(amountCents: number, currency: Currency): string {
  const { locale } = CURRENCIES[currency]
  const amount = amountCents / 100
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'IDR' ? 0 : 2,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  }).format(amount)
}

export function centsToFloat(cents: number): number {
  return cents / 100
}

export function floatToCents(amount: number): number {
  return Math.round(amount * 100)
}

export function calculateGST(subtotalCents: number, taxRate: number): number {
  return Math.round(subtotalCents * (taxRate / 100))
}

export function calculateLineItemAmount(
  quantity: number,
  unitPriceCents: number
): number {
  return Math.round(quantity * unitPriceCents)
}
