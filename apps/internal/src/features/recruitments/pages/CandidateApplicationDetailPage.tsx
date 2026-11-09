import { useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { BackButton, ErrorState, Panel } from "@/shared/components"
import { usePageBreadcrumbs } from "@/shared/components/layout/breadcrumbs-context"
import type { Crumb } from "@/shared/components/layout/AppShell"
import { getApiError } from "@/shared/api/api-error"
import { safeFormatDate } from "@/shared/lib/format"
import {
  useGetApplicationByIdQuery,
  useStartApplicationStageMutation,
} from "../api/applications-api"
import { mapApplicationRecap } from "../utils/applicationRecapAdapter"
import { getStartStageRestriction } from "../utils/applicationStageUtils"
import type { CandidateNavigationSearch } from "../schemas/recruitment-navigation"
import { CandidateProfileCard } from "../components/detail/CandidateProfileCard"
import { StageTimelineProgress } from "../components/detail/StageTimelineProgress"
import { StageEvaluationEvidence } from "../components/detail/StageEvaluationEvidence"
import { StageDecisionFooter } from "../components/detail/StageDecisionFooter"
import { StartApplicationStageDialog } from "../components/detail/StartApplicationStageDialog"

export interface CandidateApplicationDetailPageProps {
  batchId: string
  applicationId: string
  returnContext: CandidateNavigationSearch
}

function ApplicationDetailContent({
  batchId,
  applicationId,
  returnContext,
}: CandidateApplicationDetailPageProps) {
  const navigate = useNavigate()
  const { currentData, isFetching, isError, error, refetch } =
    useGetApplicationByIdQuery(applicationId, {
      refetchOnMountOrArgChange: true,
    })
  const belongsToBatch =
    currentData?.recruitmentBatchId.toLowerCase() === batchId.toLowerCase()
  const application = useMemo(
    () =>
      currentData && belongsToBatch ? mapApplicationRecap(currentData) : null,
    [currentData, belongsToBatch]
  )
  const [startStage, { isLoading: isStarting }] =
    useStartApplicationStageMutation()
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null)

  const stages = application?.applicationStages ?? []
  const activeStageIndex = application?.currentStageIndex ?? -1
  const requestedStageIndex = stages.findIndex(
    (stage) => stage.batchStageId === selectedStageId
  )
  const selectedStageIndex =
    requestedStageIndex >= 0
      ? requestedStageIndex
      : activeStageIndex >= 0
        ? activeStageIndex
        : stages.length - 1
  const startRestriction = application
    ? getStartStageRestriction(application)
    : "Application details are unavailable."
  const showDetails = Boolean(
    application && !isError && (!isFetching || isStartOpen)
  )
  const problem = getApiError(
    error,
    "Unable to load this application. Please try again."
  )
  const isForbidden = problem.status === 403
  const isUnavailable =
    problem.status === 404 || Boolean(currentData && !belongsToBatch)
  const backSearch = { ...returnContext, tab: "candidates" as const }
  const breadcrumbBatchName =
    showDetails && application ? application.batch.name : "Recruitment batch"
  const breadcrumbCandidateName =
    showDetails && application
      ? application.candidateName
      : "Candidate Application"
  const crumbs = useMemo<Crumb[]>(
    () => [
      { label: "Dashboard", to: "/dashboard" },
      { label: "Recruitments", to: "/recruitments" },
      {
        label: breadcrumbBatchName,
        to: "/recruitments/" + batchId,
        search: { ...returnContext, tab: "summary" },
      },
      {
        label: "Candidates",
        to: "/recruitments/" + batchId,
        search: { ...returnContext, tab: "candidates" },
      },
      { label: breadcrumbCandidateName },
    ],
    [batchId, breadcrumbBatchName, breadcrumbCandidateName, returnContext]
  )
  usePageBreadcrumbs(crumbs)
  const goBack = () => {
    void navigate({
      to: "/recruitments/$id",
      params: { id: batchId },
      search: backSearch,
      replace: true,
    })
  }

  const handleStartStage = async () => {
    if (!application || isStarting) return
    if (isFetching || isError) {
      setStartError("Refresh the application details before starting a stage.")
      return
    }
    const restriction = getStartStageRestriction(application)
    if (restriction) {
      setStartError(restriction)
      return
    }
    setStartError(null)
    try {
      await startStage({
        applicationId: application.id,
        batchId: application.recruitmentBatchId,
      }).unwrap()
      setIsStartOpen(false)
    } catch (error) {
      setStartError(
        getApiError(error, "Failed to start the next stage. Please try again.")
          .message
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3.5">
        <BackButton
          onClick={goBack}
          disabled={isStarting}
          label="Back to Candidates"
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Candidate Application
            </h1>
            {showDetails && application && (
              <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                {application.codeApplication}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {showDetails && application ? (
              <>
                Review selection progress and evaluations for{" "}
                <span className="font-semibold text-foreground">
                  {application.batch.name}
                </span>
                .
              </>
            ) : (
              "Review the candidate profile and selection-stage evaluations."
            )}
          </p>
        </div>
      </div>

      <Panel className="space-y-0">
        {showDetails && application ? (
          <>
            <div className="space-y-3 border-b border-border p-6">
              <CandidateProfileCard application={application} />
              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                {application.appliedAt && (
                  <span>Applied {safeFormatDate(application.appliedAt)}</span>
                )}
                <span className="tabular-nums">
                  {application.summary.completedStages} of{" "}
                  {application.summary.totalStages} stages completed
                </span>
              </div>
              {application.note && (
                <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground">
                  {application.note}
                </p>
              )}
            </div>
            <div
              className={
                stages.length > 0
                  ? "md:grid md:grid-cols-[280px_minmax(0,1fr)]"
                  : undefined
              }
            >
              {stages.length > 0 && (
                <aside
                  aria-label="Selection stages"
                  className="min-w-0 border-b border-border p-6 md:border-r md:border-b-0"
                >
                  <StageTimelineProgress
                    stages={stages}
                    currentStageIndex={activeStageIndex}
                    selectedStageIndex={selectedStageIndex}
                    onSelectStage={(index) =>
                      setSelectedStageId(stages[index]?.batchStageId ?? null)
                    }
                  />
                </aside>
              )}
              <div className="min-w-0 p-6">
                <StageEvaluationEvidence
                  application={application}
                  stageIndex={selectedStageIndex}
                />
              </div>
            </div>
            <StageDecisionFooter
              key={stages[selectedStageIndex]?.batchStageId ?? "no-stage"}
              application={application}
              stage={stages[selectedStageIndex]}
              isViewingActiveStage={selectedStageIndex === activeStageIndex}
              isFinalStage={
                activeStageIndex >= 0 && activeStageIndex === stages.length - 1
              }
              onGoToActiveStage={() => setSelectedStageId(null)}
              onStartStage={() => {
                setStartError(null)
                setIsStartOpen(true)
              }}
              startRestriction={startRestriction}
              isStarting={isStarting}
              onBack={goBack}
            />
          </>
        ) : isError || isUnavailable ? (
          <ErrorState
            title={
              isForbidden
                ? "Access denied"
                : isUnavailable
                  ? "Application unavailable"
                  : "Failed to load application"
            }
            description={
              isForbidden
                ? "You do not have access to this application."
                : isUnavailable
                  ? "This application is not available in this recruitment batch. Return to Candidates and refresh the list."
                  : problem.message
            }
            onRetry={
              isForbidden || isUnavailable ? undefined : () => void refetch()
            }
          />
        ) : (
          <div role="status" aria-busy="true" className="space-y-6 p-6">
            <span className="sr-only">Loading application details...</span>
            <Skeleton className="h-28 w-full rounded-xl" />
            <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-36 w-full" />
              </div>
            </div>
          </div>
        )}
      </Panel>

      {application && (
        <StartApplicationStageDialog
          open={isStartOpen}
          onOpenChange={setIsStartOpen}
          candidateName={application.candidateName}
          stageName={application.currentStageName}
          isTest={stages[activeStageIndex]?.stageType === "test"}
          isSubmitting={isStarting}
          disabled={isFetching || isError || Boolean(startRestriction)}
          error={
            startError ??
            (isError
              ? "Unable to verify the application progress. Refresh the details and try again."
              : startRestriction)
          }
          onConfirm={() => void handleStartStage()}
        />
      )}
    </div>
  )
}

export function CandidateApplicationDetailPage(
  props: CandidateApplicationDetailPageProps
) {
  return (
    <ApplicationDetailContent
      key={props.batchId + ":" + props.applicationId}
      {...props}
    />
  )
}
