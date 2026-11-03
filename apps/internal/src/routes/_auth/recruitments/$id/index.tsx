import { createFileRoute } from "@tanstack/react-router"
import { RecruitmentDetailPage } from "@/features/recruitments"

export const Route = createFileRoute("/_auth/recruitments/$id/")({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <RecruitmentDetailPage id={id} />
}
