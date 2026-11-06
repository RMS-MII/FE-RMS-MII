import { Layers, Pencil, UserPlus } from "lucide-react"
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
import { mockEmployees, mockStageTypes } from "../../data/mock"
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

const statusDescriptions: Record<StageEmployeeStatus, string> = {
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
          icon={<Layers className="size-6 stroke-[1.75]" />}
          title="No Stages Configured"
          description="This recruitment batch does not have any selection stages set up yet. Add stages to define the selection flow for applicants."
          action={
            <CreateButton onClick={onCreateStage}>
              Create Stage
            </CreateButton>
          }
        />
      </Panel>
    )
  }

  return (
    <>
      <Panel className="space-y-0">
        <PanelHeader
          title="Selection Stages (BatchStage)"
          meta={`${stages.length} stages • Estimated total ${totalDays} days`}
          actions={
            <EditButton onClick={onEditStage ?? onCreateStage}>
              Edit Stage
            </EditButton>
          }
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-14 pl-5 text-center">#</TableHead>
                <TableHead>Stage Name & Type</TableHead>
                <TableHead>Schedule (Period)</TableHead>
                <TableHead className="text-center">Passing Score</TableHead>
                <TableHead>Interviewers</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stages.map((stage, index) => {
                const currentStageIdx = recruitment.currentStage ?? 0
                const isDone =
                  index < currentStageIdx || recruitment.status === "completed"
                const isCurrent =
                  index === currentStageIdx && recruitment.status === "running"

                const stateMeta = isDone
                  ? { label: "Completed", tone: "neutral" as const }
                  : isCurrent
                  ? { label: "In Progress", tone: "info" as const }
                  : { label: "Upcoming", tone: "neutral" as const }

                const typeMeta = mockStageTypes.find((t) => t.id === stage.stageTypeId)

                // Detailed interviewers with status
                const stageInterviewers = (stage.assignedInterviewers ?? []).map((assignment) => {
                  const emp =
                    mockEmployees.find((e) => e.id === assignment.employeeId) || {
                      id: assignment.employeeId,
                      fullName: `Employee (${assignment.employeeId.slice(0, 6)}...)`,
                      email: "interviewer@mii.co.id",
                      jobTitle: "Interviewer",
                      department: "Technical",
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
                          {typeMeta?.stageCategory || stage.type} Stage
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
                          className="group inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
                        >
                          <UserPlus className="size-3 text-muted-foreground group-hover:text-primary" />
                          <span>Assign</span>
                        </button>
                      ) : (
                        <div className="inline-flex flex-wrap items-center gap-1.5">
                          <TooltipProvider>
                            {stageInterviewers.map((item) => (
                              <Tooltip key={item.employee.id}>
                                <TooltipTrigger
                                  render={
                                    <span
                                      className={cn(
                                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-help select-none border-none",
                                        statusColors[item.status]
                                      )}
                                    >
                                      {item.employee.fullName}
                                    </span>
                                  }
                                />
                                <TooltipContent
                                  side="top"
                                  className="rounded-xl border border-border bg-card p-2.5 text-foreground shadow-md ring-1 ring-black/5"
                                >
                                  <div className="text-xs space-y-1">
                                    <p className="font-semibold text-foreground">{item.employee.fullName}</p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {item.employee.jobTitle || "Interviewer"}
                                    </p>
                                    <div className="pt-0.5 flex items-center gap-1.5">
                                      <span className="text-[11px] text-muted-foreground">Status: {statusDescriptions[item.status]}</span>
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </TooltipProvider>

                          {/* Tombol edit di list terakhir menempel rapat */}
                          <button
                            type="button"
                            onClick={() => handleOpenAssignDialog(stage, index)}
                            title="Edit interviewers"
                            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                          >
                            <Pencil className="size-3" />
                          </button>
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 text-center whitespace-nowrap">
                      <StatusBadge tone={stateMeta.tone}>{stateMeta.label}</StatusBadge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>

      {/* Modal Dialog for Assigning Interviewers */}
      <AssignInterviewersDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        stage={assignStage}
        stageIndex={assignIndex}
        batchName={recruitment.name}
        onSave={handleSaveInterviewers}
      />
    </>
  )
}
