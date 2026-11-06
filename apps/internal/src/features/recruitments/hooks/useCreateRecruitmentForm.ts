import { useState, useMemo } from "react"
import type { Recruitment } from "../types"
import { mockDepartments } from "../data/mock"
import { validateRecruitmentFormData } from "../utils"
import { useGetDepartmentsQuery } from "../api/departments-api"
import { useCreateBatchMutation } from "../api/recruitments-api"

export interface UseCreateRecruitmentFormProps {
  existingCount?: number
  onSuccess: (newRecruitment: Recruitment) => void
  onOpenChange: (open: boolean) => void
}

export function useCreateRecruitmentForm({
  onSuccess,
  onOpenChange,
}: UseCreateRecruitmentFormProps) {
  const [name, setName] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [description, setDescription] = useState("")
  const [openDate, setOpenDate] = useState("")
  const [closeDate, setCloseDate] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: departments, isLoading: isLoadingDepts } = useGetDepartmentsQuery()
  const [createBatchApi, { isLoading: isCreating }] = useCreateBatchMutation()

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
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitError(null)

    const startIso = new Date(openDate).toISOString()
    const endIso = new Date(closeDate + "T23:59:59").toISOString()

    try {
      const createdBatch = await createBatchApi({
        departmentId,
        name: name.trim(),
        description: description.trim() || name.trim(),
        startDate: startIso,
        endDate: endIso,
      }).unwrap()

      onSuccess(createdBatch)
      onOpenChange(false)
      resetForm()
    } catch (err: any) {
      console.error("Failed to create recruitment batch via API:", err)
      const errMsg =
        err?.data?.message ||
        err?.data?.title ||
        err?.data?.detail ||
        "Failed to create recruitment batch on server. Please try again."
      setSubmitError(errMsg)
    }
  }

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return {
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
    submitError,
    isSubmitting: isCreating,
    clearFieldError,
    departmentSelectItems,
    isLoadingDepts,
    handleSubmit,
    resetForm,
  }
}
