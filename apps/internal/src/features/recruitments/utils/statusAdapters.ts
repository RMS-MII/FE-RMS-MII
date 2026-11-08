type StatusInput = number | string | null | undefined
const key = (value: StatusInput) => String(value ?? "").toLowerCase()

// Each map belongs to one BE enum; matching numeric values are not interchangeable.
export function mapApplicationStatus(value: StatusInput): string {
  const statuses: Record<string, string> = {
    "1": "in_progress",
    inprocess: "in_progress",
    in_progress: "in_progress",
    "2": "rejected",
    rejected: "rejected",
    "3": "dropped",
    dropped: "dropped",
    "4": "accepted",
    accepted: "accepted",
  }
  return statuses[key(value)] ?? "unknown"
}

export function parseStatusFilterToNumber(
  value: string
): 1 | 2 | 3 | 4 | undefined {
  const statuses: Record<string, 1 | 2 | 3 | 4> = {
    in_progress: 1,
    rejected: 2,
    dropped: 3,
    accepted: 4,
  }
  return statuses[value]
}

export function mapFinalResultStatus(
  value: StatusInput
): "accepted" | "rejected" | null {
  if (["1", "accepted"].includes(key(value))) return "accepted"
  if (["2", "rejected"].includes(key(value))) return "rejected"
  return null
}

export function mapApplicationStageStatus(value: StatusInput): string {
  if (value == null) return "upcoming"
  const statuses: Record<string, string> = {
    "1": "in_progress",
    inprogress: "in_progress",
    "2": "submitted",
    submitted: "submitted",
    "3": "expired",
    expired: "expired",
    "4": "prioritized",
    prioritized: "prioritized",
    "5": "considered",
    considered: "considered",
    "6": "rejected",
    rejected: "rejected",
    "7": "dropped",
    dropped: "dropped",
  }
  return statuses[key(value)] ?? "unknown"
}

export function mapInterviewSessionStatus(value: StatusInput) {
  const statuses = {
    "1": "scheduled",
    scheduled: "scheduled",
    "2": "pending_confirmation",
    pendingconfirmation: "pending_confirmation",
    "3": "rescheduled",
    rescheduled: "rescheduled",
    "4": "accepted_by_interviewer",
    acceptedbyinterviewer: "accepted_by_interviewer",
    "5": "accepted_by_candidate",
    acceptedbycandidate: "accepted_by_candidate",
  } as const
  return statuses[key(value) as keyof typeof statuses] ?? "unknown"
}

export function mapSessionInterviewStatus(value: StatusInput) {
  const statuses = {
    "1": "in_progress",
    inprogress: "in_progress",
    "2": "completed",
    completed: "completed",
    "3": "cancelled",
    cancelled: "cancelled",
  } as const
  return statuses[key(value) as keyof typeof statuses] ?? "unknown"
}

export function mapStageEmployeeStatus(value: StatusInput) {
  const statuses = {
    "1": "pending",
    pending: "pending",
    "2": "accepted",
    accepted: "accepted",
    "3": "declined",
    declined: "declined",
  } as const
  return statuses[key(value) as keyof typeof statuses] ?? "unknown"
}

export function mapRescheduleStatus(value: StatusInput) {
  const statuses = {
    "1": "pending",
    pending: "pending",
    "2": "approved",
    approved: "approved",
    "3": "rejected",
    rejected: "rejected",
  } as const
  return statuses[key(value) as keyof typeof statuses] ?? "unknown"
}

export function mapRecommendation(value: StatusInput) {
  const recommendations = {
    "1": "StronglyRecommend",
    stronglyrecommend: "StronglyRecommend",
    "2": "Recommend",
    recommend: "Recommend",
    "3": "Consider",
    consider: "Consider",
    "4": "NotRecommend",
    notrecommend: "NotRecommend",
  } as const
  return recommendations[key(value) as keyof typeof recommendations] ?? null
}
