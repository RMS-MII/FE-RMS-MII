import { createFileRoute } from "@tanstack/react-router"
import { MyInterviewsPage } from "@/features/interviews"

export const Route = createFileRoute("/_auth/interviews/")({
  component: MyInterviewsPage,
})

