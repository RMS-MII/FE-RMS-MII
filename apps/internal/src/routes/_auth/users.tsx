import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/users")({
  component: UsersPage,
})

function UsersPage() {
  return (
    <div className="min-h-[400px]">
      {/* Content placeholder */}
    </div>
  )
}

