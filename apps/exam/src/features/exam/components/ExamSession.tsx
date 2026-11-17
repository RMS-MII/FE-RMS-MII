import { useEffect, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  LayoutGrid,
  Send,
} from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Separator } from "@workspace/ui/components/separator"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"
import type { CandidateTest, ExamAnswers } from "../types"
import {
  formatCountdown,
  getAnsweredCount,
  getMissingRequiredQuestions,
} from "../utils"
import { Brand } from "./Brand"
import { QuestionCard } from "./QuestionCard"
import { QuestionNavigator } from "./QuestionNavigator"

interface ExamSessionProps {
  test: CandidateTest
  answers: ExamAnswers
  currentIndex: number
  remainingMs: number | null
  timeUp: boolean
  submitting: boolean
  draftSaveFailed: boolean
  onRetryDraft: () => void
  onSelect: (questionId: string, optionId: string) => void
  onIndexChange: (index: number) => void
  onSubmitClick: () => void
}

function ProgressLine({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function TimerChip({
  remainingMs,
  timeUp,
}: {
  remainingMs: number | null
  timeUp: boolean
}) {
  const critical = remainingMs !== null && remainingMs <= 5 * 60 * 1_000
  const label =
    remainingMs === null ? "Tanpa batas" : formatCountdown(remainingMs)

  return (
    <div
      role="timer"
      aria-label={timeUp ? "Waktu habis" : `Sisa waktu ${label}`}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums sm:text-sm",
        timeUp || critical
          ? "border-destructive/25 bg-destructive/10 text-destructive"
          : "border-border bg-card text-foreground"
      )}
    >
      <Clock3 className="size-3.5 shrink-0 sm:size-4" />
      <span className="hidden font-normal text-muted-foreground sm:inline">
        Sisa waktu
      </span>
      <span>{timeUp ? "Waktu habis" : label}</span>
      {critical && !timeUp ? (
        <span className="size-1.5 animate-pulse rounded-full bg-destructive" />
      ) : null}
    </div>
  )
}

