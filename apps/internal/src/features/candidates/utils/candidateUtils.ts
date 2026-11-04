import type { Candidate, CandidateSortKey } from "../types"

export function filterCandidates(
  list: Candidate[],
  search = "",
  gender = "all",
  batchStatus = "all"
): Candidate[] {
  let result = [...list]

  if (gender && gender !== "all") {
    result = result.filter(
      (c) => c.gender?.toLowerCase() === gender.toLowerCase()
    )
  }

  if (batchStatus === "applied") {
    result = result.filter((c) => c.appliedBatchCount > 0)
  } else if (batchStatus === "pool") {
    result = result.filter((c) => c.appliedBatchCount === 0)
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase()
    result = result.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phoneNumber && c.phoneNumber.includes(q)) ||
        (c.institution && c.institution.toLowerCase().includes(q)) ||
        (c.education && c.education.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
    )
  }

  return result
}

export function sortCandidates(
  list: Candidate[],
  sortKey: CandidateSortKey = "createdAt",
  order: "asc" | "desc" = "desc"
): Candidate[] {
  return [...list].sort((a, b) => {
    let comparison = 0

    switch (sortKey) {
      case "name":
        comparison = a.fullName.localeCompare(b.fullName)
        break
      case "education":
        comparison = (a.institution || "").localeCompare(b.institution || "")
        break
      case "gpa":
        comparison = Number(a.gpa || 0) - Number(b.gpa || 0)
        break
      case "salary":
        comparison = (a.expectedSalary || 0) - (b.expectedSalary || 0)
        break
      case "batches":
        comparison = a.appliedBatchCount - b.appliedBatchCount
        break
      case "createdAt":
      default:
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }

    return order === "asc" ? comparison : -comparison
  })
}

