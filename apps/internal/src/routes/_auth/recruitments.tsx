import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/recruitments")({
  component: RecruitmentsPage,
})

function RecruitmentsPage() {
  return (
    <div className="min-h-[400px]">
      {/* Content placeholder */}
    </div>
  )
}

