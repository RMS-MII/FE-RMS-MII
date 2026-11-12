import { useMemo, useState } from "react"
import { getWibDateKey, parseUtcDateTime } from "@/shared/lib/utcDateTime"
import type { MyInterviewItem } from "../types"

function dateFromKey(key: string) {
  return new Date(`${key}T00:00:00Z`)
}

export function addDaysToKey(key: string, days: number) {
  const date = dateFromKey(key)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function addMonthsToKey(month: string, months: number) {
  const date = dateFromKey(`${month}-01`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 7)
}

export function getMonthDays(month: string) {
  const [year, monthNumber] = month.split("-").map(Number)
  const first = `${month}-01`
  const last = new Date(Date.UTC(year, monthNumber, 0)).toISOString().slice(0, 10)
  const firstWeekday = (dateFromKey(first).getUTCDay() + 6) % 7
  const lastWeekday = (dateFromKey(last).getUTCDay() + 6) % 7
  const start = addDaysToKey(first, -firstWeekday)
  const end = addDaysToKey(last, 6 - lastWeekday)
  const count = Math.max(35, Math.round((dateFromKey(end).getTime() - dateFromKey(start).getTime()) / 86400000) + 1)
  return Array.from({ length: count }, (_, index) => addDaysToKey(start, index))
}

export function useMyInterviewsCalendar(
  interviews: MyInterviewItem[],
  month: string,
  setMonth: (month: string) => void
) {
  const today = getWibDateKey(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null)
  const [hasSelectedDate, setHasSelectedDate] = useState(false)

  const days = useMemo(() => getMonthDays(month), [month])
  const interviewsByDay = useMemo(() => {
    const result = new Map<string, MyInterviewItem[]>()
    for (const interview of interviews) {
      const key = getWibDateKey(interview.scheduledStart)
      const entries = result.get(key) ?? []
      entries.push(interview)
      result.set(key, entries)
    }
    for (const entries of result.values())
      entries.sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))
    return result
  }, [interviews])

  const monthInterviews = interviews
    .filter((item) => getWibDateKey(item.scheduledStart).slice(0, 7) === month)
    .sort((a, b) => parseUtcDateTime(a.scheduledStart).getTime() - parseUtcDateTime(b.scheduledStart).getTime())
  const nextInterview = monthInterviews.find((item) => parseUtcDateTime(item.scheduledStart).getTime() >= Date.now())
    ?? monthInterviews[0]
  const suggestedDate = today.slice(0, 7) === month && interviewsByDay.has(today)
    ? today
    : nextInterview ? getWibDateKey(nextInterview.scheduledStart) : today.slice(0, 7) === month ? today : `${month}-01`
  const activeDate = hasSelectedDate && selectedDate.slice(0, 7) === month ? selectedDate : suggestedDate
  const dayInterviews = interviewsByDay.get(activeDate) ?? []
  const selectedInterview = dayInterviews.find((item) => item.id === selectedInterviewId)
    ?? dayInterviews[0]
    ?? null

  const selectDate = (date: string) => {
    setMonth(date.slice(0, 7))
    setSelectedDate(date)
    setSelectedInterviewId(null)
    setHasSelectedDate(true)
  }

  const selectInterview = (interview: MyInterviewItem) => {
    setMonth(getWibDateKey(interview.scheduledStart).slice(0, 7))
    setSelectedDate(getWibDateKey(interview.scheduledStart))
    setSelectedInterviewId(interview.id)
    setHasSelectedDate(true)
  }

  const changeMonth = (nextMonth: string) => {
    setMonth(nextMonth)
    setSelectedDate(`${nextMonth}-01`)
    setSelectedInterviewId(null)
    setHasSelectedDate(false)
  }

  return {
    today,
    month,
    days,
    activeDate,
    interviewsByDay,
    dayInterviews,
    selectedInterview,
    selectDate,
    selectInterview,
    changeMonth,
  }
}
