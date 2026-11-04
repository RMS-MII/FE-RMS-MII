import { createFileRoute } from "@tanstack/react-router"
import { ManageStagesPage } from "@/features/recruitments"

export const Route = createFileRoute("/_auth/recruitments/$id/stages")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <ManageStagesPage id={id} />
}

