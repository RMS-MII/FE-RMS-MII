import { Link } from "@tanstack/react-router"
import { User, ArrowRightLeft } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/store"
import { setRole } from "@/features/auth"
import type { UserRole } from "@/features/auth"

export function AppHeader() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const currentRole = user?.role ?? "HR"

  const toggleRole = () => {
    const nextRole: UserRole = currentRole === "HR" ? "Interviewer" : "HR"
    dispatch(setRole(nextRole))
  }

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Breadcrumb info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          Sistem Manajemen Rekrutmen
        </span>
      </div>

      {/* User profile & preview controls */}
      <div className="flex items-center gap-4">
        {/* Role switcher untuk kemudahan peninjauan UI */}
        <div className="flex items-center gap-2 bg-secondary px-2.5 py-1 rounded-md text-xs">
          <span className="text-muted-foreground">Mode UI:</span>
          <span className="font-semibold text-accent-foreground">
            {currentRole}
          </span>
          <button
            type="button"
            onClick={toggleRole}
            className="flex items-center gap-1 ml-1 text-primary hover:underline font-medium"
            title="Ganti peran untuk melihat perbedaan tampilan"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Ganti ({currentRole === "HR" ? "Interviewer" : "HR"})</span>
          </button>
        </div>

        <div className="h-4 w-px bg-border" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-accent-foreground text-xs font-semibold">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium leading-none text-foreground">
              {user?.name ?? "Budi Santoso"}
            </p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">
              {currentRole}
            </p>
          </div>
        </div>

        {/* Link melihat halaman login preview */}
        <Link
          to="/login"
          className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
        >
          Lihat Login
        </Link>
      </div>
    </header>
  )
}
