import { useState, type FormEvent } from "react"
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
  CancelButton,
  DatePicker,
  SaveButton,
  TimePicker,
} from "@/shared/components"
import { getApiError } from "@/shared/api/api-error"
import {
  formatWibTime,
  getWibDateKey,
  wibToUtcISOString,
} from "@/shared/lib/utcDateTime"
import type { AssignTakeHomePayload, MyInterviewItem } from "../types"

export function AssignTakeHomeDialog({
  session,
  onClose,
  onAssign,
  busy,
}: {
  session: MyInterviewItem
  onClose: () => void
  onAssign: (sessionId: string, body: AssignTakeHomePayload) => Promise<void>
  busy: boolean
}) {
  const [fileTakeHome, setFileTakeHome] = useState(session.fileTakeHome ?? "")
  const [deadlineDate, setDeadlineDate] = useState(
    session.endedSubmissionAt ? getWibDateKey(session.endedSubmissionAt) : ""
  )
  const [deadlineTime, setDeadlineTime] = useState(
    session.endedSubmissionAt
      ? formatWibTime(session.endedSubmissionAt)
      : "23:59"
  )
  const [taskTitle, setTaskTitle] = useState("")
  const [instructions, setInstructions] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError("")
    if (!deadlineDate || !deadlineTime) {
      setError("Select a deadline date and time.")
      return
    }
    const endedSubmissionAt = wibToUtcISOString(deadlineDate, deadlineTime)
    if (Date.parse(endedSubmissionAt) <= Date.now()) {
      setError("The submission deadline must be in the future.")
      return
    }
    try {
      await onAssign(session.sessionId, {
        fileTakeHome: fileTakeHome.trim(),
        endedSubmissionAt,
        taskTitle: taskTitle.trim(),
        instructions: instructions.trim(),
      })
    } catch (err) {
      setError(
        getApiError(err, "Unable to save the take-home assignment.").message
      )
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {session.fileTakeHome ? "Edit Take-home" : "Assign Take-home"}
          </DialogTitle>
          <DialogDescription>
            {session.candidateName} · {session.sessionName}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="space-y-2">
            <Label htmlFor="take-home-title">Task title</Label>
            <Input
              id="take-home-title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
              maxLength={150}
              disabled={busy}
              placeholder="Technical assignment"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="take-home-link">Assignment link</Label>
            <Input
              id="take-home-link"
              type="url"
              value={fileTakeHome}
              onChange={(e) => setFileTakeHome(e.target.value)}
              required
              maxLength={200}
              disabled={busy}
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-muted-foreground">
              This link will appear in the candidate portal.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="take-home-date">Deadline date</Label>
              <DatePicker
                id="take-home-date"
                value={deadlineDate}
                onChange={setDeadlineDate}
                minDate={getWibDateKey(new Date().toISOString())}
                disabled={busy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="take-home-time">Deadline time (WIB)</Label>
              <TimePicker
                id="take-home-time"
                value={deadlineTime}
                onChange={setDeadlineTime}
                disabled={busy}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="take-home-instructions">
              Instructions for the email
            </Label>
            <Textarea
              id="take-home-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              maxLength={4000}
              disabled={busy}
              rows={3}
            />
          </div>
          {session.fileSubmission &&
            /^https?:\/\//i.test(session.fileSubmission) && (
              <a
                href={session.fileSubmission}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View candidate submission
              </a>
            )}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <CancelButton onClick={onClose} disabled={busy} />
            <SaveButton type="submit" disabled={busy} isLoading={busy}>
              Save Assignment
            </SaveButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
