import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  initialRecruitments,
  mockEmployees,
  mockStageTypes,
} from "../data/mock"
import {
  useGetBatchByIdQuery,
  useUpdateBatchStagesMutation,
} from "../api/recruitments-api"
import type { Recruitment } from "../types"
import type { EditableStage } from "../components/stages"
import {
  reorderArray,
  standardStagePresets,
  mapStageTypeToCategory,
  buildChainedStages,
} from "../utils"

export function getInitialEditableStages(recruitment: Recruitment | null): EditableStage[] {
  if (!recruitment) return []

  // 1. If batchStages exists from API
  if (recruitment.batchStages && Array.isArray(recruitment.batchStages) && recruitment.batchStages.length > 0) {
    return recruitment.batchStages.map((bs, index) => {
      let duration = 7
      if (bs.startDate && bs.endDate) {
        const start = new Date(bs.startDate).getTime()
        const end = new Date(bs.endDate).getTime()
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          duration = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)))
        }
      }
      return {
        tempId: `stage-${bs.id || index}`,
        id: bs.id,
        stageTypeId: bs.stageTypeId,
        name: bs.stageName,
        type: (bs.stageCategory?.toLowerCase() ?? "screening") as any,
        durationDays: duration,
        ownerId: "",
        interviewerIds: [],
        passingScore: bs.passingScore ?? null,
        startDate: bs.startDate ? bs.startDate.slice(0, 10) : "",
        endDate: bs.endDate ? bs.endDate.slice(0, 10) : "",
        isActive: bs.isActive ?? true,
      }
    })
  }

  // 2. If legacy mock stages exist
  const existingStages = recruitment.stages ?? []
  if (existingStages.length > 0) {
    return existingStages.map((s, index) => ({
      tempId: `stage-${s.id || index}`,
      id: s.id,
      stageTypeId: s.stageTypeId || mockStageTypes[0].id,
      name: s.name,
      type: s.type || "screening",
      durationDays: s.durationDays || 7,
      ownerId: s.ownerId || recruitment.ownerId || "",
      interviewerIds: s.interviewerIds ?? (s.ownerId ? [s.ownerId] : []),
      passingScore: s.passingScore ?? null,
      startDate: s.startDate || "",
      endDate: s.endDate || "",
      isActive: s.isActive ?? true,
    }))
  }

  // 3. Default presets for fresh batch without stages
  const defaultOwner = recruitment.ownerId || mockEmployees[0]?.id || ""
  return standardStagePresets.map((preset, index) => ({
    tempId: `preset-${index}`,
    id: `s-${recruitment.id}-${index + 1}`,
    stageTypeId: preset.stageTypeId,
    name: preset.name,
    type: preset.type,
    durationDays: preset.durationDays,
    ownerId: defaultOwner,
    interviewerIds: defaultOwner ? [defaultOwner] : [],
    passingScore: preset.passingScore,
    startDate: recruitment.openDate || "",
    endDate: recruitment.closeDate || "",
    isActive: true,
  }))
}

export interface UseManageStagesProps {
  id: string
}

