import { useMemo } from "react"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Button } from "@workspace/ui/components/button"
import { DialogFooter } from "@workspace/ui/components/dialog"
import {
  CancelButton,
  SaveButton,
  SearchCombobox,
  type SearchComboboxOption,
} from "@/shared/components"
import { CheckCircle2, Trash2 } from "lucide-react"
import {
  useAddFromTalentPool,
  type TalentPoolCandidate,
  type UseAddFromTalentPoolProps,
} from "../../hooks/useAddFromTalentPool"

export type AddFromTalentPoolTabProps = UseAddFromTalentPoolProps

function CandidateDetails({
  candidate,
}: {
  candidate: Pick<
    TalentPoolCandidate,
    "fullName" | "email" | "education" | "institution"
  >
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {candidate.fullName.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {candidate.fullName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {candidate.email}
          </p>
        </div>
      </div>
      {(candidate.education || candidate.institution) && (
        <div className="min-w-0 pl-9 sm:max-w-52 sm:pl-0 sm:text-right">
          <p className="truncate text-xs font-medium text-foreground">
            {candidate.education || "-"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {candidate.institution || "-"}
          </p>
        </div>
      )}
    </div>
  )
}

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
    handleAddCandidate,
    handleRemoveCandidate,
    handleClearSelection,
    error,
    canAddCandidates,
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

  const candidateOptions = useMemo<SearchComboboxOption<TalentPoolCandidate>[]>(
    () =>
      availableTalentCandidates.map((candidate) => ({
        id: candidate.id,
        label: candidate.fullName,
        subLabel: candidate.email,
        meta: `${candidate.education} ${candidate.institution}`,
        data: candidate,
      })),
    [availableTalentCandidates]
  )

  const isSelectionDisabled = !canAddCandidates || isSubmitting
  const isSelectAllDisabled =
    isSelectionDisabled ||
    isLoadingCandidates ||
    isCandidatesError ||
    availableTalentCandidates.length === 0

  return (
    <>
      <div className="max-h-[65vh] space-y-4 overflow-y-auto p-6 pt-4">
        <div className="space-y-2">
          <div className="flex flex-col gap-1 px-1 sm:flex-row sm:items-center sm:justify-between">
            <Label
              htmlFor="talent-pool-candidates"
              className="text-sm font-medium"
            >
              Select Candidates from Pool{" "}
              <span className="text-destructive">*</span>
            </Label>
            <span className="text-xs text-muted-foreground">
              You can select multiple candidates simultaneously
            </span>
          </div>

          <SearchCombobox
            id="talent-pool-candidates"
            options={candidateOptions}
            placeholder={
              isLoadingCandidates
                ? "Loading candidates..."
                : "+ Add candidate..."
            }
            searchPlaceholder="Search candidates by name, campus, or email..."
            searchValue={talentSearch}
            onSearchChange={setTalentSearch}
            shouldFilter={false}
            selectedIds={selectedCandidateIds}
            onSelect={(option) => handleAddCandidate(option.id)}
            closeOnSelect={false}
            disabled={isSelectionDisabled}
            isLoading={isLoadingCandidates}
            loadingText="Loading talent pool candidates from server..."
            emptyText={
              talentSearch.trim()
                ? `No available candidates found matching "${talentSearch}".`
                : "No available candidates in the talent pool for this batch. Registered candidates may already be in this batch, or the talent pool is currently empty."
            }
            errorContent={
              isCandidatesError ? (
                <div
                  role="alert"
                  className="space-y-2 py-6 text-center text-xs text-destructive"
                >
                  <p>Failed to load candidates from server.</p>
                  <button
                    type="button"
                    onClick={() => refetchCandidates()}
                    className="cursor-pointer font-medium text-foreground underline hover:text-primary"
                  >
                    Retry loading candidates
                  </button>
                </div>
              ) : undefined
            }
            popoverClassName="w-(--anchor-width) max-w-[calc(100vw-2rem)] sm:w-(--anchor-width)"
            renderOption={(option) =>
              option.data ? (
                <CandidateDetails candidate={option.data} />
              ) : (
                option.label
              )
            }
          />

          <div className="flex items-center justify-between border-b border-border px-2 py-1 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Checkbox
                id="select-all-talent-candidates"
                checked={isAllSelected}
                onCheckedChange={handleToggleSelectAll}
                disabled={isSelectAllDisabled}
                className="size-4 rounded"
              />
              <Label
                htmlFor="select-all-talent-candidates"
                className="cursor-pointer text-xs font-medium"
              >
                Select All ({availableTalentCandidates.length})
              </Label>
            </div>

            <span className="font-semibold text-foreground">
              {selectedCandidateIds.length} candidate
              {selectedCandidateIds.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          {error && <p className="px-1 text-xs text-destructive">{error}</p>}
        </div>

        {/* Selected preview bar */}
        {selectedCandidates.length > 0 && (
          <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                Selected Candidates ({selectedCandidates.length})
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={isSubmitting}
                className="cursor-pointer text-xs text-muted-foreground underline hover:text-destructive"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {selectedCandidates.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-2.5"
                >
                  <CandidateDetails candidate={c} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleRemoveCandidate(c.id)}
                    disabled={isSubmitting}
                    aria-label={`Remove ${c.fullName}`}
                    title={`Remove ${c.fullName}`}
                    className="size-7 shrink-0 rounded-full border-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="flex items-center justify-end gap-2.5 border-t border-border bg-card px-9 pb-9">
        <CancelButton onClick={onCancel} disabled={isSubmitting} />
        <SaveButton
          onClick={handleSubmit}
          disabled={!canAddCandidates || selectedCandidates.length === 0}
          isLoading={isSubmitting}
          loadingText="Adding Candidates..."
        >
          Add Selected ({selectedCandidates.length})
        </SaveButton>
      </DialogFooter>
    </>
  )
}
