import { useNavigate } from "@tanstack/react-router"
import { ShieldAlert, Home, ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ErrorLayout } from "./ErrorLayout"

export interface ForbiddenPageProps {
  title?: string
  description?: string
  homePath?: string
}

export function ForbiddenPage({
  title = "Access Denied",
  description = "You do not have the required permissions to view this page or resource.",
  homePath = "/dashboard",
}: ForbiddenPageProps) {
  const navigate = useNavigate()

  return (
    <ErrorLayout
      statusCode="403"
      icon={<ShieldAlert className="size-8 stroke-[1.75] text-amber-500" />}
      title={title}
      description={description}
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="rounded-full gap-2 cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Go Back</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate({ to: homePath })}
            className="rounded-full gap-2 cursor-pointer"
          >
            <Home className="size-4" />
            <span>Back to Dashboard</span>
          </Button>
        </>
      }
    />
  )
}

