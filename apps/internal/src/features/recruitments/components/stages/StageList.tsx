import { useState } from "react"
import { ArrowDown, ArrowUp, ChevronDown, GripVertical, Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Panel, PanelHeader, CreateButton, EmptyState } from "@/shared/components"
import { safeFormatDate, getDurationDays } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import type { StageTypeDto } from "../../types"
import { StageConfigForm } from "./StageConfigForm"
import type { EditableStage } from "./types"

export interface StageListProps {
  stages: EditableStage[]
  selectedId: string | null
  stageTypes?: StageTypeDto[]
  onSelect: (tempId: string | null) => void
  onFieldChange: <K extends keyof EditableStage>(field: K, value: EditableStage[K]) => void
  onAddStage: () => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  onRemoveStage: (index: number) => void
}

export function StageList({
  stages,
  selectedId,
  stageTypes = [],
  onSelect,
  onFieldChange,
  onAddStage,
  onMoveUp,
  onMoveDown,
  onReorder,
  onRemoveStage,
}: StageListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  return (
    <Panel className="space-y-0">
      <PanelHeader
        title="Sequence Flow"
        meta={`${stages.length} stages`}
        actions={<CreateButton onClick={onAddStage}>Add Stage</CreateButton>}
      />

      <div className="p-4 pt-3">
        <p className="mb-3 text-xs text-muted-foreground">
          Expand a stage to edit its settings. Drag the handle or use the arrow buttons to reorder.
        </p>

        {stages.length === 0 ? (
          <EmptyState
            title="No stages yet"
            description="Click Add Stage to start adding recruitment stages."
            className="py-10"
          />
        ) : (
          <ol className="space-y-2.5">
            {stages.map((stage, index) => {
              const isExpanded = selectedId === stage.tempId
              const stageType = stageTypes.find((item) => item.id === stage.stageTypeId)
              const duration = stage.startDate && stage.endDate
                ? getDurationDays(stage.startDate, stage.endDate)
                : null

              return (
                <li
                  key={stage.tempId}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-colors",
                    isExpanded ? "border-primary shadow-sm" : "border-border bg-card",
                    dragIndex === index && "opacity-50",
                    overIndex === index && dragIndex !== null && dragIndex !== index &&
                      "border-dashed border-primary bg-primary/5"
                  )}
                  onDragOver={(event) => {
                    if (dragIndex === null) return
                    event.preventDefault()
                    event.dataTransfer.dropEffect = "move"
                    if (overIndex !== index) setOverIndex(index)
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    if (dragIndex !== null && dragIndex !== index) onReorder?.(dragIndex, index)
                    setDragIndex(null)
                    setOverIndex(null)
                  }}
                >
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4",
                    isExpanded ? "bg-primary/5" : "bg-card"
                  )}>
                    <span
                      draggable
                      onDragStart={(event) => {
                        setDragIndex(index)
                        event.dataTransfer.effectAllowed = "move"
                        event.dataTransfer.setData("text/plain", String(index))
                      }}
                      onDragEnd={() => {
                        setDragIndex(null)
                        setOverIndex(null)
                      }}
                      title="Drag to reorder"
                      className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
                    >
                      <GripVertical className="size-4" aria-hidden />
                    </span>

                    <button
                      type="button"
                      onClick={() => onSelect(isExpanded ? null : stage.tempId)}
                      aria-expanded={isExpanded}
                      aria-controls={`settings-${stage.tempId}`}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-primary"
                    >
                      <span className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                        isExpanded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {stage.name || `Stage ${index + 1}`}
                          </span>
                          {stage.passingScore != null && (
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
                              {stage.passingScore}%
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                          <span>{stageType?.name ?? stage.type}</span>
                          {stage.startDate && stage.endDate && (
                            <span>
                              · {safeFormatDate(stage.startDate)} – {safeFormatDate(stage.endDate)}
                              {duration !== null && ` (${duration} days)`}
                            </span>
                          )}
                        </span>
                      </span>
                      <ChevronDown className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        isExpanded && "rotate-180 text-primary"
                      )} aria-hidden />
                    </button>

                    <div className="flex shrink-0 items-center gap-1 border-l border-border pl-2 sm:pl-3">
                      <Button type="button" variant="ghost" size="icon-xs"
                        onClick={() => onMoveUp(index)} disabled={index === 0}
                        title="Move stage earlier" aria-label={`Move stage ${index + 1} earlier`}
                        className="size-7 rounded-full border-0 bg-muted hover:bg-muted/40 disabled:opacity-30">
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-xs"
                        onClick={() => onMoveDown(index)} disabled={index === stages.length - 1}
                        title="Move stage later" aria-label={`Move stage ${index + 1} later`}
                        className="size-7 rounded-full border-0 bg-muted hover:bg-muted/40 disabled:opacity-30">
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-xs"
                        onClick={() => onRemoveStage(index)}
                        title="Remove stage" aria-label={`Remove stage ${index + 1}`}
                        className="size-7 rounded-full border-0 text-destructive hover:bg-destructive/10">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div id={`settings-${stage.tempId}`}>
                      <StageConfigForm
                        stage={stage}
                        stageTypes={stageTypes}
                        onFieldChange={onFieldChange}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </Panel>
  )
}
