import type { ReactNode } from "react"
import {
  AlertTriangle,
  CalendarX2,
  Clock3,
  Link2Off,
  RefreshCw,
  ServerCrash,
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { Brand } from "./Brand"

function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-linear-to-b from-primary/5 to-transparent"
      />
      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Brand />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
        {children}
      </main>
      <footer className="relative px-5 pb-6 text-center text-[11px] text-muted-foreground sm:px-8">
        © 2026 PT Mitra Integrasi Informatika
      </footer>
    </div>
  )
}

export function ExamLoading() {
  return (
    <ScreenShell>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border bg-card shadow-sm">
          <Spinner className="size-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold">Memuat soal tes</p>
          <p className="text-sm text-muted-foreground">
            Mohon tunggu sebentar, kami sedang menyiapkan tes Anda.
          </p>
        </div>
      </div>
    </ScreenShell>
  )
}

interface MessageScreenProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

function MessageScreen({
  icon,
  title,
  description,
  action,
}: MessageScreenProps) {
  return (
    <ScreenShell>
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted text-foreground">
          {icon}
        </div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </ScreenShell>
  )
}

export function ExamInvalidLinkScreen() {
  return (
    <MessageScreen
      icon={<Link2Off className="size-6" />}
      title="Link tes tidak valid"
      description="Link yang Anda buka tidak lengkap atau sudah tidak dikenali. Pastikan Anda membuka link undangan tes secara utuh dari email atau pesan dari tim rekrutmen."
    />
  )
}

export function ExamLoadErrorScreen({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry: () => void
}) {
  return (
    <MessageScreen
      icon={<ServerCrash className="size-6" />}
      title={title}
      description={description}
      action={
        <Button onClick={onRetry} className="h-10 rounded-full px-5">
          <RefreshCw className="size-4" />
          Coba Lagi
        </Button>
      }
    />
  )
}

export function ExamExpiredScreen({ deadline }: { deadline: string }) {
  return (
    <MessageScreen
      icon={<CalendarX2 className="size-6" />}
      title="Waktu tes sudah berakhir"
      description={`Batas waktu pengerjaan tes ini adalah ${deadline}. Anda tidak dapat lagi mengakses atau mengumpulkan jawaban. Silakan hubungi tim rekrutmen jika membutuhkan bantuan.`}
    />
  )
}

export function ExamNotStartedScreen({ startedAt }: { startedAt: string }) {
  return (
    <MessageScreen
      icon={<Clock3 className="size-6" />}
      title="Tes belum dimulai"
      description={`Tes ini dijadwalkan mulai pada ${startedAt}. Silakan kembali lagi pada waktu tersebut.`}
    />
  )
}

export function ExamSubmissionErrorScreen({
  description,
  onRetry,
}: {
  description: string
  onRetry: () => void
}) {
  return (
    <MessageScreen
      icon={<AlertTriangle className="size-6" />}
      title="Waktu habis, jawaban belum terkirim"
      description={description}
      action={
        <Button onClick={onRetry} className="h-10 rounded-full px-5">
          <RefreshCw className="size-4" />
          Kirim Ulang Jawaban
        </Button>
      }
    />
  )
}
