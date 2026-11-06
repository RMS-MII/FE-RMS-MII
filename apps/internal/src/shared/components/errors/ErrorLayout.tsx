import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

export interface ErrorLayoutProps {
  statusCode?: string | number
  icon?: ReactNode
  title: string
  description?: string
  actions?: ReactNode
  extra?: ReactNode
  className?: string
}

export function ErrorLayout({
  statusCode,
  icon,
  title,
  description,
  actions,
  extra,
  className,
}: ErrorLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-6 text-center",
        className
      )}
    >
      <div className="flex max-w-md flex-col items-center">
        {statusCode && (
          <div className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-primary">
            {statusCode}
          </div>
        )}

        {icon && (
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-sm">
            {icon}
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}

        {actions && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        )}

        {extra && <div className="mt-6 w-full text-left">{extra}</div>}
      </div>
    </div>
  )
}

