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
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { CancelButton, SaveButton } from "@/shared/components"
import type {
  ApiAssessmentRecommendation,
  MyInterviewItem,
  SubmitAssessmentPayload,
} from "../types"

const recommendationOptions: {
  value: ApiAssessmentRecommendation
  label: string
}[] = [
  { value: "StronglyRecommend", label: "Strongly Recommend" },
  { value: "Recommend", label: "Recommend" },
  { value: "Consider", label: "Consider" },
  { value: "NotRecommend", label: "Not Recommend" },
]

export interface InterviewAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: MyInterviewItem
  readOnly?: boolean
  isSubmitting?: boolean
  error?: string | null
  onSubmit?: (payload: SubmitAssessmentPayload) => void | Promise<void>
}

export function InterviewAssessmentDialog({
  open,
  onOpenChange,
  session,
  readOnly = false,
  isSubmitting = false,
  error,
  onSubmit,
}: InterviewAssessmentDialogProps) {
  const [score, setScore] = useState(
    session.assessment ? String(session.assessment.score) : ""
  )
  const [recommendation, setRecommendation] = useState<ApiAssessmentRecommendation>(
    recommendationOptions.find(
      (item) => item.label === session.assessment?.recommendation
    )?.value ?? "Recommend"
  )
  const [notes, setNotes] = useState(session.assessment?.notes ?? "")
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsedScore = Number(score)
    if (score.trim() === "" || !Number.isFinite(parsedScore)) {
      setFormError("Enter an assessment score.")
      return
    }
    if (parsedScore < 0 || parsedScore > 100) {
      setFormError("Score must be between 0 and 100.")
      return
    }
    if (notes.length > 2000) {
      setFormError("Notes must be 2,000 characters or fewer.")
      return
    }

    setFormError(null)
    await onSubmit?.({
      score: parsedScore,
      recommendation,
      notes: notes.trim(),
    })
  }

  const displayRecommendation = session.assessment?.recommendation
  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "Assessment Summary" : "Submit Interview Assessment"}
          </DialogTitle>
          <DialogDescription>
            {session.candidateName} · {session.sessionName}
          </DialogDescription>
        </DialogHeader>

        {readOnly ? (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {session.assessment?.score ?? "—"}
                  <span className="text-sm font-normal text-muted-foreground"> / 100</span>
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Recommendation</p>
                <p className="mt-1 font-semibold text-foreground">
                  {displayRecommendation ?? "—"}
                </p>
              </div>
            </div>
            {session.assessment?.notes ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">Notes</p>
                <p className="whitespace-pre-wrap rounded-xl bg-muted/60 p-3 text-sm text-foreground">
                  {session.assessment.notes}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Full assessment notes are not available from this interview summary.
              </p>
            )}
            <DialogFooter>
              <CancelButton onClick={() => onOpenChange(false)}>
                Close
              </CancelButton>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="assessment-score">Score (0–100)</Label>
              <Input
                id="assessment-score"
                type="number"
                min="0"
                max="100"
                step="any"
                value={score}
                onChange={(event) => setScore(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assessment-recommendation">Recommendation</Label>
              <Select
                items={recommendationOptions}
                value={recommendation}
                onValueChange={(value) => {
                  if (value) setRecommendation(value as ApiAssessmentRecommendation)
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="assessment-recommendation" className="w-full">
                  <SelectValue placeholder="Select recommendation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {recommendationOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="assessment-notes">Notes</Label>
                <span className="text-xs text-muted-foreground">{notes.length}/2000</span>
              </div>
              <Textarea
                id="assessment-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={2000}
                rows={5}
                disabled={isSubmitting}
                placeholder="Add interview feedback (optional)"
              />
            </div>
            {(formError || error) && (
              <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                {formError ?? error}
              </p>
            )}
            <DialogFooter className="border-t border-border bg-card">
              <CancelButton
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              />
              <SaveButton type="submit" disabled={isSubmitting}>
                Submit Assessment
              </SaveButton>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
