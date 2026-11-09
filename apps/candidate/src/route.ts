export const route = window.location.pathname.match(
  /^\/portal\/([0-9a-f-]{36})(?:\/sessions\/([0-9a-f-]{36})(\/submission)?)?\/?$/i
)

export const candidateId = route?.[1] || ""

export const prefix = `/portal/${candidateId}`