export function ExamSession({
  test,
  answers,
  currentIndex,
  remainingMs,
  timeUp,
  submitting,
  draftSaveFailed,
  onRetryDraft,
  onSelect,
  onIndexChange,
  onSubmitClick,
}: ExamSessionProps) {
  const [navigatorOpen, setNavigatorOpen] = useState(false)
  const total = test.questions.length
  const answeredCount = getAnsweredCount(test.questions, answers)
  const unansweredCount = total - answeredCount
  const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0
  const missingRequired = getMissingRequiredQuestions(test.questions, answers)
  const locked = submitting || timeUp

  const stageTypeName = (test.stageTypeName ?? "").toLowerCase()
  const isPsychotest =
    stageTypeName.includes("psikotes")
  const useScroll = isPsychotest
  const showTimer = !useScroll

  const goToQuestion = (index: number) => {
    setNavigatorOpen(false)
    onIndexChange(index)

    if (useScroll) {
      const question = test.questions[index]

      if (!question) {
        return
      }

      document
        .getElementById(`question-${question.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const openSubmitFromNavigator = () => {
    setNavigatorOpen(false)
    onSubmitClick()
  }

  const initialIndexRef = useRef(currentIndex)
  useEffect(() => {
    const question = test.questions[initialIndexRef.current]

    if (!question) {
      return
    }

    if (useScroll) {
      document
        .getElementById(`question-${question.id}`)
        ?.scrollIntoView({ behavior: "auto", block: "start" })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const question = test.questions[currentIndex]

  if (!question) {
    return null
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="hidden shrink-0 sm:block">
              <Brand />
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground sm:hidden">
              M
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{test.stageName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {test.candidateName}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="outline"
              className="hidden rounded-full text-[11px] md:inline-flex"
            >
              <span className="mr-1 size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Sedang mengerjakan
            </Badge>
            {showTimer ? (
              <TimerChip remainingMs={remainingMs} timeUp={timeUp} />
            ) : null}
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-3 sm:px-6 lg:hidden">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Terjawab{" "}
              <span className="font-semibold text-foreground">
                {answeredCount}
              </span>{" "}
              dari {total}
            </span>
            <span className="font-semibold text-foreground">{percent}%</span>
          </div>
          <ProgressLine percent={percent} />
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="min-w-0 space-y-4">
          {timeUp ? (
            <Alert variant="destructive">
              <Clock3 className="size-4" />
              <AlertTitle>Waktu pengerjaan habis</AlertTitle>
              <AlertDescription>
                Jawaban yang sudah tersimpan sedang dikumpulkan.
              </AlertDescription>
            </Alert>
          ) : null}
          {draftSaveFailed && !timeUp ? (
            <Alert variant="destructive">
              <AlertTitle>Perubahan jawaban belum tersimpan</AlertTitle>
              <AlertDescription>
                Periksa koneksi Anda, lalu{" "}
                <button type="button" className="underline" onClick={onRetryDraft}>
                  simpan ulang
                </button>.
              </AlertDescription>
            </Alert>
          ) : null}

          {useScroll ? (
            <ol className="space-y-4">
              {test.questions.map((item, index) => (
                <li key={item.id}>
                  <QuestionCard
                    question={item}
                    index={index}
                    total={total}
                    selectedOptionIds={answers[item.id] ?? []}
                    disabled={locked}
                    onSelect={(optionId) => onSelect(item.id, optionId)}
                  />
                </li>
              ))}
            </ol>
          ) : (
            <>
              <QuestionCard
                question={question}
                index={currentIndex}
                total={total}
                selectedOptionIds={answers[question.id] ?? []}
                disabled={locked}
                onSelect={(optionId) => onSelect(question.id, optionId)}
              />

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-10"
                  onClick={() => onIndexChange(currentIndex - 1)}
                  disabled={currentIndex === 0 || locked}
                >
                  <ChevronLeft className="size-4" />
                  Sebelumnya
                </Button>

                <span className="text-xs font-medium text-muted-foreground sm:hidden">
                  {currentIndex + 1} / {total}
                </span>

                <Button
                  size="lg"
                  className="h-10"
                  onClick={() => onIndexChange(currentIndex + 1)}
                  disabled={currentIndex >= total - 1 || locked}
                >
                  Berikutnya
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 lg:hidden">
            <Button
              variant="outline"
              size="lg"
              className="h-10"
              onClick={() => setNavigatorOpen(true)}
              disabled={locked}
            >
              <LayoutGrid className="size-4" />
              Daftar Soal
            </Button>
            <Button
              size="lg"
              className="h-10"
              onClick={onSubmitClick}
              disabled={locked}
            >
              <Send className="size-4" />
              Kumpulkan
            </Button>
          </div>
        </div>

        <aside className="sticky top-24 hidden lg:block">
          <div className="rounded-2xl border bg-card p-5 ring-1 ring-border/60">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Progres Tes</h2>
              <Badge variant="secondary" className="text-[11px]">
                {answeredCount}/{total}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {percent}% soal sudah dijawab
            </p>
            <div className="mt-3">
              <ProgressLine percent={percent} />
            </div>

            <Separator className="my-5" />

            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Navigasi Soal</h3>
              <span className="text-[11px] text-muted-foreground">
                {unansweredCount} tersisa
              </span>
            </div>
            <QuestionNavigator
              questions={test.questions}
              answers={answers}
              currentIndex={currentIndex}
              disabled={locked}
              onSelect={goToQuestion}
            />

            <Separator className="my-5" />

            <Button
              size="lg"
              className="h-10 w-full"
              onClick={onSubmitClick}
              disabled={locked}
            >
              {submitting ? (
                <Spinner className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {submitting ? "Mengirim..." : "Kumpulkan Jawaban"}
            </Button>
            {missingRequired.length > 0 ? (
              <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                Masih ada {missingRequired.length} soal wajib yang belum
                dijawab.
              </p>
            ) : (
              <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
                Pastikan seluruh jawaban sudah sesuai sebelum dikumpulkan.
              </p>
            )}
          </div>
        </aside>
      </main>

      <Dialog open={navigatorOpen} onOpenChange={setNavigatorOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Daftar Soal</DialogTitle>
            <DialogDescription>
              Terjawab {answeredCount} dari {total} soal. Pilih nomor untuk
              berpindah soal.
            </DialogDescription>
          </DialogHeader>

          <QuestionNavigator
            questions={test.questions}
            answers={answers}
            currentIndex={currentIndex}
            disabled={locked}
            onSelect={goToQuestion}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNavigatorOpen(false)}
              disabled={submitting}
            >
              Tutup
            </Button>
            <Button onClick={openSubmitFromNavigator} disabled={locked}>
              <Send className="size-4" />
              Kumpulkan Jawaban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
