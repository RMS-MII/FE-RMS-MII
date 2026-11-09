export interface ApiProblem {
  status: number | string | null
  kind: "forbidden" | "conflict" | "business-rule" | "validation" | "other"
  message: string
  fieldErrors: Record<string, string[]>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function getApiError(
  error: unknown,
  fallback = "The request failed. Please try again."
): ApiProblem {
  const source = isRecord(error) ? error : {}
  const data = isRecord(source.data) ? source.data : {}
  const status =
    typeof source.status === "number" || typeof source.status === "string"
      ? source.status
      : null
  const fieldErrors: Record<string, string[]> = {}
  if (isRecord(data.errors)) {
    for (const [field, messages] of Object.entries(data.errors)) {
      const values = Array.isArray(messages) ? messages : [messages]
      fieldErrors[field] = values.filter(
        (message): message is string => typeof message === "string"
      )
    }
  }
  const defaults: Record<number, string> = {
    403: "You do not have permission to perform this action.",
    409: "This action conflicts with the latest data. Refresh and try again.",
    422: "This action does not meet the current requirements.",
  }
  const detail = typeof data.detail === "string" ? data.detail : undefined
  const title = typeof data.title === "string" ? data.title : undefined
  return {
    status,
    kind:
      status === 403
        ? "forbidden"
        : status === 409
          ? "conflict"
          : status === 422
            ? "business-rule"
            : Object.keys(fieldErrors).length > 0
              ? "validation"
              : "other",
    message:
      detail ||
      Object.values(fieldErrors).flat()[0] ||
      title ||
      (typeof status === "number" && defaults[status]) ||
      (error instanceof Error ? error.message : fallback),
    fieldErrors,
  }
}
