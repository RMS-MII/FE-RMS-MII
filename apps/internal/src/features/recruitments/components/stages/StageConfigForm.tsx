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
import { mockEmployees, mockStageTypes } from "../../data/mock"
import type { EditableStage } from "./types"
import type { LegacyStageType } from "../../types"

export interface StageConfigFormProps {
  selectedStage: EditableStage | null
  selectedIndex: number
  totalStages: number
  nextStage: EditableStage | null
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
  onFieldChange,
  onRemoveStage,
}: StageConfigFormProps) {
  const employeeOptions = useMemo(() => {
    return [
      { label: "Unassigned (assign later)", value: "unassigned" },
      ...mockEmployees.map((e) => ({
        label: `${e.fullName} (${e.jobTitle || "Employee"})`,
        value: e.id,
      })),
    ]
  }, [])

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


  const handleStageTypeChange = (stageTypeId: string) => {
    const selectedType = mockStageTypes.find((st) => st.id === stageTypeId)
    let category: LegacyStageType = "screening"
    if (selectedType?.stageCategory?.toLowerCase().includes("test")) category = "test"
    else if (selectedType?.stageCategory?.toLowerCase().includes("interview")) category = "interview"
    else if (selectedType?.stageCategory?.toLowerCase().includes("offering")) category = "offering"

    onFieldChange("stageTypeId", stageTypeId)
    onFieldChange("type", category)

    // Update name if name was default
    if (
      !selectedStage.name.trim() ||
      mockStageTypes.some((m) => m.name === selectedStage.name)
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
            items={mockStageTypes.map((st) => ({
              label: `${st.name} (${st.stageCategory || "General"})`,
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
                {mockStageTypes.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name} ({st.stageCategory})
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

        {/* Assigned Evaluator / PIC (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Assigned Evaluator / PIC <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <Select
            items={employeeOptions}
            value={selectedStage.ownerId || "unassigned"}
            onValueChange={(val) => {
              onFieldChange("ownerId", val === "unassigned" ? "" : val || "")
            }}
          >
            <SelectTrigger className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary shadow-none">
              <SelectValue placeholder="Assign PIC / Evaluator" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectGroup>
                {employeeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            Can be assigned later during interview session scheduling.
          </p>
        </div>

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

