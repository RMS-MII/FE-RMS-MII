import type { Recruitment, CandidateApplicationItem } from "../types"
import type { SortDirection } from "@/shared/components"
import { candidates } from "@/data/mock"

/**
 * Builds CandidateApplicationItem records for a recruitment batch by joining:
 * - BatchApplications (candidate application to this recruitment)
 * - Candidates table (profile info: name, email, education, cv, etc.)
 * - ApplicationStage records (for each stage in recruitment.stages)
 */
export function getRecruitmentCandidateApplications(
  recruitment: Recruitment
): CandidateApplicationItem[] {
  const batchCandidates = candidates.filter((c) => c.recruitmentId === recruitment.id)

  return batchCandidates.map((c, idx) => {
    const codeNumber = String(idx + 1).padStart(3, "0")
    const codeYear = recruitment.openDate ? recruitment.openDate.slice(0, 4) : "2026"
    const codeApplication = `APP-${codeYear}-${codeNumber}`
    const stages = recruitment.stages || []
    const currentStage = stages[c.stageIndex]

    // Construct ApplicationStage entries for each stage in the recruitment batch
    const applicationStages = stages.map((stg, sIdx) => {
      let stageStatus: CandidateApplicationItem["applicationStages"][0]["status"] = "upcoming"
      let stageScore: number | null = null
      let startedAt: string | null = null
      let completedAt: string | null = null
      let notes: string | null = null

      if (sIdx < c.stageIndex) {
        // Stage previously completed and passed
        stageStatus = "passed"
        const passing = stg.passingScore ?? 70
        const hash = (c.name.charCodeAt(0) + sIdx * 7) % 18
        stageScore = Math.min(100, passing + 6 + hash)
        startedAt = c.appliedAt
        completedAt = c.appliedAt
        notes = "Passed evaluation criteria."
      } else if (sIdx === c.stageIndex) {
        // Current active stage
        if (c.status === "rejected") {
          stageStatus = "failed"
          stageScore = c.testScore ?? 54
          notes = "Did not meet passing score requirements."
        } else if (c.status === "withdrawn") {
          stageStatus = "withdrawn"
          stageScore = c.testScore
          notes = "Candidate withdrew from the selection process."
        } else if (c.status === "accepted") {
          stageStatus = "passed"
          stageScore = c.testScore ?? 88
          notes = "Offered position and accepted."
        } else if (c.status === "pending") {
          stageStatus = "pending"
          stageScore = c.testScore
          notes = "Waiting for interviewer / committee evaluation."
        } else {
          stageStatus = "in_progress"
          stageScore = c.testScore
          notes = "Currently participating in this stage."
        }
        startedAt = c.appliedAt
      } else {
        // Future / upcoming stage
        stageStatus = "upcoming"
        stageScore = null
      }

      return {
        stageIndex: sIdx,
        stageId: stg.id,
        stageName: stg.name,
        stageType: stg.type,
        passingScore: stg.passingScore ?? 70,
        status: stageStatus,
        totalScore: stageScore,
        startedAt,
        completedAt,
        notes,
      }
    })

    const currStageScore =
      applicationStages[c.stageIndex]?.totalScore ?? c.testScore ?? null
    const currStageStatus =
      applicationStages[c.stageIndex]?.status ?? c.status

    return {
      id: `app-${c.id}`,
      candidateId: c.id,
      recruitmentBatchId: recruitment.id,
      codeApplication,
      appliedAt: c.appliedAt,
      status: c.status,
      finalStatus:
        c.status === "accepted"
          ? "accepted"
          : c.status === "rejected"
          ? "rejected"
          : "pending",
      note: null,
      fileOfferingLetter:
        c.status === "accepted" ? `Offering_Letter_${c.name.replace(/\s+/g, "_")}.pdf` : null,
      offeringLetterStatus: c.status === "accepted" ? "Accepted" : null,

      // Profile details
      candidateName: c.name,
      candidateEmail: c.email,
      candidatePhone: c.phone,
      candidateEducation: c.education,
      candidateInstitution: c.education.includes(", ") ? c.education.split(", ")[1] : null,
      candidateGpa: "3.75",
      candidateCv: `CV_${c.name.replace(/\s+/g, "_")}.pdf`,
      candidatePortfolio: `https://github.com/${c.name.toLowerCase().replace(/\s+/g, "")}`,

      // Current Stage
      currentStageIndex: c.stageIndex,
      currentStageName: currentStage ? currentStage.name : `Stage ${c.stageIndex + 1}`,
      currentStageScore: currStageScore,
      currentStageStatus: currStageStatus,
      applicationStages,
    }
  })
}

export type CandidateAppSortKey = "name" | "code" | "stage" | "score" | "status" | "appliedAt"

export function filterCandidateApplications(
  list: CandidateApplicationItem[],
  search = "",
  selectedStageIndex: number | null = null,
  statusFilter = "all"
): CandidateApplicationItem[] {
  let result = [...list]

  if (selectedStageIndex !== null) {
    // When a stage is selected, filter candidates who have reached or are in this stage
    result = result.filter((item) => {
      // Must have reached at least this stage
      return item.currentStageIndex >= selectedStageIndex
    })
  }

  if (statusFilter && statusFilter !== "all") {
    result = result.filter((item) => {
      if (selectedStageIndex !== null) {
        const stageRecord = item.applicationStages[selectedStageIndex]
        return stageRecord?.status === statusFilter
      }
      return item.status === statusFilter || item.currentStageStatus === statusFilter
    })
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(
      (item) =>
        item.candidateName.toLowerCase().includes(q) ||
        item.candidateEmail.toLowerCase().includes(q) ||
        item.codeApplication.toLowerCase().includes(q) ||
        (item.candidateEducation && item.candidateEducation.toLowerCase().includes(q))
    )
  }

  return result
}

export function sortCandidateApplications(
  list: CandidateApplicationItem[],
  sortKey: CandidateAppSortKey = "appliedAt",
  order: SortDirection = "desc",
  selectedStageIndex: number | null = null
): CandidateApplicationItem[] {
  return [...list].sort((a, b) => {
    let comparison = 0

    switch (sortKey) {
      case "name":
        comparison = a.candidateName.localeCompare(b.candidateName)
        break
      case "code":
        comparison = a.codeApplication.localeCompare(b.codeApplication)
        break
      case "stage":
        comparison = a.currentStageIndex - b.currentStageIndex
        break
      case "score": {
        const scoreA =
          selectedStageIndex !== null
            ? a.applicationStages[selectedStageIndex]?.totalScore ?? 0
            : a.currentStageScore ?? 0
        const scoreB =
          selectedStageIndex !== null
            ? b.applicationStages[selectedStageIndex]?.totalScore ?? 0
            : b.currentStageScore ?? 0
        comparison = scoreA - scoreB
        break
      }
      case "status": {
        const statusA =
          selectedStageIndex !== null
            ? a.applicationStages[selectedStageIndex]?.status ?? ""
            : a.currentStageStatus
        const statusB =
          selectedStageIndex !== null
            ? b.applicationStages[selectedStageIndex]?.status ?? ""
            : b.currentStageStatus
        comparison = statusA.localeCompare(statusB)
        break
      }
      case "appliedAt":
      default:
        comparison = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
        break
    }

    return order === "asc" ? comparison : -comparison
  })
}
