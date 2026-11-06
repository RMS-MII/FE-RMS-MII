import { useState } from "react"
import { useNavigate, type ErrorComponentProps } from "@tanstack/react-router"
import { AlertTriangle, Home, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ErrorLayout } from "./ErrorLayout"

export function GeneralErrorPage({ error, reset }: ErrorComponentProps) {
  const navigate = useNavigate()
  const [showDetails, setShowDetails] = useState(false)

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "An unexpected error occurred."

  const isDev = import.meta.env.DEV

  return (
    <ErrorLayout
      statusCode="500"
      icon={<AlertTriangle className="size-8 stroke-[1.75] text-destructive" />}
      title="Something went wrong"
      description="An unexpected error occurred while loading this page. Please try refreshing or return to the dashboard."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (reset) {
                reset()
              } else {
                window.location.reload()
              }
            }}
            className="rounded-full gap-2 cursor-pointer"
          >
            <RotateCcw className="size-4" />
            <span>Try Again</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate({ to: "/dashboard" })}
            className="rounded-full gap-2 cursor-pointer"
          >
            <Home className="size-4" />
            <span>Back to Dashboard</span>
          </Button>
        </>
      }
      extra={
        isDev ? (
          <div className="mt-4 w-full overflow-hidden rounded-xl border border-border bg-muted/50 text-left text-xs">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between px-3 py-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <span className="font-mono font-medium">Error Details (Development Only)</span>
              {showDetails ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
            {showDetails && (
              <pre className="max-h-48 overflow-auto border-t border-border p-3 font-mono text-[11px] text-destructive">
                {errorMessage}
                {error instanceof Error && error.stack && `\n\n${error.stack}`}
              </pre>
            )}
          </div>
        ) : undefined
      }
    />
  )
}

