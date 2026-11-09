import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, FileText, RefreshCw } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { request } from "./api"
import type { Tasks } from "./api"
import { route, candidateId, prefix, portalPage, pageTitle } from "./route"
import { PortalShell } from "./components/PortalShell"
import { ApplicationView } from "./components/ApplicationView"
import { SessionList } from "./components/SessionList"
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
    <PortalShell data={data} selected={app?.id} onSelect={setSelected}>
      <main className="portal-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">LAMARAN SAYA</p>
            <h1>
              {route?.[2]
                ? "Detail interview"
                : portalPage !== "overview"
                  ? pageTitle
                  : data
                    ? `Halo, ${data.candidateName.split(" ")[0]}.`
                    : "Perjalanan karier Anda"}
            </h1>
            <p className="muted">
              {route?.[2]
                ? "Tinjau jadwal dan persiapkan langkah berikutnya."
                : portalPage === "interviews"
                  ? "Lihat jadwal dan kelola kehadiran interview Anda."
                  : portalPage === "assignments"
                    ? "Pantau batas pengumpulan dan kirim tautan hasil tugas Anda."
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
                Memuat informasi rekrutmenâ€¦
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
                <div id="overview">
                  <section>
                    {app ? (
                      portalPage === "overview" ? (
                        <ApplicationView application={app} />
                      ) : (
                        <SessionList
                          application={app}
                          assignments={portalPage === "assignments"}
                        />
                      )
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
    </PortalShell>
  )
}
