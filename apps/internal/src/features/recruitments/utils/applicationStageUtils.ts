import type { CandidateApplicationDetailItem } from "../types"

/** The server selects the next stage. This only explains eligibility in the recap. */
export function getStartStageRestriction(
  application: CandidateApplicationDetailItem
): string | null {
  if (application.status !== "in_progress" || application.finalStatus != null) {
    return "This application has already been finalized."
  }
  if (
    application.summary.isAllStagesCompleted ||
    application.summary.canFinalize
  ) {
    return "All selection stages are complete. Review the application for a final decision."
  }
  if (application.applicationStages.length === 0)
    return "No active stages are configured for this batch."
  const startedStages = application.applicationStages.filter(
    (stage) => stage.isStarted
  )
  if (startedStages.some((stage) => !stage.isCompleted)) {
    return "A stage is still in progress or awaiting evaluation."
  }
  if (startedStages.some((stage) => !stage.isPassed)) {
    return "This application cannot continue because a stage did not pass."
  }
  const nextStage = application.applicationStages[application.currentStageIndex]
  if (!nextStage) return "No next stage is available to start."
  if (nextStage.isStarted !== false || nextStage.applicationStageId !== null) {
    return "This stage has already started."
  }
  return null
}
