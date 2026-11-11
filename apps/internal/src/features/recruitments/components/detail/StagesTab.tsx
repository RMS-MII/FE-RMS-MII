import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import {
  Panel,
  PanelHeader,
  StatusBadge,
  EmptyState,
  ErrorState,
  CreateButton,
  EditButton,
  TableSkeleton,
  CancelButton,
  SaveButton,
} from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import { safeFormatDate } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import { getRecruitmentStatusMeta } from "../../types"
import { formatStageCategory } from "../../utils"
import type {
  BatchStageLifecycleStatus,
  BatchStageTransitionDto,
  Recruitment,
  Stage,
  StageEmployeeStatus,
} from "../../types"
import { AssignInterviewersDialog } from "./AssignInterviewersDialog"
import { useGetBatchApplicationsQuery } from "../../api/applications-api"
import { useStagesTab } from "../../hooks/useStagesTab"
import { CheckCircle2, CirclePlay, Pencil, UserPlus, X } from "lucide-react"
import { useState } from "react"

export interface StagesTabProps {
  recruitment: Recruitment
  onCreateStage?: () => void
  onEditStage?: () => void
}

const statusColors: Record<StageEmployeeStatus, string> = {
  unknown: "bg-neutral-soft text-neutral",
  pending:
    "bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25",
  accepted:
    "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25",
  declined:
    "bg-rose-500/15 text-rose-800 dark:text-rose-300 hover:bg-rose-500/25",
}

const statusTextColors: Record<StageEmployeeStatus, string> = {
  unknown: "text-neutral",
  pending: "text-amber-800",
  accepted: "text-emerald-800",
  declined: "text-rose-800",
}

const statusLabels: Record<StageEmployeeStatus, string> = {
  unknown: "Unknown",
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
}

type StageTransitionAction = "activate" | "complete"

function normalizeLifecycleStatus(
  value: BatchStageLifecycleStatus | undefined
): "inactive" | "active" | "completed" | undefined {
  if (value === undefined) return undefined
  const normalized = String(value).toLowerCase()
  if (normalized === "0" || normalized === "inactive") return "inactive"
  if (normalized === "1" || normalized === "active") return "active"
  if (normalized === "2" || normalized === "completed") return "completed"
  return undefined
}

function getTransitionCounts(
  result: BatchStageTransitionDto,
  action: StageTransitionAction
) {
  const counts = [
    ["Candidates assigned", result.candidatesStarted],
    ["Passed", result.candidatesPassed],
    ["Rejected", result.candidatesRejected],
    ["Dropped", result.candidatesDropped],
    ["Expired", result.candidatesExpired],
  ] as const
  return action === "complete"
    ? counts.filter(([label]) => label !== "Candidates assigned")
    : counts
}

