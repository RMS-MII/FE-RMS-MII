const candidatePortalBaseUrl =
  import.meta.env.VITE_CANDIDATE_PORTAL_URL || "http://localhost:5175"

export function candidatePortalUrl(path: string) {
  return new URL(path, candidatePortalBaseUrl).href
}
