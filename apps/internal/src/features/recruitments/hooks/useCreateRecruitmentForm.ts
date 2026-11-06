import { useState, useMemo } from "react"
import type { Recruitment } from "../types"
import { mockDepartments } from "../data/mock"
import { generateBatchCode, validateRecruitmentFormData } from "../utils"
import { useGetDepartmentsQuery } from "../api/departments-api"

export interface UseCreateRecruitmentFormProps {
  existingCount?: number
  onSuccess: (newRecruitment: Recruitment) => void
  onOpenChange: (open: boolean) => void
}

export function useCreateRecruitmentForm({
  existingCount = 5,
  onSuccess,
  onOpenChange,
}: UseCreateRecruitmentFormProps) {
  const generatedCode = generateBatchCode(existingCount)

  const [name, setName] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [description, setDescription] = useState("")
  const [openDate, setOpenDate] = useState("")
  const [closeDate, setCloseDate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: departments, isLoading: isLoadingDepts } = useGetDepartmentsQuery()

  const departmentSelectItems = useMemo(() => {
    const list = departments && departments.length > 0 ? departments : mockDepartments
    return list.map((d) => ({
      label: d.name,
      value: d.id,
    }))
  }, [departments])

  const validate = () => {
    const errs = validateRecruitmentFormData({
      name,
      departmentId,
      openDate,
      closeDate,
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const resetForm = () => {
    setName("")
    setDepartmentId("")
    setDescription("")
    setOpenDate("")
    setCloseDate("")
    setErrors({})
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const allDepartments = departments && departments.length > 0 ? departments : mockDepartments
    const selectedDept = allDepartments.find((d) => d.id === departmentId)

    const newRecruitmentId = `r-${Date.now()}`
    const newStageId = `s-${Date.now()}-1`

    const newRecruitment: Recruitment = {
      id: newRecruitmentId,
      batchCode: generatedCode,
      name: name.trim(),
      division: selectedDept?.name ?? "General",
      departmentId: selectedDept?.id ?? "",
      department: selectedDept,
      location: "Jakarta, APL Tower",
      quota: 1,
      openDate,
      startDate: openDate,
      closeDate,
      endDate: closeDate,
      status: "draft",
      currentStage: -1,
      createdBy: "e1000000-0000-4000-8000-000000000001",
      ownerId: "u1",
      description: description.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: null,
      batchStages: [],
      stages: [
        {
          id: newStageId,
          batchStageId: `bs-${newStageId}`,
          recruitmentBatchId: newRecruitmentId,
          stageTypeId: "st-10000000-0000-4000-8000-000000000001",
          name: "Document Screening",
          type: "screening",
          durationDays: 7,
          passingScore: 70,
          ownerId: "u1",
          startDate: openDate,
          endDate: closeDate,
          nextStageId: null,
          isActive: true,
        },
      ],
    }

    onSuccess(newRecruitment)
    onOpenChange(false)
    resetForm()
  }

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return {
    generatedCode,
    name,
    setName,
    departmentId,
    setDepartmentId,
    description,
    setDescription,
    openDate,
    setOpenDate,
    closeDate,
    setCloseDate,
    errors,
    setErrors,
    clearFieldError,
    departmentSelectItems,
    isLoadingDepts,
    handleSubmit,
    resetForm,
  }
}

