import { format, formatDistanceToNow, isBefore, addDays } from 'date-fns'

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function isOverdue(dueDate: string | Date): boolean {
  return isBefore(new Date(dueDate), new Date())
}

export function addPaymentDays(days: number = 30): Date {
  return addDays(new Date(), days)
}

export function formatForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
