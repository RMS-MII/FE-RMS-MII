import { useState, useMemo } from "react"
import type { Recruitment, CandidateApplicationItem } from "../types"
import { useRegisterCandidatesMutation } from "../api/applications-api"

export interface UseRegisterNewCandidateProps {
  recruitment: Recruitment
  existingApplicationCount: number
  onSuccess: (newApplication: CandidateApplicationItem) => void
  onCancel?: () => void
}

export const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
]

export function useRegisterNewCandidate({
  recruitment,
  existingApplicationCount,
  onSuccess,
}: UseRegisterNewCandidateProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("Male")
  const [birthDate, setBirthDate] = useState("")
  const [address, setAddress] = useState("")
  const [education, setEducation] = useState("")
  const [institution, setInstitution] = useState("")
  const [gpa, setGpa] = useState("")
  const [expectedSalary, setExpectedSalary] = useState("")
  const [cv, setCv] = useState("")
  const [portfolio, setPortfolio] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [registerCandidatesApi, { isLoading: isApiSubmitting }] = useRegisterCandidatesMutation()

  const stages = useMemo(() => {
    return recruitment.batchStages && recruitment.batchStages.length > 0
      ? recruitment.batchStages
      : recruitment.stages || []
  }, [recruitment.batchStages, recruitment.stages])

  const hasStages = stages.length > 0

  const handleSubmit = async () => {
    setSubmitError(null)

    if (!hasStages) {
      setSubmitError("Cannot register candidate because no selection stages have been configured for this recruitment batch. Please configure stages first.")
      return
    }

    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) {
      newErrors.fullName = "Candidate full name is required."
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "A valid email address is required."
    }
    if (!birthDate.trim()) {
      newErrors.birthDate = "Birth date is required."
    }
    if (!address.trim()) {
      newErrors.address = "Address is required."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const codeYear = recruitment.openDate ? recruitment.openDate.slice(0, 4) : "2026"
    const codeNumber = String(existingApplicationCount + 1).padStart(3, "0")
    const codeApplication = `APP-${codeYear}-${codeNumber}`
    const appliedAt = new Date().toISOString()
    const firstStage = stages[0]

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

    const eduFull = education.trim()
      ? institution.trim()
        ? `${education.trim()}, ${institution.trim()}`
        : education.trim()
      : null

    const resolvedCv = cv.trim() || undefined

    try {
      const result = await registerCandidatesApi({
        batchId: recruitment.id,
        candidates: [
          {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phoneNumber: phone.trim() || undefined,
            gender: gender.toLowerCase() === "female" ? 2 : 1,
            birthDate: birthDate.trim().slice(0, 10),
            address: address.trim(),
            education: education.trim() || undefined,
            institution: institution.trim() || undefined,
            gpa: gpa.trim() ? Number(gpa.trim()) : undefined,
            expectedSalary: expectedSalary.trim() ? Number(expectedSalary.trim()) : undefined,
            cv: resolvedCv,
            portfolio: portfolio.trim() || undefined,
          },
        ],
      }).unwrap()

      const createdItem = Array.isArray(result) && result[0] ? result[0] : null

      const newApplication: CandidateApplicationItem = {
        id: createdItem?.id || `app-${Date.now()}`,
        candidateId: createdItem?.candidateId || `cand-${Date.now()}`,
        recruitmentBatchId: recruitment.id,
        codeApplication: createdItem?.codeApplication || codeApplication,
        appliedAt: createdItem?.appliedAt || appliedAt,
        status: "in_progress",
        finalStatus: "pending",
        note: null,
        fileOfferingLetter: null,
        offeringLetterStatus: null,
        candidateName: fullName.trim(),
        candidateEmail: email.trim().toLowerCase(),
        candidatePhone: phone.trim() || null,
        candidateEducation: eduFull,
        candidateInstitution: institution.trim() || null,
        candidateGpa: gpa.trim() || null,
        candidateCv: resolvedCv || null,
        candidatePortfolio: portfolio.trim() || null,
        currentStageIndex: 0,
        currentStageName: firstStage ? (firstStage as any).stageName || (firstStage as any).name : "Stage 1",
        currentStageScore: null,
        currentStageStatus: "in_progress",
        applicationStages,
      }

      onSuccess(newApplication)
    } catch (err: any) {
      console.error("Failed to register candidate via API:", err)
      const errMsg =
        err?.data?.message ||
        err?.data?.title ||
        "Failed to register candidate on server. Please try again."
      setSubmitError(errMsg)
    }
  }

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    phone,
    setPhone,
    gender,
    setGender,
    birthDate,
    setBirthDate,
    address,
    setAddress,
    education,
    setEducation,
    institution,
    setInstitution,
    gpa,
    setGpa,
    expectedSalary,
    setExpectedSalary,
    cv,
    setCv,
    portfolio,
    setPortfolio,
    errors,
    setErrors,
    submitError,
    hasStages,
    isSubmitting: isApiSubmitting,
    clearFieldError,
    handleSubmit,
  }
}
