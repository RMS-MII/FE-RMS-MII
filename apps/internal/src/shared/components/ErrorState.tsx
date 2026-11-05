import type { ReactNode } from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@/shared/lib/utils"

export interface ErrorStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  action?: ReactNode
  className?: string
}

export function ErrorState({
  icon,
  title = "Failed to load data",
  description = "Something went wrong while fetching the data. Please check your connection and try again.",
  onRetry,
  retryLabel = "Try Again",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
        {icon ?? <AlertCircle className="size-6 stroke-[1.75]" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-full text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action ? (
        <div className="mt-4">{action}</div>
      ) : onRetry ? (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="rounded-full gap-2 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>{retryLabel}</span>
          </Button>
        </div>
      ) : null}
    </div>
  )
}

