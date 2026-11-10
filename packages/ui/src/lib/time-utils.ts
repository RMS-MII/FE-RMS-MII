/**
 * Utilities for time manipulation, validation, and formatting (HH:mm 24-hour format).
 */

/**
 * Validates if a string is a valid 24-hour time in "HH:mm" format (00:00 - 23:59).
 */
export function isValidTimeString(time: string): boolean {
  if (!time || typeof time !== "string") return false
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time.trim())
}

/**
 * Parses "HH:mm" into numeric hours and minutes. Returns null if invalid.
 */
export function parseTimeString(
  time: string
): { hours: number; minutes: number } | null {
  if (!isValidTimeString(time)) return null
  const [h, m] = time.trim().split(":").map(Number)
  if (h === undefined || m === undefined) return null
  return { hours: h, minutes: m }
}

/**
 * Formats numeric hours and minutes into "HH:mm" format.
 */
export function formatTime24h(hours: number, minutes: number): string {
  const clampedH = Math.max(0, Math.min(23, Math.floor(hours)))
  const clampedM = Math.max(0, Math.min(59, Math.floor(minutes)))
  return `${String(clampedH).padStart(2, "0")}:${String(clampedM).padStart(2, "0")}`
}

/**
 * Formats "HH:mm" to 12-hour format with AM/PM (e.g. "14:30" -> "02:30 PM").
 */
export function formatTime12h(time24: string): string {
  const parsed = parseTimeString(time24)
  if (!parsed) return time24
  const { hours, minutes } = parsed
  const period = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 === 0 ? 12 : hours % 12
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`
}

/**
 * Generates array of 2-digit hour strings ["00", "01", ..., "23"].
 */
export function generateHours(): string[] {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
}

/**
 * Generates array of 2-digit minute strings ["00", "01", ..., "59"] with optional step.
 */
export function generateMinutes(step: number = 1): string[] {
  const validStep = Math.max(1, Math.min(30, step))
  const minutes: string[] = []
  for (let i = 0; i < 60; i += validStep) {
    minutes.push(String(i).padStart(2, "0"))
  }
  return minutes
}

/**
 * Generates an array of "HH:mm" time strings between minTime and maxTime with a given step.
 * Default step is 30 minutes, spanning 00:00 to 23:30.
 */
export function generateTimeOptions(
  stepMinutes: number = 30,
  minTime: string = "00:00",
  maxTime: string = "23:59"
): string[] {
  const options: string[] = []
  const validStep = Math.max(5, Math.min(60, stepMinutes))

  const minParsed = parseTimeString(minTime) || { hours: 0, minutes: 0 }
  const maxParsed = parseTimeString(maxTime) || { hours: 23, minutes: 59 }

  const startTotalMinutes = minParsed.hours * 60 + minParsed.minutes
  const endTotalMinutes = maxParsed.hours * 60 + maxParsed.minutes

  for (let m = startTotalMinutes; m <= endTotalMinutes; m += validStep) {
    const hours = Math.floor(m / 60)
    const minutes = m % 60
    if (hours < 24) {
      options.push(formatTime24h(hours, minutes))
    }
  }

  return options
}

/**
 * Checks if timeA is strictly before timeB ("HH:mm").
 */
export function isTimeBefore(timeA: string, timeB: string): boolean {
  const pA = parseTimeString(timeA)
  const pB = parseTimeString(timeB)
  if (!pA || !pB) return false
  return pA.hours * 60 + pA.minutes < pB.hours * 60 + pB.minutes
}

/**
 * Checks if timeA is strictly after timeB ("HH:mm").
 */
export function isTimeAfter(timeA: string, timeB: string): boolean {
  const pA = parseTimeString(timeA)
  const pB = parseTimeString(timeB)
  if (!pA || !pB) return false
  return pA.hours * 60 + pA.minutes > pB.hours * 60 + pB.minutes
}

/**
 * Adds minutes to an "HH:mm" time string, returning the new "HH:mm".
 * Handles overflow/rollover to next day.
 */
export function addMinutesToTime(time: string, minutesToAdd: number): string {
  const parsed = parseTimeString(time)
  if (!parsed) return time
  const total = parsed.hours * 60 + parsed.minutes + minutesToAdd
  const normalized = ((total % 1440) + 1440) % 1440
  return formatTime24h(Math.floor(normalized / 60), normalized % 60)
}

/**
 * Calculates duration in minutes between two "HH:mm" times.
 */
export function calculateDurationMinutes(
  startTime: string,
  endTime: string
): number {
  const pStart = parseTimeString(startTime)
  const pEnd = parseTimeString(endTime)
  if (!pStart || !pEnd) return 0
  const startM = pStart.hours * 60 + pStart.minutes
  const endM = pEnd.hours * 60 + pEnd.minutes
  return endM >= startM ? endM - startM : 1440 - startM + endM
}

/**
 * Human-readable duration string (e.g. "1 hr", "45 mins", "1 hr 30 mins").
 */
export function formatDurationHuman(minutes: number): string {
  if (minutes <= 0) return "0 mins"
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hr ${remainingMinutes} mins`
  }
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`
  }
  return `${remainingMinutes} mins`
}

