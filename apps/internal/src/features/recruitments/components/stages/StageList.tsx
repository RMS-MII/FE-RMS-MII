import { useState } from "react"
import { ArrowUp, ArrowDown, Trash2, GripVertical } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Panel, PanelHeader, CreateButton, EmptyState } from "@/shared/components"
import { safeFormatDate, getDurationDays } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"
import { mockStageTypes } from "../../data/mock"
import type { EditableStage } from "./types"

export interface StageListProps {
  stages: EditableStage[]
  selectedId: string | null
  onSelect: (tempId: string) => void
  onAddStage: () => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  onRemoveStage: (index: number) => void
}

export function StageList({
  stages,
  selectedId,
  onSelect,
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
        actions={
          <CreateButton onClick={onAddStage}>
            Add Stage
          </CreateButton>
        }
      />

      <div className="p-4 pt-3">
        <p className="text-xs text-muted-foreground mb-3">
          Drag handles to reorder, use arrow buttons, or click any stage to configure its parameters.
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
              const isSelected = selectedId === stage.tempId
              const isFirst = index === 0
              const isLast = index === stages.length - 1
              const stageType = mockStageTypes.find((st) => st.id === stage.stageTypeId)

              return (
                <li
                  key={stage.tempId}
                  draggable
                  onDragStart={(e) => {
                    setDragIndex(index)
                    e.dataTransfer.effectAllowed = "move"
                    e.dataTransfer.setData("text/plain", `${index}`)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = "move"
                    if (overIndex !== index) {
                      setOverIndex(index)
                    }
                  }}
                  onDragEnd={() => {
                    setDragIndex(null)
                    setOverIndex(null)
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (dragIndex !== null && dragIndex !== index && onReorder) {
                      onReorder(dragIndex, index)
                    }
                    setDragIndex(null)
                    setOverIndex(null)
                  }}
                  className={cn(
                    "flex items-center gap-2.5 sm:gap-3 rounded-2xl border px-3 sm:px-4 py-3 transition-all duration-150 cursor-pointer select-none",
                    isSelected
                      ? "border-primary bg-primary-50/60 shadow-xs ring-1 ring-primary"
                      : "border-border bg-card hover:bg-muted/30",
                    dragIndex === index && "opacity-40 scale-[0.99]",
                    overIndex === index && dragIndex !== null && dragIndex !== index && "border-primary border-dashed bg-primary-50/40"
                  )}
                  onClick={() => onSelect(stage.tempId)}
                >
                  {/* Drag Handle */}
                  <div
                    className="text-muted-foreground/50 hover:text-foreground cursor-grab active:cursor-grabbing p-0.5 -ml-1 touch-none"
                    title="Drag to reorder"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="size-4 shrink-0" aria-hidden />
                  </div>

                  {/* Order Index */}
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>

                  {/* Stage Summary Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "truncate text-sm font-semibold",
                          isSelected ? "text-primary font-bold" : "text-foreground"
                        )}
                      >
                        {stage.name || `Stage ${index + 1}`}
                      </p>
                      {stage.passingScore !== null && stage.passingScore !== undefined && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary tabular-nums">
                          {stage.passingScore}%
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <span className="truncate">
                        {stageType?.name ?? stage.type}
                      </span>
                      {stage.startDate && stage.endDate && (
                        <>
                          <span>•</span>
                          <span className="truncate">
                            {safeFormatDate(stage.startDate)} – {safeFormatDate(stage.endDate)}
                            {getDurationDays(stage.startDate, stage.endDate) !== null && (
                              <span className="ml-1 font-medium text-foreground">
                                ({getDurationDays(stage.startDate, stage.endDate)} days)
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Accessible Move & Delete Actions */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onMoveUp(index)}
                      disabled={isFirst}
                      title="Move stage earlier"
                      className="size-7 rounded-full border-0 bg-muted hover:bg-muted/40 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onMoveDown(index)}
                      disabled={isLast}
                      title="Move stage later"
                      className="size-7 rounded-full border-0 bg-muted hover:bg-muted/40 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRemoveStage(index)}
                      title="Remove stage"
                      className="size-7 rounded-full border-0 text-destructive hover:bg-destructive/10 cursor-pointer ml-0.5"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </Panel>
  )
}
