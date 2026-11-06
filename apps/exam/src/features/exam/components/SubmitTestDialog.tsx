import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Send,
  TriangleAlert,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Spinner } from "@workspace/ui/components/spinner"
import type { CandidateTestQuestion, ExamAnswers } from "../types"
import { getAnsweredCount, getMissingRequiredQuestions } from "../utils"

interface SubmitTestDialogProps {
  open: boolean
  submitting: boolean
  error: string | null
  questions: CandidateTestQuestion[]
  answers: ExamAnswers
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onReviewMissing: () => void
}

export function SubmitTestDialog({
  open,
  submitting,
  error,
  questions,
  answers,
  onOpenChange,
  onConfirm,
  onReviewMissing,
}: SubmitTestDialogProps) {
  const answeredCount = getAnsweredCount(questions, answers)
  const unansweredCount = questions.length - answeredCount
  const missingRequired = getMissingRequiredQuestions(questions, answers)
  const canSubmit = missingRequired.length === 0

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!submitting) {
          onOpenChange(nextOpen)
        }
      }}
    >
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="size-4 text-primary" />
            Kumpulkan jawaban?
          </DialogTitle>
          <DialogDescription>
            Periksa kembali jawaban Anda sebelum mengirimkannya.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-muted/40 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Terjawab
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {answeredCount}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  / {questions.length}
                </span>
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase">
                Belum dijawab
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {unansweredCount}
              </p>
            </div>
          </div>

          {missingRequired.length > 0 ? (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Masih ada soal wajib yang kosong</AlertTitle>
              <AlertDescription>
                <p>
                  Soal nomor{" "}
                  <span className="font-semibold">
                    {missingRequired
                      .map((question) =>
                        questions.findIndex((item) => item.id === question.id)
                      )
                      .map((index) => index + 1)
                      .join(", ")}
                  </span>{" "}
                  wajib dijawab sebelum Anda dapat mengumpulkan jawaban.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <TriangleAlert className="size-4 text-amber-600" />
              <AlertTitle>Jawaban tidak dapat diubah</AlertTitle>
              <AlertDescription>
                Setelah dikumpulkan, Anda tidak dapat kembali mengubah jawaban
                atau mengulang tes ini.
              </AlertDescription>
            </Alert>
          )}

          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="size-4" />
              <AlertTitle>Gagal mengirim jawaban</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter className="border-t bg-muted/40 px-6 py-4">
          {canSubmit ? (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Periksa Lagi
              </Button>
              <Button onClick={onConfirm} disabled={submitting}>
                {submitting ? (
                  <Spinner className="size-4" />
                ) : (
                  <Send className="size-4" />
                )}
                {submitting ? "Mengirim..." : "Kumpulkan Jawaban"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Tutup
              </Button>
              <Button onClick={onReviewMissing} disabled={submitting}>
                <CheckCircle2 className="size-4" />
                Periksa Soal Wajib
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
