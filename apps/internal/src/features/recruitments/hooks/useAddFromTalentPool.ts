import { useState, useMemo } from "react"
import { useGetCandidatesQuery } from "@/features/candidates/api/candidates-api"
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

  // Fetch candidates from Talent Pool API
  const {
    data: apiCandidatesData,
    isLoading: isLoadingCandidates,
    isFetching: isFetchingCandidates,
    isError: isCandidatesError,
    refetch: refetchCandidates,
  } = useGetCandidatesQuery({
    search: talentSearch.trim() || undefined,
    page: 1,
    pageSize: 100,
  })

  const [registerCandidatesApi, { isLoading: isApiSubmitting }] = useRegisterCandidatesMutation()

  // Candidates list mapped directly from API DTOs
  const talentPoolList = useMemo(() => {
    if (!apiCandidatesData?.items) return []
    return apiCandidatesData.items.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      email: c.email,
      phoneNumber: c.phoneNumber || "",
      gender: c.gender === 2 || c.gender === "Female" ? "Female" : "Male",
      birthDate: c.birthDate || "",
      address: c.address || "",
      education: c.education || "",
      institution: c.institution || "",
      gpa: c.gpa ? String(c.gpa) : "",
      expectedSalary: c.expectedSalary || undefined,
      cv: c.cv || "",
      portfolio: c.portfolio || "",
      appliedBatches: (c.assignedBatches || []).map((b) => ({
        batchId: b.batchId,
        batchCode: b.batchCode,
        batchName: b.batchName,
        appliedAt: b.appliedAt,
        status: String(b.applicationStatus ?? ""),
      })),
    }))
  }, [apiCandidatesData])

  // Filter candidates who have NOT yet applied to this recruitment batch
  const availableTalentCandidates = useMemo(() => {
    return talentPoolList.filter((c) => {
      const alreadyApplied = c.appliedBatches?.some(
        (b) =>
          (b.batchId && b.batchId.toLowerCase() === recruitment.id?.toLowerCase()) ||
          (recruitment.batchCode && b.batchCode && b.batchCode.toLowerCase() === recruitment.batchCode.toLowerCase())
      )
      return !alreadyApplied
    })
  }, [talentPoolList, recruitment.id, recruitment.batchCode])

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

  const handleClearSelection = () => {
    setSelectedCandidateIds([])
  }

  const stages = useMemo(() => {
    return recruitment.batchStages && recruitment.batchStages.length > 0
      ? recruitment.batchStages
      : recruitment.stages || []
  }, [recruitment.batchStages, recruitment.stages])

  const hasStages = stages.length > 0

  const handleSubmit = async () => {
    if (!hasStages) {
      setError("Cannot add candidates because no selection stages have been configured for this recruitment batch. Please configure stages first.")
      return
    }

    if (selectedCandidates.length === 0) {
      setError("Please select at least one candidate from the talent pool.")
      return
    }

    const codeYear = recruitment.openDate ? recruitment.openDate.slice(0, 4) : "2026"
    const appliedAt = new Date().toISOString()
    const firstStage = stages[0]

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
    } catch (err: any) {
      console.error("Failed to register candidates via API:", err)
      const errMsg =
        err?.data?.message ||
        err?.data?.title ||
        "Failed to register candidates on server. Please try again."
      setError(errMsg)
    }
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
    handleClearSelection,
    error,
    hasStages,
    isLoadingCandidates: isLoadingCandidates || isFetchingCandidates,
    isCandidatesError,
    refetchCandidates,
    isSubmitting: isApiSubmitting,
    handleSubmit,
  }
}
