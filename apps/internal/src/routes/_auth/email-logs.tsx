import { createFileRoute } from "@tanstack/react-router"
import { EmailLogsPage } from "@/features/email-logs/pages/EmailLogsPage"

export const Route = createFileRoute("/_auth/email-logs")({
  component: EmailLogsPage,
})
