import { useState, useMemo } from "react"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { DialogFooter } from "@workspace/ui/components/dialog"
import { CancelButton, SaveButton, SearchInput } from "@/shared/components"
import { mockCandidates } from "@/features/candidates/data/mock"
import type { Recruitment, CandidateApplicationItem } from "../../types"
import { CheckCircle2 } from "lucide-react"

export interface AddFromTalentPoolTabProps {
  recruitment: Recruitment
  existingApplicationCount: number
  onSuccess: (newApplications: CandidateApplicationItem[]) => void
  onCancel: () => void
}

export function AddFromTalentPoolTab({
  recruitment,
  existingApplicationCount,
  onSuccess,
  onCancel,
}: AddFromTalentPoolTabProps) {
  const [talentSearch, setTalentSearch] = useState("")
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filter candidates from talent pool who have NOT yet applied to this recruitment batch
  const availableTalentCandidates = useMemo(() => {
    return mockCandidates.filter((c) => {
      const alreadyApplied = c.appliedBatches?.some(
        (b) => b.batchId === recruitment.id || b.batchCode === recruitment.batchCode
      )
      if (alreadyApplied) return false

      if (talentSearch.trim()) {
        const q = talentSearch.toLowerCase()
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.institution && c.institution.toLowerCase().includes(q)) ||
          (c.education && c.education.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [recruitment.id, recruitment.batchCode, talentSearch])

  const selectedCandidates = useMemo(() => {
    return availableTalentCandidates.filter((c) => selectedCandidateIds.includes(c.id))
  }, [availableTalentCandidates, selectedCandidateIds])

  const isAllSelected =
    availableTalentCandidates.length > 0 &&
    availableTalentCandidates.every((c) => selectedCandidateIds.includes(c.id))

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCandidateIds([])
    } else {
      setSelectedCandidateIds(availableTalentCandidates.map((c) => c.id))
    }
  }

  const handleToggleCandidate = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
    if (error) setError(null)
  }

  const handleSubmit = () => {
    if (selectedCandidates.length === 0) {
      setError("Please select at least one candidate from the talent pool.")
      return
    }

    const codeYear = recruitment.openDate ? recruitment.openDate.slice(0, 4) : "2026"
    const appliedAt = new Date().toISOString()
    const stages = recruitment.stages || []
    const firstStage = stages[0]

    // Construct application items for each selected candidate simultaneously
    const newApplications: CandidateApplicationItem[] = selectedCandidates.map((cand, idx) => {
      const codeNumber = String(existingApplicationCount + idx + 1).padStart(3, "0")
      const codeApplication = `APP-${codeYear}-${codeNumber}`

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

      return {
        id: `app-man-${Date.now()}-${idx}`,
        candidateId: cand.id,
        recruitmentBatchId: recruitment.id,
        codeApplication,
        appliedAt,
        status: "in_progress",
        finalStatus: "pending",
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
        currentStageName: firstStage ? firstStage.name : "Stage 1",
        currentStageScore: null,
        currentStageStatus: "in_progress",
        applicationStages,
      }
    })

    onSuccess(newApplications)
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-1">
          <Label className="text-sm font-medium">
            Select Candidates from Pool <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            You can select multiple candidates simultaneously
          </span>
        </div>

        <SearchInput
          value={talentSearch}
          onChange={setTalentSearch}
          placeholder="Search candidates by name, campus, or email..."
          containerClassName="w-full sm:w-full"
        />

        <div className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground border-b border-border">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="inline-flex items-center gap-2 hover:text-foreground cursor-pointer font-medium"
          >
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleToggleSelectAll}
              className="size-4 rounded"
            />
            <span>Select All ({availableTalentCandidates.length})</span>
          </button>

          <span className="font-semibold text-foreground">
            {selectedCandidateIds.length} candidate{selectedCandidateIds.length !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="max-h-64 overflow-y-auto rounded-2xl border border-border divide-y divide-border bg-card p-1">
          {availableTalentCandidates.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No available candidates found matching "{talentSearch}".
            </div>
          ) : (
            availableTalentCandidates.map((c) => {
              const isSelected = selectedCandidateIds.includes(c.id)

              return (
                <div
                  key={c.id}
                  onClick={() => handleToggleCandidate(c.id)}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl cursor-pointer text-sm transition-all ${
                    isSelected
                      ? "bg-primary/5 text-foreground"
                      : "hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleCandidate(c.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="size-4 rounded"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate leading-tight">
                        {c.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate leading-tight">
                        {c.email}
                      </p>
                    </div>
                  </div>

                  {(c.education || c.institution) && (
                    <div className="text-right shrink-0 min-w-0 pl-3">
                      <p className="text-xs font-medium text-foreground truncate max-w-64 leading-tight">
                        {c.education || "-"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-64 leading-tight">
                        {c.institution || "-"}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive px-1">{error}</p>
        )}
      </div>

      {selectedCandidates.length > 0 && (
        <div className="rounded-2xl bg-primary/5 p-3 text-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <span>{selectedCandidates.length} Candidate{selectedCandidates.length > 1 ? "s" : ""} Selected</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Will enter at Stage 1: {recruitment.stages[0]?.name || "Screening"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {selectedCandidates.map((cand) => (
              <span
                key={cand.id}
                className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-0.5 text-xs font-medium border border-border shadow-2xs"
              >
                <CheckCircle2 className="size-3 text-primary" />
                <span>{cand.fullName}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <DialogFooter className="mt-6 gap-2 sm:gap-2 bg-white flex flex-row items-center justify-end">
        <CancelButton onClick={onCancel} />
        <SaveButton type="button" onClick={handleSubmit}>
          {selectedCandidates.length > 0
            ? `Add ${selectedCandidates.length} Candidate${selectedCandidates.length > 1 ? "s" : ""}`
            : "Add Candidate"}
        </SaveButton>
      </DialogFooter>
    </div>
  )
}

