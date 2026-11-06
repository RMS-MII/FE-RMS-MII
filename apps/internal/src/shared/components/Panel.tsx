import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export function Panel({ children, className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface PanelHeaderProps {
  title?: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  className?: string
  children?: ReactNode
}

export function PanelHeader({
  title,
  description,
  meta,
  actions,
  className,
  children,
}: PanelHeaderProps) {
  if (children) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4",
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-5 py-4",
        className
      )}
    >
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
        {meta && <p className="text-xs text-muted-foreground tabular-nums">{meta}</p>}
        {description && (
          <p className="w-full text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

