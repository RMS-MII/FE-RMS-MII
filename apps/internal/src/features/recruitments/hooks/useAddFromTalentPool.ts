import { useState, useMemo } from "react"
import {
  useGetCandidatesQuery,
  type CandidateWithBatchesDto,
} from "@/features/candidates"
import type { Recruitment, CandidateApplicationItem } from "../types"
import { useRegisterCandidatesMutation } from "../api/applications-api"
import { getRecruitmentAddRestriction } from "../utils/recruitmentUtils"
import { stageCategoryToLegacyType } from "../utils/stageUtils"
import { getApiError } from "@/shared/api/api-error"
import {
  mapApplicationStatus,
  mapFinalResultStatus,
} from "../utils/statusAdapters"

export interface UseAddFromTalentPoolProps {
  recruitment: Recruitment
  existingApplicationCount: number
  onSuccess: (newApplications: CandidateApplicationItem[]) => void
  onCancel?: () => void
}

function mapTalentPoolCandidate(c: CandidateWithBatchesDto) {
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email,
    phoneNumber: c.phoneNumber || "",
    gender: c.gender === 2 || c.gender === "Female" ? "Female" : "Male",
    birthDate: c.birthDate || "",
    address: c.address || "",
    education: c.education || "",
    institution: c.institution || "",
    gpa: c.gpa != null ? String(c.gpa) : "",
    expectedSalary: c.expectedSalary ?? undefined,
    cv: c.cv || "",
    portfolio: c.portfolio || "",
    appliedBatches: (c.assignedBatches || []).map((b) => ({
      batchId: b.batchId,
      batchCode: b.batchCode,
      batchName: b.batchName,
      appliedAt: b.appliedAt,
      status: String(b.applicationStatus ?? ""),
    })),
  }
}

export type TalentPoolCandidate = ReturnType<typeof mapTalentPoolCandidate>

function isRegisteredInBatch(
  candidate: TalentPoolCandidate,
  recruitment: Recruitment
) {
  return candidate.appliedBatches.some(
    (batch) =>
      (batch.batchId &&
        batch.batchId.toLowerCase() === recruitment.id.toLowerCase()) ||
      (batch.batchCode &&
        batch.batchCode.toLowerCase() === recruitment.batchCode.toLowerCase())
  )
}

