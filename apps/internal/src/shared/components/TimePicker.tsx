import * as React from "react"
import { Clock, X } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@/shared/lib/utils"
import {
  generateHours,
  generateMinutes,
  parseTimeString,
  isTimeBefore,
  isTimeAfter,
} from "../lib/timeUtils"

export interface TimePickerProps {
  id?: string
  value?: string // "HH:mm" (24-hour)
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minTime?: string // "HH:mm"
  maxTime?: string // "HH:mm"
  minuteStep?: number // Step for minutes (default: 1 for 00-59, or 5 for 00, 05, 10...)
  className?: string
  "aria-invalid"?: boolean
  clearable?: boolean
}

export function TimePicker({
  id,
  value = "",
  onChange,
  placeholder = "hh:mm",
  disabled = false,
  minTime,
  maxTime,
  minuteStep = 1,
  className,
  "aria-invalid": ariaInvalid,
  clearable = false,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedHourRef = React.useRef<HTMLButtonElement | null>(null)
  const selectedMinuteRef = React.useRef<HTMLButtonElement | null>(null)

  const hoursList = React.useMemo(() => generateHours(), [])
  const minutesList = React.useMemo(
    () => generateMinutes(minuteStep),
    [minuteStep]
  )

  const parsed = React.useMemo(() => parseTimeString(value), [value])
  const currentHour = parsed ? String(parsed.hours).padStart(2, "0") : ""
  const currentMinute = parsed ? String(parsed.minutes).padStart(2, "0") : ""

  // Auto-scroll hour and minute columns into view when popover opens
  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        if (selectedHourRef.current) {
          selectedHourRef.current.scrollIntoView({
            block: "center",
            behavior: "instant",
          })
        }
        if (selectedMinuteRef.current) {
          selectedMinuteRef.current.scrollIntoView({
            block: "center",
            behavior: "instant",
          })
        }
      }, 40)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleHourSelect = (hour: string) => {
    const minute = currentMinute || "00"
    const newTime = `${hour}:${minute}`
    onChange?.(newTime)
  }

  const handleMinuteSelect = (minute: string) => {
    const hour = currentHour || "09"
    const newTime = `${hour}:${minute}`
    onChange?.(newTime)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.("")
  }
  // Check if an hour has at least one valid minute given minTime and maxTime
  const isHourDisabled = (hourStr: string) => {
    const h = Number(hourStr)
    if (minTime) {
      const minParsed = parseTimeString(minTime)
      if (minParsed && h < minParsed.hours) return true
    }
    if (maxTime) {
      const maxParsed = parseTimeString(maxTime)
      if (maxParsed && h > maxParsed.hours) return true
    }
    return false
  }

  // Check if a minute is valid for the currently selected hour
  const isMinuteDisabled = (minuteStr: string) => {
    if (!currentHour) return false
    const timeStr = `${currentHour}:${minuteStr}`
    if (minTime && isTimeBefore(timeStr, minTime)) return true
    if (maxTime && isTimeAfter(timeStr, maxTime)) return true
    return false
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
            !value && "text-muted-foreground",
            ariaInvalid && "ring-2 ring-destructive",
            className
          )}
        >
          <span className="font-mono text-sm tracking-tight truncate">
            {value ? value : placeholder}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {clearable && value && !disabled && (
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
                aria-label="Clear time"
                className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground cursor-pointer"
              >
                <X className="size-3" aria-hidden />
              </span>
            )}
            <Clock className="size-4 text-muted-foreground" aria-hidden />
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          container={typeof document !== "undefined" ? document.body : undefined}
          className="w-60 p-0 rounded-2xl bg-card shadow-float z-60 overflow-hidden"
        >
          {/* 2 Columns: Hours & Minutes */}
          <div className="grid grid-cols-2 divide-x divide-border/60">
            {/* Column 1: Hour */}
            <div className="flex flex-col">
              <div className="py-1 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 border-b border-border/40 select-none">
                Hour
              </div>
              <div className="max-h-52 overflow-y-auto p-1 space-y-1 select-none scrollbar-thin">
                {hoursList.map((h) => {
                  const isSelected = currentHour === h
                  const isDisabled = isHourDisabled(h)

                  return (
                    <button
                      key={h}
                      ref={isSelected ? selectedHourRef : undefined}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleHourSelect(h)}
                      className={cn(
                        "w-full py-1 rounded-lg text-md font-mono font-medium transition-colors text-center cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground hover:bg-muted",
                        isDisabled &&
                          "opacity-30 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      {h}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Column 2: Minute */}
            <div className="flex flex-col">
              <div className="py-1 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40 border-b border-border/40 select-none">
                Minute
              </div>
              <div className="max-h-52 overflow-y-auto p-1 space-y-0.5 select-none scrollbar-thin">
                {minutesList.map((m) => {
                  const isSelected = currentMinute === m
                  const isDisabled = isMinuteDisabled(m)

                  return (
                    <button
                      key={m}
                      ref={isSelected ? selectedMinuteRef : undefined}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleMinuteSelect(m)}
                      className={cn(
                        "w-full py-1 rounded-lg text-md font-mono font-medium transition-colors text-center cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-foreground hover:bg-muted",
                        isDisabled &&
                          "opacity-30 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
