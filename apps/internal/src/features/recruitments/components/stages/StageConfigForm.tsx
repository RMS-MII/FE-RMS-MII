import { format } from "date-fns"
import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"
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
import { Panel, PanelHeader } from "@/shared/components"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import type { StageTypeDto } from "../../types"
import { formatStageCategory, stageCategoryToLegacyType } from "../../utils"
import type { EditableStage } from "./types"
import { Trash2 } from "lucide-react"

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
  const dateRange: DateRange | undefined = (() => {
    if (!selectedStage?.startDate) return undefined
    const parseLocalDate = (value: string) => {
      const [year, month, day] = value.slice(0, 10).split("-").map(Number)
      return year && month && day ? new Date(year, month - 1, day) : undefined
    }
    const from = parseLocalDate(selectedStage.startDate)
    const to = selectedStage.endDate
      ? parseLocalDate(selectedStage.endDate)
      : undefined
    return from ? { from, ...(to ? { to } : {}) } : undefined
  })()

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

        {/* Schedule date range */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Stage Period
          </label>
          <Popover>
            <PopoverTrigger className={`flex h-10 w-full items-center justify-between gap-2 rounded-full border-0 bg-muted px-4 text-sm transition-all hover:bg-muted/40 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary ${dateRange ? "text-foreground" : "text-muted-foreground"}`}>
              <span className="truncate">
                {dateRange?.from
                  ? `${format(dateRange.from, "dd/MM/yyyy")} – ${dateRange.to ? format(dateRange.to, "dd/MM/yyyy") : "Select end date"}`
                  : "Select start and end dates"}
              </span>
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto rounded-2xl border border-border bg-card p-3 shadow-float">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  onFieldChange(
                    "startDate",
                    range?.from ? format(range.from, "yyyy-MM-dd") : ""
                  )
                  onFieldChange(
                    "endDate",
                    range?.to ? format(range.to, "yyyy-MM-dd") : ""
                  )
                }}
                numberOfMonths={2}
                defaultMonth={dateRange?.from}
                autoFocus
              />
            </PopoverContent>
          </Popover>
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
