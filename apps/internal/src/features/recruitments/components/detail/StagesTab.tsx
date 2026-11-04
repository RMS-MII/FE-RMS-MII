import { ArrowRight, Layers } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Panel,
  PanelHeader,
  StatusBadge,
  EmptyState,
  CreateButton,
  EditButton,
} from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import { mockEmployees, mockStageTypes } from "../../data/mock"
import type { Recruitment } from "../../types"

export interface StagesTabProps {
  recruitment: Recruitment
  onCreateStage?: () => void
  onEditStage?: () => void
}

export function StagesTab({ recruitment, onCreateStage, onEditStage }: StagesTabProps) {
  if (recruitment.stages.length === 0) {
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

  const totalDays = recruitment.stages.reduce((acc, s) => acc + (s.durationDays || 0), 0)

  return (
    <Panel className="space-y-0">
      <PanelHeader
        title="Selection Stages (BatchStage)"
        meta={`${recruitment.stages.length} stages • Estimated total ${totalDays} days`}
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
              <TableHead>Next Stage</TableHead>
              <TableHead>Assessor / PIC</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recruitment.stages.map((stage, index) => {
              const isDone =
                index < recruitment.currentStage || recruitment.status === "completed"
              const isCurrent =
                index === recruitment.currentStage && recruitment.status === "running"

              const stateMeta = isDone
                ? { label: "Completed", tone: "success" as const }
                : isCurrent
                ? { label: "Running", tone: "info" as const }
                : { label: "Upcoming", tone: "neutral" as const }

              const stageType = mockStageTypes.find((st) => st.id === stage.stageTypeId)
              const owner =
                mockEmployees.find((e) => e.id === stage.ownerId) ??
                mockEmployees.find((e) => e.id === recruitment.ownerId) ??
                mockEmployees[0]

              const nextStage = stage.nextStageId
                ? recruitment.stages.find((s) => s.id === stage.nextStageId)
                : null

              return (
                <TableRow
                  key={stage.id}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <TableCell className="pl-5 py-3.5 text-center font-semibold text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>

                  <TableCell className="py-3.5">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{stage.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stageType?.name ?? stage.type}
                        {stageType?.stageCategory ? ` • ${stageType.stageCategory}` : ""}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="py-3.5 whitespace-nowrap">
                    {stage.startDate && stage.endDate ? (
                      <div className="text-xs">
                        <span className="font-medium text-foreground">
                          {safeFormatDate(stage.startDate)} – {safeFormatDate(stage.endDate)}
                        </span>
                        {stage.durationDays > 0 && (
                          <span className="block text-muted-foreground mt-0.5">
                            ({stage.durationDays} days)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-3.5 text-center whitespace-nowrap">
                    {stage.passingScore !== null && stage.passingScore !== undefined ? (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary tabular-nums">
                        {stage.passingScore}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>

                  <TableCell className="py-3.5 whitespace-nowrap">
                    {nextStage ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-40">{nextStage.name}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Final Stage
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-3.5 whitespace-nowrap">
                    <span className="text-sm text-foreground truncate block max-w-45">
                      {owner?.fullName ?? "-"}
                    </span>
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
  )
}
