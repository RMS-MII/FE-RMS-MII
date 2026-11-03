import { useState, useId } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
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

import type { Recruitment } from "../types"
import { mockDepartments } from "../data/mock"

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
  const currentYear = new Date().getFullYear()
  const generatedCode = `REC-${currentYear}-00${existingCount + 1}`

  const [name, setName] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [description, setDescription] = useState("")
  const [openDate, setOpenDate] = useState("")
  const [closeDate, setCloseDate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const departmentSelectItems = mockDepartments.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = "Recruitment name is required"
    if (!departmentId) errs.departmentId = "Department is required"
    if (!openDate) errs.openDate = "Start date is required"
    if (!closeDate) errs.closeDate = "End date is required"
    if (openDate && closeDate && closeDate < openDate) {
      errs.closeDate = "End date cannot be earlier than start date"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const selectedDept = mockDepartments.find((d) => d.id === departmentId)

    const newRecruitmentId = `r-${Date.now()}`
    const newStageId = `s-${Date.now()}-1`

    const newRecruitment: Recruitment = {
      id: newRecruitmentId,
      code: generatedCode,
      batchCode: generatedCode,
      name: name.trim(),
      division: selectedDept?.name ?? "General",
      departmentId: selectedDept?.id ?? "",
      department: selectedDept,
      location: "Jakarta, APL Tower",
      quota: 1,
      openDate,
      startDate: openDate,
      closeDate,
      endDate: closeDate,
      status: "draft",
      currentStage: -1,
      createdBy: "e1000000-0000-4000-8000-000000000001",
      ownerId: "u1",
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      stages: [
        {
          id: newStageId,
          batchStageId: `bs-${newStageId}`,
          recruitmentBatchId: newRecruitmentId,
          stageTypeId: "st-10000000-0000-4000-8000-000000000001",
          name: "Document Screening",
          type: "screening",
          durationDays: 7,
          passingScore: 70,
          ownerId: "u1",
          startDate: openDate,
          endDate: closeDate,
          nextStageId: null,
          isActive: true,
        },
      ],
    }

    onSuccess(newRecruitment)
    onOpenChange(false)

    // Reset form
    setName("")
    setDepartmentId("")
    setDescription("")
    setOpenDate("")
    setCloseDate("")
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create Recruitment</DialogTitle>
          <DialogDescription>
            Add a new recruitment batch and define its department and schedule.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={handleSubmit} className="space-y-4 py-2">
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
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
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
                  if (errors.departmentId) setErrors((prev) => ({ ...prev, departmentId: "" }))
                }
              }}
            >
              <SelectTrigger
                id="recruitment-department"
                className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/60 outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-none"
                aria-invalid={!!errors.departmentId}
              >
                <SelectValue placeholder="Select department" />
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
                  if (errors.openDate) setErrors((prev) => ({ ...prev, openDate: "" }))
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
                  if (errors.closeDate) setErrors((prev) => ({ ...prev, closeDate: "" }))
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

        <DialogFooter className="mt-4 gap-2 sm:gap-2 bg-accent">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-10 rounded-full border-0 bg-muted px-5 text-sm font-medium text-foreground transition-colors hover:bg-gray-300 hover:text-foreground cursor-pointer shadow-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            className="h-10 rounded-full border-0 bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer shadow-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Create Recruitment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

