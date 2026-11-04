import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/email-logs")({
  component: EmailLogsPage,
})

function EmailLogsPage() {
  return (
    <div className="min-h-100">
      {/* Main content kosong */}
    </div>
  )
}
