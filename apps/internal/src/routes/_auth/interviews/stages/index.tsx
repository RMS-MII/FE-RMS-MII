import { createFileRoute } from "@tanstack/react-router"
import { StageInvitationsPage } from "@/features/interviews"

export const Route = createFileRoute("/_auth/interviews/stages/")({
  component: StageInvitationsPage,
})

