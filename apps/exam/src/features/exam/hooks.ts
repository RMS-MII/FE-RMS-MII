import { useEffect, useRef, useState } from "react"
import {
  ApiError,
  finishCandidateTest,
  getExamCandidateTest,
  getPortalCandidateTest,
  redirectToCandidateLogin,
  startCandidateTest,
  submitCandidateTestAnswer,
} from "./api"
import { clearExamDraft, loadExamDraft, type ExamDraft } from "./storage"
import type {
  CandidateTest,
  FinishTestResult,
  StartTestResult,
  SubmitTestAnswer,
} from "./types"
import { getTestDeadline, parseServerDate } from "./utils"

interface CandidateTestState {
  data: CandidateTest | null
  draft: ExamDraft | null
  receivedAt: number
  error: unknown
  loading: boolean
}

function isUnauthorized(error: unknown) {
  return error instanceof ApiError && error.status === 401
}

function isExamSessionUnavailable(error: unknown) {
  return error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
}

async function loadCandidateTest(
  candidateId: string,
  stageId: string,
  signal: AbortSignal
) {
  try {
    return await getExamCandidateTest(candidateId, stageId, signal)
  } catch (error) {
    if (!isExamSessionUnavailable(error)) throw error
  }

  let preview: CandidateTest
  try {
    preview = await getPortalCandidateTest(candidateId, stageId, signal)
  } catch (error) {
    if (!signal.aborted && isUnauthorized(error)) redirectToCandidateLogin()
    throw error
  }

  if (!preview.attemptStartedAt) return preview

  // Start is idempotent: restore the exam cookie without changing AttemptStartedAt.
  await startCandidateTest(candidateId, stageId, signal)
  return getExamCandidateTest(candidateId, stageId, signal)
}

export function useCandidateTest(candidateId: string, stageId: string) {
  const pendingSave = useRef<Promise<unknown>>(Promise.resolve())
  const [state, setState] = useState<CandidateTestState>({
    data: null,
    draft: null,
    receivedAt: 0,
    error: null,
    loading: true,
  })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    // Tunda request ke macrotask berikutnya. Di StrictMode development React
    // menjalankan effect dua kali (setup -> cleanup -> setup) secara sinkron;
    // tanpa penundaan ini request pertama sudah terlanjur dikirim lalu
    // dibatalkan, sehingga server menerima dua request untuk data yang sama.
    const timer = window.setTimeout(() => {
      loadCandidateTest(candidateId, stageId, controller.signal)
        .then((data) => {
          setState({
            data,
            draft: loadExamDraft(data.candidateId, data.applicationStageId),
            receivedAt: Date.now(),
            error: null,
            loading: false,
          })
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return
          }

          setState({
            data: null,
            draft: null,
            receivedAt: 0,
            error,
            loading: false,
          })
        })
    }, 0)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [candidateId, stageId, reloadKey])

  const reload = () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    setReloadKey((key) => key + 1)
  }

  const start = async (): Promise<StartTestResult> => {
    let response: StartTestResult
    try {
      response = await startCandidateTest(candidateId, stageId)
    } catch (error) {
      if (isUnauthorized(error)) redirectToCandidateLogin()
      throw error
    }

    const data = await getExamCandidateTest(candidateId, stageId)
    setState((current) => ({
      ...current,
      data,
      receivedAt: Date.now(),
      error: null,
    }))
    return response
  }

  const withExamSession = async <T,>(operation: () => Promise<T>): Promise<T> => {
    try {
      return await operation()
    } catch (error) {
      if (!isExamSessionUnavailable(error)) throw error
    }

    try {
      await startCandidateTest(candidateId, stageId)
    } catch (error) {
      if (isUnauthorized(error)) redirectToCandidateLogin()
      throw error
    }

    return operation()
  }

  const save = (answers: SubmitTestAnswer[], isDraft: boolean) => {
    // A slower save must never overwrite a newer selection from this tab.
    const write = pendingSave.current.catch(() => undefined).then(() =>
      withExamSession(() =>
        submitCandidateTestAnswer({ candidateId, stageId, answers, isDraft })
      )
    )
    pendingSave.current = write
    return write
  }

  const complete = async (answers?: SubmitTestAnswer[]): Promise<FinishTestResult> => {
    if (answers) await save(answers, false)
    else await pendingSave.current.catch(() => undefined)

    const result = await withExamSession(() =>
      finishCandidateTest(candidateId, stageId)
    )
    clearExamDraft(candidateId, stageId)
    return result
  }

  return { ...state, reload, start, saveDraft: (answers: SubmitTestAnswer[]) => save(answers, true), complete }
}

export function useExamTimer(
  test: CandidateTest | null,
  receivedAt: number,
  sessionStartedAt: number | null,
  onExpire?: () => void
) {
  const [now, setNow] = useState(() => Date.now())
  const onExpireRef = useRef(onExpire)
  const expiredNotifiedRef = useRef(false)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const deadline = test ? getTestDeadline(test, sessionStartedAt) : null

  const rawOffset =
    test && receivedAt > 0 ? parseServerDate(test.serverTimeUtc) - receivedAt : 0
  const clockOffset = Number.isNaN(rawOffset) ? 0 : rawOffset

  const serverNow = now + clockOffset
  const remainingMs =
    deadline === null ? null : Math.max(0, deadline - serverNow)

  useEffect(() => {
    expiredNotifiedRef.current = false

    const interval = window.setInterval(() => {
      const nextNow = Date.now()
      setNow(nextNow)

      if (deadline === null) {
        return
      }

      const nextRemaining = deadline - (nextNow + clockOffset)

      if (nextRemaining <= 0 && !expiredNotifiedRef.current) {
        expiredNotifiedRef.current = true
        onExpireRef.current?.()
      }
    }, 1_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [clockOffset, deadline])

  return {
    deadline,
    serverNow,
    remainingMs,
  }
}
