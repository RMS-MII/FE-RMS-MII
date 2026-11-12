import type { AssignTakeHomePayload, MyInterviewItem } from "../types"

export function createTakeHomePayload(
  session: MyInterviewItem,
  fileTakeHome: string,
  endedSubmissionAt: string
): AssignTakeHomePayload {
  return {
    fileTakeHome: fileTakeHome.trim(),
    endedSubmissionAt,
    taskTitle: `Take-home test - ${session.stageName}`.slice(0, 150),
    instructions:
      "Complete the assignment using the provided link and submit your answer through the candidate portal before the deadline.",
  }
}
