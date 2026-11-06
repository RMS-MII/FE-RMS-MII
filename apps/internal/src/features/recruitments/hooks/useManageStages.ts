import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  useGetBatchByIdQuery,
  useUpdateBatchStagesMutation,
} from "../api/recruitments-api"
import { useGetStageTypesQuery } from "../api/stage-types-api"
import type { Recruitment } from "../types"
import type { EditableStage } from "../components/stages"
import {
  reorderArray,
  stageCategoryToLegacyType,
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
        type: stageCategoryToLegacyType(bs.stageCategory),
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

  // 2. If legacy stages exist
  const existingStages = recruitment.stages ?? []
  if (existingStages.length > 0) {
    return existingStages.map((s, index) => ({
      tempId: `stage-${s.id || index}`,
      id: s.id,
      stageTypeId: s.stageTypeId || "",
      name: s.name,
      type: s.type || "screening",
      durationDays: s.durationDays || 7,
      ownerId: s.ownerId || recruitment.ownerId || "",
      interviewerIds: s.interviewerIds ?? (s.ownerId ? [s.ownerId] : []),
      passingScore: s.passingScore ?? null,
      startDate: s.startDate ? s.startDate.slice(0, 10) : "",
      endDate: s.endDate ? s.endDate.slice(0, 10) : "",
      isActive: s.isActive ?? true,
    }))
  }

  // 3. Fresh batch without stages starts empty (presets removed)
  return []
}

export interface UseManageStagesProps {
  id: string
}

export function useManageStages({ id }: UseManageStagesProps) {
  const navigate = useNavigate()

  const { data: apiRecruitment, isLoading, isError, refetch } = useGetBatchByIdQuery(id)
  const [updateBatchStagesApi, { isLoading: isSaving }] = useUpdateBatchStagesMutation()
  const { data: stageTypes = [], isLoading: isLoadingStageTypes } = useGetStageTypesQuery({ activeOnly: true })

  const recruitment = useMemo(() => {
    return apiRecruitment ?? null
  }, [apiRecruitment])

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
    } else if (stages.length === 0) {
      setSelectedTempId(null)
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
      if (selectedTempId === targetTempId) {
        const nextSelected = updated[index] || updated[index - 1] || null
        setSelectedTempId(nextSelected ? nextSelected.tempId : null)
      }
      return updated
    })
  }

  const handleAddStage = () => {
    if (!recruitment) return

    const defaultType =
      stageTypes.length > 0
        ? stageTypes[Math.min(stages.length, stageTypes.length - 1)]
        : null
    const category = defaultType
      ? stageCategoryToLegacyType(defaultType.stageCategory)
      : "screening"

    // Compute sensible default dates based on batch or previous stage
    let defaultStartDate = recruitment.startDate || recruitment.openDate || ""
    let defaultEndDate = recruitment.endDate || recruitment.closeDate || ""

    if (stages.length > 0) {
      const lastStage = stages[stages.length - 1]
      if (lastStage.endDate) {
        const lastEnd = new Date(lastStage.endDate)
        if (!isNaN(lastEnd.getTime())) {
          const nextStart = new Date(lastEnd)
          nextStart.setDate(nextStart.getDate() + 1)
          defaultStartDate = nextStart.toISOString().slice(0, 10)
          const nextEnd = new Date(nextStart)
          nextEnd.setDate(nextEnd.getDate() + 7)
          defaultEndDate = nextEnd.toISOString().slice(0, 10)
        }
      }
    }

    const newTempId = `stage-new-${Date.now()}-${Math.random()}`
    const newStage: EditableStage = {
      tempId: newTempId,
      id: `s-${recruitment.id}-${stages.length + 1}`,
      stageTypeId: defaultType ? defaultType.id : "",
      name: defaultType ? defaultType.name : `Stage ${stages.length + 1}`,
      type: category,
      durationDays: 7,
      ownerId: recruitment.ownerId || "",
      interviewerIds: recruitment.ownerId ? [recruitment.ownerId] : [],
      passingScore: 75,
      startDate: defaultStartDate ? defaultStartDate.slice(0, 10) : "",
      endDate: defaultEndDate ? defaultEndDate.slice(0, 10) : "",
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

    if (stages.length === 0) {
      setErrorMessage("Please add at least one stage before saving.")
      return
    }

    if (stages.length > 20) {
      setErrorMessage("A batch can have at most 20 stages.")
      return
    }

    // Validation matching backend validator
    const stageNames = new Set<string>()
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i]
      const name = s.name.trim()

      if (!s.stageTypeId) {
        setErrorMessage(`Stage ${i + 1} must have a selected Stage Type.`)
        setSelectedTempId(s.tempId)
        return
      }

      if (!name) {
        setErrorMessage(`Stage ${i + 1} must have a valid stage name.`)
        setSelectedTempId(s.tempId)
        return
      }

      if (name.length > 50) {
        setErrorMessage(`Stage ${i + 1} name cannot exceed 50 characters.`)
        setSelectedTempId(s.tempId)
        return
      }

      if (stageNames.has(name.toLowerCase())) {
        setErrorMessage(`Stage name "${name}" is duplicated. Stage names must be unique within a batch.`)
        setSelectedTempId(s.tempId)
        return
      }
      stageNames.add(name.toLowerCase())

      if (!s.startDate) {
        setErrorMessage(`Stage "${name}" must have a start date.`)
        setSelectedTempId(s.tempId)
        return
      }

      if (!s.endDate) {
        setErrorMessage(`Stage "${name}" must have an end date.`)
        setSelectedTempId(s.tempId)
        return
      }

      const startDateObj = new Date(s.startDate)
      const endDateObj = new Date(s.endDate)
      if (endDateObj <= startDateObj) {
        setErrorMessage(`Stage "${name}": End date must be after start date.`)
        setSelectedTempId(s.tempId)
        return
      }

      if (i > 0) {
        const prevStartDateObj = new Date(stages[i - 1].startDate)
        if (startDateObj < prevStartDateObj) {
          setErrorMessage(`Stage "${name}": Start date must be on or after the previous stage's start date.`)
          setSelectedTempId(s.tempId)
          return
        }
      }
    }

    // Call backend API
    try {
      await updateBatchStagesApi({
        id: recruitment.id,
        body: {
          stages: stages.map((s) => ({
            stageTypeId: s.stageTypeId,
            stageName: s.name.trim(),
            isActive: s.isActive ?? true,
            passingScore:
              s.passingScore !== null && s.passingScore !== undefined
                ? Number(s.passingScore)
                : null,
            startDate: new Date(s.startDate).toISOString(),
            endDate: new Date(s.endDate).toISOString(),
          })),
        },
      }).unwrap()
    } catch (err: any) {
      const errorMsg =
        err?.data?.detail ||
        err?.data?.message ||
        err?.data?.title ||
        "Failed to save stages to server. Please verify schedule and details."
      setErrorMessage(errorMsg)
      return
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
    stageTypes,
    isLoadingStageTypes,
    selectedTempId,
    setSelectedTempId,
    selectedIndex,
    selectedStage,
    nextStage,
    savedSuccess,
    isSaving,
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
