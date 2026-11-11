const route = window.location.pathname.match(
  /^\/portal\/([0-9a-f-]{36})(?:\/sessions\/([0-9a-f-]{36})(\/submission)?|\/(interviews|assignments))?\/?$/i
)

export const candidateId = route?.[1] || ""

export const prefix = `/portal/${candidateId}`

export const interviewSessionId = route?.[3] ? "" : route?.[2] || ""
export const portalPage = route?.[3] ? "assignments" : route?.[4] || "overview"
export const submissionSessionId = route?.[3]
  ? route[2]
  : portalPage === "assignments"
    ? new URLSearchParams(window.location.search).get("session") || ""
    : ""
export const pageTitle = interviewSessionId
  ? "Detail interview"
  : portalPage === "interviews"
    ? "Jadwal interview"
    : portalPage === "assignments"
      ? "Tugas take-home"
      : "Ringkasan"
