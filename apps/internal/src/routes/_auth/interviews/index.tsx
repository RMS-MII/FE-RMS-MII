import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/interviews/")({
  beforeLoad: () => {
    throw redirect({ to: "/interviews/stages" })
  },
})

