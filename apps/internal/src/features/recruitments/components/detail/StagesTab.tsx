import type { Recruitment } from "../../types"
import { Panel, PanelHeader, StatusBadge, EmptyState } from "@/shared/components"
import { mockEmployees, mockStageTypes } from "../../data/mock"

export interface StagesTabProps {
  recruitment: Recruitment
}

export function StagesTab({ recruitment }: StagesTabProps) {
  if (recruitment.stages.length === 0) {
    return (
      <Panel className="p-8">
        <EmptyState
          title="No stages configured"
          description="This recruitment batch does not have any selection stages set up yet. Add stages to begin accepting and evaluating candidates."
        />
      </Panel>
    )
  }

  const totalDays = recruitment.stages.reduce((acc, s) => acc + s.durationDays, 0)

  return (
    <Panel>
      <PanelHeader
        title="Stage Sequence"
        meta={`${recruitment.stages.length} stages, estimated total ${totalDays} days`}
      />

      <ol className="divide-y divide-border">
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

          return (
            <li
              key={stage.id}
              className="grid grid-cols-[36px_1fr_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 md:grid-cols-[36px_1.5fr_1.2fr_1fr_120px]"
            >
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                {index + 1}
              </span>

              <div>
                <span className="text-sm font-medium text-foreground">
                  {stage.name}
                </span>
                {stage.passingScore && (
                  <p className="text-xs text-muted-foreground">
                    Passing score: {stage.passingScore}%
                  </p>
                )}
              </div>

              <span className="hidden text-sm text-muted-foreground md:block">
                {stageType?.stageCategory ?? stage.type}, {stage.durationDays} days
              </span>

              <span className="hidden text-sm text-foreground md:block truncate">
                {owner?.fullName}
              </span>

              <span className="justify-self-end">
                <StatusBadge tone={stateMeta.tone}>{stateMeta.label}</StatusBadge>
              </span>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}

