import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, FileText, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { request } from "./api"
import type { Tasks } from "./api"
import { route, candidateId, prefix } from "./route"
import { ApplicationView } from "./components/ApplicationView"
import { SessionDetail } from "./components/SessionDetail"

export function App() {
  const [data, setData] = useState<Tasks>()

  const [error, setError] = useState("")

  const [loading, setLoading] = useState(Boolean(candidateId))

  const [selected, setSelected] = useState("")

  const controller = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    if (!candidateId) {
      setLoading(false)
      return
    }

    controller.current?.abort()
    const abort = new AbortController()
    controller.current = abort

    setLoading(true)
    setError("")

    try {
      setData(await request<Tasks>(`${prefix}/tasks`, undefined, abort.signal))
    } catch (e) {
      if (!abort.signal.aborted)
        setError(
          e instanceof Error ? e.message : "Tidak dapat terhubung ke server."
        )
    } finally {
      if (!abort.signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const abort = new AbortController()
    controller.current = abort
    if (candidateId) {
      request<Tasks>(`${prefix}/tasks`, undefined, abort.signal)
        .then(setData)
        .catch((e: unknown) => {
          if (!abort.signal.aborted)
            setError(
              e instanceof Error ? e.message : "Tidak dapat memuat portal."
            )
        })
        .finally(() => {
          if (!abort.signal.aborted) setLoading(false)
        })
    }
    const focus = () => {
      void refresh()
    }
    window.addEventListener("focus", focus)
    return () => {
      controller.current?.abort()
      window.removeEventListener("focus", focus)
    }
  }, [refresh])

  const app =
    data?.applications.find((a) => a.id === selected) || data?.applications[0]

  const session = data?.applications
    .flatMap((a) => a.stages.flatMap((s) => s.sessions))
    .find((s) => s.id === route?.[2])

  return (
    <div className="portal">
      <header className="portal-header">
        <a href={prefix} className="brand">
          <span className="brand-mark">M</span>
          <span>
            METRODATA<small>Recruitment · MII</small>
          </span>
        </a>
        <span className="portal-label">PORTAL KANDIDAT</span>
      </header>

      <main className="portal-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">REKRUTMEN / KANDIDAT</p>
            <h1>
              {route?.[2]
                ? "Detail interview"
                : data
                  ? `Halo, ${data.candidateName.split(" ")[0]}.`
                  : "Perjalanan karier Anda"}
            </h1>
            <p className="muted">
              {route?.[2]
                ? "Tinjau jadwal dan persiapkan langkah berikutnya."
                : "Pantau proses seleksi dan kelola jadwal Anda di sini."}
            </p>
          </div>
          {candidateId && (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => void refresh()}
            >
              <RefreshCw size={15} /> Perbarui
            </Button>
          )}
        </div>

        {!candidateId ? (
          <div className="panel empty">
            <FileText />
            <h2>Buka tautan undangan Anda</h2>
            <p>Gunakan tautan portal yang dikirimkan tim HR melalui email.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="notice error" role="alert">
                {error}{" "}
                <button onClick={() => void refresh()}>Coba lagi</button>
              </div>
            )}

            {loading && !data && (
              <div className="panel empty" role="status">
                Memuat informasi rekrutmen…
              </div>
            )}

            {data &&
              (route?.[2] ? (
                session ? (
                  <>
                    <a className="back" href={prefix}>
                      <ArrowLeft size={16} /> Semua lamaran
                    </a>
                    <SessionDetail
                      key={session.id}
                      session={session}
                      refresh={refresh}
                    />
                  </>
                ) : (
                  <div className="panel empty">
                    <h2>Jadwal tidak ditemukan</h2>
                    <a href={prefix}>Kembali ke lamaran</a>
                  </div>
                )
              ) : (
                <div className="portal-grid">
                  <aside>
                    <div className="panel profile">
                      <div className="avatar">
                        {data.candidateName.slice(0, 1)}
                      </div>
                      <h2>{data.candidateName}</h2>
                      <p className="muted email">{data.candidateEmail}</p>
                      <div className="divider" />
                      <p className="eyebrow">
                        LAMARAN ANDA <span>{data.applications.length}</span>
                      </p>
                      <nav aria-label="Pilih lamaran">
                        {data.applications.map((a) => (
                          <button
                            className={`application-choice ${a.id === app?.id ? "selected" : ""}`}
                            key={a.id}
                            onClick={() => setSelected(a.id)}
                          >
                            <span>
                              <strong>{a.batchName}</strong>
                              <small>{a.codeApplication}</small>
                            </span>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </nav>
                    </div>
                    <p className="side-note">
                      Butuh bantuan?
                      <br />
                      Hubungi tim HR melalui email undangan yang Anda terima.
                    </p>
                  </aside>
                  <section>
                    {app ? (
                      <ApplicationView application={app} />
                    ) : (
                      <div className="panel empty">
                        <h2>Belum ada lamaran</h2>
                        <p>
                          Informasi seleksi akan tampil setelah didaftarkan oleh
                          tim HR.
                        </p>
                      </div>
                    )}
                  </section>
                </div>
              ))}
          </>
        )}
      </main>
      <footer className="portal-footer">
        © {new Date().getFullYear()} PT Mitra Integrasi Informatika{" "}
        <span>Recruitment Management System</span>
      </footer>
    </div>
  )
}
