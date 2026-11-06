import { ArrowLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PageHeader, BackButton, Panel, ErrorState } from "@/shared/components"
import { StagePipeline } from "../components/StagePipeline"
import {
  RecruitmentDetailHeader,
  SummaryTab,
  StagesTab,
  CandidatesTab,
  InterviewsTab,
} from "../components/detail"
import { cn } from "@/shared/lib/utils"
import {
  useRecruitmentDetail,
  type TabKey,
  type UseRecruitmentDetailProps,
} from "../hooks/useRecruitmentDetail"

export type { TabKey }

export interface RecruitmentDetailPageProps extends UseRecruitmentDetailProps {}

export function RecruitmentDetailPage(props: RecruitmentDetailPageProps) {
  const { id } = props
  const {
    recruitment,
    isLoading,
    isError,
    refetch,
    activeTab,
    selectedStage,
    tabs,
    pipelineItems,
    handleTabChange,
    handleStageChange,
    handleStageSelect,
    handleCreateStage,
    handleEditStage,
    handleBackToList,
  } = useRecruitmentDetail(props)

  // 1. Loading state with identical layout structure
  if (isLoading && !recruitment) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3.5">
          <BackButton to="/recruitments" label="Back to recruitments list" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-7 w-60 rounded-lg" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-96 max-w-full rounded-md" />
          </div>
        </div>

        <section aria-label="Recruitment stages flow">
          <Skeleton className="h-14 w-full rounded-2xl" />
        </section>

        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card p-1 shadow-card">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>

        <Panel>
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-4 items-baseline"
              >
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    )
  }

  // 2. Error state
  if (isError && !recruitment) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3.5">
          <BackButton to="/recruitments" label="Back to recruitments list" />
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recruitment Batch
            </h1>
          </div>
        </div>

        <Panel className="p-8">
          <ErrorState
            title="Failed to load recruitment batch"
            description="Unable to fetch the recruitment batch details. Please check your connection and try again."
            onRetry={() => refetch()}
          />
        </Panel>
      </div>
    )
  }

  // 3. Not Found state
  if (!recruitment) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Recruitment Not Found"
          description={`No recruitment exists with ID "${id}".`}
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="gap-2 rounded-full border-0 bg-muted px-4 hover:bg-muted/40 cursor-pointer"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Recruitments</span>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RecruitmentDetailHeader recruitment={recruitment} />

      <section aria-label="Recruitment stages flow">
        <StagePipeline
          items={pipelineItems}
          selected={activeTab === "candidates" ? selectedStage : null}
          onSelect={handleStageSelect}
          onCreateStage={handleCreateStage}
        />
        {recruitment.status === "draft" && (
          <p className="mt-2 text-xs text-muted-foreground">
            This recruitment batch is currently in draft. Stages will commence once opened.
          </p>
        )}
      </section>

      <div>
        <div
          role="tablist"
          aria-label="Recruitment detail sections"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card p-1"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.key}`}
                id={`tab-${tab.key}`}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="focus-visible:outline-none"
      >
        {activeTab === "summary" && <SummaryTab recruitment={recruitment} />}
        {activeTab === "stages" && (
          <StagesTab
            recruitment={recruitment}
            onCreateStage={handleCreateStage}
            onEditStage={handleEditStage}
          />
        )}
        {activeTab === "candidates" && (
          <CandidatesTab
            recruitment={recruitment}
            selectedStageIndex={selectedStage}
            onStageChange={handleStageChange}
          />
        )}
        {activeTab === "interviews" && (
          <InterviewsTab recruitment={recruitment} />
        )}
      </div>
    </div>
  )
}
