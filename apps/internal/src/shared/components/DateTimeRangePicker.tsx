import { format, startOfToday } from "date-fns"
import { CalendarDays, Clock3 } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@workspace/ui/components/calendar"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@/shared/lib/utils"

export interface DateTimeRangeValue {
  start: string
  end: string
}

export interface DateTimeRangePickerProps {
  value: DateTimeRangeValue
  onChange: (value: DateTimeRangeValue) => void
  id?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
}

function parseLocalDateTime(value: string): Date | undefined {
  if (!value) return undefined

  const [datePart, timePart = "00:00"] = value.split("T")
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours, minutes] = timePart.split(":").map(Number)

  if (!year || !month || !day) return undefined
  const date = new Date(year, month - 1, day, hours || 0, minutes || 0)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function getTime(value: string, fallback: string) {
  const date = parseLocalDateTime(value)
  return date ? format(date, "HH:mm") : fallback
}

function withTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const result = new Date(date)
  result.setHours(hours || 0, minutes || 0, 0, 0)
  return format(result, "yyyy-MM-dd'T'HH:mm")
}

function formatValue(value: DateTimeRangeValue, placeholder: string) {
  const start = parseLocalDateTime(value.start)
  const end = parseLocalDateTime(value.end)

  if (!start) return placeholder
  const formattedStart = format(start, "dd/MM/yyyy, HH:mm")
  return end
    ? `${formattedStart} – ${format(end, "dd/MM/yyyy, HH:mm")}`
    : `${formattedStart} – Select end date`;
}

export function DateTimeRangePicker({
  value,
  onChange,
  id,
  placeholder = "Select start and end date/time",
  disabled = false,
  invalid = false,
  className,
}: DateTimeRangePickerProps) {
  const startDate = parseLocalDateTime(value.start)
  const endDate = parseLocalDateTime(value.end)
  const selectedRange: DateRange | undefined = startDate
    ? { from: startDate, ...(endDate ? { to: endDate } : {}) }
    : undefined
  const startTime = getTime(value.start, "00:00")
  const endTime = getTime(value.end, "23:59")

  const handleRangeChange = (range: DateRange | undefined) => {
    onChange({
      start: range?.from ? withTime(range.from, startTime) : "",
      end: range?.to ? withTime(range.to, endTime) : "",
    })
  }

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        aria-invalid={invalid}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none disabled:cursor-not-allowed disabled:opacity-50",
          !startDate && "text-muted-foreground",
          invalid && "ring-2 ring-destructive",
          className
        )}
      >
        <span className="truncate">{formatValue(value, placeholder)}</span>
        <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        container={typeof document !== "undefined" ? document.body : undefined}
        className="w-auto max-w-[calc(100vw-1rem)] rounded-2xl border border-border bg-card p-3 shadow-float"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleRangeChange}
            disabled={{ before: startOfToday() }}
            numberOfMonths={1}
            captionLayout="dropdown"
            defaultMonth={startDate}
            autoFocus
          />

          <div className="flex w-full flex-col gap-4 border-t border-border pt-3 sm:w-44 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock3 className="size-4 text-muted-foreground" aria-hidden />
              Set time
            </div>
            <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
              Start time
              <Input
                type="time"
                value={startTime}
                disabled={!startDate || disabled}
                onChange={(event) => {
                  if (!startDate || !event.target.value) return
                  onChange({ ...value, start: withTime(startDate, event.target.value) })
                }}
                className="h-10 rounded-xl border-border bg-background px-3 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1.5 text-xs font-medium text-muted-foreground">
              End time
              <Input
                type="time"
                value={endTime}
                disabled={!endDate || disabled}
                onChange={(event) => {
                  if (!endDate || !event.target.value) return
                  onChange({ ...value, end: withTime(endDate, event.target.value) })
                }}
                className="h-10 rounded-xl border-border bg-background px-3 text-sm text-foreground"
              />
            </label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Select the date range, then set its start and end times.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
