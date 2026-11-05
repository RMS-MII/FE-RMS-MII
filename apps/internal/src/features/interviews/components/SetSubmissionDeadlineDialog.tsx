import { useState, useEffect } from "react"
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
import { CancelButton, DatePicker, SaveButton } from "@/shared/components"
import { format, parseISO } from "date-fns"
import {
  FileClock,
  FileCheck,
  FileQuestion,
  ExternalLink,
  Calendar,
} from "lucide-react"
import type { MyInterviewItem } from "../types"

export interface SetSubmissionDeadlineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: MyInterviewItem | null
  onSaveDeadline: (sessionId: string, endedSubmissionAt: string) => void
}

export function SetSubmissionDeadlineDialog({
  open,
  onOpenChange,
  session,
  onSaveDeadline,
}: SetSubmissionDeadlineDialogProps) {
  const [deadlineDate, setDeadlineDate] = useState("")
  const [deadlineTime, setDeadlineTime] = useState("23:59")
  const [instructions, setInstructions] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open && session) {
      if (session.endedSubmissionAt) {
        try {
          const d = parseISO(session.endedSubmissionAt)
          setDeadlineDate(format(d, "yyyy-MM-dd"))
          setDeadlineTime(format(d, "HH:mm"))
        } catch {
          setDeadlineDate("")
          setDeadlineTime("23:59")
        }
      } else {
        // Default to same date as scheduled interview or 1 day prior
        try {
          const interviewDate = parseISO(session.scheduledStart)
          setDeadlineDate(format(interviewDate, "yyyy-MM-dd"))
          setDeadlineTime("23:59")
        } catch {
          setDeadlineDate("")
          setDeadlineTime("23:59")
        }
      }
      setInstructions("")
      setError("")
    }
  }, [open, session])

  if (!session) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deadlineDate) {
      setError("Please select a deadline date.")
      return
    }
    if (!deadlineTime) {
      setError("Please set a deadline time.")
      return
    }

    const endedSubmissionAtISO = `${deadlineDate}T${deadlineTime}:00`
    onSaveDeadline(session.id, endedSubmissionAtISO)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileClock className="size-5" />
            </span>
            <DialogTitle>Set Submission Deadline</DialogTitle>
          </div>
          <DialogDescription>
            Configure candidate take-home test submission deadline for this interview session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 max-h-[72vh] overflow-y-auto">
          {/* Candidate & Stage Overview */}
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-foreground text-sm">
                  {session.candidateName}
                </span>
                <p className="text-muted-foreground text-[11px]">
                  {session.recruitmentName} • {session.stageName}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary shrink-0">
                {session.codeApplication}
              </span>
            </div>

            {/* Current File Submission Status */}
            <div className="pt-2 border-t border-border/50">
              {session.fileSubmission ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="size-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-medium text-[11px] block truncate">
                        {session.fileSubmission}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        Submission file uploaded by candidate
                      </span>
                    </div>
                  </div>
                  <a
                    href={session.fileSubmission}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline shrink-0"
                  >
                    <span>View</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground text-[11px] py-1">
                  <FileQuestion className="size-3.5 text-amber-600 shrink-0" />
                  <span>No submission file uploaded yet by candidate.</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Date & Time Inputs */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="submission-deadline-date" className="text-sm font-medium px-1 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                <span>Submission Deadline Date</span>
                <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                id="submission-deadline-date"
                value={deadlineDate}
                onChange={(val) => {
                  setDeadlineDate(val)
                  if (error) setError("")
                }}
                placeholder="Select deadline date..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="submission-deadline-time" className="text-sm font-medium px-1">
                Deadline Time (WIB) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="submission-deadline-time"
                type="time"
                value={deadlineTime}
                onChange={(e) => {
                  setDeadlineTime(e.target.value)
                  if (error) setError("")
                }}
                className="h-10 rounded-full border-0 bg-muted px-4 text-xs font-mono text-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="submission-instructions" className="text-sm font-medium px-1">
                Instructions / Notes for Candidate (Optional)
              </Label>
              <Textarea
                id="submission-instructions"
                placeholder="e.g. Please provide your GitHub repository URL or upload your assignment PDF/ZIP archive before this deadline..."
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="min-h-16 rounded-2xl border-0 bg-muted px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none resize-y"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive px-1 font-medium">{error}</p>
          )}

          <DialogFooter className="px-9 pb-9 border-t border-border bg-card gap-2 -mx-6 -mb-6 mt-4">
            <CancelButton onClick={() => onOpenChange(false)} />
            <SaveButton type="submit">
              Save Deadline
            </SaveButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

