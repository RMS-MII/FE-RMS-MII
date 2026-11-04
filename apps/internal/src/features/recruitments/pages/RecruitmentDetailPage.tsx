import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { PageHeader } from "@/shared/components"
import { initialRecruitments, recruitmentPipeline } from "../data/mock"
import { StagePipeline } from "../components/StagePipeline"
import {
  RecruitmentDetailHeader,
  SummaryTab,
  StagesTab,
  CandidatesTab,
  InterviewsTab,
  EvaluationsTab,
  DecisionsTab,
} from "../components/detail"
import { candidates, interviews, evaluations } from "@/data/mock"
import { cn } from "@/shared/lib/utils"

export type TabKey =
  | "summary"
  | "stages"
  | "candidates"
  | "interviews"
  | "evaluations"
  | "decisions"

export interface RecruitmentDetailPageProps {
  id: string
  activeTab?: TabKey
  selectedStage?: number | null
  onTabChange?: (tab: TabKey) => void
  onStageChange?: (stageIndex: number | null) => void
}

export function RecruitmentDetailPage({
  id,
  activeTab: controlledTab,
  selectedStage: controlledStage,
  onTabChange,
  onStageChange,
}: RecruitmentDetailPageProps) {
  const navigate = useNavigate()
  const [internalTab, setInternalTab] = useState<TabKey>("summary")
  const [internalStage, setInternalStage] = useState<number | null>(null)

  const activeTab = controlledTab ?? internalTab
  const selectedStage = controlledStage !== undefined ? controlledStage : internalStage

  const handleTabChange = (newTab: TabKey) => {
    if (onTabChange) {
      onTabChange(newTab)
    } else {
      setInternalTab(newTab)
    }
  }

  const handleStageChange = (newStage: number | null) => {
    if (onStageChange) {
      onStageChange(newStage)
    } else {
      setInternalStage(newStage)
    }
  }

  const recruitment = useMemo(() => {
    return initialRecruitments.find((r) => r.id === id) ?? null
  }, [id])

  // Related data counts matching ERD records
  const recruitmentCandidates = useMemo(() => {
    return candidates.filter((c) => c.recruitmentId === id)
  }, [id])

  const recruitmentInterviews = useMemo(() => {
    return interviews.filter((i) => i.recruitmentId === id)
  }, [id])

  const recruitmentEvaluations = useMemo(() => {
    return evaluations.filter((e) =>
      recruitmentInterviews.some((i) => i.id === e.interviewId)
    )
  }, [recruitmentInterviews])

  const pendingDecisions = useMemo(() => {
    return recruitmentCandidates.filter((c) => c.status === "pending")
  }, [recruitmentCandidates])

  const pipelineItems = useMemo(() => {
    if (!recruitment) return []
    return recruitmentPipeline(recruitment)
  }, [recruitment])

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
              onClick={() => navigate({ to: "/recruitments" })}
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

  const handleStageSelect = (index: number) => {
    if (activeTab === "candidates" && selectedStage === index) {
      handleStageChange(null)
    } else {
      handleStageChange(index)
    }
  }

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "summary", label: "Summary" },
    { key: "stages", label: "Stages", count: recruitment.stages.length },
    { key: "candidates", label: "Candidates", count: recruitmentCandidates.length },
    { key: "interviews", label: "Interviews", count: recruitmentInterviews.length },
    { key: "evaluations", label: "Evaluations", count: recruitmentEvaluations.length },
    { key: "decisions", label: "Decisions", count: pendingDecisions.length },
  ]

  const handleCreateStage = () => {
    navigate({
      to: "/recruitments/$id/stages",
      params: { id: recruitment.id },
    })
  }

  const handleEditStage = () => {
    navigate({
      to: "/recruitments/$id/stages",
      params: { id: recruitment.id },
    })
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
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card p-1 shadow-card"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 cursor-pointer select-none",
                  isActive
                    ? "bg-primary-50 text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs tabular-nums font-semibold",
                      isActive
                        ? "bg-primary/10 text-primary"
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

      <section aria-label={tabs.find((t) => t.key === activeTab)?.label}>
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
        {activeTab === "evaluations" && (
          <EvaluationsTab recruitment={recruitment} />
        )}
        {activeTab === "decisions" && (
          <DecisionsTab recruitment={recruitment} />
        )}
      </section>
    </div>
  )
}
