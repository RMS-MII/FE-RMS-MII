import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

export type StatCardTone = "primary" | "success" | "danger" | "neutral"

export interface StatCardTrend {
  value: number
  direction: "up" | "down"
}

const statCardToneStyles: Record<StatCardTone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-neutral",
}

const trendToneStyles: Record<StatCardTrend["direction"], string> = {
  up: "bg-success-soft text-success",
  down: "bg-danger-soft text-danger",
}

export interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: StatCardTone
  description?: string
  trend?: StatCardTrend
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            statCardToneStyles[tone]
          )}
        >
          <Icon className="size-4.5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {trend ? (
        <span
          className={cn(
            "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
            trendToneStyles[trend.direction]
          )}
        >
          {trend.direction === "up" ? (
            <TrendingUp className="size-3" aria-hidden />
          ) : (
            <TrendingDown className="size-3" aria-hidden />
          )}
          <span>{trend.value > 0 ? `+${trend.value}` : trend.value}</span>
        </span>
      ) : null}
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}
