import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { CancelButton, SaveButton } from "@/shared/components"
import { safeFormatDate } from "@/shared/lib/format"
import type { Stage, StageInterviewerAssignment } from "../../types"
import { InterviewerAssignSection } from "../InterviewerAssignSection"

export interface AssignInterviewersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stage: Stage | null
  stageIndex?: number
  batchName?: string
  onSave: (stageId: string, assignments: StageInterviewerAssignment[]) => Promise<void>
}

export function AssignInterviewersDialog({
  open,
  onOpenChange,
  stage,
  onSave,
}: AssignInterviewersDialogProps) {
  const [assignments, setAssignments] = useState<StageInterviewerAssignment[]>(
    () => stage?.assignedInterviewers ?? []
  )
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!stage || isSaving) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await onSave(stage.id, assignments)
      setIsSaved(true)
      setTimeout(() => {
        setIsSaved(false)
        onOpenChange(false)
      }, 400)
    } catch {
      setSaveError("Failed to save interviewers. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!stage) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden bg-card">
        <DialogHeader className="p-6 pb-4 border-b border-border text-left">
          <DialogTitle>Assign Interviewers</DialogTitle>
          <DialogDescription>
            Assign or update interviewers for this selection stage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6 pt-4">
          {/* Stage Overview: Nama, Tipe, Tanggal Mulai dan Akhir */}
          <div className="rounded-2xl bg-muted/60 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground text-sm">
                {stage.name}
              </span>
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary capitalize">
                {stage.stageTypeName || stage.stageCategory || stage.type}
              </span>
            </div>
            <div className="text-muted-foreground">
              <span>Schedule: </span>
              <span className="font-medium text-foreground">
                {stage.startDate && stage.endDate
                  ? `${safeFormatDate(stage.startDate)} – ${safeFormatDate(stage.endDate)}`
                  : "-"}
              </span>
            </div>
          </div>

          <InterviewerAssignSection
            id="dialog-interviewers"
            assignments={assignments}
            onChange={setAssignments}
            allowRemove={false}
          />
          {saveError && (
            <p role="alert" className="text-sm text-destructive">{saveError}</p>
          )}
        </div>

        <DialogFooter className="px-6 border-t border-border bg-card gap-2">
          <CancelButton onClick={() => onOpenChange(false)} />
          <SaveButton onClick={handleSave} isSaved={isSaved} isLoading={isSaving} disabled={isSaved}>
            Save
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
