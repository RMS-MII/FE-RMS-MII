import { useNavigate } from "@tanstack/react-router"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { ErrorLayout } from "./ErrorLayout"

export interface NotFoundPageProps {
  title?: string
  description?: string
  homePath?: string
  [key: string]: unknown
}

export function NotFoundPage({
  title = "Page Not Found",
  description = "Sorry, the page you are looking for does not exist, has been removed, or is temporarily unavailable.",
  homePath = "/dashboard",
}: NotFoundPageProps = {}) {
  const navigate = useNavigate()

  return (
    <ErrorLayout
      statusCode="404"
      icon={<FileQuestion className="size-8 stroke-[1.75]" />}
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

