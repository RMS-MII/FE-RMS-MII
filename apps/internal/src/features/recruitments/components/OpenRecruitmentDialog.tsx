import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { AlertCircle, CirclePlay, Loader2, Settings2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
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

interface OpenRecruitmentDialogProps {
  recruitment: Recruitment
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (recruitment: Recruitment) => void
}

function getOpenErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data
    if (typeof data === "object" && data !== null) {
      if ("detail" in data && typeof data.detail === "string")
        return data.detail
      if ("title" in data && typeof data.title === "string") return data.title
    }
  }
  return "Unable to open this recruitment. Please try again."
}

export function OpenRecruitmentDialog({
  recruitment,
  open,
  onOpenChange,
  onSuccess,
}: OpenRecruitmentDialogProps) {
  const navigate = useNavigate()
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
  const isDraft = statusMeta?.label === "Draft"
  const stageCount = batch?.batchStages?.length ?? 0
  const canOpen = Boolean(
    batch && isDraft && stageCount > 0 && !isFetching && !isError
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) onOpenChange(nextOpen)
  }

  const handleOpenRecruitment = async () => {
    if (!canOpen || isSubmitting) return
    setSubmitError(null)
    try {
      const updatedBatch = await updateStatus({
        id: recruitment.id,
        body: { status: "Open" },
      }).unwrap()
      onSuccess(updatedBatch)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getOpenErrorMessage(error))
      void refetch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader className="border-b border-border p-6 pb-4">
          <DialogTitle>Open Recruitment</DialogTitle>
          <DialogDescription>
            Review this batch and its selection stages before opening
            recruitment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {isFetching ? (
            <div
              role="status"
              className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
            >
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Checking recruitment readiness...
            </div>
          ) : isError || !batch || !statusMeta ? (
            <ErrorState
              title="Unable to load recruitment"
              description="Please reload the batch before opening recruitment."
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
                  <dt className="text-muted-foreground">Selection stages</dt>
                  <dd className="font-medium text-foreground">
                    {stageCount} {stageCount === 1 ? "stage" : "stages"}
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

              {!isDraft ? (
                <p
                  role="status"
                  className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground"
                >
                  Only Draft recruitments can be opened. This batch is currently{" "}
                  {statusMeta.label}.
                </p>
              ) : stageCount === 0 ? (
                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0" aria-hidden />
                    <p>
                      Configure at least one selection stage before opening this
                      recruitment.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-full border-amber-300 bg-white text-xs text-amber-900 hover:bg-amber-100"
                    onClick={() => {
                      onOpenChange(false)
                      void navigate({
                        to: "/recruitments/$id/stages",
                        params: { id: batch.id },
                      })
                    }}
                  >
                    <Settings2 className="size-3.5" aria-hidden />
                    Configure Stages
                  </Button>
                </div>
              ) : (
                <p className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground">
                  Once opened, you can add candidates and schedule interviews
                  for configured interview stages.
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
            onClick={handleOpenRecruitment}
            disabled={!canOpen}
            isLoading={isSubmitting}
            loadingText="Opening..."
            icon={<CirclePlay className="size-4" aria-hidden />}
          >
            Open Recruitment
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
