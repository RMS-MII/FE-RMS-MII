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

/** ISO date (YYYY-MM-DD or full ISO 8601 YYYY-MM-DDTHH:mm:ssZ) parsed safely. */
export function parseDate(iso?: string): Date {
  if (!iso) return new Date()
  const clean = iso.includes("T") ? iso.split("T")[0] : iso.split(" ")[0]
  const parts = clean.split("-").map(Number)
  if (parts.length === 3) {
    const [y, m, d] = parts
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 0 && m > 0 && d > 0) {
      return new Date(y, m - 1, d)
    }
  }
  const fallback = new Date(iso)
  return isNaN(fallback.getTime()) ? new Date() : fallback
}

export const formatDate = (iso?: string): string => {
  if (!iso) return "-"
  try {
    const d = parseDate(iso)
    if (isNaN(d.getTime())) return "-"
    return dateFmt.format(d)
  } catch {
    return "-"
  }
}

export const formatDay = (iso?: string): string => {
  if (!iso) return "-"
  try {
    const d = parseDate(iso)
    if (isNaN(d.getTime())) return "-"
    return dayFmt.format(d)
  } catch {
    return "-"
  }
}

export const formatLongDay = (iso?: string): string => {
  if (!iso) return "-"
  try {
    const d = parseDate(iso)
    if (isNaN(d.getTime())) return "-"
    return longDayFmt.format(d)
  } catch {
    return "-"
  }
}

export const formatNumber = (n: number): string => numberFmt.format(n)
export const formatCurrency = (n: number): string => currencyFmt.format(n)

export function formatPeriod(startIso?: string, endIso?: string): string {
  if (!startIso && !endIso) return "-"
  if (!startIso) return formatDate(endIso)
  if (!endIso) return formatDate(startIso)
  try {
    return `${formatDate(startIso)} – ${formatDate(endIso)}`
  } catch {
    return "-"
  }
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
    return formatDate(dateStr)
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
