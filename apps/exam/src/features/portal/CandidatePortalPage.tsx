import { useEffect, useState } from "react"
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Play,
  Video,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Spinner } from "@workspace/ui/components/spinner"
import { ApiError } from "@/features/exam/api"
import { Brand } from "@/features/exam/components/Brand"
import { ExamLoadErrorScreen } from "@/features/exam/components/ExamStateScreens"
import { formatDateTime, formatStageStatus } from "@/features/exam/utils"
import { getCandidateTasks } from "./api"
import type {
  CandidateApplicationTask,
  CandidateStageTask,
  CandidateTasks,
  StatusValue,
} from "./types"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline"

interface PortalPageProps {
  candidateId: string
}

function useCandidateTasks(candidateId: string) {
  const [data, setData] = useState<CandidateTasks | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    getCandidateTasks(candidateId, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) {
          setData(response)
        }
      })
      .catch((failure: unknown) => {
        if (!controller.signal.aborted) {
          setError(failure)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [candidateId, reloadToken])

  return {
    data,
    error,
    loading,
    reload: () => setReloadToken((current) => current + 1),
  }
}

function statusVariant(status: StatusValue): BadgeVariant {
  switch (String(status)) {
    case "Rejected":
    case "Dropped":
    case "Expired":
      return "destructive"
    case "InProgress":
    case "Accepted":
      return "default"
    case "Submitted":
    case "Prioritized":
    case "Considered":
      return "secondary"
    default:
      return "outline"
  }
}

function formatApplicationStatus(status: StatusValue) {
  const labels: Record<string, string> = {
    InProcess: "Sedang Diproses",
    Rejected: "Tidak Lolos",
    Dropped: "Mengundurkan Diri",
    Accepted: "Diterima",
  }

  return labels[String(status)] ?? String(status)
}

function isTestStage(stage: CandidateStageTask) {
  return stage.stageCategory === "Test" || stage.stageCategory === 1
}

function getPortalErrorContent(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return {
        title: "Data kandidat tidak ditemukan",
        description:
          "Link portal tidak valid atau data kandidat sudah tidak tersedia. Silakan hubungi tim rekrutmen.",
      }
    }

    return {
      title: "Gagal memuat portal kandidat",
      description:
        error.detail ??
        error.title ??
        "Terjadi kesalahan saat memuat data. Silakan coba lagi.",
    }
  }

  return {
    title: "Tidak dapat terhubung ke server",
    description: "Periksa koneksi internet Anda, lalu tekan tombol coba lagi.",
  }
}

function PortalLoading() {
  return (
    <div className="relative flex min-h-svh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-6 sm:px-8">
        <Brand />
        <Badge variant="outline" className="h-7 rounded-full px-3 text-[11px]">
          Portal Kandidat
        </Badge>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 pb-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner className="size-6 text-primary" />
          <div className="space-y-1">
            <p className="text-base font-semibold">Memuat portal kandidat</p>
            <p className="text-sm text-muted-foreground">
              Mohon tunggu sebentar, kami sedang menyiapkan data Anda.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

function StageAction({
  candidateId,
  stage,
}: {
  candidateId: string
  stage: CandidateStageTask
}) {
  const status = String(stage.status)

  if (stage.canTakeTest) {
    return (
      <a
        href={`/portal/${candidateId}/stages/${stage.applicationStageId}/test`}
        className={buttonVariants({
          size: "lg",
          className: "h-10 shrink-0 rounded-full px-5 text-sm font-semibold",
        })}
      >
        <Play className="size-4" />
        Mulai Tes
        <ArrowRight className="size-4" />
      </a>
    )
  }

  if (!isTestStage(stage)) {
    return null
  }

  const message =
    status === "Submitted"
      ? "Tes sudah dikirim"
      : status === "Expired"
        ? "Tes kedaluwarsa"
        : status === "InProgress"
          ? "Tes belum tersedia"
          : null

  if (!message) {
    return null
  }

  return (
    <p className="shrink-0 text-xs font-medium text-muted-foreground">
      {message}
    </p>
  )
}

function StageRow({
  candidateId,
  index,
  stage,
}: {
  candidateId: string
  index: number
  stage: CandidateStageTask
}) {
  const testStage = isTestStage(stage)

  return (
    <div className="flex flex-col gap-4 border-b px-6 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
          {index + 1}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">{stage.stageName}</p>
            <Badge variant={statusVariant(stage.status)}>
              {formatStageStatus(stage.status)}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {stage.stageTypeName}
            {testStage ? " · Tes Online" : ""}
          </p>
          {testStage ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              <span>Batas waktu: {formatDateTime(stage.endAt)}</span>
            </p>
          ) : null}
          {stage.sessions.length > 0 ? (
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
              <Video className="size-3.5" />
              <span>
                Jadwal wawancara:{" "}
                {formatDateTime(stage.sessions[0].scheduledStart)}
              </span>
            </p>
          ) : null}
        </div>
      </div>

      <StageAction candidateId={candidateId} stage={stage} />
    </div>
  )
}

function ApplicationCard({
  application,
  candidateId,
}: {
  application: CandidateApplicationTask
  candidateId: string
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0 ring-border/70">
      <div className="border-b bg-muted/30 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {application.codeApplication}
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold tracking-tight">
              {application.batchName}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {application.departmentName}
            </p>
          </div>
          <Badge variant={statusVariant(application.status)}>
            {formatApplicationStatus(application.status)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-0">
        {application.stages.length === 0 ? (
          <p className="px-6 py-6 text-sm text-muted-foreground">
            Belum ada tahapan yang dijadwalkan.
          </p>
        ) : (
          application.stages.map((stage, index) => (
            <StageRow
              key={stage.applicationStageId}
              candidateId={candidateId}
              index={index}
              stage={stage}
            />
          ))
        )}
      </CardContent>
    </Card>
  )
}

function EmptyApplications() {
  return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <ClipboardList className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 text-sm font-semibold">
        Belum ada tahapan rekrutmen
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Saat ini belum ada tahapan yang perlu Anda kerjakan. Silakan cek kembali
        nanti.
      </p>
    </div>
  )
}

export function CandidatePortalPage({ candidateId }: PortalPageProps) {
  const { data, error, loading, reload } = useCandidateTasks(candidateId)

  useEffect(() => {
    document.title = "Portal Kandidat - Tes Online"

    return () => {
      document.title = "Tes Online | Metrodata"
    }
  }, [])

  if (loading && !data) {
    return <PortalLoading />
  }

  if (error && !data) {
    const content = getPortalErrorContent(error)

    return (
      <ExamLoadErrorScreen
        title={content.title}
        description={content.description}
        onRetry={reload}
      />
    )
  }

  if (!data) {
    return <PortalLoading />
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b from-primary/5 via-primary/[0.02] to-transparent"
      />

      <header className="relative mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Brand />
        <Badge variant="outline" className="h-7 rounded-full px-3 text-[11px]">
          Portal Kandidat
        </Badge>
      </header>

      <main className="relative mx-auto w-full max-w-4xl px-5 pb-16 sm:px-8">
        <section className="mb-7">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Selamat datang
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            Halo, {data.candidateName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Berikut daftar tahapan rekrutmen Anda. Buka tes yang tersedia di
            bawah ini sebelum batas waktunya berakhir.
          </p>
        </section>

        {data.applications.length === 0 ? (
          <EmptyApplications />
        ) : (
          <div className="space-y-5">
            {data.applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                candidateId={candidateId}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="relative pb-6 text-center text-[11px] text-muted-foreground">
        © 2026 PT Mitra Integrasi Informatika
      </footer>
    </div>
  )
}
