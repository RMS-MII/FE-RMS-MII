import { useRef, useState, type PointerEvent } from "react"
import { Clock3 } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

interface TimeRangePickerProps {
  id: string
  startTime: string
  endTime: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
  invalid?: boolean
}

const DIAL_SIZE = 224
const DIAL_CENTER = DIAL_SIZE / 2
const DIAL_RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS
const MINUTES_PER_DIAL = 12 * 60

type DragState =
  | { kind: "create"; start: number }
  | { kind: "start"; end: number }
  | { kind: "end"; start: number }
  | { kind: "move"; pointerMinutes: number; start: number; duration: number }
type DialZone = DragState["kind"]

function toMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
}

function pointOnDial(minutes: number, radius: number) {
  const angle = ((minutes % MINUTES_PER_DIAL) / MINUTES_PER_DIAL) * Math.PI * 2 - Math.PI / 2
  return {
    x: DIAL_CENTER + Math.cos(angle) * radius,
    y: DIAL_CENTER + Math.sin(angle) * radius,
  }
}

export function TimeRangePicker({
  id,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
  invalid = false,
}: TimeRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [hoverZone, setHoverZone] = useState<DialZone>("create")
  const dragState = useRef<DragState | null>(null)
  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  const startPoint = pointOnDial(start, DIAL_RADIUS)
  const endPoint = pointOnDial(end, DIAL_RADIUS)
  const rangeLength = Math.max(0, end - start)

  const pointerPosition = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - bounds.left - bounds.width / 2
    const y = event.clientY - bounds.top - bounds.height / 2
    const clockwiseAngle = (Math.atan2(y, x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)
    return {
      minutes: Math.min(715, Math.round((clockwiseAngle / (Math.PI * 2)) * 144) * 5),
      radius: Math.hypot(x, y),
    }
  }

  const zoneAtPointer = (
    event: PointerEvent<HTMLDivElement>,
    position: ReturnType<typeof pointerPosition>
  ): DialZone => {
    const handle = event.target instanceof Element
      ? event.target.getAttribute("data-time-handle")
      : null
    if (handle === "start" || handle === "end") return handle

    if (
      rangeLength > 0 &&
      position.radius >= DIAL_RADIUS - 16 &&
      position.radius <= DIAL_RADIUS + 16 &&
      rangeLength <= MINUTES_PER_DIAL &&
      ((position.minutes - start + MINUTES_PER_DIAL) % MINUTES_PER_DIAL) <= rangeLength
    ) return "move"

    return "create"
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    const position = pointerPosition(event)
    const zone = zoneAtPointer(event, position)
    setHoverZone(zone)

    if (zone === "start") {
      dragState.current = { kind: "start", end }
      return
    }
    if (zone === "end") {
      dragState.current = { kind: "end", start }
      return
    }
    if (zone === "move") {
      dragState.current = { kind: "move", pointerMinutes: position.minutes, start, duration: rangeLength }
      return
    }

    const nextStart = Math.min(Math.floor(start / MINUTES_PER_DIAL) * MINUTES_PER_DIAL + position.minutes, 1430)
    dragState.current = { kind: "create", start: nextStart }
    onStartChange(toTime(nextStart))
    onEndChange(toTime(Math.min(nextStart + 60, 1435)))
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current
    const position = pointerPosition(event)
    if (!drag) {
      setHoverZone(zoneAtPointer(event, position))
      return
    }

    if (drag.kind === "start") {
      if (drag.end >= 5) {
        let candidate = Math.floor(start / MINUTES_PER_DIAL) * MINUTES_PER_DIAL + position.minutes
        if (candidate - start > MINUTES_PER_DIAL / 2) candidate -= MINUTES_PER_DIAL
        if (start - candidate > MINUTES_PER_DIAL / 2) candidate += MINUTES_PER_DIAL
        onStartChange(toTime(Math.max(0, Math.min(candidate, drag.end - 5))))
      }
      return
    }
    if (drag.kind === "end") {
      if (drag.start <= 1430) {
        let candidate = Math.floor(end / MINUTES_PER_DIAL) * MINUTES_PER_DIAL + position.minutes
        if (candidate - end > MINUTES_PER_DIAL / 2) candidate -= MINUTES_PER_DIAL
        if (end - candidate > MINUTES_PER_DIAL / 2) candidate += MINUTES_PER_DIAL
        onEndChange(toTime(Math.min(1435, Math.max(candidate, drag.start + 5))))
      }
      return
    }

    if (drag.kind === "move") {
      let delta = position.minutes - drag.pointerMinutes
      if (delta > MINUTES_PER_DIAL / 2) delta -= MINUTES_PER_DIAL
      if (delta < -MINUTES_PER_DIAL / 2) delta += MINUTES_PER_DIAL
      const nextStart = Math.max(0, Math.min(1435 - drag.duration, drag.start + delta))
      onStartChange(toTime(nextStart))
      onEndChange(toTime(nextStart + drag.duration))
      return
    }

    let candidate = Math.floor(drag.start / MINUTES_PER_DIAL) * MINUTES_PER_DIAL + position.minutes
    if (candidate < drag.start && drag.start - candidate > MINUTES_PER_DIAL / 2)
      candidate += MINUTES_PER_DIAL
    onEndChange(toTime(Math.min(1435, Math.max(drag.start + 5, candidate))))
  }

  const stopDragging = () => {
    dragState.current = null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        id={id}
        aria-invalid={invalid}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          invalid && "ring-2 ring-destructive"
        )}
      >
        <span className="font-mono tabular-nums">{startTime} - {endTime} WIB</span>
        <Clock3 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={6}
        className="w-105 max-w-[calc(100vw-1rem)] rounded-2xl bg-card p-4 shadow-float"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div
            role="group"
            aria-label="Drag the start or end marker to edit its time, or drag the highlighted arc to move both"
            className={cn(
              "relative size-56 shrink-0 touch-none select-none rounded-full bg-muted/70",
              hoverZone === "start" || hoverZone === "end"
                ? "cursor-pointer"
                : hoverZone === "move" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
            onPointerLeave={() => { if (!dragState.current) setHoverZone("create") }}
          >
            <svg className="absolute inset-0 size-full" viewBox="0 0 224 224" aria-hidden>
              <circle cx="112" cy="112" r={DIAL_RADIUS} fill="none" stroke="currentColor" strokeWidth="10" className="text-border" />
              <circle
                cx="112" cy="112" r={DIAL_RADIUS} fill="none" stroke="currentColor" strokeWidth="10"
                strokeDasharray={`${(Math.min(rangeLength, MINUTES_PER_DIAL) / MINUTES_PER_DIAL) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={-((start % MINUTES_PER_DIAL) / MINUTES_PER_DIAL) * CIRCUMFERENCE}
                transform="rotate(-90 112 112)"
                className="text-primary"
              />
              <circle data-time-handle="start" cx={startPoint.x} cy={startPoint.y} r="11" className="cursor-pointer fill-primary" />
              <text x={startPoint.x} y={startPoint.y} textAnchor="middle" dominantBaseline="central" className="pointer-events-none fill-primary-foreground text-[10px] font-bold">S</text>
              <circle data-time-handle="end" cx={endPoint.x} cy={endPoint.y} r="11" strokeWidth="2" className="cursor-pointer fill-background stroke-primary" />
              <text x={endPoint.x} y={endPoint.y} textAnchor="middle" dominantBaseline="central" className="pointer-events-none fill-primary text-[10px] font-bold">E</text>
            </svg>
            {Array.from({ length: 12 }, (_, index) => {
              const hour = index === 0 ? 12 : index
              const point = pointOnDial(hour * 60, 62)
              return (
                <span
                  key={hour}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-mono text-xs tabular-nums text-muted-foreground"
                  style={{ left: point.x, top: point.y }}
                >
                  {hour}
                </span>
              )
            })}
          </div>

          <div className="min-w-28 flex-1 space-y-3" role="group" aria-label="Edit time range">
            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Start</span>
              <input
                type="time"
                value={startTime}
                onChange={(event) => event.target.value && onStartChange(event.target.value)}
                className="block h-9 w-full rounded-lg border border-border bg-background px-2 font-mono text-sm tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full border border-primary bg-background" />End</span>
              <input
                type="time"
                value={endTime}
                onChange={(event) => event.target.value && onEndChange(event.target.value)}
                className="block h-9 w-full rounded-lg border border-border bg-background px-2 font-mono text-sm tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
            <Button type="button" size="sm" onClick={() => setOpen(false)} className="w-full rounded-full">
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
