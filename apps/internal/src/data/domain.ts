import type { Tone } from "@/components/StatusBadge"
import type {
  Candidate,
  CandidateStatus,
  Evaluation,
  Interview,
  Offering,
  Recommendation,
  Recruitment,
  RecruitmentStatus,
} from "@/data/mock"
import { TODAY } from "@/data/mock"

type Meta = { label: string; tone: Tone }

// ---------------------------------------------------------------------------
// Status maps
// ---------------------------------------------------------------------------
export const recruitmentStatusMeta: Record<RecruitmentStatus, Meta> = {
  draft:      { label: "Draft",     tone: "neutral" },
  running:    { label: "Running",   tone: "info" },
  completed:  { label: "Completed", tone: "success" },
  closed:     { label: "Closed",    tone: "danger" },
}

export const candidateStatusMeta: Record<CandidateStatus, Meta> = {
  in_progress: { label: "In Progress",         tone: "info" },
  pending:     { label: "Pending Decision",     tone: "warning" },
  accepted:    { label: "Accepted",             tone: "success" },
  rejected:    { label: "Not Passed",           tone: "danger" },
  withdrawn:   { label: "Withdrew",             tone: "neutral" },
}

export const offeringStatusMeta: Record<Offering["status"], Meta> = {
  draft:    { label: "Draft",    tone: "neutral" },
  sent:     { label: "Sent",     tone: "info" },
  accepted: { label: "Accepted", tone: "success" },
  declined: { label: "Declined", tone: "danger" },
}

export const recommendationMeta: Record<Recommendation, Meta> = {
  proceed:  { label: "Proceed to next stage", tone: "success" },
  uncertain: { label: "Uncertain",            tone: "warning" },
  reject:   { label: "Do not proceed",        tone: "danger" },
}

export type InterviewState =
  | "no_interviewer"
  | "scheduled"
  | "awaiting_evaluation"
  | "completed"

export const interviewStatusMeta: Record<InterviewState, Meta> = {
  no_interviewer:       { label: "No interviewer assigned", tone: "warning" },
  scheduled:            { label: "Scheduled",               tone: "info" },
  awaiting_evaluation:  { label: "Awaiting evaluation",     tone: "warning" },
  completed:            { label: "Evaluation complete",      tone: "success" },
}

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------
export function evaluationFor(evals: Evaluation[], interviewId: string, interviewerId: string) {
  return evals.find((e) => e.interviewId === interviewId && e.interviewerId === interviewerId)
}

export function getInterviewState(iv: Interview, evals: Evaluation[]): InterviewState {
  if (iv.interviewerIds.length === 0) return "no_interviewer"
  if (iv.date >= TODAY) return "scheduled"
  const allSubmitted = iv.interviewerIds.every(
    (u) => evaluationFor(evals, iv.id, u)?.status === "submitted"
  )
  return allSubmitted ? "completed" : "awaiting_evaluation"
}

export type StageState = "done" | "current" | "upcoming" | "halted"

export interface PipelineItem {
  name: string
  count?: number
  state: StageState
  note?: string
}

/** Active candidates currently sitting in each stage. */
export function recruitmentPipeline(r: Recruitment, cands: Candidate[]): PipelineItem[] {
  return r.stages.map((s, i) => ({
    name: s.name,
    count: cands.filter(
      (c) =>
        c.recruitmentId === r.id &&
        c.stageIndex === i &&
        (c.status === "in_progress" || c.status === "pending" || c.status === "accepted")
    ).length,
    state:
      i < r.currentStage ? "done" : i === r.currentStage ? "current" : "upcoming",
  }))
}

/** Stages a single candidate has passed, with the outcome of each. */
export function candidatePipeline(r: Recruitment, c: Candidate): PipelineItem[] {
  return r.stages.map((s, i) => {
    if (i < c.stageIndex) return { name: s.name, state: "done", note: "Passed" }
    if (i === c.stageIndex) {
      if (c.status === "rejected") return { name: s.name, state: "halted", note: "Not passed" }
      if (c.status === "withdrawn") return { name: s.name, state: "halted", note: "Withdrew" }
      if (c.status === "accepted") return { name: s.name, state: "done", note: "Accepted" }
      if (c.status === "pending") return { name: s.name, state: "current", note: "Pending decision" }
      return { name: s.name, state: "current", note: "In progress" }
    }
    return {
      name: s.name,
      state: "upcoming",
      note:
        c.status === "in_progress" || c.status === "pending"
          ? "Not started"
          : "Not participated",
    }
  })
}

export function activeCount(r: Recruitment, cands: Candidate[]) {
  return cands.filter(
    (c) =>
      c.recruitmentId === r.id &&
      (c.status === "in_progress" || c.status === "pending")
  ).length
}

export function averageScore(e: Evaluation) {
  const v = Object.values(e.scores).filter((n) => n > 0)
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null
}

