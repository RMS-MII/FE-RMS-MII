import { labels } from "../api"
export function Status({ value }: { value: string }) {
  return (
    <span
      className={`status ${["Accepted", "Prioritized", "Considered", "AcceptedByCandidate", "Submitted"].includes(value) ? "positive" : ""}`}
    >
      {labels[value] || value}
    </span>
  )
}
