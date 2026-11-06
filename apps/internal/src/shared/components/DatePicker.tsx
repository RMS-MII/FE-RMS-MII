import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"

import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@/shared/lib/utils"

export interface DatePickerProps {
  id?: string
  value?: string | Date
  onChange?: (value: string, date?: Date) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date | string
  maxDate?: Date | string
  className?: string
  "aria-invalid"?: boolean
  clearable?: boolean
  defaultMonth?: Date | string
  fromYear?: number
  toYear?: number
  showDropdowns?: boolean
}

/**
 * Safely parse string "YYYY-MM-DD" or Date object into a local Date without UTC offset shifts.
 */
function toDate(val: string | Date | undefined): Date | undefined {
  if (!val) return undefined
  if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val
  if (typeof val === "string") {
    const parts = val.split("-").map(Number)
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      return new Date(parts[0], parts[1] - 1, parts[2])
    }
    const parsed = new Date(val)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }
  return undefined
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  disabled = false,
  minDate,
  maxDate,
  className,
  "aria-invalid": ariaInvalid,
  clearable = false,
  defaultMonth,
  fromYear,
  toYear,
  showDropdowns = true,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => toDate(value), [value])
  const min = React.useMemo(() => toDate(minDate), [minDate])
  const max = React.useMemo(() => toDate(maxDate), [maxDate])

  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => {
    return selectedDate || toDate(defaultMonth) || new Date()
  })

  React.useEffect(() => {
    if (selectedDate) {
      setDisplayMonth(selectedDate)
    } else if (defaultMonth) {
      const d = toDate(defaultMonth)
      if (d) setDisplayMonth(d)
    }
  }, [selectedDate, defaultMonth])

  const currentYear = new Date().getFullYear()
  const startYear = fromYear || (min ? min.getFullYear() : 1950)
  const endYear = toYear || (max ? max.getFullYear() : currentYear + 10)
  const years = React.useMemo(() => {
    const list: number[] = []
    for (let y = endYear; y >= startYear; y--) {
      list.push(y)
    }
    return list
  }, [startYear, endYear])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd")
      onChange?.(formatted, date)
    } else {
      onChange?.("", undefined)
    }
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("", undefined)
  }

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-full border-0 bg-muted px-4 text-sm font-normal text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none cursor-pointer outline-none select-none disabled:cursor-not-allowed disabled:opacity-50",
            !selectedDate && "text-muted-foreground",
            ariaInvalid && "ring-2 ring-destructive",
            className
          )}
        >
          <span className="truncate">
            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : placeholder}
          </span>
          <div className="flex items-center gap-1">
            {clearable && selectedDate && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleClear(e as unknown as React.MouseEvent)
                  }
                }}
                aria-label="Clear date"
                className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
              >
                <X className="size-3" aria-hidden />
              </span>
            )}
            <CalendarIcon className="size-4 text-muted-foreground shrink-0" aria-hidden />
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          container={typeof document !== "undefined" ? document.body : undefined}
          className="w-auto p-3 rounded-2xl border border-border bg-card shadow-float z-60"
        >
          {showDropdowns && (
            <div className="flex items-center justify-between gap-2 px-1 pb-2.5 border-b border-border">
              <select
                aria-label="Select month"
                value={displayMonth.getMonth()}
                onChange={(e) => {
                  const newMonth = new Date(displayMonth.getFullYear(), Number(e.target.value), 1)
                  setDisplayMonth(newMonth)
                }}
                className="h-8 flex-1 rounded-lg border border-border bg-muted/60 px-2 text-xs font-semibold text-foreground outline-none cursor-pointer hover:bg-muted transition-colors"
              >
                {months.map((m, i) => (
                  <option key={i} value={i} className="bg-card text-foreground">
                    {m}
                  </option>
                ))}
              </select>

              <select
                aria-label="Select year"
                value={displayMonth.getFullYear()}
                onChange={(e) => {
                  const newMonth = new Date(Number(e.target.value), displayMonth.getMonth(), 1)
                  setDisplayMonth(newMonth)
                }}
                className="h-8 w-24 rounded-lg border border-border bg-muted/60 px-2 text-xs font-semibold text-foreground outline-none cursor-pointer hover:bg-muted transition-colors"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-card text-foreground">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Calendar
            mode="single"
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={(date: Date) => {
              if (min && date < min) return true
              if (max && date > max) return true
              return false
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
