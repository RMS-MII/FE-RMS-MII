import { examUrl, request, RequestError } from "./api"

export interface CandidateProfile {
  id: string
  fullName: string
  gender: "Male" | "Female" | number
  phoneNumber: string
  birthDate: string
  education: string
  institution: string
  gpa: number
  address: string
  cv: string | null
  portfolio: string | null
}

export interface CandidateSession {
  email: string
  profile: CandidateProfile | null
}

export async function getSession(
  signal?: AbortSignal
): Promise<CandidateSession | null> {
  try {
    return await request<CandidateSession>("/portal/session", undefined, signal)
  } catch (error) {
    if (error instanceof RequestError && error.status === 401) return null
    throw error
  }
}

export function signInLink(
  next = window.location.pathname + window.location.search
) {
  return `/login?${new URLSearchParams({ next })}`
}

export function profileLink(
  next = window.location.pathname + window.location.search
) {
  return `/profile?${new URLSearchParams({ next })}`
}

export function portalHome(session: CandidateSession) {
  return session.profile ? `/portal/${session.profile.id}` : "/profile"
}

export function sessionDestination(session: CandidateSession) {
  const query = new URLSearchParams(window.location.search)
  if (!session.profile) return `/profile${window.location.search}`

  const next = query.get("next")
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  )
    return portalHome(session)
  if (query.get("exam") === "1") {
    const exam =
      /^\/portal\/([0-9a-f-]{36})\/stages\/([0-9a-f-]{36})\/test\/?$/i.exec(
        next
      )
    return exam && exam[1].toLowerCase() === session.profile.id.toLowerCase()
      ? (examUrl(exam[1], exam[2]) ?? portalHome(session))
      : portalHome(session)
  }

  return /^\/jobs(?:[/?]|$)|^\/portal\/[0-9a-f-]{36}/i.test(next)
    ? next
    : portalHome(session)
}
