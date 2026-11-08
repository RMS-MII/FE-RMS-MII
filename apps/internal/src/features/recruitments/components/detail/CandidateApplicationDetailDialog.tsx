import { useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CancelButton, ErrorState } from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { safeFormatDate } from "@/shared/lib/format"
import type { CandidateApplicationDetailItem } from "../../types"
import {
  useGetApplicationByIdQuery,
  useStartApplicationStageMutation,
} from "../../api/applications-api"
import { mapApplicationRecap } from "../../utils/applicationRecapAdapter"
import { getStartStageRestriction } from "../../utils/applicationStageUtils"
import { StartApplicationStageDialog } from "./StartApplicationStageDialog"
import { CandidateProfileCard } from "./CandidateProfileCard"
import { StageTimelineProgress } from "./StageTimelineProgress"
import { StageEvaluationEvidence } from "./StageEvaluationEvidence"
import { StageDecisionFooter } from "./StageDecisionFooter"

export interface CandidateApplicationDetailDialogProps {
  applicationId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ApplicationDetailContentProps {
  application: CandidateApplicationDetailItem
  onOpenChange: (open: boolean) => void
  onRefresh: () => void
  onStartStage: () => void
  startRestriction: string | null
  isStarting: boolean
}

function ApplicationDetailContent({
  application,
  onOpenChange,
  onRefresh,
  onStartStage,
  startRestriction,
  isStarting,
}: ApplicationDetailContentProps) {
  const stages = application.applicationStages || []
  const activeStageIndex = application.currentStageIndex
  const [stageIndex, setStageIndex] = useState(
    activeStageIndex >= 0 ? activeStageIndex : stages.length - 1
  )
  const selectedStageIndex = Math.max(
    -1,
    Math.min(stageIndex, stages.length - 1)
  )
  const isFinalStage =
    activeStageIndex >= 0 && activeStageIndex === stages.length - 1

  return (
    <DialogContent className="flex max-h-[90dvh] w-full flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-4xl lg:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border p-6 pr-14 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <DialogTitle className="text-base font-semibold text-foreground">
            Candidate Application
          </DialogTitle>
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium text-muted-foreground">
            {application.codeApplication}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isStarting}
            className="ml-auto h-8 gap-1.5 rounded-full bg-card px-3 text-xs"
          >
            <RefreshCw className="size-3.5" aria-hidden />
            Refresh
          </Button>
        </div>
        <DialogDescription className="text-sm leading-relaxed">
          Review the candidate profile and selection-stage evaluations for{" "}
          {application.batch.name}.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3 border-b border-border px-6 py-4">
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
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
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
                currentStageIndex={application.currentStageIndex}
                selectedStageIndex={selectedStageIndex}
                onSelectStage={setStageIndex}
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
      </div>

      <StageDecisionFooter
        key={stages[selectedStageIndex]?.stageId ?? "no-stage"}
        application={application}
        stage={stages[selectedStageIndex]}
        isViewingActiveStage={
          selectedStageIndex === application.currentStageIndex
        }
        isFinalStage={isFinalStage}
        onGoToActiveStage={() => setStageIndex(activeStageIndex)}
        onStartStage={onStartStage}
        startRestriction={startRestriction}
        isStarting={isStarting}
        onClose={() => onOpenChange(false)}
      />
    </DialogContent>
  )
}

function ApplicationRecapContent({
  applicationId,
  onOpenChange,
}: {
  applicationId: string
  onOpenChange: (open: boolean) => void
}) {
  const { currentData, isFetching, isError, error, refetch } =
    useGetApplicationByIdQuery(applicationId, {
      refetchOnMountOrArgChange: true,
    })
  const application = useMemo(
    () => (currentData ? mapApplicationRecap(currentData) : null),
    [currentData]
  )

  const [startStage, { isLoading: isStarting }] =
    useStartApplicationStageMutation()
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)
  const startRestriction = application
    ? getStartStageRestriction(application)
    : "Application details are unavailable."
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

  const problem = getApiError(
    error,
    "Unable to load this application. Please try again."
  )
  const isForbidden = problem.status === 403
  const isNotFound = problem.status === 404
  const fallbackContent = (
    <DialogContent className="flex max-h-[90dvh] w-full flex-col gap-0 overflow-hidden rounded-2xl bg-card p-0 sm:max-w-4xl lg:max-w-5xl">
      <DialogHeader className="shrink-0 border-b border-border p-6 pr-14 pb-4">
        <DialogTitle className="text-base font-semibold text-foreground">
          Candidate Application
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed">
          Review the candidate profile and selection-stage evaluations.
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isError ? (
          <ErrorState
            title={
              isForbidden
                ? "Access denied"
                : isNotFound
                  ? "Application unavailable"
                  : "Failed to load application"
            }
            description={
              isForbidden
                ? "You do not have access to this application."
                : isNotFound
                  ? "This application could not be found. Close this dialog and refresh the candidate list."
                  : problem.message
            }
            onRetry={
              isForbidden || isNotFound ? undefined : () => void refetch()
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
      </div>
      <div className="flex justify-end border-t border-border px-6 py-4">
        <CancelButton onClick={() => onOpenChange(false)}>Close</CancelButton>
      </div>
    </DialogContent>
  )
  return (
    <>
      {!isError && (!isFetching || isStartOpen) && application ? (
        <ApplicationDetailContent
          application={application}
          onOpenChange={onOpenChange}
          onRefresh={() => void refetch()}
          onStartStage={() => {
            setStartError(null)
            setIsStartOpen(true)
          }}
          startRestriction={startRestriction}
          isStarting={isStarting}
        />
      ) : (
        fallbackContent
      )}
      {application && (
        <StartApplicationStageDialog
          open={isStartOpen}
          onOpenChange={setIsStartOpen}
          candidateName={application.candidateName}
          stageName={application.currentStageName}
          isTest={
            application.applicationStages[application.currentStageIndex]
              ?.stageType === "test"
          }
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
    </>
  )
}

export function CandidateApplicationDetailDialog({
  applicationId,
  open,
  onOpenChange,
}: CandidateApplicationDetailDialogProps) {
  if (!applicationId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ApplicationRecapContent
          key={applicationId}
          applicationId={applicationId}
          onOpenChange={onOpenChange}
        />
      )}
    </Dialog>
  )
}

export { CandidateApplicationDetailDialog as CandidateDetailDialog }
