import { useCallback, useEffect, useRef, useState } from "react"
import { request, type Tasks } from "../api"

export function useCandidateTasks(candidateId: string, prefix: string) {
  const [result, setResult] = useState<{ data: Tasks; fetchedAt: number }>()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(Boolean(candidateId))
  const controller = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    if (!candidateId) {
      setLoading(false)
      return
    }

    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort
    setLoading(true)
    setError("")

    try {
      const data = await request<Tasks>(`${prefix}/tasks`, undefined, abort.signal)
      if (!abort.signal.aborted) setResult({ data, fetchedAt: Date.now() })
    } catch (failure) {
      if (!abort.signal.aborted)
        setError(failure instanceof Error ? failure.message : "Could not load the portal.")
    } finally {
      if (!abort.signal.aborted) setLoading(false)
    }
  }, [candidateId, prefix])

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0)
    const onFocus = () => void refresh()
    window.addEventListener("focus", onFocus)
    return () => {
      window.clearTimeout(initialLoad)
      controller.current?.abort()
      window.removeEventListener("focus", onFocus)
    }
  }, [refresh])

  return { result, error, loading, refresh }
}
