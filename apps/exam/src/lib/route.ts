export interface ExamRouteParams {
  kind: "test"
  candidateId: string
  stageId: string
}

export interface PortalRouteParams {
  kind: "portal"
  candidateId: string
}

export type AppRoute = ExamRouteParams | PortalRouteParams

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}

export function parseAppRoute(pathname: string): AppRoute | null {
  const testMatch = pathname.match(
    /^\/portal\/([^/]+)\/stages\/([^/]+)\/test\/?$/i
  )

  if (testMatch) {
    const candidateId = decodeURIComponent(testMatch[1])
    const stageId = decodeURIComponent(testMatch[2])

    if (!isUuid(candidateId) || !isUuid(stageId)) {
      return null
    }

    return { kind: "test", candidateId, stageId }
  }

  const portalMatch = pathname.match(/^\/portal\/([^/]+)\/?$/i)

  if (portalMatch) {
    const candidateId = decodeURIComponent(portalMatch[1])

    if (!isUuid(candidateId)) {
      return null
    }

    return { kind: "portal", candidateId }
  }

  return null
}
