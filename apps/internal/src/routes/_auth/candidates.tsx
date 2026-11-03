import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/candidates")({
  component: CandidatesPage,
})

function CandidatesPage() {
  return (
    <div className="min-h-100">
      {/* Content placeholder */}
    </div>
  )
}

