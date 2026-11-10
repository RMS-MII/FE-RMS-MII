/** Treat API timestamps without an offset as UTC, matching timestamps with Z. */
export function parseUtcDateTime(value: string | Date): Date {
  if (value instanceof Date) return value
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00Z`)
  const timestamp = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`
  return new Date(timestamp)
}

/** UTC instant shown as Indonesia's fixed UTC+7 clock time. */
export function getWibDateKey(value: string | Date): string {
  return new Date(parseUtcDateTime(value).getTime() + 7 * 60 * 60 * 1000)
    .toISOString().slice(0, 10)
}

export function formatWibTime(value: string | Date): string {
  const date = new Date(parseUtcDateTime(value).getTime() + 7 * 60 * 60 * 1000)
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`
}

export function formatWibDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
    ...options,
  }).format(parseUtcDateTime(value))
}

export function formatWibDateTime(value: string | Date): string {
  return `${formatWibDate(value)}, ${formatWibTime(value)} WIB`
}

export function safeFormatWibDateTime(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback
  try {
    return formatWibDateTime(value)
  } catch {
    return fallback
  }
}

/** Convert a calendar date and wall-clock time selected in WIB into UTC for the API. */
export function wibToUtcISOString(date: string, time: string): string {
  return new Date(`${date}T${time}:00+07:00`).toISOString()
}

export function wibDateTimeInputToUtcISOString(value: string): string {
  const [date, time] = value.split("T")
  return wibToUtcISOString(date, time)
}

export function wibDayBoundToUtcISOString(date: string, endOfDay = false): string {
  return new Date(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+07:00`).toISOString()
}
