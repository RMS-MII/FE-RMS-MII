const dateFmt = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

const dayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  day: "numeric",
  month: "short",
})

const longDayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
})

const numberFmt = new Intl.NumberFormat("en-US")
const currencyFmt = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

/** ISO date (YYYY-MM-DD) parsed as a local calendar date. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export const formatDate = (iso: string): string => dateFmt.format(parseDate(iso))
export const formatDay = (iso: string): string => dayFmt.format(parseDate(iso))
export const formatLongDay = (iso: string): string => longDayFmt.format(parseDate(iso))
export const formatNumber = (n: number): string => numberFmt.format(n)
export const formatCurrency = (n: number): string => currencyFmt.format(n)

export function formatPeriod(startIso: string, endIso: string): string {
  if (!startIso || !endIso) return "-"
  return `${formatDate(startIso)} – ${formatDate(endIso)}`
}

/** Calculate duration in days between two dates. Returns null if invalid or end < start. */
export function getDurationDays(startDate?: string, endDate?: string): number | null {
  if (!startDate || !endDate) return null
  try {
    const start = new Date(startDate.includes("T") ? startDate : `${startDate}T00:00:00`)
    const end = new Date(endDate.includes("T") ? endDate : `${endDate}T00:00:00`)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.round(diffTime / 86_400_000)
    return diffDays >= 0 ? diffDays : null
  } catch {
    return null
  }
}

/** Safe date formatter that handles ISO strings with or without timestamp, with fallback. */
export function safeFormatDate(dateStr?: string): string {
  if (!dateStr) return "-"
  try {
    const clean = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr
    return formatDate(clean)
  } catch {
    return dateStr
  }
}

export function relativeDays(iso: string, today: string): string {
  const diff = Math.round((parseDate(today).getTime() - parseDate(iso).getTime()) / 86_400_000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff > 1) return `${diff} days ago`
  if (diff === -1) return "Tomorrow"
  return `In ${-diff} days`
}

