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
  Panel,
  PanelHeader,
  StatusBadge,
  EmptyState,
  ErrorState,
  CreateButton,
  EditButton,
} from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import { formatStageCategory } from "../../utils"
import type {
  Recruitment,
  StageEmployeeStatus,
} from "../../types"
import { AssignInterviewersDialog } from "./AssignInterviewersDialog"
import { useStagesTab } from "../../hooks/useStagesTab"
import { UserPlus, Pencil, Loader2 } from "lucide-react"

export interface StagesTabProps {
  recruitment: Recruitment
  onCreateStage?: () => void
  onEditStage?: () => void
}

const statusColors: Record<StageEmployeeStatus, string> = {
  pending:
    "bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25",
  accepted:
    "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/25",
  declined:
    "bg-rose-500/15 text-rose-800 dark:text-rose-300 hover:bg-rose-500/25",
}

const statusTextColors: Record<StageEmployeeStatus, string> = {
  pending: "text-amber-800",
  accepted: "text-emerald-800",
  declined: "text-rose-800",
}

const statusLabels: Record<StageEmployeeStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
}

export function StagesTab({ recruitment, onCreateStage, onEditStage }: StagesTabProps) {
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
  } = useStagesTab({ recruitment })

  if (isLoading) {
    return (
      <Panel className="p-8">
        <div role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading stages...
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
            onCreateStage ? (
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
        <Panel className="overflow-hidden space-y-0">
          <PanelHeader
            title="Selection Pipeline"
            meta={`${stages.length} stages • ~${totalDays} days total`}
            actions={
              <div className="flex items-center gap-2">
                <EditButton onClick={onEditStage}>
                  Edit Stages
                </EditButton>
              </div>
            }
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-14 pl-5 text-center">#</TableHead>
                  <TableHead className="min-w-48">Stage Name</TableHead>
                  <TableHead className="min-w-44">Schedule</TableHead>
                  <TableHead className="w-24 text-center">Passing</TableHead>
                  <TableHead className="min-w-56 text-center">Interviewers</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {stages.map((stage, index) => {
                  const isCurrent = index === 0
                  const isDone = false
                  const status = isDone
                    ? { label: "Completed", tone: "success" as const }
                    : isCurrent
                    ? { label: "In Progress", tone: "info" as const }
                    : { label: "Upcoming", tone: "neutral" as const }

                  const isInterviewStage =
                    stage.type === "interview" ||
                    stage.stageCategory === "Interview" ||
                    stage.stageCategory === "2" ||
                    stage.name.toLowerCase().includes("interview") ||
                    stage.name.toLowerCase().includes("wawancara")

                  // Detailed interviewers with status
                  const stageInterviewers = (stage.assignedInterviewers ?? []).map((assignment) => {
                    const emp = {
                      id: assignment.employeeId,
                      fullName: assignment.employeeName || `Employee (${assignment.employeeId.slice(0, 6)}...)`,
                      jobTitle: assignment.jobTitle || "Interviewer",
                    }
                    return {
                      employee: emp,
                      status: assignment.status,
                    }
                  })

                  return (
                    <TableRow key={stage.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="w-14 pl-5 text-center font-mono text-xs font-semibold text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{stage.name}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {formatStageCategory(stage.stageCategory) || stage.type} Stage
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {stage.startDate && stage.endDate ? (
                          <span>
                            {safeFormatDate(stage.startDate)} - {safeFormatDate(stage.endDate)}
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
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : stageInterviewers.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignDialog(stage, index)}
                            className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                          >
                            <UserPlus className="size-3 text-muted-foreground group-hover:text-primary" />
                            <span>Assign</span>
                          </button>
                        ) : (
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {stageInterviewers.map(({ employee, status: empStatus }) => (
                              <Tooltip key={employee.id}>
                                <TooltipTrigger
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors shadow-xs",
                                    statusColors[empStatus]
                                  )}
                                  onClick={() => handleOpenAssignDialog(stage, index)}
                                >
                                  <span className="truncate max-w-30">{employee.fullName}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs flex-col items-start gap-0.5 border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-900 shadow-md">
                                  <p className="font-semibold">{employee.fullName}</p>
                                  <p className="text-slate-600">{employee.jobTitle || "Interviewer"}</p>
                                  <p className={cn("mt-1 font-medium", statusTextColors[empStatus])}>
                                    {statusLabels[empStatus]}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleOpenAssignDialog(stage, index)}
                              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                              title="Edit interviewer"
                            >
                              <Pencil className="size-3" />
                            </button>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-center">
                        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
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
    </TooltipProvider>
  )
}