export function useAddFromTalentPool({
  recruitment,
  onSuccess,
}: UseAddFromTalentPoolProps) {
  const [talentSearch, setTalentSearch] = useState("")
  const [selectedCandidateSnapshots, setSelectedCandidateSnapshots] = useState<
    TalentPoolCandidate[]
  >([])
  const [error, setError] = useState<string | null>(null)

  // Fetch candidates from Talent Pool API
  const {
    currentData: apiCandidatesData,
    isLoading: isLoadingCandidates,
    isFetching: isFetchingCandidates,
    isError: isCandidatesError,
    refetch: refetchCandidates,
  } = useGetCandidatesQuery({
    search: talentSearch.trim() || undefined,
    page: 1,
    pageSize: 100,
  })

  const [registerCandidatesApi, { isLoading: isApiSubmitting }] =
    useRegisterCandidatesMutation()

  // Candidates list mapped directly from API DTOs
  const talentPoolList = useMemo(() => {
    return apiCandidatesData?.items.map(mapTalentPoolCandidate) ?? []
  }, [apiCandidatesData])

  // Filter candidates who have NOT yet applied to this recruitment batch
  const availableTalentCandidates = useMemo(() => {
    return talentPoolList.filter(
      (candidate) => !isRegisteredInBatch(candidate, recruitment)
    )
  }, [talentPoolList, recruitment])

  const selectedCandidates = useMemo(() => {
    const latestCandidates = new Map(
      talentPoolList.map((candidate) => [candidate.id, candidate])
    )
    return selectedCandidateSnapshots
      .map((candidate) => latestCandidates.get(candidate.id) ?? candidate)
      .filter((candidate) => !isRegisteredInBatch(candidate, recruitment))
  }, [selectedCandidateSnapshots, talentPoolList, recruitment])

  const selectedCandidateIds = useMemo(
    () => selectedCandidates.map((candidate) => candidate.id),
    [selectedCandidates]
  )

  const isAllSelected =
    availableTalentCandidates.length > 0 &&
    availableTalentCandidates.every((c) => selectedCandidateIds.includes(c.id))

  const handleToggleSelectAll = () => {
    if (
      isLoadingCandidates ||
      isFetchingCandidates ||
      isCandidatesError ||
      isApiSubmitting
    )
      return
    const visibleIds = new Set(
      availableTalentCandidates.map((candidate) => candidate.id)
    )
    setSelectedCandidateSnapshots((previous) => {
      const selectedIds = new Set(previous.map((candidate) => candidate.id))
      if (
        availableTalentCandidates.every((candidate) =>
          selectedIds.has(candidate.id)
        )
      ) {
        return previous.filter((candidate) => !visibleIds.has(candidate.id))
      }
      return [
        ...previous,
        ...availableTalentCandidates.filter(
          (candidate) => !selectedIds.has(candidate.id)
        ),
      ]
    })
    setError(null)
  }

  const handleAddCandidate = (id: string) => {
    if (
      isLoadingCandidates ||
      isFetchingCandidates ||
      isCandidatesError ||
      isApiSubmitting
    )
      return
    const candidate = availableTalentCandidates.find((item) => item.id === id)
    if (!candidate) return
    setSelectedCandidateSnapshots((previous) =>
      previous.some((item) => item.id === id)
        ? previous
        : [...previous, candidate]
    )
    setError(null)
  }

  const handleRemoveCandidate = (id: string) => {
    setSelectedCandidateSnapshots((previous) =>
      previous.filter((candidate) => candidate.id !== id)
    )
    setError(null)
  }

  const handleClearSelection = () => {
    setSelectedCandidateSnapshots([])
    setError(null)
  }

  const stages = useMemo(() => {
    return recruitment.batchStages ?? recruitment.stages ?? []
  }, [recruitment.batchStages, recruitment.stages])

  const addRestriction = getRecruitmentAddRestriction(recruitment, "candidate")
  const canAddCandidates = !addRestriction

  const handleSubmit = async () => {
    if (isApiSubmitting) return
    if (addRestriction) {
      setError(addRestriction)
      return
    }

    if (selectedCandidates.length === 0) {
      setError("Please select at least one candidate from the talent pool.")
      return
    }

    const firstStage = stages[0]
    const firstStageName = firstStage
      ? "stageName" in firstStage
        ? firstStage.stageName
        : firstStage.name
      : "Stage 1"

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
        expectedSalary:
          cand.expectedSalary != null ? Number(cand.expectedSalary) : undefined,
        cv: cand.cv || undefined,
        portfolio: cand.portfolio || undefined,
      }))

      const result = await registerCandidatesApi({
        batchId: recruitment.id,
        candidates: candidatePayloads,
      }).unwrap()

      const createdItems = Array.isArray(result) ? result : []
      if (
        createdItems.length !== selectedCandidates.length ||
        createdItems.some((item) => !item.id || !item.candidateId)
      ) {
        throw new Error(
          "The registration response is incomplete. Refresh the candidate list before trying again."
        )
      }

      const newApplications: CandidateApplicationItem[] =
        selectedCandidates.map((cand, idx) => {
          const apiItem = createdItems[idx]
          const codeApplication = apiItem.codeApplication

          const applicationStages = stages.map((stg, sIdx) => ({
            stageIndex: sIdx,
            stageId: stg.id,
            batchStageId: stg.id,
            applicationStageId: null,
            stageName: "stageName" in stg ? stg.stageName : stg.name,
            stageType: stageCategoryToLegacyType(
              stg.stageCategory ?? ("type" in stg ? stg.type : undefined)
            ),
            passingScore: stg.passingScore ?? null,
            status: "upcoming",
            totalScore: null,
            startedAt: null,
            completedAt: null,
            notes: null,
          }))

          return {
            id: apiItem.id,
            isStandalone: apiItem.isStandalone,
            candidateId: apiItem.candidateId,
            recruitmentBatchId: recruitment.id,
            codeApplication,
            appliedAt: apiItem.appliedAt ?? apiItem.createdAt ?? "",
            status: mapApplicationStatus(apiItem.status),
            finalStatus: mapFinalResultStatus(apiItem.finalResultStatus),
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
            currentStageName: firstStageName,
            currentStageScore: null,
            currentStageStatus: "upcoming",
            applicationStages,
          }
        })

      onSuccess(newApplications)
    } catch (err) {
      setError(
        getApiError(err, "Failed to register candidates. Please try again.")
          .message
      )
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
    handleAddCandidate,
    handleRemoveCandidate,
    handleClearSelection,
    error,
    canAddCandidates,
    isLoadingCandidates: isLoadingCandidates || isFetchingCandidates,
    isCandidatesError,
    refetchCandidates,
    isSubmitting: isApiSubmitting,
    handleSubmit,
  }
}
