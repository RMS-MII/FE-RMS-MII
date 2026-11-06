import { useEffect, useRef, useState } from "react"
import { getCandidateTest } from "./api"
import { loadExamDraft, type ExamDraft } from "./storage"
import type { CandidateTest } from "./types"
import { getTestDeadline } from "./utils"

interface CandidateTestState {
  data: CandidateTest | null
  draft: ExamDraft | null
  receivedAt: number
  error: unknown
  loading: boolean
}

export function useCandidateTest(candidateId: string, stageId: string) {
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

    getCandidateTest(candidateId, stageId, controller.signal)
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

    return () => {
      controller.abort()
    }
  }, [candidateId, stageId, reloadKey])

  const reload = () => {
    setState((current) => ({ ...current, loading: true, error: null }))
    setReloadKey((key) => key + 1)
  }

  return { ...state, reload }
}

export function useExamTimer(
  test: CandidateTest | null,
  receivedAt: number,
  onExpire?: () => void
) {
  const [now, setNow] = useState(() => Date.now())
  const onExpireRef = useRef(onExpire)
  const expiredNotifiedRef = useRef(false)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const deadline = test ? getTestDeadline(test) : null

  const rawOffset =
    test && receivedAt > 0
      ? new Date(test.serverTimeUtc).getTime() - receivedAt
      : 0
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
