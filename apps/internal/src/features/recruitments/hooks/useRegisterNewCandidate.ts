import { useState, useMemo } from "react"
import type { Recruitment, CandidateApplicationItem } from "../types"
import { useRegisterCandidatesMutation } from "../api/applications-api"
import { getRecruitmentAddRestriction } from "../utils/recruitmentUtils"
import { stageCategoryToLegacyType } from "../utils/stageUtils"
import { getApiError } from "@/shared/api/api-error"
import {
  mapApplicationStatus,
  mapFinalResultStatus,
} from "../utils/statusAdapters"

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

  const [registerCandidatesApi, { isLoading: isApiSubmitting }] =
    useRegisterCandidatesMutation()

  const stages = useMemo(() => {
    return recruitment.batchStages ?? recruitment.stages ?? []
  }, [recruitment.batchStages, recruitment.stages])

  const addRestriction = getRecruitmentAddRestriction(recruitment, "candidate")
  const canAddCandidates = !addRestriction

  const handleSubmit = async () => {
    setSubmitError(null)

    if (addRestriction) {
      setSubmitError(addRestriction)
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

    const firstStage = stages[0]

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
            expectedSalary: expectedSalary.trim()
              ? Number(expectedSalary.trim())
              : undefined,
            cv: resolvedCv,
            portfolio: portfolio.trim() || undefined,
          },
        ],
      }).unwrap()

      const createdItem = Array.isArray(result) && result[0] ? result[0] : null
      if (!createdItem?.id || !createdItem.candidateId) {
        throw new Error(
          "The registration response is incomplete. Refresh the candidate list before trying again."
        )
      }

      const newApplication: CandidateApplicationItem = {
        id: createdItem.id,
        candidateId: createdItem.candidateId,
        recruitmentBatchId: recruitment.id,
        codeApplication: createdItem.codeApplication,
        appliedAt: createdItem.appliedAt ?? createdItem.createdAt ?? "",
        status: mapApplicationStatus(createdItem.status),
        finalStatus: mapFinalResultStatus(createdItem.finalResultStatus),
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
        currentStageName: firstStage
          ? "stageName" in firstStage
            ? firstStage.stageName
            : firstStage.name
          : "No stages configured",
        currentStageScore: null,
        currentStageStatus: "upcoming",
        applicationStages,
      }

      onSuccess(newApplication)
    } catch (err) {
      const problem = getApiError(
        err,
        "Failed to register the candidate. Please try again."
      )
      setSubmitError(problem.message)
      const fields: Record<string, string> = {}
      for (const [path, messages] of Object.entries(problem.fieldErrors)) {
        const field = path.split(".").pop() ?? path
        fields[field.charAt(0).toLowerCase() + field.slice(1)] =
          messages.join(" ")
      }
      setErrors(fields)
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
    canAddCandidates,
    isSubmitting: isApiSubmitting,
    clearFieldError,
    handleSubmit,
  }
}
