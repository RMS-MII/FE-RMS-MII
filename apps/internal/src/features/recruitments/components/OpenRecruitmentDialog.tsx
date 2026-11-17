import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { AlertCircle, CirclePlay, Settings2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
  CancelButton,
  DatePicker,
  ErrorState,
  SaveButton,
  StatusBadge,
} from "@/shared/components"
import { formatPeriod } from "@/shared/lib/format"
import {
  formatWibTime,
  getWibDateKey,
  parseUtcDateTime,
  wibToUtcISOString,
} from "@/shared/lib/utcDateTime"
import { canEditApplicationDeadline } from "../utils/recruitmentUtils"
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
  const [deadlineDate, setDeadlineDate] = useState("")
  const [deadlineTime, setDeadlineTime] = useState("23:59")
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

  useEffect(() => {
    if (!open || isFetching || !batch) return
    setDeadlineDate(
      batch.applicationDeadlineAt
        ? getWibDateKey(batch.applicationDeadlineAt)
        : ""
    )
    setDeadlineTime(
      batch.applicationDeadlineAt
        ? formatWibTime(batch.applicationDeadlineAt)
        : "23:59"
    )
  }, [open, isFetching, batch])

  const statusMeta = batch ? getRecruitmentStatusMeta(batch.status) : null
  const isDraft = statusMeta?.label === "Draft"
  const editingDeadline = canEditApplicationDeadline(batch ?? recruitment)
  const enabledStages =
    batch?.batchStages ?? []
  const stageCount = enabledStages.length
  const canOpen = Boolean(
    batch &&
    (isDraft || editingDeadline) &&
    stageCount > 0 &&
    !isFetching &&
    !isError
  )

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    if (!nextOpen) {
      setDeadlineDate("")
      setDeadlineTime("23:59")
      setSubmitError(null)
    }
    onOpenChange(nextOpen)
  }

  const handleOpenRecruitment = async () => {
    if (!batch || !canOpen || isSubmitting || !deadlineDate || !deadlineTime)
      return
    const applicationDeadlineAt = wibToUtcISOString(deadlineDate, deadlineTime)
    const cutoff = Date.parse(applicationDeadlineAt)
    if (
      cutoff <= Date.now() ||
      (batch.endDate && cutoff > parseUtcDateTime(batch.endDate).getTime())
    ) {
      setSubmitError(
        "The application deadline must be in the future and on or before the batch end."
      )
      return
    }
    if (
      enabledStages.some(
        (stage) =>
          stage.endDate && cutoff >= parseUtcDateTime(stage.endDate).getTime()
      )
    ) {
      setSubmitError(
        "The application deadline must be before every enabled stage ends."
      )
      return
    }
    setSubmitError(null)
    try {
      const updatedBatch = await updateStatus({
        id: recruitment.id,
        body: { status: "Open", applicationDeadlineAt },
      }).unwrap()
      onSuccess(updatedBatch)
      setDeadlineDate("")
      setDeadlineTime("23:59")
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getOpenErrorMessage(error))
      void refetch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-md"
        showCloseButton={!isSubmitting}
      >
        <DialogHeader className="border-b border-border p-6 pb-4">
          <DialogTitle>
            {editingDeadline
              ? batch?.applicationDeadlineAt
                ? "Edit Application Deadline"
                : "Set Application Deadline"
              : "Open Recruitment"}
          </DialogTitle>
          <DialogDescription>
            Choose when the job portal stops accepting applications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          {isFetching ? (
            <div role="status" aria-label="Loading recruitment details" className="space-y-5">
              <div className="space-y-3">
                {[
                  ["w-24", "w-40"],
                  ["w-20", "w-28"],
                  ["w-16", "w-36"],
                  ["w-32", "w-20"],
                  ["w-28", "w-16"],
                ].map(([labelWidth, valueWidth], index) => (
                  <div key={index} className="flex items-center justify-between gap-4">
                    <Skeleton className={`h-4 ${labelWidth}`} />
                    <Skeleton className={`h-4 ${valueWidth}`} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-10 w-full rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-10 w-full rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
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

              {!isDraft && !editingDeadline ? (
                <p
                  role="status"
                  className="rounded-xl bg-muted px-4 py-3 text-xs text-muted-foreground"
                >
                  The application deadline can only be set before bulk selection
                  starts.
                </p>
              ) : stageCount === 0 ? (
                <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="size-4 shrink-0" aria-hidden />
                    <p>
                      Configure at least one enabled selection stage before
                      opening this recruitment.
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
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">
                    Application Deadline (WIB)
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="deadline-date"
                        className="text-xs font-medium"
                      >
                        Date
                      </label>
                      <DatePicker
                        id="deadline-date"
                        value={deadlineDate}
                        minDate={getWibDateKey(new Date())}
                        maxDate={batch?.endDate ? getWibDateKey(batch.endDate) : undefined}
                        onChange={setDeadlineDate}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="deadline-time"
                        className="text-xs font-medium"
                      >
                        Time
                      </label>
                      <Input
                        id="deadline-time"
                        type="time"
                        value={deadlineTime}
                        onChange={(event) => setDeadlineTime(event.target.value)}
                        disabled={isSubmitting}
                        className="font-mono tabular-nums h-10 rounded-full border-0 bg-muted px-4 text-sm text-foreground shadow-none transition-all duration-150 outline-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bulk selection can start once this deadline is reached.
                  </p>
                </div>
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
            disabled={!canOpen || !deadlineDate || !deadlineTime}
            isLoading={isSubmitting}
            loadingText="Saving…"
            icon={<CirclePlay className="size-4" aria-hidden />}
          >
            {editingDeadline ? "Save Deadline" : "Open Recruitment"}
          </SaveButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
