export function applicationTags(applicationId?: string, batchId?: string) {
  return [
    {
      type: "Candidate" as const,
      id: applicationId
        ? `APPLICATION_${applicationId}`
        : "APPLICATION_DETAILS",
    },
    { type: "Candidate" as const, id: "LIST" },
    ...(batchId
      ? [{ type: "Candidate" as const, id: `BATCH_${batchId}` }]
      : []),
    { type: "Recruitment" as const, id: "LIST" },
    ...(batchId ? [{ type: "Recruitment" as const, id: batchId }] : []),
    { type: "Interview" as const, id: "LIST" },
    { type: "Evaluation" as const, id: "LIST" },
    { type: "OfferingLetter" as const, id: "LIST" },
  ]
}
