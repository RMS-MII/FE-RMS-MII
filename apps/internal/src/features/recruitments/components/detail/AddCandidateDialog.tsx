import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { cn } from "@/shared/lib/utils"
import { mockCandidates } from "@/features/candidates/data/mock"
import type { Recruitment, CandidateApplicationItem } from "../../types"
import { Users, UserPlus } from "lucide-react"
import { AddFromTalentPoolTab } from "./AddFromTalentPoolTab"
import { RegisterNewCandidateTab } from "./RegisterNewCandidateTab"

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

  // Count available candidates not yet in this recruitment batch
  const availableCount = useMemo(() => {
    return mockCandidates.filter((c) => {
      return !c.appliedBatches?.some(
        (b) => b.batchId === recruitment.id || b.batchCode === recruitment.batchCode
      )
    }).length
  }, [recruitment.id, recruitment.batchCode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Add Candidate</DialogTitle>
            <span className="font-mono text-xs font-semibold rounded-md bg-muted px-2 py-0.5 text-foreground">
              {recruitment.batchCode}
            </span>
          </div>
          <DialogDescription>
            Add candidates from talent pool or register a new candidate into {recruitment.name}.
          </DialogDescription>
        </DialogHeader>

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