export function useManageStages({ id }: UseManageStagesProps) {
  const navigate = useNavigate()

  const { data: apiRecruitment, isLoading, isError, refetch } = useGetBatchByIdQuery(id)
  const [updateBatchStagesApi] = useUpdateBatchStagesMutation()

  const recruitment = useMemo(() => {
    return apiRecruitment ?? initialRecruitments.find((r) => r.id === id) ?? null
  }, [apiRecruitment, id])

  const [stages, setStages] = useState<EditableStage[]>(() => getInitialEditableStages(recruitment))

  useEffect(() => {
    if (recruitment) {
      setStages(getInitialEditableStages(recruitment))
    }
  }, [recruitment?.batchStages, recruitment?.stages])

  // Selected stage for right panel configuration (defaults to first stage if exists)
  const [selectedTempId, setSelectedTempId] = useState<string | null>(() => {
    return stages[0]?.tempId ?? null
  })

  useEffect(() => {
    if (stages.length > 0 && !selectedTempId) {
      setSelectedTempId(stages[0].tempId)
    }
  }, [stages, selectedTempId])

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedIndex = stages.findIndex((s) => s.tempId === selectedTempId)
  const selectedStage = selectedIndex !== -1 ? stages[selectedIndex] : null
  const nextStage =
    selectedIndex !== -1 && selectedIndex < stages.length - 1
      ? stages[selectedIndex + 1]
      : null

  const handleFieldChange = <K extends keyof EditableStage>(
    field: K,
    value: EditableStage[K]
  ) => {
    if (!selectedStage) return
    setStages((prev) => {
      const updated = [...prev]
      updated[selectedIndex] = { ...updated[selectedIndex], [field]: value }
      return updated
    })
  }

  const handleMoveUp = (index: number) => {
    setStages((prev) => reorderArray(prev, index, index - 1))
  }

  const handleMoveDown = (index: number) => {
    setStages((prev) => reorderArray(prev, index, index + 1))
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setStages((prev) => reorderArray(prev, fromIndex, toIndex))
  }

  const handleRemoveStage = (index: number) => {
    const targetTempId = stages[index]?.tempId
    setStages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      // If removed stage was selected, select adjacent stage
      if (selectedTempId === targetTempId) {
        const nextSelected = updated[index] || updated[index - 1] || null
        setSelectedTempId(nextSelected ? nextSelected.tempId : null)
      }
      return updated
    })
  }

  const handleAddStage = () => {
    if (!recruitment) return
    const defaultType = mockStageTypes[Math.min(stages.length, mockStageTypes.length - 1)]
    const category = mapStageTypeToCategory(defaultType.id)

    const newTempId = `stage-new-${Date.now()}-${Math.random()}`
    const newStage: EditableStage = {
      tempId: newTempId,
      id: `s-${recruitment.id}-${stages.length + 1}`,
      stageTypeId: defaultType.id,
      name: defaultType.name,
      type: category,
      durationDays: 7,
      ownerId: recruitment.ownerId || "",
      interviewerIds: recruitment.ownerId ? [recruitment.ownerId] : [],
      passingScore: 75,
      startDate: recruitment.openDate || "",
      endDate: recruitment.closeDate || "",
      isActive: true,
    }

    setStages((prev) => [...prev, newStage])
    setSelectedTempId(newTempId)
  }

  const handleCancel = () => {
    if (!recruitment) return
    navigate({
      to: `/recruitments/${recruitment.id}`,
      search: { tab: "stages" },
    })
  }

  const handleSave = async () => {
    if (!recruitment) return
    setErrorMessage(null)

    // Validation
    for (let i = 0; i < stages.length; i++) {
      if (!stages[i].name.trim()) {
        setErrorMessage(`Stage ${i + 1} must have a valid stage name.`)
        setSelectedTempId(stages[i].tempId)
        return
      }
    }

    // Call backend API if real recruitment batch ID
    if (recruitment.id && !recruitment.id.startsWith("r")) {
      try {
        await updateBatchStagesApi({
          id: recruitment.id,
          body: {
            batchId: recruitment.id,
            stages: stages.map((s) => ({
              stageTypeId: s.stageTypeId.replace(/^st-/, ""),
              stageName: s.name.trim(),
              isActive: s.isActive ?? true,
              passingScore:
                s.passingScore !== null && s.passingScore !== undefined
                  ? Number(s.passingScore)
                  : null,
              startDate: s.startDate
                ? new Date(s.startDate).toISOString()
                : new Date().toISOString(),
              endDate: s.endDate
                ? new Date(s.endDate).toISOString()
                : new Date().toISOString(),
            })),
          },
        }).unwrap()
      } catch (err: any) {
        setErrorMessage("Failed to save stages to server. Please try again.")
        return
      }
    } else {
      // Build chained stages matching ERD NextStageId
      const finalStages = buildChainedStages(stages, recruitment.id)

      // Update in-memory initialRecruitments data
      const targetIdx = initialRecruitments.findIndex((r) => r.id === recruitment.id)
      if (targetIdx !== -1) {
        initialRecruitments[targetIdx] = {
          ...initialRecruitments[targetIdx],
          stages: finalStages,
        }
      }
    }

    setSavedSuccess(true)
    setTimeout(() => {
      navigate({
        to: `/recruitments/${recruitment.id}`,
        search: { tab: "stages" },
      })
    }, 400)
  }

  return {
    recruitment,
    isLoading,
    isError,
    refetch,
    stages,
    selectedTempId,
    setSelectedTempId,
    selectedIndex,
    selectedStage,
    nextStage,
    savedSuccess,
    errorMessage,
    handleFieldChange,
    handleMoveUp,
    handleMoveDown,
    handleReorder,
    handleRemoveStage,
    handleAddStage,
    handleCancel,
    handleSave,
  }
}

