import { useState, type FormEvent } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { DatePicker, Panel, TimePicker } from "@/shared/components"
import {
  formatWibDateTime,
  formatWibTime,
  getWibDateKey,
  wibToUtcISOString,
} from "@/shared/lib/utcDateTime"
import type { AssignTakeHomePayload, MyInterviewItem } from "../types"
import { createTakeHomePayload } from "../utils/takeHomePayload"

interface Props {
  session: MyInterviewItem
  isSaving: boolean
  onSave: (payload: AssignTakeHomePayload) => Promise<void>
}

function validLink(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function InterviewTakeHomeSection({ session, isSaving, onSave }: Props) {
  const [link, setLink] = useState(session.fileTakeHome ?? "")
  const [deadlineDate, setDeadlineDate] = useState(
    session.endedSubmissionAt ? getWibDateKey(session.endedSubmissionAt) : ""
  )
  const [deadlineTime, setDeadlineTime] = useState(
    session.endedSubmissionAt
      ? formatWibTime(session.endedSubmissionAt)
      : "23:59"
  )
  const [error, setError] = useState<string | null>(null)
  const hasAssignment = Boolean(session.fileTakeHome)
  const isSubmitted = Boolean(session.fileSubmission)
  const isOverdue =
    !isSubmitted &&
    Boolean(
      session.endedSubmissionAt &&
      Date.parse(session.endedSubmissionAt) < Date.now()
    )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (!validLink(link.trim()))
      return setError("Enter a valid HTTP or HTTPS assignment link.")
    if (!deadlineDate || !deadlineTime)
      return setError("Select a submission deadline.")
    const endedSubmissionAt = wibToUtcISOString(deadlineDate, deadlineTime)
    if (Date.parse(endedSubmissionAt) <= Date.now())
      return setError("The deadline must be in the future.")
    try {
      await onSave(createTakeHomePayload(session, link, endedSubmissionAt))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the assignment."
      )
    }
  }

  return (
    <Panel>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">
          Take-home test
        </h2>
        <p className="text-xs text-muted-foreground">
          Share an assignment link and review the candidate's submission.
        </p>
      </div>
      <div className="space-y-5 p-5">
        {session.canAssignTakeHome ? (
          <form
            className="space-y-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="space-y-1.5">
              <Label htmlFor="take-home-link">Assignment link</Label>
              <Input
                id="take-home-link"
                type="url"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                maxLength={200}
                placeholder="https://..."
                required
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="take-home-date">Deadline date</Label>
                <DatePicker
                  id="take-home-date"
                  value={deadlineDate}
                  onChange={setDeadlineDate}
                  minDate={getWibDateKey(new Date())}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="take-home-time">Deadline time (WIB)</Label>
                <TimePicker
                  id="take-home-time"
                  value={deadlineTime}
                  onChange={setDeadlineTime}
                  disabled={isSaving}
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSaving}
              className="rounded-full"
            >
              {isSaving
                ? "Saving..."
                : hasAssignment
                  ? "Update Assignment"
                  : "Send Assignment"}
            </Button>
          </form>
        ) : hasAssignment ? (
          <div className="space-y-2 text-sm">
            <a
              href={session.fileTakeHome!}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Open assignment <ExternalLink className="size-3.5" />
            </a>
            {session.endedSubmissionAt && (
              <p className="text-xs text-muted-foreground">
                Deadline: {formatWibDateTime(session.endedSubmissionAt)}
              </p>
            )}
            {session.assessment && (
              <p className="text-xs text-muted-foreground">
                The assignment is locked after you submit an assessment.
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {session.assessment
              ? "Take-home assignments are locked after you submit an assessment."
              : "You can send an assignment after the candidate confirms the schedule while the stage is active."}
          </p>
        )}

        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold text-foreground">
            Candidate submission
          </h3>
          {isSubmitted && validLink(session.fileSubmission!) ? (
            <a
              href={session.fileSubmission!}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Open submitted work <ExternalLink className="size-3.5" />
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isOverdue
                ? "Submission deadline has passed."
                : hasAssignment
                  ? "Waiting for candidate submission."
                  : "No assignment has been sent yet."}
            </p>
          )}
        </div>
      </div>
    </Panel>
  )
}
