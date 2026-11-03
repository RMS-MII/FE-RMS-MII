import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { RecruitmentDetailPage, type TabKey } from "@/features/recruitments"

const tabEnum = z.enum([
  "summary",
  "stages",
  "candidates",
  "interviews",
  "evaluations",
  "decisions",
])

const recruitmentDetailSearchSchema = z.object({
  tab: tabEnum.optional().catch(undefined),
  stage: z.coerce.number().optional().catch(undefined),
})

export type RecruitmentDetailSearch = z.infer<typeof recruitmentDetailSearchSchema>

export const Route = createFileRoute("/_auth/recruitments/$id/")({
  validateSearch: (search: Record<string, unknown>): RecruitmentDetailSearch =>
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
      activeTab={(search.tab as TabKey | undefined) ?? "summary"}
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
          }),
          replace: true,
        })
      }}
    />
  )
}
