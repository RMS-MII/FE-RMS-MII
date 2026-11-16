export function signInLink(
  next = window.location.pathname + window.location.search
) {
  return `/login?${new URLSearchParams({ next })}`
}

export function redirectToSignIn() {
  if (window.location.pathname !== "/login") {
    window.location.assign(signInLink())
  }
}

export function requiresCandidateSession(path: string) {
  return (
    /^\/portal\/[0-9a-f-]{36}(?:\/|$)/i.test(path) ||
    /^\/portal\/jobs\/[0-9a-f-]{36}\/applications$/i.test(path) ||
    path === "/portal/session/profile"
  )
}
