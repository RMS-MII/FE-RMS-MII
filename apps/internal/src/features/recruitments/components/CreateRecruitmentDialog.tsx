import { useId } from "react"
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
import { DatePicker } from "@/shared/components"
import { SaveButton } from "@/shared/components"
import { CancelButton } from "@/shared/components"

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
    existingCount,
    onSuccess,
    onOpenChange,
  })

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

          {/* Tanggal Buka & Tanggal Berakhir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="recruitment-start" className="text-sm font-medium px-1">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="recruitment-start"
                value={openDate}
                onChange={(val) => {
                  setOpenDate(val)
                  clearFieldError("openDate")
                }}
                aria-invalid={!!errors.openDate}
                placeholder="dd/mm/yyyy"
              />
              {errors.openDate && (
                <p className="text-xs text-destructive px-1">{errors.openDate}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="recruitment-end" className="text-sm font-medium px-1">
                End Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="recruitment-end"
                value={closeDate}
                minDate={openDate || undefined}
                onChange={(val) => {
                  setCloseDate(val)
                  clearFieldError("closeDate")
                }}
                aria-invalid={!!errors.closeDate}
                placeholder="dd/mm/yyyy"
              />
              {errors.closeDate && (
                <p className="text-xs text-destructive px-1">{errors.closeDate}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton onClick={() => onOpenChange(false)} disabled={isSubmitting} />
          <SaveButton type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
