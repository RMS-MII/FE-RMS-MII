import { useState, type FormEvent } from "react"
import { SaveButton } from "@/shared/components"
import { Textarea } from "@workspace/ui/components/textarea"
import { getApiError } from "@/shared/api/api-error"
import {
  useSetFinalResultMutation,
  useStartApplicationStageMutation,
} from "../../api/applications-api"
import type {
  CandidateApplicationDetailItem,
  SetFinalResultCommand,
} from "../../types/application"

export function StandaloneApplicationActions({
  application,
  readOnly,
}: {
  application: CandidateApplicationDetailItem
  readOnly: boolean
}) {
  const [startStage, { isLoading: starting }] =
    useStartApplicationStageMutation()
  const [setFinalResult, { isLoading: finalizing }] =
    useSetFinalResultMutation()
  const [error, setError] = useState("")
  const canProgress =
    !readOnly &&
    application.status === "in_progress" &&
    application.finalStatus == null
  const stages = application.applicationStages
  const nextStage = stages.find((stage) => !stage.isStarted)
  const canStart =
    canProgress &&
    nextStage &&
    stages.every((stage) => !stage.isStarted || stage.isPassed)

  async function start() {
    setError("")
    try {
      await startStage({
        applicationId: application.id,
        batchId: application.recruitmentBatchId,
      }).unwrap()
    } catch (failure) {
      setError(getApiError(failure, "Unable to start this stage.").message)
    }
  }

  async function finalize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const finalResultStatus = fields.get(
      "decision"
    ) as SetFinalResultCommand["finalResultStatus"]
    const notes = String(fields.get("notes") ?? "").trim()
    if (!notes) {
      setError("Enter a note for the final decision.")
      return
    }
    setError("")
    try {
      await setFinalResult({
        applicationId: application.id,
        body: { finalResultStatus, notes },
      }).unwrap()
    } catch (failure) {
      setError(
        getApiError(failure, "Unable to save the final decision.").message
      )
    }
  }

  return (
    <section className="space-y-3 border-b border-border p-6">
      <h2 className="text-base font-semibold">Standalone application</h2>
      <p className="text-sm text-muted-foreground">
        This candidate progresses through the selection stages independently.
      </p>
      {canStart && (
        <SaveButton
          onClick={() => void start()}
          isLoading={starting}
          loadingText="Starting…"
        >
          Start {nextStage.stageName}
        </SaveButton>
      )}
      {canProgress && application.summary.canFinalize && (
        <form
          onSubmit={(event) => void finalize(event)}
          className="max-w-lg space-y-3"
        >
          <label className="grid gap-1.5 text-sm">
            Final result
            <select
              name="decision"
              required
              className="h-9 rounded-lg border border-border bg-card px-3"
            >
              <option value="">Select a result</option>
              {stages.every((stage) => stage.isPassed) && (
                <option value="Accepted">Accepted</option>
              )}
              <option value="Rejected">Rejected</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            Decision notes
            <Textarea name="notes" required maxLength={500} />
          </label>
          <SaveButton type="submit" isLoading={finalizing}>
            Save final result
          </SaveButton>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  )
}
