import { useState, useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"

import { BackButton, Panel } from "@/shared/components"
import {
  initialRecruitments,
  mockEmployees,
  mockStageTypes,
} from "../data/mock"
import {
  StageOverviewBanner,
  StageList,
  StageConfigForm,
  type EditableStage,
} from "../components/stages"
import {
  reorderArray,
  standardStagePresets,
  mapStageTypeToCategory,
  buildChainedStages,
} from "../utils"

export interface ManageStagesPageProps {
  id: string
}

export function ManageStagesPage({ id }: ManageStagesPageProps) {
  const navigate = useNavigate()

  const recruitment = useMemo(() => {
    return initialRecruitments.find((r) => r.id === id) ?? null
  }, [id])

  const [stages, setStages] = useState<EditableStage[]>(() => {
    if (!recruitment) return []
    const existingStages = recruitment.stages ?? []
    if (existingStages.length > 0) {
      return existingStages.map((s, index) => ({
        tempId: `stage-${s.id || index}-${Date.now()}`,
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

    // Default pre-filled stages for newly created batch
    const defaultOwner = recruitment.ownerId || mockEmployees[0]?.id || ""
    return standardStagePresets.map((preset, index) => ({
      tempId: `preset-${index}-${Date.now()}`,
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
  })

  // Selected stage for right panel configuration (defaults to first stage if exists)
  const [selectedTempId, setSelectedTempId] = useState<string | null>(() => {
    return stages[0]?.tempId ?? null
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!recruitment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BackButton to="/recruitments" label="Back to Recruitments" />
          <h1 className="text-xl font-bold text-foreground">Recruitment Not Found</h1>
        </div>
        <Panel className="p-8 text-center text-muted-foreground">
          No recruitment found with ID: {id}
        </Panel>
      </div>
    )
  }

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
    navigate({
      to: `/recruitments/${recruitment.id}`,
      search: { tab: "stages" },
    })
  }

  const handleSave = () => {
    setErrorMessage(null)

    // Validation
    for (let i = 0; i < stages.length; i++) {
      if (!stages[i].name.trim()) {
        setErrorMessage(`Stage ${i + 1} must have a valid stage name.`)
        setSelectedTempId(stages[i].tempId)
        return
      }
    }

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

    setSavedSuccess(true)
    setTimeout(() => {
      navigate({
        to: `/recruitments/${recruitment.id}`,
        search: { tab: "stages" },
      })
    }, 400)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-start gap-3.5">
        <BackButton
          to={`/recruitments/${recruitment.id}?tab=stages`}
          label="Back to Recruitment Detail"
        />

        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Manage Selection Stages
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure sequential pipeline, passing criteria, and schedules for{" "}
            <span className="font-semibold text-foreground">{recruitment.name}</span>.
          </p>
        </div>
      </div>

      <StageOverviewBanner
        recruitment={recruitment}
        totalStages={stages.length}
        onCancel={handleCancel}
        onSave={handleSave}
        isSaved={savedSuccess}
      />

      {errorMessage && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          {errorMessage}
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
        <StageList
          stages={stages}
          selectedId={selectedTempId}
          onSelect={setSelectedTempId}
          onAddStage={handleAddStage}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onReorder={handleReorder}
          onRemoveStage={handleRemoveStage}
        />

        <StageConfigForm
          selectedStage={selectedStage}
          selectedIndex={selectedIndex}
          totalStages={stages.length}
          nextStage={nextStage}
          onFieldChange={handleFieldChange}
          onRemoveStage={handleRemoveStage}
        />
      </div>
    </div>
  )
}
