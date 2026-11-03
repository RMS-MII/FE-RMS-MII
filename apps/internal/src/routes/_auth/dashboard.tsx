import { createFileRoute } from "@tanstack/react-router"
import { useAppSelector } from "@/app/store"

export const Route = createFileRoute("/_auth/dashboard")({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ringkasan proses rekrutmen dan penugasan aktif Anda.
        </p>
      </div>

      {/* Perlu Tindakan Panel */}
      <section className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">
            Perlu tindakan
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            3 item menunggu
          </span>
        </div>

        <div className="border border-border rounded-md overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-secondary text-accent-foreground text-xs font-medium border-b border-border">
              <tr>
                <th className="px-4 py-2.5">Aktivitas</th>
                <th className="px-4 py-2.5">Kandidat</th>
                <th className="px-4 py-2.5">Posisi</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  Evaluasi belum diisi
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Ahmad Fauzi
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  .NET Developer 2026
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Isi evaluasi
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  Wawancara belum ada interviewer
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Siti Rahma
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  Data Analyst
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Tugaskan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Tahapan Rekrutmen Aktif */}
      <section className="bg-card border border-border rounded-lg p-5">
        <h2 className="text-base font-semibold text-foreground mb-3">
          Rekrutmen berjalan
        </h2>
        <p className="text-sm text-muted-foreground">
          Mode: {user?.role ?? "HR"}. Pipeline dan status rekrutmen akan dimuat di sini.
        </p>
      </section>
    </div>
  )
}

