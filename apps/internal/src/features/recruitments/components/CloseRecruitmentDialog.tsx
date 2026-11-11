import { useState } from "react"
import { AlertTriangle, CircleStop, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  CancelButton,
  ErrorState,
  SaveButton,
  StatusBadge,
} from "@/shared/components"
import { formatPeriod } from "@/shared/lib/format"
import {
  useGetBatchByIdQuery,
  useUpdateBatchStatusMutation,
} from "../api/recruitments-api"
import { getRecruitmentStatusMeta } from "../types"
import type { Recruitment } from "../types"

interface CloseRecruitmentDialogProps {
  recruitment: Recruitment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (recruitment: Recruitment) => void
}

function getCloseErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data
    if (typeof data === "object" && data !== null) {
      if ("detail" in data && typeof data.detail === "string")
        return data.detail
      if ("title" in data && typeof data.title === "string") return data.title
    }
  }
  return "Unable to close this recruitment. Please try again."
}

export function CloseRecruitmentDialog({
  recruitment,
  open,
  onOpenChange,
  onSuccess,
}: CloseRecruitmentDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    currentData: batch,
    isFetching,
    isError,
    refetch,
  } = useGetBatchByIdQuery(recruitment.id, {
    skip: !open,
    refetchOnMountOrArgChange: true,
  })
  const [updateStatus, { isLoading: isSubmitting }] =
    useUpdateBatchStatusMutation()
  const statusMeta = batch ? getRecruitmentStatusMeta(batch.status) : null
  const isOpen = statusMeta?.label === "Open"
  const hasActiveStage = batch?.batchStages?.some((stage) =>
    ["active", "1"].includes(String(stage.lifecycleStatus).toLowerCase())
  )
  const canClose = Boolean(batch && isOpen && !hasActiveStage && !isFetching && !isError)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) onOpenChange(nextOpen)
  }

  const handleCloseRecruitment = async () => {
    if (!canClose || isSubmitting) return
    setSubmitError(null)
    try {
      const updatedBatch = await updateStatus({
        id: recruitment.id,
        body: { status: "Closed" },
      }).unwrap()
      onSuccess(updatedBatch)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getCloseErrorMessage(error))
      void refetch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-2xl bg-card p-0 sm:max-w-md"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader className="border-b border-border p-6 pr-12 pb-4">
          <DialogTitle className="text-base font-semibold">
            Close Recruitment
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            Review this batch before closing recruitment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {isFetching ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Checking recruitment status...
            </div>
          ) : isError || !batch || !statusMeta ? (
            <ErrorState
              title="Unable to load recruitment"
              description="Please reload the batch before closing recruitment."
              onRetry={() => refetch()}
              className="px-0 py-3"
            />
          ) : (
            <>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">
                    Recruitment
                  </dt>
                  <dd className="text-right font-semibold text-foreground">
                    {batch.name}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Batch code</dt>
                  <dd className="font-mono text-xs text-foreground">
                    {batch.batchCode}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-muted-foreground">Period</dt>
                  <dd className="text-right text-foreground">
                    {formatPeriod(batch.startDate, batch.endDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Current status</dt>
                  <dd>
                    <StatusBadge tone={statusMeta.tone}>
                      {statusMeta.label}
                    </StatusBadge>
                  </dd>
                </div>
              </dl>

              {isOpen && hasActiveStage ? (
                <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  Complete the active stage before closing this recruitment batch.
                </p>
              ) : isOpen ? (
                <>
                  <div className="space-y-2 rounded-xl bg-muted/50 p-4 text-sm text-foreground">
                    <p className="font-medium">After closing this batch:</p>
                    <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
                      <li>
                        Candidate applications and interview schedules become read-only.
                      </li>
                      <li>
                        Existing candidates and interview sessions will keep
                        their current statuses.
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    <p>
                      This batch cannot be reopened after closing under the
                      current workflow.
                    </p>
                  </div>
                </>
              ) : (
                <p
                  role="status"
                  className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground"
                >
                  Only Open recruitments can be closed. This batch is currently{" "}
                  {statusMeta.label}.
                </p>
              )}
            </>
          )}

          {submitError && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs text-destructive"
            >
              {submitError}
            </p>
          )}
        </div>

        <DialogFooter className="m-0 gap-2 border-t border-border bg-card px-6 py-4">
          <CancelButton
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          />
          <SaveButton
            onClick={handleCloseRecruitment}
            disabled={!canClose}
            isLoading={isSubmitting}
            loadingText="Closing..."
            icon={<CircleStop className="size-4" aria-hidden />}
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
          >
            Close Recruitment
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
