import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/email-logs")({
  component: EmailLogsPage,
})

function EmailLogsPage() {
  return (
    <div className="min-h-[400px]">
      {/* Main content kosong */}
    </div>
  )
}
