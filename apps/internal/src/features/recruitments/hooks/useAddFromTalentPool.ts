import { useState, useMemo } from "react"
import { mockCandidates } from "@/features/candidates/data/mock"
import type { Recruitment, CandidateApplicationItem } from "../types"
import { useRegisterCandidatesMutation } from "../api/applications-api"

export interface UseAddFromTalentPoolProps {
  recruitment: Recruitment
  existingApplicationCount: number
  onSuccess: (newApplications: CandidateApplicationItem[]) => void
  onCancel?: () => void
}

export function useAddFromTalentPool({
  recruitment,
  existingApplicationCount,
  onSuccess,
}: UseAddFromTalentPoolProps) {
  const [talentSearch, setTalentSearch] = useState("")
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const [registerCandidatesApi, { isLoading: isApiSubmitting }] = useRegisterCandidatesMutation()

  const isRealBatch = Boolean(recruitment.id && !recruitment.id.startsWith("r"))

  // Filter candidates from talent pool who have NOT yet applied to this recruitment batch
  const availableTalentCandidates = useMemo(() => {
    return mockCandidates.filter((c) => {
      const alreadyApplied = c.appliedBatches?.some(
        (b) => b.batchId === recruitment.id || b.batchCode === recruitment.batchCode
      )
      if (alreadyApplied) return false

      if (talentSearch.trim()) {
        const q = talentSearch.toLowerCase()
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.institution && c.institution.toLowerCase().includes(q)) ||
          (c.education && c.education.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [recruitment.id, recruitment.batchCode, talentSearch])

  const selectedCandidates = useMemo(() => {
    return availableTalentCandidates.filter((c) => selectedCandidateIds.includes(c.id))
  }, [availableTalentCandidates, selectedCandidateIds])

  const isAllSelected =
    availableTalentCandidates.length > 0 &&
    availableTalentCandidates.every((c) => selectedCandidateIds.includes(c.id))

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCandidateIds([])
    } else {
      setSelectedCandidateIds(availableTalentCandidates.map((c) => c.id))
    }
  }

  const handleToggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    if (error) setError(null)
  }

  const handleSubmit = async () => {
    if (selectedCandidates.length === 0) {
      setError("Please select at least one candidate from the talent pool.")
      return
    }

    const codeYear = recruitment.openDate ? recruitment.openDate.slice(0, 4) : "2026"
    const appliedAt = new Date().toISOString()
    const stages = recruitment.batchStages && recruitment.batchStages.length > 0
      ? recruitment.batchStages
      : recruitment.stages || []
    const firstStage = stages[0]

    // 1. If real batch, call backend API
    if (isRealBatch) {
      try {
        const candidatePayloads = selectedCandidates.map((cand) => ({
          fullName: cand.fullName,
          email: cand.email,
          phoneNumber: cand.phoneNumber || undefined,
          gender: cand.gender === "Female" ? 2 : 1,
          birthDate: cand.birthDate ? cand.birthDate.slice(0, 10) : "2000-01-01",
          address: cand.address || "Jakarta, Indonesia",
          education: cand.education || undefined,
          institution: cand.institution || undefined,
          gpa: cand.gpa ? Number(cand.gpa) : undefined,
          expectedSalary: cand.expectedSalary ? Number(cand.expectedSalary) : undefined,
          cv: cand.cv || undefined,
          portfolio: cand.portfolio || undefined,
        }))

        const result = await registerCandidatesApi({
          batchId: recruitment.id,
          candidates: candidatePayloads,
        }).unwrap()

        const createdItems = Array.isArray(result) ? result : []

        const newApplications: CandidateApplicationItem[] = selectedCandidates.map((cand, idx) => {
          const apiItem = createdItems[idx]
          const codeNumber = String(existingApplicationCount + idx + 1).padStart(3, "0")
          const codeApplication = apiItem?.codeApplication || `APP-${codeYear}-${codeNumber}`

          const applicationStages = stages.map((stg: any, sIdx) => ({
            stageIndex: sIdx,
            stageId: stg.id,
            stageName: stg.stageName || stg.name,
            stageType: stg.stageCategory?.toLowerCase() || stg.type,
            passingScore: stg.passingScore ?? 70,
            status: sIdx === 0 ? "in_progress" : "upcoming",
            totalScore: null,
            startedAt: sIdx === 0 ? appliedAt : null,
            completedAt: null,
            notes: null,
          }))

          return {
            id: apiItem?.id || `app-man-${Date.now()}-${idx}`,
            candidateId: apiItem?.candidateId || cand.id,
            recruitmentBatchId: recruitment.id,
            codeApplication,
            appliedAt: apiItem?.appliedAt || appliedAt,
            status: "in_progress",
            finalStatus: "pending",
            note: null,
            fileOfferingLetter: null,
            offeringLetterStatus: null,
            candidateName: cand.fullName,
            candidateEmail: cand.email,
            candidatePhone: cand.phoneNumber,
            candidateEducation: cand.education,
            candidateInstitution: cand.institution,
            candidateGpa: cand.gpa,
            candidateCv: cand.cv,
            candidatePortfolio: cand.portfolio,
            currentStageIndex: 0,
            currentStageName: firstStage ? (firstStage as any).stageName || (firstStage as any).name : "Stage 1",
            currentStageScore: null,
            currentStageStatus: "in_progress",
            applicationStages,
          }
        })

        onSuccess(newApplications)
        return
      } catch (err: any) {
        console.error("Failed to register candidates via API:", err)
        const errMsg = err?.data?.message || err?.data?.title || "Failed to register candidates on server. Please try again."
        setError(errMsg)
        return
      }
    }

    // 2. Fallback for mock batch
    const newApplications: CandidateApplicationItem[] = selectedCandidates.map((cand, idx) => {
      const codeNumber = String(existingApplicationCount + idx + 1).padStart(3, "0")
      const codeApplication = `APP-${codeYear}-${codeNumber}`

      const applicationStages = stages.map((stg: any, sIdx) => ({
        stageIndex: sIdx,
        stageId: stg.id,
        stageName: stg.stageName || stg.name,
        stageType: stg.stageCategory?.toLowerCase() || stg.type,
        passingScore: stg.passingScore ?? 70,
        status: sIdx === 0 ? "in_progress" : "upcoming",
        totalScore: null,
        startedAt: sIdx === 0 ? appliedAt : null,
        completedAt: null,
        notes: null,
      }))

      return {
        id: `app-man-${Date.now()}-${idx}`,
        candidateId: cand.id,
        recruitmentBatchId: recruitment.id,
        codeApplication,
        appliedAt,
        status: "in_progress",
        finalStatus: "pending",
        note: null,
        fileOfferingLetter: null,
        offeringLetterStatus: null,
        candidateName: cand.fullName,
        candidateEmail: cand.email,
        candidatePhone: cand.phoneNumber,
        candidateEducation: cand.education,
        candidateInstitution: cand.institution,
        candidateGpa: cand.gpa,
        candidateCv: cand.cv,
        candidatePortfolio: cand.portfolio,
        currentStageIndex: 0,
        currentStageName: firstStage ? (firstStage as any).stageName || (firstStage as any).name : "Stage 1",
        currentStageScore: null,
        currentStageStatus: "in_progress",
        applicationStages,
      }
    })

    onSuccess(newApplications)
  }

  return {
    talentSearch,
    setTalentSearch,
    selectedCandidateIds,
    availableTalentCandidates,
    selectedCandidates,
    isAllSelected,
    handleToggleSelectAll,
    handleToggleCandidate,
    error,
    isSubmitting: isApiSubmitting,
    handleSubmit,
  }
}

