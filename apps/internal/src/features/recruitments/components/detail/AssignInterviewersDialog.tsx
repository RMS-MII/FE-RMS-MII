import { useState, useEffect } from "react"
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
import type { Stage, StageEmployeeStatus, StageInterviewerAssignment } from "../../types"
import { InterviewerAssignSection } from "../InterviewerAssignSection"

export interface AssignInterviewersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stage: Stage | null
  stageIndex?: number
  batchName?: string
  onSave: (stageId: string, assignments: StageInterviewerAssignment[]) => void
}

export function AssignInterviewersDialog({
  open,
  onOpenChange,
  stage,
  onSave,
}: AssignInterviewersDialogProps) {
  const [assignments, setAssignments] = useState<StageInterviewerAssignment[]>([])
  const [isSaved, setIsSaved] = useState(false)

  // Sync state whenever the stage prop changes or dialog opens
  useEffect(() => {
    if (stage) {
      if (stage.assignedInterviewers && stage.assignedInterviewers.length > 0) {
        setAssignments(stage.assignedInterviewers)
      } else {
        const fallbackIds =
          stage.interviewerIds && stage.interviewerIds.length > 0
            ? stage.interviewerIds
            : stage.ownerId
              ? [stage.ownerId]
              : []
        setAssignments(
          fallbackIds.map((id) => ({
            employeeId: id,
            status: "pending" as StageEmployeeStatus,
          }))
        )
      }
      setIsSaved(false)
    }
  }, [stage, open])

  const handleSave = () => {
    if (!stage) return
    onSave(stage.id, assignments)
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onOpenChange(false)
    }, 400)
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
          />
        </div>

        <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2">
          <CancelButton onClick={() => onOpenChange(false)} />
          <SaveButton onClick={handleSave} isSaved={isSaved}>
            Save
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
