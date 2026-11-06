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
  CreateButton,
  EditButton,
} from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import { mockEmployees } from "../../data/mock"
import { formatStageCategory } from "../../utils"
import type {
  Recruitment,
  StageEmployeeStatus,
} from "../../types"
import { AssignInterviewersDialog } from "./AssignInterviewersDialog"
import { useStagesTab } from "../../hooks/useStagesTab"

export interface StagesTabProps {
  recruitment: Recruitment
  onCreateStage?: () => void
  onEditStage?: () => void
}

const statusColors: Record<StageEmployeeStatus, string> = {
  pending:
    "bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25",
  accepted:
    "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25",
  declined:
    "bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-500/25",
}

const statusLabels: Record<StageEmployeeStatus, string> = {
  pending: "Pending (Menunggu Persetujuan)",
  accepted: "Accepted (Menyetujui)",
  declined: "Declined (Menolak)",
}

export function StagesTab({ recruitment, onCreateStage, onEditStage }: StagesTabProps) {
  const {
    stages,
    totalDays,
    assignStage,
    assignIndex,
    isDialogOpen,
    setIsDialogOpen,
    handleOpenAssignDialog,
    handleSaveInterviewers,
  } = useStagesTab({ recruitment })

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
                {onEditStage && (
                  <EditButton onClick={onEditStage}>
                    Edit Stages
                  </EditButton>
                )}
                {onCreateStage && (
                  <CreateButton onClick={onCreateStage}>
                    Add Stage
                  </CreateButton>
                )}
              </div>
            }
          />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/30">
                  <TableHead className="w-14 pl-5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Stage Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Schedule
                  </TableHead>
                  <TableHead className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Passing Score
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Assigned Interviewers
                  </TableHead>
                  <TableHead className="w-28 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </TableHead>
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

                  // Detailed interviewers with status
                  const stageInterviewers = (stage.assignedInterviewers ?? []).map((assignment) => {
                    const emp =
                      mockEmployees.find((e) => e.id === assignment.employeeId) || {
                        id: assignment.employeeId,
                        fullName: `Employee (${assignment.employeeId.slice(0, 6)}...)`,
                        email: "interviewer@mii.co.id",
                        jobTitle: "Interviewer",
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
                      <TableCell className="py-3.5">
                        {stageInterviewers.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAssignDialog(stage, index)}
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-600 font-medium cursor-pointer"
                          >
                            <span>+ Assign Interviewers</span>
                          </button>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {stageInterviewers.map(({ employee, status: empStatus }) => (
                              <Tooltip key={employee.id}>
                                <TooltipTrigger
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium cursor-pointer transition-colors shadow-xs",
                                    statusColors[empStatus]
                                  )}
                                  onClick={() => handleOpenAssignDialog(stage, index)}
                                >
                                  <span className="truncate max-w-[120px]">{employee.fullName}</span>
                                  <span className="text-[10px] opacity-75 capitalize">
                                    • {empStatus}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs max-w-xs">
                                  <p className="font-semibold">{employee.fullName}</p>
                                  <p className="text-muted-foreground">{employee.jobTitle || "Interviewer"}</p>
                                  <p className="mt-1 text-primary-200">
                                    Status: <span className="font-medium">{statusLabels[empStatus]}</span>
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">Click badge to edit assignment</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleOpenAssignDialog(stage, index)}
                              className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted ml-1 cursor-pointer"
                              title="Edit interviewer assignments"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="w-28 text-center py-3.5">
                        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Panel>

        <AssignInterviewersDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          stage={assignStage}
          stageIndex={assignIndex}
          batchName={recruitment.name}
          onSave={handleSaveInterviewers}
        />
      </div>
    </TooltipProvider>
  )
}
