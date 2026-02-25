import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Turkish character to ASCII slug conversion
export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ğ: 'g', Ğ: 'G', ü: 'u', Ü: 'U', ş: 's', Ş: 'S',
    ı: 'i', İ: 'I', ö: 'o', Ö: 'O', ç: 'c', Ç: 'C',
  }
  return text
    .replace(/[ğÄŸüÃœşÅŸıİöÃ–çÃ‡]/g, (char) => trMap[char] || char)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

export function discountPercent(price: number, originalPrice: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export function getPrimaryImage(images: { url: string; is_primary: boolean }[]): string | null {
  if (!images || images.length === 0) return null
  const primary = images.find((img) => img.is_primary)
  return primary ? primary.url : images[0]?.url || null
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const COLLECTION_TYPE_LABELS: Record<string, string> = {
  yeni_gelenler: 'Yeni Gelenler',
  cok_satanlar: 'Çok Satanlar',
  indirimdekiler: 'İndirimdekiler',
  ozel: 'Özel Koleksiyon',
}

export const MAIN_TYPE_LABELS: Record<string, string> = {
  pompa: 'Pompa',
  yedek_parca: 'Yedek Parça',
}
