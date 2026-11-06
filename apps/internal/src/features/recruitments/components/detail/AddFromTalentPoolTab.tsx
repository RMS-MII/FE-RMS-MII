import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { DialogFooter } from "@workspace/ui/components/dialog"
import { CancelButton, SaveButton, SearchInput } from "@/shared/components"
import { CheckCircle2 } from "lucide-react"
import {
  useAddFromTalentPool,
  type UseAddFromTalentPoolProps,
} from "../../hooks/useAddFromTalentPool"

export interface AddFromTalentPoolTabProps extends UseAddFromTalentPoolProps {}

export function AddFromTalentPoolTab({
  recruitment,
  existingApplicationCount,
  onSuccess,
  onCancel,
}: AddFromTalentPoolTabProps) {
  const {
    talentSearch,
    setTalentSearch,
    selectedCandidateIds,
    availableTalentCandidates,
    selectedCandidates,
    isAllSelected,
    handleToggleSelectAll,
    handleToggleCandidate,
    handleClearSelection,
    error,
    hasStages,
    isLoadingCandidates,
    isCandidatesError,
    refetchCandidates,
    isSubmitting,
    handleSubmit,
  } = useAddFromTalentPool({
    recruitment,
    existingApplicationCount,
    onSuccess,
    onCancel,
  })

  return (
    <>
      <div className="p-6 pt-4 space-y-4 max-h-[65vh] overflow-y-auto">
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
              disabled={availableTalentCandidates.length === 0}
              className="inline-flex items-center gap-2 hover:text-foreground cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleToggleSelectAll}
                disabled={availableTalentCandidates.length === 0}
                className="size-4 rounded"
              />
              <span>Select All ({availableTalentCandidates.length})</span>
            </button>

            <span className="font-semibold text-foreground">
              {selectedCandidateIds.length} candidate{selectedCandidateIds.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto rounded-2xl border border-border divide-y divide-border bg-card p-1">
            {isLoadingCandidates ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading talent pool candidates from server...
              </div>
            ) : isCandidatesError ? (
              <div className="p-8 text-center text-sm text-destructive space-y-2">
                <p>Failed to load candidates from server.</p>
                <button
                  type="button"
                  onClick={() => refetchCandidates()}
                  className="text-xs underline text-foreground hover:text-primary cursor-pointer font-medium"
                >
                  Retry loading candidates
                </button>
              </div>
            ) : availableTalentCandidates.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {talentSearch.trim()
                  ? `No available candidates found matching "${talentSearch}".`
                  : "No available candidates in the talent pool for this batch. Registered candidates may already be in this batch, or the talent pool is currently empty."}
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

        {/* Selected preview bar */}
        {selectedCandidates.length > 0 && (
          <div className="rounded-2xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-primary" />
                Selected Candidates ({selectedCandidates.length})
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-destructive cursor-pointer text-xs underline"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {selectedCandidates.map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-xs text-foreground font-medium shadow-none"
                >
                  {c.fullName}
                  <button
                    type="button"
                    onClick={() => handleToggleCandidate(c.id)}
                    className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="pb-9 px-9 border-t border-border bg-card flex items-center justify-end gap-2.5">
        <CancelButton onClick={onCancel} disabled={isSubmitting} />
        <SaveButton
          onClick={handleSubmit}
          disabled={!hasStages || selectedCandidates.length === 0}
          isLoading={isSubmitting}
          loadingText="Adding Candidates..."
        >
          Add Selected ({selectedCandidates.length})
        </SaveButton>
      </DialogFooter>
    </>
  )
}
