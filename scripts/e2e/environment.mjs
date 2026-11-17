const databaseNamePattern = /^RmsDBTest$/i

export function getE2EConnectionString() {
  const connectionString = process.env.RMS_E2E_CONNECTION_STRING?.trim()
  if (!connectionString) {
    throw new Error(
      "Set RMS_E2E_CONNECTION_STRING to the dedicated SQL Server database RmsDBTest. The development database must not be used."
    )
  }

  const segments = connectionString
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
  const databaseSegments = segments.filter((segment) =>
    /^(database|initial catalog)\s*=/i.test(segment)
  )

  if (databaseSegments.length !== 1) {
    throw new Error(
      "RMS_E2E_CONNECTION_STRING must contain exactly one Database or Initial Catalog value."
    )
  }

  const databaseName = databaseSegments[0].slice(databaseSegments[0].indexOf("=") + 1).trim()
  if (!databaseNamePattern.test(databaseName)) {
    throw new Error(
      `Refusing to use database '${databaseName}'. E2E tests may only use RmsDBTest.`
    )
  }

  return connectionString
}

export const e2eUrls = Object.freeze({
  internal: "http://localhost:5183",
  exam: "http://localhost:5184",
  candidate: "http://localhost:5185",
  api: "http://localhost:5161",
  smtp4dev: "http://localhost:5000",
})

export function apiEnvironment(connectionString) {
  return {
    ASPNETCORE_ENVIRONMENT: "Development",
    ASPNETCORE_URLS: e2eUrls.api,
    ConnectionStrings__RmsDB: connectionString,
    Seed__ResetToCheckpointOnStartup: "false",
    MailSettings__Host: "localhost",
    MailSettings__Port: "2525",
    MailSettings__Security: "none",
    App__CandidatePortalUrl: e2eUrls.candidate,
    Cors__AllowedOrigins__0: e2eUrls.internal,
    Cors__AllowedOrigins__1: e2eUrls.exam,
    Cors__AllowedOrigins__2: e2eUrls.candidate,
  }
}
