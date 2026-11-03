import { createFileRoute } from "@tanstack/react-router"
import { RecruitmentsListPage } from "@/features/recruitments"

export const Route = createFileRoute("/_auth/recruitments/")({
  component: RecruitmentsListPage,
})
