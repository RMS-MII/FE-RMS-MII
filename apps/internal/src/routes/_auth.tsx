import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "@/shared/components/layout/AppLayout"

// Layout utama internal tanpa blokir guard agar langsung bisa dieksplorasi
export const Route = createFileRoute("/_auth")({
  component: AppLayout,
})
