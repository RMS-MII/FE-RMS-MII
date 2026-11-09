import { useState, useMemo } from "react"
import type { Recruitment } from "../types"
import { validateRecruitmentFormData } from "../utils"
import { useGetDepartmentsQuery } from "../api/departments-api"
import { useCreateBatchMutation } from "../api/recruitments-api"

export interface UseCreateRecruitmentFormProps {
  open?: boolean
  existingCount?: number
  onSuccess: (newRecruitment: Recruitment) => void
  onOpenChange: (open: boolean) => void
}

export function useCreateRecruitmentForm({
  open = true,
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

  // Hanya fetch data departemen ketika modal dalam kondisi terbuka
  const { data: departments, isLoading: isLoadingDepts } = useGetDepartmentsQuery(
    undefined,
    { skip: !open }
  )
  const [createBatchApi, { isLoading: isCreating }] = useCreateBatchMutation()

  const departmentSelectItems = useMemo(() => {
    return (departments ?? []).map((d) => ({
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
    const endIso = new Date(closeDate).toISOString()

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
    submitError,
    isSubmitting: isCreating,
    clearFieldError,
    departmentSelectItems,
    isLoadingDepts,
    handleSubmit,
    resetForm,
  }
}