export function StagesTab({
  recruitment,
  onCreateStage,
  onEditStage,
}: StagesTabProps) {
  const {
    stages,
    isLoading,
    isError,
    refetch,
    totalDays,
    assignStage,
    assignIndex,
    isDialogOpen,
    setIsDialogOpen,
    handleOpenAssignDialog,
    handleSaveInterviewers,
    handleActivateStage,
    handleCompleteStage,
    isTransitioning,
  } = useStagesTab({ recruitment })
  const [pendingTransition, setPendingTransition] = useState<{
    stage: Stage
    action: StageTransitionAction
  } | null>(null)
  const [transitionError, setTransitionError] = useState<string | null>(null)
  const [transitionResult, setTransitionResult] = useState<{
    action: StageTransitionAction
    result: BatchStageTransitionDto
  } | null>(null)

  const configuredStages = stages.filter((stage) => stage.isActive)
  const activeStage = stages.find(
    (stage) => normalizeLifecycleStatus(stage.lifecycleStatus) === "active"
  )
  const activeStageIndex = activeStage
    ? configuredStages.findIndex((stage) => stage.id === activeStage.id)
    : -1
  const nextStageToActivate = activeStage
    ? activeStageIndex >= 0
      ? configuredStages[activeStageIndex + 1]
      : undefined
    : configuredStages[0]
  const isFinalActiveStage =
    activeStage !== undefined &&
    activeStageIndex >= 0 &&
    activeStageIndex === configuredStages.length - 1
  const isClosed = getRecruitmentStatusMeta(recruitment.status).label === "Closed"
  const hasStartedLifecycle = stages.some((stage) => {
    const lifecycleStatus = normalizeLifecycleStatus(stage.lifecycleStatus)
    return lifecycleStatus === "active" || lifecycleStatus === "completed"
  })

  const { currentData: eligibleCandidates } = useGetBatchApplicationsQuery(
    { id: recruitment.id, status: 1, pageSize: 1 },
    { skip: hasStartedLifecycle || configuredStages.length === 0 }
  )
  const canStartFirstStage = Boolean(eligibleCandidates?.totalItems)

  const handleConfirmTransition = async () => {
    if (!pendingTransition) return
    setTransitionError(null)

    try {
      const result =
        pendingTransition.action === "activate"
          ? await handleActivateStage(pendingTransition.stage.id)
          : await handleCompleteStage(pendingTransition.stage.id)
      setTransitionResult({ action: pendingTransition.action, result })
      setPendingTransition(null)
    } catch (error) {
      setTransitionError(getApiError(error).message)
    }
  }

  if (isLoading) {
    return (
      <Panel className="space-y-0 overflow-hidden">
        <PanelHeader title="Selection Pipeline" meta="Loading stages..." />
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-14 pl-5 text-center">#</TableHead>
                <TableHead className="min-w-48">Stage Name</TableHead>
                <TableHead className="min-w-44">Schedule</TableHead>
                <TableHead className="w-24 text-center">Passing</TableHead>
                <TableHead className="min-w-56 text-center">
                  Interviewers
                </TableHead>
                <TableHead className="w-28 text-center">Status</TableHead>
                <TableHead className="w-40 pr-5 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableSkeleton colCount={7} rowCount={5} />
            </TableBody>
          </Table>
        </div>
      </Panel>
    )
  }

  if (isError) {
    return (
      <Panel className="p-8">
        <ErrorState
          title="Failed to load stages"
          description="Unable to fetch the selection stages and interviewers. Please try again."
          onRetry={() => refetch()}
        />
      </Panel>
    )
  }

  if (stages.length === 0) {
    return (
      <Panel className="p-8">
        <EmptyState
          title="No stages configured"
          description="Define the selection pipeline stages for this recruitment batch to begin accepting applications."
          action={
            onCreateStage && !isClosed ? (
              <CreateButton onClick={onCreateStage}>
                Configure Stages
              </CreateButton>
            ) : undefined
          }
        />
      </Panel>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Panel className="space-y-0 overflow-hidden">
          <PanelHeader
            title="Selection Pipeline"
            meta={`${stages.length} stages • ~${totalDays} days total`}
            actions={
              <div className="flex items-center gap-2">
                <EditButton
                  onClick={onEditStage}
                  disabled={isClosed || hasStartedLifecycle}
                  title={
                    isClosed ? "This recruitment batch is closed" : hasStartedLifecycle
                      ? "Stages cannot be reconfigured after activation"
                      : undefined
                  }
                >
                  Edit Stages
                </EditButton>
              </div>
            }
          />

          {transitionError && (
            <div
              role="alert"
              className="flex items-start justify-between gap-3 border-b border-border bg-danger-soft px-5 py-3 text-sm text-danger"
            >
              <span>{transitionError}</span>
              <button
                type="button"
                className="shrink-0 hover:bg-red-400 rounded-full p-0.5 hover:text-white"
                aria-label="Dismiss error"
                onClick={() => setTransitionError(null)}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )}
          {transitionResult && (
            <div
              role="status"
              className="flex items-start justify-between gap-3 border-b border-border bg-muted/40 px-5 py-3 text-sm"
            >
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {transitionResult.action === "activate"
                    ? transitionResult.result.alreadyApplied
                      ? "Stage is already active"
                      : "Stage activated"
                    : transitionResult.result.alreadyApplied
                      ? "Stage was already completed"
                      : "Stage completed"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getTransitionCounts(
                    transitionResult.result,
                    transitionResult.action
                  )
                    .map(([label, count]) => `${label}: ${count}`)
                    .join(" · ")}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss result"
                onClick={() => setTransitionResult(null)}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-14 pl-5 text-center">#</TableHead>
                  <TableHead className="min-w-48">Stage Name</TableHead>
                  <TableHead className="min-w-44">Schedule</TableHead>
                  <TableHead className="w-24 text-center">Passing</TableHead>
                  <TableHead className="min-w-56 text-center">
                    Interviewers
                  </TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-40 pr-5 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {stages.map((stage, index) => {
                  const lifecycleStatus = normalizeLifecycleStatus(
                    stage.lifecycleStatus
                  )
                  const status = !stage.isActive
                    ? { label: "Disabled", tone: "neutral" as const }
                    : lifecycleStatus === "completed"
                      ? { label: "Completed", tone: "success" as const }
                      : lifecycleStatus === "active"
                        ? { label: "Active", tone: "info" as const }
                        : lifecycleStatus === "inactive"
                          ? { label: "Inactive", tone: "neutral" as const }
                          : index === 0
                            ? { label: "In Progress", tone: "info" as const }
                            : { label: "Upcoming", tone: "neutral" as const }
                  const transitionAction: StageTransitionAction | null =
                    lifecycleStatus === "inactive" &&
                    nextStageToActivate?.id === stage.id
                      ? "activate"
                      : lifecycleStatus === "active" &&
                          isFinalActiveStage &&
                          activeStage?.id === stage.id
                        ? "complete"
                        : null

                  const needsCandidates = transitionAction === "activate" &&
                    !hasStartedLifecycle && !canStartFirstStage
                  const isInterviewStage =
                    stage.type === "interview" ||
                    stage.stageCategory === "Interview" ||
                    stage.stageCategory === "2" ||
                    stage.name.toLowerCase().includes("interview") ||
                    stage.name.toLowerCase().includes("wawancara")

                  // Detailed interviewers with status
                  const stageInterviewers = (
                    stage.assignedInterviewers ?? []
                  ).map((assignment) => {
                    const emp = {
                      id: assignment.employeeId,
                      fullName:
                        assignment.employeeName ||
                        `Employee (${assignment.employeeId.slice(0, 6)}...)`,
                      jobTitle: assignment.jobTitle || "Interviewer",
                      note: assignment.note,
                    }
                    return {
                      employee: emp,
                      status: assignment.status,
                    }
                  })

                  return (
                    <TableRow
                      key={stage.id}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <TableCell className="w-14 pl-5 text-center font-mono text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {stage.name}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {formatStageCategory(stage.stageCategory) ||
                              stage.type}{" "}
                            Stage
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs whitespace-nowrap text-muted-foreground">
                        {stage.startDate && stage.endDate ? (
                          <span>
                            {safeFormatDate(stage.startDate)} -{" "}
                            {safeFormatDate(stage.endDate)}
                          </span>
                        ) : (
                          <span>{stage.durationDays} days duration</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-center font-mono text-sm">
                        {stage.passingScore !== null ? (
                          <span className="font-semibold text-foreground">
                            {stage.passingScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Interviewers column: colored badge based on status + hover tooltip + edit button at the end */}
                      <TableCell className="py-3.5 text-center">
                        {!isInterviewStage ? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        ) : stageInterviewers.length === 0 ? (
                          <button
                            type="button"
                            disabled={isClosed}
                            onClick={() => handleOpenAssignDialog(stage, index)}
                            className="group inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                          >
                            <UserPlus className="size-3 text-muted-foreground group-hover:text-primary" />
                            <span>Assign</span>
                          </button>
                        ) : (
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {stageInterviewers.map(
                              ({ employee, status: empStatus }) => (
                                <Tooltip key={employee.id}>
                                  <TooltipTrigger
                                    className={cn(
                                      "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-xs transition-colors",
                                      statusColors[empStatus]
                                    )}
                                    disabled={isClosed}
                                    onClick={() =>
                                      handleOpenAssignDialog(stage, index)
                                    }
                                  >
                                    <span className="max-w-30 truncate">
                                      {employee.fullName}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="max-w-xs flex-col items-start gap-0.5 border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-900 shadow-md"
                                  >
                                    <p className="font-semibold">
                                      {employee.fullName}
                                    </p>
                                    <p className="text-slate-600">
                                      {employee.jobTitle || "Interviewer"}
                                    </p>
                                    <p
                                      className={cn(
                                        "mt-1 font-medium",
                                        statusTextColors[empStatus]
                                      )}
                                    >
                                      {statusLabels[empStatus]}
                                    </p>
                                    {empStatus === "declined" && (
                                      <div className="mt-1 border-t border-slate-200 pt-1">
                                        <p className="font-medium text-slate-700">Reason</p>
                                        <p className="whitespace-pre-wrap wrap-break-word text-slate-600">
                                          {employee.note?.trim() || "No reason provided."}
                                        </p>
                                      </div>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              )
                            )}
                            <button
                              type="button"
                              disabled={isClosed}
                              onClick={() =>
                                handleOpenAssignDialog(stage, index)
                              }
                              className="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                              title="Edit interviewer"
                            >
                              <Pencil className="size-3" />
                            </button>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-center">
                        <StatusBadge tone={status.tone}>
                          {status.label}
                        </StatusBadge>
                      </TableCell>

                      <TableCell className="py-3.5 pr-5 text-center">
                        {!isClosed && transitionAction ? (
                          <Button
                            type="button"
                            size="sm"
                            variant={transitionAction === "complete" ? "default" : "outline"}
                            className="rounded-full"
                            disabled={isTransitioning || needsCandidates}
                            title={needsCandidates
                              ? "Register at least one eligible candidate before starting the first stage."
                              : undefined}
                            onClick={() => {
                              setTransitionError(null)
                              setPendingTransition({ stage, action: transitionAction })
                            }}
                          >
                            {transitionAction === "activate" ? (
                              <>
                                <CirclePlay className="mr-1.5 size-3.5" aria-hidden />
                                Activate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="mr-1.5 size-3.5" aria-hidden />
                                Complete Stage
                              </>
                            )}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Panel>
      </div>

      {isDialogOpen && (
        <AssignInterviewersDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          stage={assignStage}
          stageIndex={assignIndex}
          batchName={recruitment.name}
          onSave={handleSaveInterviewers}
        />
      )}

      <Dialog
        open={pendingTransition !== null}
        onOpenChange={(open) => {
          if (!isTransitioning && !open) setPendingTransition(null)
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingTransition?.action === "activate"
                ? "Activate selection stage?"
                : "Complete final stage?"}
            </DialogTitle>
            <DialogDescription>
              {pendingTransition?.action === "activate"
                ? activeStage
                  ? `This will complete ${activeStage.name} and start ${pendingTransition.stage.name} for candidates who passed.`
                  : `This will start ${pendingTransition.stage.name} for all eligible candidates in this batch.`
                : `This will complete the recruitment process and record final results for candidates in ${pendingTransition?.stage.name}.`}
            </DialogDescription>
          </DialogHeader>
          {transitionError && (
            <p
              role="alert"
              className="rounded-xl bg-danger-soft p-3 text-sm text-danger"
            >
              {transitionError}
            </p>
          )}
          <DialogFooter className="bg-card border-t border-border">
            <CancelButton
              disabled={isTransitioning}
              onClick={() => setPendingTransition(null)}
            />
            <SaveButton
              disabled={!pendingTransition || isTransitioning}
              isLoading={isTransitioning}
              loadingText={
                pendingTransition?.action === "activate"
                  ? "Activating..."
                  : "Completing..."
              }
              icon={
                pendingTransition?.action === "activate" ? (
                  <CirclePlay className="size-4" aria-hidden />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden />
                )
              }
              onClick={() => void handleConfirmTransition()}
            >
              {pendingTransition?.action === "activate"
                ? "Activate Stage"
                : "Complete Stage"}
            </SaveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
