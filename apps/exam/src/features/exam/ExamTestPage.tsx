import { useCallback, useEffect, useState } from "react"
import { ApiError, submitCandidateTest } from "./api"
import { useCandidateTest, useExamTimer } from "./hooks"
import { clearExamDraft, saveExamDraft, type ExamDraft } from "./storage"
import type { CandidateTest, ExamAnswers, SubmitTestResult } from "./types"
import {
  formatDateTime,
  getMissingRequiredQuestions,
  isMultipleChoice,
  parseServerDate,
} from "./utils"
import { ExamIntro } from "./components/ExamIntro"
import { ExamResult } from "./components/ExamResult"
import { ExamSession } from "./components/ExamSession"
import {
  ExamExpiredScreen,
  ExamLoadErrorScreen,
  ExamLoading,
  ExamNotStartedScreen,
  ExamSubmissionErrorScreen,
} from "./components/ExamStateScreens"
import { SubmitTestDialog } from "./components/SubmitTestDialog"

type ExamPhase = "intro" | "exam" | "result"

interface ExamTestPageProps {
  candidateId: string
  stageId: string
}

interface ExamRunnerProps {
  test: CandidateTest
  initialDraft: ExamDraft | null
  receivedAt: number
}

function getLoadErrorContent(error: unknown): {
  title: string
  description: string
} {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return {
        title: "Tes tidak ditemukan",
        description:
          "Link tes mungkin tidak valid atau tahap tes ini sudah tidak tersedia. Silakan hubungi tim rekrutmen untuk informasi lebih lanjut.",
      }
    }

    if (error.status === 422) {
      return {
        title: "Tes tidak dapat diakses",
        description:
          error.detail ??
          error.title ??
          "Tes ini tidak dapat diakses saat ini. Kemungkinan tes sudah dikerjakan, kedaluwarsa, atau belum dijadwalkan.",
      }
    }

    return {
      title: "Gagal memuat tes",
      description:
        error.detail ??
        error.title ??
        "Terjadi kesalahan saat memuat data tes. Silakan coba lagi.",
    }
  }

  return {
    title: "Tidak dapat terhubung ke server",
    description: "Periksa koneksi internet Anda, lalu tekan tombol coba lagi.",
  }
}

function getSubmissionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "Data tes tidak ditemukan. Muat ulang halaman atau hubungi tim rekrutmen."
    }

    if (error.status === 422) {
      return (
        error.detail ??
        "Jawaban tidak dapat dikirim karena waktu tes sudah berakhir atau tes sudah pernah dikumpulkan."
      )
    }

    if (error.status === 400) {
      return (
        error.detail ??
        "Data jawaban tidak valid. Periksa kembali jawaban Anda lalu coba lagi."
      )
    }

    return (
      error.detail ?? error.title ?? "Gagal mengirim jawaban. Silakan coba lagi."
    )
  }

  return "Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi."
}

