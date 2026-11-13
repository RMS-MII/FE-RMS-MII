import { lazy, Suspense, useId } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  CancelButton,
  DateTimeRangePicker,
  SaveButton,
} from "@/shared/components"

import type { Recruitment } from "../types"
import { useCreateRecruitmentForm } from "../hooks/useCreateRecruitmentForm"

const RichTextEditor = lazy(() =>
  import("@/shared/components/RichTextEditor").then((module) => ({
    default: module.RichTextEditor,
  }))
)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 rounded-2xl bg-card p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-border p-6 pb-4">
          <DialogTitle>Create Recruitment</DialogTitle>
          <DialogDescription>
            Add a new recruitment batch and define its department and schedule.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="min-w-0 space-y-5 p-6"
        >
          {submitError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
              {submitError}
            </div>
          )}

          <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="min-w-0 space-y-5">
              {/* Nama Rekrutmen */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="recruitment-name"
                  className="px-1 text-sm font-medium"
                >
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
                  className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 outline-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
                />
                {errors.name && (
                  <p className="px-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Departemen */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="recruitment-department"
                  className="px-1 text-sm font-medium"
                >
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
                    className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary"
                    aria-invalid={!!errors.departmentId}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingDepts
                          ? "Loading departments..."
                          : "Select department"
                      }
                    />
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
                  <p className="px-1 text-xs text-destructive">
                    {errors.departmentId}
                  </p>
                )}
              </div>

              {/* Recruitment date range */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="recruitment-date-range"
                  className="px-1 text-sm font-medium"
                >
                  Recruitment Period <span className="text-destructive">*</span>
                </Label>
                <DateTimeRangePicker
                  id="recruitment-date-range"
                  value={{ start: openDate, end: closeDate }}
                  onChange={(range) => {
                    setOpenDate(range.start)
                    setCloseDate(range.end)
                    clearFieldError("openDate")
                    clearFieldError("closeDate")
                  }}
                  disabled={isSubmitting}
                  invalid={Boolean(errors.openDate || errors.closeDate)}
                />
                {(errors.openDate || errors.closeDate) && (
                  <p className="px-1 text-xs text-destructive">
                    {errors.openDate || errors.closeDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              <Label
                id="recruitment-desc-label"
                htmlFor="recruitment-desc"
                className="px-1 text-sm font-medium"
              >
                Description
              </Label>
              <Suspense
                fallback={
                  <div
                    role="status"
                    className="min-h-80 flex-1 rounded-2xl bg-muted p-4 text-sm text-muted-foreground"
                  >
                    Loading editor...
                  </div>
                }
              >
                <RichTextEditor
                  id="recruitment-desc"
                  labelledBy="recruitment-desc-label"
                  placeholder="Brief description of the job recruitment and expectations..."
                  value={description}
                  onChange={setDescription}
                  disabled={isSubmitting}
                />
              </Suspense>
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2 border-t border-border bg-card px-9 pb-9 ">
          <CancelButton
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          />
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
