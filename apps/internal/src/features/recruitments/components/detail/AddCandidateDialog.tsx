import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@/shared/lib/utils"
import { useGetCandidatesQuery } from "@/features/candidates/api/candidates-api"
import type { Recruitment, CandidateApplicationItem } from "../../types"
import { Users, UserPlus, AlertCircle } from "lucide-react"
import { AddFromTalentPoolTab } from "./AddFromTalentPoolTab"
import { RegisterNewCandidateTab } from "./RegisterNewCandidateTab"
import { getRecruitmentAddRestriction } from "../../utils/recruitmentUtils"

export interface AddCandidateDialogProps {
  recruitment: Recruitment
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddCandidates: (newApplications: CandidateApplicationItem[]) => void
  existingApplicationCount: number
}

export function AddCandidateDialog({
  recruitment,
  open,
  onOpenChange,
  onAddCandidates,
  existingApplicationCount,
}: AddCandidateDialogProps) {
  const [activeTab, setActiveTab] = useState<"talent-pool" | "new-candidate">("talent-pool")

  const addRestriction = getRecruitmentAddRestriction(recruitment, "candidate")

  const { data: apiCandidatesData } = useGetCandidatesQuery(undefined, {
    skip: !open,
  })

  // Count available candidates not yet in this recruitment batch directly from API
  const availableCount = useMemo(() => {
    if (!apiCandidatesData?.items) return 0
    return apiCandidatesData.items.filter((c) => {
      return !c.assignedBatches?.some(
        (b) =>
          (b.batchId && b.batchId.toLowerCase() === recruitment.id?.toLowerCase()) ||
          (recruitment.batchCode && b.batchCode && b.batchCode.toLowerCase() === recruitment.batchCode.toLowerCase())
      )
    }).length
  }, [apiCandidatesData, recruitment.id, recruitment.batchCode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl border-border bg-card shadow-xl">
        <DialogHeader className="p-6 pb-4 border-b border-border text-left">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold text-foreground">Add Candidate</DialogTitle>
            <span className="font-mono text-xs font-semibold rounded-md bg-muted px-2 py-0.5 text-foreground">
              {recruitment.batchCode}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            Add candidates from talent pool or register a new candidate into {recruitment.name}.
          </DialogDescription>
        </DialogHeader>

        {addRestriction && (
          <div className="mx-6 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              {addRestriction}
            </p>
          </div>
        )}

        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-muted rounded-full w-full h-11 select-none">
            <button
              type="button"
              onClick={() => setActiveTab("talent-pool")}
              className={cn(
                "inline-flex items-center justify-center gap-2 h-9 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer",
                activeTab === "talent-pool"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Users className="size-4" />
              <span>From Talent Pool ({availableCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new-candidate")}
              className={cn(
                "inline-flex items-center justify-center gap-2 h-9 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer",
                activeTab === "new-candidate"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <UserPlus className="size-4" />
              <span>Register New Candidate</span>
            </button>
          </div>
        </div>

        {/* Tab 1 Content: From Talent Pool */}
        {activeTab === "talent-pool" && (
          <AddFromTalentPoolTab
            recruitment={recruitment}
            existingApplicationCount={existingApplicationCount}
            onSuccess={(apps) => {
              onAddCandidates(apps)
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}

        {/* Tab 2 Content: Register New Candidate */}
        {activeTab === "new-candidate" && (
          <RegisterNewCandidateTab
            recruitment={recruitment}
            existingApplicationCount={existingApplicationCount}
            onSuccess={(app) => {
              onAddCandidates([app])
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
