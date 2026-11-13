import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { DateTimeRangePicker } from "@/shared/components"
import type { StageTypeDto } from "../../types"
import { formatStageCategory, mapStageTypeToCategory } from "../../utils"
import type { EditableStage } from "./types"

export interface StageConfigFormProps {
  stage: EditableStage
  batchEndDateTime: string
  stageTypes: StageTypeDto[]
  onFieldChange: <K extends keyof EditableStage>(
    field: K,
    value: EditableStage[K]
  ) => void
}

export function StageConfigForm({
  stage,
  batchEndDateTime,
  stageTypes,
  onFieldChange,
}: StageConfigFormProps) {
  const requiresPassingScore =
    mapStageTypeToCategory(stage.stageTypeId, stageTypes, stage.type) === "test"

  const handleStageTypeChange = (stageTypeId: string) => {
    const selectedType = stageTypes.find((item) => item.id === stageTypeId)
    onFieldChange("stageTypeId", stageTypeId)
    onFieldChange("type", mapStageTypeToCategory(stageTypeId, stageTypes))

    if (
      selectedType &&
      (!stage.name.trim() || stageTypes.some((item) => item.name === stage.name))
    ) {
      onFieldChange("name", selectedType.name)
    }
  }

  return (
    <div className="grid gap-4 border-t border-border bg-muted/15 p-4 sm:grid-cols-2 sm:p-5">
      <div className="sm:col-span-2">
        <h3 className="text-sm font-semibold text-foreground">Stage Settings</h3>
        <p className="text-xs text-muted-foreground">
          Set the type, name, passing score, and schedule for this stage.
        </p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${stage.tempId}-type`} className="text-xs font-semibold text-foreground">
          Stage Type <span className="text-destructive">*</span>
        </label>
        <Select
          items={stageTypes.map((item) => ({
            label: `${item.name} (${formatStageCategory(item.stageCategory)})`,
            value: item.id,
          }))}
          value={stage.stageTypeId}
          onValueChange={(value) => {
            if (value) handleStageTypeChange(value)
          }}
        >
          <SelectTrigger id={`${stage.tempId}-type`} className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm shadow-none">
            <SelectValue placeholder="Select stage type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectGroup>
              {stageTypes.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name} ({formatStageCategory(item.stageCategory)})
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${stage.tempId}-name`} className="text-xs font-semibold text-foreground">
          Stage Name <span className="text-destructive">*</span>
        </label>
        <Input
          id={`${stage.tempId}-name`}
          type="text"
          value={stage.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
          placeholder="e.g. Technical Coding Test"
          className="h-10 rounded-full border-0 bg-muted px-4 text-sm shadow-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${stage.tempId}-score`} className="text-xs font-semibold text-foreground">
          Passing Score (%) {requiresPassingScore ? (
            <span className="text-destructive">*</span>
          ) : (
            <span className="font-normal text-muted-foreground">(Optional)</span>
          )}
        </label>
        <Input
          id={`${stage.tempId}-score`}
          type="number"
          min={0}
          max={100}
          step="0.01"
          required={requiresPassingScore}
          value={stage.passingScore ?? ""}
          onChange={(event) =>
            onFieldChange("passingScore", event.target.value === "" ? null : Number(event.target.value))
          }
          placeholder="e.g. 75"
          className="h-10 rounded-full border-0 bg-muted px-4 text-sm shadow-none"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground">Stage Period</p>
        <DateTimeRangePicker
          value={{ start: stage.startDate, end: stage.endDate }}
          maxDateTime={batchEndDateTime || undefined}
          invalid={Boolean(batchEndDateTime &&
            (stage.startDate > batchEndDateTime || stage.endDate > batchEndDateTime))}
          onChange={(range) => {
            onFieldChange("startDate", range.start)
            onFieldChange("endDate", range.end)
          }}
        />
      </div>
    </div>
  )
}
