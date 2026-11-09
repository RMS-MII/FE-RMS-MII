import { useId, useMemo, useState } from "react"
import { format } from "date-fns"
import { CalendarDays } from "lucide-react"
import type { DateRange } from "react-day-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { SaveButton } from "@/shared/components"
import { CancelButton } from "@/shared/components"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import type { Recruitment } from "../types"
import { useCreateRecruitmentForm } from "../hooks/useCreateRecruitmentForm"

export interface CreateRecruitmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (newRecruitment: Recruitment) => void
  existingCount?: number
}

export function CreateRecruitmentDialog({
  open,
  onOpenChange,
  onSuccess,
  existingCount = 5,
}: CreateRecruitmentDialogProps) {
  const formId = useId()
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)

  const {
    name,
    setName,
    departmentId,
    setDepartmentId,
    description,
    setDescription,
    openDate,
    setOpenDate,
    closeDate,
    setCloseDate,
    errors,
    submitError,
    isSubmitting,
    clearFieldError,
    departmentSelectItems,
    isLoadingDepts,
    handleSubmit,
  } = useCreateRecruitmentForm({
    open,
    existingCount,
    onSuccess,
    onOpenChange,
  })

  const dateRange = useMemo<DateRange | undefined>(() => {
    const parseLocalDate = (value: string) => {
      const [year, month, day] = value.split("-").map(Number)
      return year && month && day ? new Date(year, month - 1, day) : undefined
    }
    const from = parseLocalDate(openDate)
    const to = parseLocalDate(closeDate)
    return from ? { from, ...(to ? { to } : {}) } : undefined
  }, [openDate, closeDate])

  const dateRangeLabel = openDate
    ? `${format(dateRange!.from!, "dd/MM/yyyy")} – ${dateRange?.to ? format(dateRange.to, "dd/MM/yyyy") : "Select end date"}`
    : "Select start and end dates"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>Create Recruitment</DialogTitle>
          <DialogDescription>
            Add a new recruitment batch and define its department and schedule.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-4 p-6">
          {submitError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive font-medium">
              {submitError}
            </div>
          )}

          {/* Nama Rekrutmen */}
          <div className="space-y-1.5">
            <Label htmlFor="recruitment-name" className="text-sm font-medium px-1">
              Recruitment Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recruitment-name"
              placeholder="e.g. Senior Frontend Engineer"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                clearFieldError("name")
              }}
              aria-invalid={!!errors.name}
              className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
            />
            {errors.name && (
              <p className="text-xs text-destructive px-1">{errors.name}</p>
            )}
          </div>

          {/* Departemen */}
          <div className="space-y-1.5">
            <Label htmlFor="recruitment-department" className="text-sm font-medium px-1">
              Department <span className="text-destructive">*</span>
            </Label>
            <Select
              items={departmentSelectItems}
              value={departmentId}
              onValueChange={(val) => {
                if (val) {
                  setDepartmentId(val)
                  clearFieldError("departmentId")
                }
              }}
            >
              <SelectTrigger
                id="recruitment-department"
                className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/60 outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                aria-invalid={!!errors.departmentId}
              >
                <SelectValue placeholder={isLoadingDepts ? "Loading departments..." : "Select department"} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {departmentSelectItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.departmentId && (
              <p className="text-xs text-destructive px-1">{errors.departmentId}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <Label htmlFor="recruitment-desc" className="text-sm font-medium px-1">Description</Label>
            <Textarea
              id="recruitment-desc"
              placeholder="Brief description of the job recruitment and expectations..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 rounded-2xl border-0 bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none resize-y"
            />
          </div>

          {/* Recruitment date range */}
          <div className="space-y-1.5">
            <Label htmlFor="recruitment-date-range" className="text-sm font-medium px-1">
              Recruitment Period <span className="text-destructive">*</span>
            </Label>
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger
                id="recruitment-date-range"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.openDate || errors.closeDate)}
                className={`flex h-10 w-full items-center justify-between gap-2 rounded-full border-0 bg-muted px-4 text-sm transition-all hover:bg-muted/60 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary ${dateRange ? "text-foreground" : "text-muted-foreground"} ${(errors.openDate || errors.closeDate) ? "ring-2 ring-destructive" : ""}`}
              >
                <span className="truncate">{dateRangeLabel}</span>
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto rounded-2xl border border-border bg-card p-3 shadow-float">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setOpenDate(range?.from ? format(range.from, "yyyy-MM-dd") : "")
                    setCloseDate(range?.to ? format(range.to, "yyyy-MM-dd") : "")
                    clearFieldError("openDate")
                    clearFieldError("closeDate")
                  }}
                  numberOfMonths={2}
                  defaultMonth={dateRange?.from}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            {(errors.openDate || errors.closeDate) && (
              <p className="px-1 text-xs text-destructive">
                {errors.openDate || errors.closeDate}
              </p>
            )}
          </div>
        </form>

        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton onClick={() => onOpenChange(false)} disabled={isSubmitting} />
          <SaveButton
            type="submit"
            form={formId}
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
