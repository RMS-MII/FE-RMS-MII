import { labels } from "../api"

export function Status({ value }: { value: string }) {
  const tone = [
    "Accepted",
    "Prioritized",
    "Considered",
    "AcceptedByCandidate",
    "Submitted",
  ].includes(value)
    ? "positive"
    : value === "AcceptedByInterviewer"
      ? "attention"
      : ["InProcess", "InProgress"].includes(value)
        ? "active"
        : ""
  return (
    <span className={`status ${tone}`}>
      {labels[value] || "Status unavailable"}
    </span>
  )
}
