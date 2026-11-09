export const route = window.location.pathname.match(
  /^\/portal\/([0-9a-f-]{36})(?:\/sessions\/([0-9a-f-]{36})(\/submission)?|\/(interviews|assignments))?\/?$/i
)

export const candidateId = route?.[1] || ""

export const prefix = `/portal/${candidateId}`

export const portalPage = route?.[4] || "overview"
export const pageTitle = route?.[2]
  ? "Detail interview"
  : portalPage === "interviews"
    ? "Jadwal interview"
    : portalPage === "assignments"
      ? "Tugas take-home"
      : "Ringkasan"
