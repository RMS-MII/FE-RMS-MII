import { useState, useMemo, useEffect, useRef } from "react"
import {
  useLazyGetAvailableTalentCandidatesQuery,
  type AvailableTalentCandidate,
} from "../api/recruitments-api"
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
  onBulkSubmittingChange?: (submitting: boolean) => void
}

function mapTalentPoolCandidate(c: AvailableTalentCandidate) {
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
  }
}

export type TalentPoolCandidate = ReturnType<typeof mapTalentPoolCandidate>

function toRegistrationPayload(cand: TalentPoolCandidate) {
  return {
    fullName: cand.fullName,
    email: cand.email,
    phoneNumber: cand.phoneNumber || undefined,
    gender: cand.gender === "Female" ? 2 : 1,
    birthDate: cand.birthDate ? cand.birthDate.slice(0, 10) : "2000-01-01",
    address: cand.address || "Jakarta, Indonesia",
    education: cand.education || undefined,
    institution: cand.institution || undefined,
    gpa: cand.gpa ? Number(cand.gpa) : undefined,
    cv: cand.cv || undefined,
    portfolio: cand.portfolio || undefined,
  }
}

export function useAddFromTalentPool({
  recruitment,
  onSuccess,
  onBulkSubmittingChange,
}: UseAddFromTalentPoolProps) {
  const [talentSearch, setTalentSearch] = useState("")
  const [debouncedTalentSearch, setDebouncedTalentSearch] = useState("")
  const [availableTalentCandidates, setAvailableTalentCandidates] = useState<TalentPoolCandidate[]>([])
  const [loadedPage, setLoadedPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isFirstPageLoading, setIsFirstPageLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isCandidatesError, setIsCandidatesError] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [selectAllSearch, setSelectAllSearch] = useState<string | null>(null)
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const [bulkRegisteredCount, setBulkRegisteredCount] = useState(0)
  const loadingMoreRef = useRef(false)
  const activeSearchRef = useRef("")
  const [selectedCandidateSnapshots, setSelectedCandidateSnapshots] = useState<
    TalentPoolCandidate[]
  >([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedTalentSearch(talentSearch.trim()),
      300
    )
    return () => window.clearTimeout(timer)
  }, [talentSearch])

  const [getCandidates] = useLazyGetAvailableTalentCandidatesQuery()
  const searchKey = `${recruitment.id}:${debouncedTalentSearch}`

  useEffect(() => {
    let cancelled = false
    activeSearchRef.current = searchKey
    loadingMoreRef.current = false
    setAvailableTalentCandidates([])
    setLoadedPage(0)
    setHasMore(false)
    setIsCandidatesError(false)
    setIsFirstPageLoading(true)
    setIsLoadingMore(false)

    void getCandidates({ batchId: recruitment.id, search: debouncedTalentSearch, page: 1 })
      .unwrap()
      .then((result) => {
        if (cancelled) return
        setAvailableTalentCandidates(result.items.map(mapTalentPoolCandidate))
        setHasMore(result.hasMore)
        setLoadedPage(1)
      })
      .catch(() => {
        if (!cancelled) setIsCandidatesError(true)
      })
      .finally(() => {
        if (!cancelled) setIsFirstPageLoading(false)
      })

    return () => { cancelled = true }
  }, [recruitment.id, debouncedTalentSearch, reloadKey, searchKey, getCandidates])

  const isLoadingCandidates =
    isFirstPageLoading || talentSearch.trim() !== debouncedTalentSearch

  const loadMoreCandidates = async () => {
    if (loadingMoreRef.current || isLoadingCandidates || !hasMore || isCandidatesError) return
    loadingMoreRef.current = true
    setIsLoadingMore(true)
    const requestedSearch = searchKey
    try {
      const result = await getCandidates({
        batchId: recruitment.id,
        search: debouncedTalentSearch,
        page: loadedPage + 1,
      }).unwrap()
      if (activeSearchRef.current !== requestedSearch) return
      setAvailableTalentCandidates((previous) => {
        const existingIds = new Set(previous.map((candidate) => candidate.id))
        return [...previous, ...result.items.map(mapTalentPoolCandidate).filter((candidate) => !existingIds.has(candidate.id))]
      })
      setHasMore(result.hasMore)
      setLoadedPage((page) => page + 1)
    } catch {
      if (activeSearchRef.current === requestedSearch) setIsCandidatesError(true)
    } finally {
      loadingMoreRef.current = false
      if (activeSearchRef.current === requestedSearch) setIsLoadingMore(false)
    }
  }

  const refetchCandidates = () => setReloadKey((key) => key + 1)

  const [registerCandidatesApi, { isLoading: isApiSubmitting }] =
    useRegisterCandidatesMutation()

  const selectedCandidates = useMemo(() => {
    const latestCandidates = new Map(
      availableTalentCandidates.map((candidate) => [candidate.id, candidate])
    )
    return selectedCandidateSnapshots.map(
      (candidate) => latestCandidates.get(candidate.id) ?? candidate
    )
  }, [selectedCandidateSnapshots, availableTalentCandidates])

  const selectedCandidateIds = useMemo(
    () => selectAllSearch !== null
      ? availableTalentCandidates.map((candidate) => candidate.id)
      : selectedCandidates.map((candidate) => candidate.id),
    [selectedCandidates, availableTalentCandidates, selectAllSearch]
  )

  const isAllSelected = selectAllSearch !== null

  const handleToggleSelectAll = () => {
    if (isLoadingCandidates || isCandidatesError || isApiSubmitting || isBulkSubmitting) return
    if (selectAllSearch !== null) {
      setSelectAllSearch(null)
    } else if (availableTalentCandidates.length > 0) {
      setSelectedCandidateSnapshots([])
      setSelectAllSearch(debouncedTalentSearch)
    }
    setError(null)
  }

  const handleAddCandidate = (id: string) => {
    if (
      isLoadingCandidates ||
      isCandidatesError ||
      isApiSubmitting ||
      isBulkSubmitting ||
      selectAllSearch !== null
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
    setSelectAllSearch(null)
    setError(null)
  }

  const stages = useMemo(() => {
    return recruitment.batchStages ?? recruitment.stages ?? []
  }, [recruitment.batchStages, recruitment.stages])

  const addRestriction = getRecruitmentAddRestriction(recruitment, "candidate")
  const canAddCandidates = !addRestriction

  const handleSubmit = async () => {
    if (isApiSubmitting || isBulkSubmitting) return
    if (addRestriction) {
      setError(addRestriction)
      return
    }

    if (selectAllSearch !== null) {
      setIsBulkSubmitting(true)
      onBulkSubmittingChange?.(true)
      setBulkRegisteredCount(0)
      setError(null)
      let completed = 0
      try {
        while (true) {
          // Registered candidates disappear from this query, so each batch starts at page 1.
          const page = await getCandidates({
            batchId: recruitment.id,
            search: selectAllSearch,
            page: 1,
            pageSize: 100,
          }).unwrap()
          if (page.items.length === 0) break
          const result = await registerCandidatesApi({
            batchId: recruitment.id,
            candidates: page.items.map(mapTalentPoolCandidate).map(toRegistrationPayload),
          }).unwrap()
          if (result.length !== page.items.length) {
            throw new Error("The registration response is incomplete. Please refresh the candidate list.")
          }
          completed += result.length
          setBulkRegisteredCount(completed)
        }
        if (completed === 0) {
          setError("No available candidates match this search anymore.")
          refetchCandidates()
        } else {
          onBulkSubmittingChange?.(false)
          onSuccess([])
        }
      } catch (err) {
        setError(`${completed} candidates added. ${getApiError(err, "Could not add the remaining candidates. You can retry to continue.").message}`)
        refetchCandidates()
      } finally {
        setIsBulkSubmitting(false)
        onBulkSubmittingChange?.(false)
      }
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
      const candidatePayloads = selectedCandidates.map(toRegistrationPayload)

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
    hasMore,
    isLoadingMore,
    loadMoreCandidates,
    selectedCandidates,
    selectAllSearch,
    bulkRegisteredCount,
    isAllSelected,
    handleToggleSelectAll,
    handleAddCandidate,
    handleRemoveCandidate,
    handleClearSelection,
    error,
    canAddCandidates,
    isLoadingCandidates,
    isCandidatesError,
    refetchCandidates,
    isSubmitting: isApiSubmitting || isBulkSubmitting,
    handleSubmit,
  }
}
