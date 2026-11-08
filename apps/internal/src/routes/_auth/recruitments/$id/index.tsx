import { createFileRoute } from "@tanstack/react-router"
import {
  RecruitmentDetailPage,
  recruitmentDetailSearchSchema,
} from "@/features/recruitments"

export const Route = createFileRoute("/_auth/recruitments/$id/")({
  validateSearch: (search: Record<string, unknown>) =>
    recruitmentDetailSearchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <RecruitmentDetailPage
      id={id}
      activeTab={search.tab ?? "summary"}
      selectedStage={search.stage ?? null}
      onTabChange={(newTab) => {
        navigate({
          search: (prev) => ({
            ...prev,
            tab: newTab === "summary" ? undefined : newTab,
            stage: newTab === "candidates" ? prev.stage : undefined,
          }),
          replace: true,
        })
      }}
      onStageChange={(newStage) => {
        navigate({
          search: (prev) => ({
            ...prev,
            tab: "candidates",
            stage: newStage ?? undefined,
            candidatePage: undefined,
          }),
          replace: true,
        })
      }}
    />
  )
}
