import { createFileRoute } from "@tanstack/react-router"
import {
  CandidateApplicationDetailPage,
  candidateNavigationSearchSchema,
} from "@/features/recruitments"

export const Route = createFileRoute(
  "/_auth/recruitments/$id/applications/$applicationId"
)({
  validateSearch: (search: Record<string, unknown>) =>
    candidateNavigationSearchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const { id, applicationId } = Route.useParams()
  const returnContext = Route.useSearch()
  return (
    <CandidateApplicationDetailPage
      batchId={id}
      applicationId={applicationId}
      returnContext={returnContext}
    />
  )
}
