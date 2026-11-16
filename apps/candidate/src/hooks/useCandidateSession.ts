import { useEffect, useState } from "react"
import { getSession, type CandidateSession } from "../session"

export function useCandidateSession(enabled: boolean) {
  const [session, setSession] = useState<CandidateSession | null | undefined>(
    enabled ? undefined : null
  )
  const [error, setError] = useState("")

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    getSession(controller.signal)
      .then(setSession)
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error ? failure.message : "Please try again."
          )
        }
      })

    return () => controller.abort()
  }, [enabled])

  return { session, error, loading: enabled && session === undefined && !error }
}
