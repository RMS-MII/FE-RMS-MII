import { createFileRoute } from "@tanstack/react-router"
import { MyInterviewDetailPage } from "@/features/interviews/pages/MyInterviewDetailPage"

export const Route = createFileRoute(
  "/_auth/interviews/schedules/$sessionInterviewId"
)({
  component: () => (
    <MyInterviewDetailPage
      sessionInterviewId={Route.useParams().sessionInterviewId}
    />
  ),
})
