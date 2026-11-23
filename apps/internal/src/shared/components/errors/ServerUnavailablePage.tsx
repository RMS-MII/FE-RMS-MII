import { RotateCcw, ServerCrash } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ErrorLayout } from "./ErrorLayout"

export function ServerUnavailablePage() {
  return (
    <ErrorLayout
      statusCode="Connection Error"
      icon={<ServerCrash className="size-8 stroke-[1.75] text-destructive" />}
      title="Server Unavailable"
      description="Unable to connect to the server. Please check your connection and try again."
      className="min-h-screen"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="cursor-pointer gap-2 rounded-full"
        >
          <RotateCcw className="size-4" />
          <span>Try Again</span>
        </Button>
      }
    />
  )
}
