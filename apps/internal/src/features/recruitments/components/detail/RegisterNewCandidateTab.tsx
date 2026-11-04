import { useState } from "react"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { DialogFooter } from "@workspace/ui/components/dialog"
import { CancelButton, SaveButton, FileInput } from "@/shared/components"
import type { Recruitment, CandidateApplicationItem } from "../../types"

export interface RegisterNewCandidateTabProps {
  recruitment: Recruitment
  existingApplicationCount: number
  onSuccess: (newApplication: CandidateApplicationItem) => void
  onCancel: () => void
}

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
]

export function RegisterNewCandidateTab({
  recruitment,
  existingApplicationCount,
  onSuccess,
  onCancel,
}: RegisterNewCandidateTabProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [gender, setGender] = useState("Male")
  const [education, setEducation] = useState("")
  const [institution, setInstitution] = useState("")
  const [gpa, setGpa] = useState("")
  const [expectedSalary, setExpectedSalary] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvFileName, setCvFileName] = useState("")
  const [portfolio, setPortfolio] = useState("")

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) {
      newErrors.fullName = "Candidate full name is required."
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "A valid email address is required."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const codeYear = recruitment.openDate ? recruitment.openDate.slice(0, 4) : "2026"
    const codeNumber = String(existingApplicationCount + 1).padStart(3, "0")
    const codeApplication = `APP-${codeYear}-${codeNumber}`
    const appliedAt = new Date().toISOString()
    const stages = recruitment.stages || []
    const firstStage = stages[0]

    const applicationStages = stages.map((stg, sIdx) => ({
      stageIndex: sIdx,
      stageId: stg.id,
      stageName: stg.name,
      stageType: stg.type,
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

    const newApplication: CandidateApplicationItem = {
      id: `app-new-${Date.now()}`,
      candidateId: `cand-new-${Date.now()}`,
      recruitmentBatchId: recruitment.id,
      codeApplication,
      appliedAt,
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
      candidateCv: cvFile ? cvFile.name : cvFileName.trim() || `CV_${fullName.trim().replace(/\s+/g, "_")}.pdf`,
      candidatePortfolio: portfolio.trim() || null,
      currentStageIndex: 0,
      currentStageName: firstStage ? firstStage.name : "Stage 1",
      currentStageScore: null,
      currentStageStatus: "in_progress",
      applicationStages,
    }

    onSuccess(newApplication)
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="cand-fullname" className="text-sm font-medium px-1">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cand-fullname"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }))
              }}
              placeholder="e.g. Budi Raharjo"
              aria-invalid={!!errors.fullName}
              className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
            />
            {errors.fullName && (
              <p className="text-xs text-destructive px-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="cand-email" className="text-sm font-medium px-1">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cand-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
              }}
              placeholder="e.g. budi.raharjo@gmail.com"
              aria-invalid={!!errors.email}
              className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
            />
            {errors.email && (
              <p className="text-xs text-destructive px-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="cand-phone" className="text-sm font-medium px-1">
              Phone Number
            </Label>
            <Input
              id="cand-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +62 812-3456-7890"
              className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
            />
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label htmlFor="cand-gender" className="text-sm font-medium px-1">
              Gender
            </Label>
            <Select
              items={genderOptions}
              value={gender}
              onValueChange={(val) => val && setGender(val)}
            >
              <SelectTrigger
                id="cand-gender"
                className="h-10 w-full rounded-full border-0 bg-muted px-4 text-sm text-foreground transition-all duration-150 hover:bg-muted/60 outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              >
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectGroup>
                  {genderOptions.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right Column: Academic & documents */}
        <div className="space-y-3.5">
          {/* Education Degree & Major */}
          <div className="space-y-1.5">
            <Label htmlFor="cand-edu" className="text-sm font-medium px-1">
              Education Degree & Major
            </Label>
            <Input
              id="cand-edu"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. S1 Computer Science"
              className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
            />
          </div>

          {/* University / Institution */}
          <div className="space-y-1.5">
            <Label htmlFor="cand-institution" className="text-sm font-medium px-1">
              University / Campus
            </Label>
            <Input
              id="cand-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Universitas Indonesia"
              className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
            />
          </div>

          {/* GPA & Expected Salary Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <Label htmlFor="cand-gpa" className="text-sm font-medium px-1">
                GPA
              </Label>
              <Input
                id="cand-gpa"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="e.g. 3.75"
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cand-salary" className="text-sm font-medium px-1">
                Expected Salary
              </Label>
              <Input
                id="cand-salary"
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="e.g. 10000000"
                className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
              />
            </div>
          </div>

          {/* CV File Attachment (Shared FileInput Component) */}
          <div className="space-y-1.5">
            <Label htmlFor="cand-cv" className="text-sm font-medium px-1">
              Curriculum Vitae (CV)
            </Label>
            <FileInput
              id="cand-cv"
              value={cvFile || cvFileName}
              onChange={(file) => {
                setCvFile(file)
                setCvFileName(file ? file.name : "")
              }}
              accept=".pdf,.doc,.docx"
              placeholder="Choose CV file (PDF or DOCX)..."
            />
          </div>
        </div>
      </div>

      {/* Portfolio URL */}
      <div className="space-y-1.5">
        <Label htmlFor="cand-portfolio" className="text-sm font-medium px-1">
          Portfolio / GitHub URL (Optional)
        </Label>
        <Input
          id="cand-portfolio"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          placeholder="https://github.com/username or personal website"
          className="h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 outline-none focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary shadow-none"
        />
      </div>

      {/* Footer */}
      <DialogFooter className="mt-6 gap-2 sm:gap-2 bg-white flex flex-row items-center justify-end">
        <CancelButton onClick={onCancel} />
        <SaveButton type="button" onClick={handleSubmit}>
          Save Candidate
        </SaveButton>
      </DialogFooter>
    </div>
  )
}

