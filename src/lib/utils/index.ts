export * from './currency'
export * from './date'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function generateNumber(prefix: string, count: number): string {
  return `${prefix}-${String(count).padStart(4, '0')}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}
