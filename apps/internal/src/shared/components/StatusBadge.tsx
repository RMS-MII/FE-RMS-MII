import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

export type Tone = "success" | "warning" | "info" | "danger" | "neutral"

const toneStyles: Record<Tone, string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  info: "bg-blue-500/20 text-blue-800",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-neutral-soft text-neutral",
}

export interface StatusBadgeProps {
  tone: Tone
  children: ReactNode
  icon?: ReactNode
  className?: string
}

export function StatusBadge({ tone, children, icon, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-3 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5",
        toneStyles[tone],
        className
      )}
    >
      {icon}
      <span>{children}</span>
    </span>
  )
}

