import { createFileRoute } from "@tanstack/react-router"
import { CandidateDetailPage } from "@/features/candidates"

export const Route = createFileRoute("/_auth/candidates/$id")({
  component: () => <CandidateDetailPage id={Route.useParams().id} />,
})
