import { useMemo } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Panel, PanelHeader, DatePicker } from "@/shared/components"
import type { StageTypeDto, StageEmployeeStatus, StageInterviewerAssignment } from "../../types"
import { formatStageCategory, stageCategoryToLegacyType } from "../../utils"
import type { EditableStage } from "./types"
import { InterviewerAssignSection } from "../InterviewerAssignSection"

export interface StageConfigFormProps {
  selectedStage: EditableStage | null
  selectedIndex: number
  totalStages: number
  nextStage: EditableStage | null
  stageTypes?: StageTypeDto[]
  isLoadingStageTypes?: boolean
  onFieldChange: <K extends keyof EditableStage>(
    field: K,
    value: EditableStage[K]
  ) => void
  onRemoveStage: (index: number) => void
}

export function StageConfigForm({
  selectedStage,
  selectedIndex,
  totalStages,
  stageTypes = [],
  onFieldChange,
  onRemoveStage,
}: StageConfigFormProps) {
  if (!selectedStage) {
    return (
      <Panel className="sticky top-20 p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium text-foreground mb-1">
          No Stage Selected
        </p>
        <p className="text-xs">
          Select any stage from the sequence list on the left to configure its details.
        </p>
      </Panel>
    )
  }

  const stageAssignments = useMemo<StageInterviewerAssignment[]>(() => {
    if (selectedStage.assignedInterviewers && selectedStage.assignedInterviewers.length > 0) {
      return selectedStage.assignedInterviewers
    }
    const fallback =
      selectedStage.interviewerIds && selectedStage.interviewerIds.length > 0
        ? selectedStage.interviewerIds
        : selectedStage.ownerId
        ? [selectedStage.ownerId]
        : []
    return fallback.map((id) => ({
      employeeId: id,
      status: "pending" as StageEmployeeStatus,
    }))
  }, [selectedStage.assignedInterviewers, selectedStage.interviewerIds, selectedStage.ownerId])

  const handleInterviewerAssignmentsChange = (assignments: StageInterviewerAssignment[]) => {
    const ids = assignments.map((a) => a.employeeId)
    onFieldChange("assignedInterviewers", assignments)
    onFieldChange("interviewerIds", ids)
    onFieldChange("ownerId", ids[0] || "")
  }

  const handleStageTypeChange = (stageTypeId: string) => {
    const selectedType = stageTypes.find((st) => st.id === stageTypeId)
    const category = stageCategoryToLegacyType(selectedType?.stageCategory)

    onFieldChange("stageTypeId", stageTypeId)
    onFieldChange("type", category)

    // Update name if name was empty or matched a known stage type's name
    if (
      !selectedStage.name.trim() ||
      stageTypes.some((m) => m.name === selectedStage.name)
    ) {
      if (selectedType) {
        onFieldChange("name", selectedType.name)
      }
    }
  }

  return (
    <Panel className="sticky top-20 space-y-0">
      <PanelHeader
        title={`Stage ${selectedIndex + 1} Settings`}
        meta={selectedStage.name || "Configure Stage"}
      />

      <div className="space-y-4 p-5">
        {/* Stage Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Stage Type <span className="text-destructive">*</span>
          </label>
          <Select
            items={stageTypes.map((st) => ({
              label: `${st.name} (${formatStageCategory(st.stageCategory)})`,
              value: st.id,
            }))}
            value={selectedStage.stageTypeId}
            onValueChange={(val) => {
              if (val) handleStageTypeChange(val)
            }}
          >
            <SelectTrigger className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
              <SelectValue placeholder="Select stage type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                {stageTypes.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name} ({formatStageCategory(st.stageCategory)})
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Stage Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Stage Name <span className="text-destructive">*</span>
          </label>
          <Input
            type="text"
            value={selectedStage.name}
            onChange={(e) => onFieldChange("name", e.target.value)}
            placeholder="e.g. Technical Coding Test"
            className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
          />
        </div>

        {/* Passing Score */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Passing Score (%) <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <Input
            type="number"
            min={0}
            max={100}
            value={selectedStage.passingScore !== null ? selectedStage.passingScore : ""}
            onChange={(e) =>
              onFieldChange(
                "passingScore",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            placeholder="e.g. 75"
            className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
          />
        </div>

        {/* Schedule: Start Date & End Date */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Start Date
            </label>
            <DatePicker
              value={selectedStage.startDate}
              onChange={(val) => onFieldChange("startDate", val)}
              placeholder="dd/mm/yyyy"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              End Date
            </label>
            <DatePicker
              value={selectedStage.endDate}
              onChange={(val) => onFieldChange("endDate", val)}
              placeholder="dd/mm/yyyy"
            />
          </div>
        </div>

        {/* Unified Interviewer Assignment Section */}
        <InterviewerAssignSection
          id="stage-config-interviewers"
          label="Assigned Interviewers"
          optional
          assignments={stageAssignments}
          onChange={handleInterviewerAssignmentsChange}
        />

        {/* Delete Stage */}
        <div className="border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onRemoveStage(selectedIndex)}
            disabled={totalStages <= 1}
            className="w-full gap-2 rounded-full border-0 bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-40 cursor-pointer h-10 text-xs font-semibold"
          >
            <Trash2 className="size-4" />
            <span>Delete Stage {selectedIndex + 1}</span>
          </Button>
        </div>
      </div>
    </Panel>
  )
}