function ExamRunner({ test, initialDraft, receivedAt }: ExamRunnerProps) {
  const [phase, setPhase] = useState<ExamPhase>(() =>
    initialDraft?.started ? "exam" : "intro"
  )
  const [answers, setAnswers] = useState<ExamAnswers>(
    () => initialDraft?.answers ?? {}
  )
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (!initialDraft?.started) {
      return 0
    }

    return Math.min(
      Math.max(0, initialDraft.currentIndex),
      Math.max(0, test.questions.length - 1)
    )
  })
  const [result, setResult] = useState<SubmitTestResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  const submitAnswers = useCallback(
    async (options?: { force?: boolean }) => {
      if (submitting) {
        return
      }

      if (!options?.force) {
        const missing = getMissingRequiredQuestions(test.questions, answers)

        if (missing.length > 0) {
          return
        }
      }

      setSubmitting(true)
      setSubmitError(null)

      try {
        const payloadAnswers = test.questions
          .map((question) => ({
            questionId: question.id,
            selectedOptionIds: answers[question.id] ?? [],
          }))
          .filter((answer) => answer.selectedOptionIds.length > 0)

        const response = await submitCandidateTest({
          candidateId: test.candidateId,
          stageId: test.applicationStageId,
          answers: payloadAnswers,
        })

        clearExamDraft(test.candidateId, test.applicationStageId)
        setResult(response)
        setPhase("result")
        setSubmitDialogOpen(false)
        window.scrollTo({ top: 0 })
      } catch (submitFailure) {
        setSubmitError(getSubmissionErrorMessage(submitFailure))
      } finally {
        setSubmitting(false)
      }
    },
    [answers, submitting, test]
  )

  const handleTimeExpired = useCallback(() => {
    setTimeUp(true)
    setSubmitDialogOpen(false)
    void submitAnswers({ force: true })
  }, [submitAnswers])

  const timer = useExamTimer(
    test,
    receivedAt,
    phase === "exam" ? handleTimeExpired : undefined
  )

  useEffect(() => {
    document.title = `${test.stageName} - Tes Online`

    return () => {
      document.title = "Tes Online | Metrodata"
    }
  }, [test.stageName])

  useEffect(() => {
    if (phase !== "exam") {
      return
    }

    saveExamDraft(test.candidateId, test.applicationStageId, {
      started: true,
      answers,
      currentIndex,
      updatedAt: new Date().toISOString(),
    })
  }, [answers, currentIndex, phase, test])

  useEffect(() => {
    if (phase !== "exam") {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [phase])

  const handleStart = () => {
    saveExamDraft(test.candidateId, test.applicationStageId, {
      started: true,
      answers: {},
      currentIndex: 0,
      updatedAt: new Date().toISOString(),
    })
    setAnswers({})
    setCurrentIndex(0)
    setSubmitError(null)
    setPhase("exam")
  }

  const handleSelect = (questionId: string, optionId: string) => {
    if (timeUp || submitting) {
      return
    }

    const question = test.questions.find((item) => item.id === questionId)

    if (!question) {
      return
    }

    setAnswers((current) => {
      const selected = current[questionId] ?? []

      if (isMultipleChoice(question.questionType)) {
        const next = selected.includes(optionId)
          ? selected.filter((id) => id !== optionId)
          : [...selected, optionId]

        return { ...current, [questionId]: next }
      }

      return { ...current, [questionId]: [optionId] }
    })
  }

  const handleIndexChange = (index: number) => {
    setCurrentIndex(
      Math.max(0, Math.min(index, Math.max(0, test.questions.length - 1)))
    )
  }

  const handleSubmitClick = () => {
    if (submitting || timeUp) {
      return
    }

    setSubmitError(null)
    setSubmitDialogOpen(true)
  }

  const handleReviewMissing = () => {
    const missing = getMissingRequiredQuestions(test.questions, answers)
    const firstMissing = missing[0]

    if (firstMissing) {
      const index = test.questions.findIndex(
        (question) => question.id === firstMissing.id
      )

      if (index >= 0) {
        setCurrentIndex(index)
      }
    }

    setSubmitDialogOpen(false)
  }

  if (phase === "result" && result) {
    return <ExamResult result={result} candidateName={test.candidateName} />
  }

  if (timeUp && submitError) {
    return (
      <ExamSubmissionErrorScreen
        description={submitError}
        onRetry={() => {
          void submitAnswers({ force: true })
        }}
      />
    )
  }

  if (phase === "intro") {
    if (timer.remainingMs !== null && timer.remainingMs <= 0) {
      return <ExamExpiredScreen deadline={formatDateTime(test.endAt)} />
    }

    const startsAt = parseServerDate(test.startedAt)

    if (!Number.isNaN(startsAt) && timer.serverNow < startsAt) {
      return <ExamNotStartedScreen startedAt={formatDateTime(test.startedAt)} />
    }

    return (
      <ExamIntro
        test={test}
        remainingMs={timer.remainingMs}
        onStart={handleStart}
      />
    )
  }

  return (
    <>
      <ExamSession
        test={test}
        answers={answers}
        currentIndex={currentIndex}
        remainingMs={timer.remainingMs}
        timeUp={timeUp}
        submitting={submitting}
        onSelect={handleSelect}
        onIndexChange={handleIndexChange}
        onSubmitClick={handleSubmitClick}
      />

      <SubmitTestDialog
        open={submitDialogOpen}
        submitting={submitting}
        error={submitError}
        questions={test.questions}
        answers={answers}
        onOpenChange={setSubmitDialogOpen}
        onConfirm={() => {
          void submitAnswers()
        }}
        onReviewMissing={handleReviewMissing}
      />
    </>
  )
}

export function ExamTestPage({ candidateId, stageId }: ExamTestPageProps) {
  const { data, draft, receivedAt, error, loading, reload } = useCandidateTest(
    candidateId,
    stageId
  )

  if (loading && !data) {
    return <ExamLoading />
  }

  if (error && !data) {
    const content = getLoadErrorContent(error)

    return (
      <ExamLoadErrorScreen
        title={content.title}
        description={content.description}
        onRetry={reload}
      />
    )
  }

  if (!data) {
    return <ExamLoading />
  }

  return (
    <ExamRunner
      key={`${data.candidateId}:${data.applicationStageId}`}
      test={data}
      initialDraft={draft}
      receivedAt={receivedAt}
    />
  )
}
