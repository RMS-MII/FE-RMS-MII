import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Clock3,
  Info,
  ListChecks,
  Play,
  ShieldCheck,
  Timer,
  UserRound,
} from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardFooter } from "@workspace/ui/components/card"
import type { CandidateTest } from "../types"
import {
  formatCountdown,
  formatDateTime,
  parseTimeSpanToMs,
} from "../utils"
import { Brand } from "./Brand"

interface ExamIntroProps {
  test: CandidateTest
  remainingMs: number | null
  onStart: () => void
}

const RULES = [
  "Pilih jawaban yang paling menggambarkan diri Anda. Tidak ada jawaban yang benar atau salah.",
  "Jawaban dapat diubah kapan saja sebelum Anda menekan tombol kumpulkan.",
  "Waktu berjalan otomatis setelah Anda memulai tes.",
  "Jawaban tersimpan sementara di perangkat ini, sehingga aman jika halaman ter-refresh.",
  "Pastikan koneksi internet stabil dan jangan menutup halaman sebelum tes selesai.",
]

export function ExamIntro({ test, remainingMs, onStart }: ExamIntroProps) {
  const questionCount = test.totalQuestions || test.questions.length
  const durationMs = parseTimeSpanToMs(test.durationTest)
  const durationLabel =
    durationMs === null ? "Sesuai jadwal" : formatCountdown(durationMs)

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-linear-to-b from-primary/5 via-primary/[0.02] to-transparent"
      />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <Brand />
        <Badge variant="outline" className="h-7 rounded-full px-3 text-[11px]">
          Portal Kandidat
        </Badge>
      </header>

      <main className="relative mx-auto grid w-full max-w-5xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
        <section className="space-y-5">
          <Card className="gap-0 overflow-hidden py-0 ring-border/70">
            <div className="border-b bg-muted/30 px-6 py-7 sm:px-8">
              <Badge className="mb-4 rounded-full px-3 py-1 text-[11px] tracking-wide">
                Tes Online
              </Badge>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {test.stageName}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Anda diundang untuk mengerjakan tahap{" "}
                <span className="font-medium text-foreground">
                  {test.stageTypeName}
                </span>
                . Baca petunjuk di bawah ini sebelum memulai pengerjaan.
              </p>
            </div>

            <CardContent className="space-y-7 px-6 py-7 sm:px-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <ClipboardList className="size-3.5" />
                    Jumlah Soal
                  </div>
                  <p className="text-sm font-semibold">{questionCount} soal</p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <CalendarClock className="size-3.5" />
                    Batas Waktu
                  </div>
                  <p className="text-sm leading-snug font-semibold">
                    {formatDateTime(test.endAt)}
                  </p>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <Timer className="size-3.5" />
                    Durasi
                  </div>
                  <p className="text-sm font-semibold">{durationLabel}</p>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-center gap-2">
                  <ListChecks className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold">Sebelum dimulai</h2>
                </div>
                <ul className="space-y-3">
                  {RULES.map((rule, index) => (
                    <li
                      key={rule}
                      className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {index + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {test.isAttempts ? (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <p className="leading-relaxed">
                    Sistem mendeteksi riwayat percobaan sebelumnya pada tahap
                    ini. Pastikan Anda mengerjakan tes dengan sungguh-sungguh.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              Data dan jawaban Anda hanya digunakan untuk keperluan proses
              seleksi dan akan diperlakukan secara rahasia.
            </p>
          </div>
        </section>

        <aside className="lg:sticky lg:top-6">
          <Card className="gap-0 overflow-hidden py-0 ring-border/70">
            <div className="border-b bg-muted/30 px-5 py-4">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Peserta
              </p>
            </div>

            <CardContent className="space-y-5 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {test.candidateName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {test.stageTypeName}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Sisa waktu
                  </span>
                  <span className="font-semibold tabular-nums">
                    {remainingMs === null
                      ? "Tanpa batas"
                      : formatCountdown(remainingMs)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">Total soal</span>
                  <span className="font-semibold">{questionCount}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-col items-stretch gap-3 border-t bg-muted/40 px-5 py-5">
              <Button
                size="lg"
                className="h-11 w-full rounded-full text-sm font-semibold"
                onClick={onStart}
                disabled={remainingMs !== null && remainingMs <= 0}
              >
                <Play className="size-4" />
                Mulai Tes
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                Dengan menekan tombol di atas, waktu pengerjaan mulai berjalan.
              </p>
            </CardFooter>
          </Card>
        </aside>
      </main>

      <footer className="relative pb-6 text-center text-[11px] text-muted-foreground">
        © 2026 PT Mitra Integrasi Informatika
      </footer>
    </div>
  )
}
