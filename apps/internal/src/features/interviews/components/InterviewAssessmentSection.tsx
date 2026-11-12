import { useState, type FormEvent } from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Panel } from "@/shared/components"
import type {
  ApiAssessmentRecommendation,
  InterviewerSessionDetailDto,
  MyInterviewItem,
  SubmitAssessmentPayload,
} from "../types"

const recommendations: { label: string; value: ApiAssessmentRecommendation }[] =
  [
    { label: "Strongly Recommend", value: "StronglyRecommend" },
    { label: "Recommend", value: "Recommend" },
    { label: "Consider", value: "Consider" },
    { label: "Not Recommend", value: "NotRecommend" },
  ]

interface Props {
  detail: InterviewerSessionDetailDto
  session: MyInterviewItem
  isSaving: boolean
  onSave: (payload: SubmitAssessmentPayload) => Promise<void>
}

export function InterviewAssessmentSection({
  detail,
  session,
  isSaving,
  onSave,
}: Props) {
  const [score, setScore] = useState(
    session.assessment ? String(session.assessment.score) : ""
  )
  const [recommendation, setRecommendation] =
    useState<ApiAssessmentRecommendation>(
      recommendations.find(
        (option) => option.label === session.assessment?.recommendation
      )?.value ?? "Recommend"
    )
  const [notes, setNotes] = useState(detail.assessmentNotes ?? "")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    const value = Number(score)
    if (
      !Number.isFinite(value) ||
      score.trim() === "" ||
      value < 0 ||
      value > 100
    )
      return setError("Enter a score between 0 and 100.")
    try {
      await onSave({ score: value, recommendation, notes: notes.trim() })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save the assessment."
      )
    }
  }

  return (
    <Panel>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">
          My assessment
        </h2>
        <p className="text-xs text-muted-foreground">
          Your assessment is separate from other interviewers' assessments.
        </p>
      </div>
      <div className="p-5">
        {detail.canAssess ? (
          <form
            className="space-y-4"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
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
                  required
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assessment-recommendation">
                  Recommendation
                </Label>
                <Select
                  items={recommendations}
                  value={recommendation}
                  onValueChange={(value) => {
                    if (value)
                      setRecommendation(value as ApiAssessmentRecommendation)
                  }}
                  disabled={isSaving}
                >
                  <SelectTrigger
                    id="assessment-recommendation"
                    className="w-full"
                  >
                    <SelectValue placeholder="Select recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    {recommendations.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assessment-notes">Notes</Label>
              <Textarea
                id="assessment-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={2000}
                rows={5}
                disabled={isSaving}
                placeholder="Interview feedback (optional)"
              />
              <p className="text-right text-xs text-muted-foreground">
                {notes.length}/2000
              </p>
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
                : session.assessment
                  ? "Update Assessment"
                  : "Submit Assessment"}
            </Button>
          </form>
        ) : session.assessment ? (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-foreground">
              {session.assessment.score}/100 ·{" "}
              {session.assessment.recommendation}
            </p>
            {detail.assessmentNotes && (
              <p className="whitespace-pre-wrap text-muted-foreground">
                {detail.assessmentNotes}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Assessment is available after the candidate confirms the schedule,
            while the recruitment remains open.
          </p>
        )}
      </div>
    </Panel>
  )
}
