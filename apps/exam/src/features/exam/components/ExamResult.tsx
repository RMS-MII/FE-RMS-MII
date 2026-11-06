import { CheckCircle2, Clock3, FileCheck2, UserRound } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Brand } from "./Brand"
import type { SubmitTestResult } from "../types"
import { formatDateTime, formatStageStatus } from "../utils"

interface ExamResultProps {
  result: SubmitTestResult
  candidateName: string
}

export function ExamResult({ result, candidateName }: ExamResultProps) {
  const submittedAt = formatDateTime(
    result.completedAt ?? result.serverTimeUtc
  )

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-linear-to-b from-emerald-500/8 via-emerald-500/[0.02] to-transparent"
      />

      <header className="relative mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
        <Brand />
        <Badge variant="outline" className="h-7 rounded-full px-3 text-[11px]">
          Portal Kandidat
        </Badge>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 pb-16 sm:px-8">
        <Card className="w-full max-w-lg gap-0 overflow-hidden py-0 text-center ring-border/70">
          <CardContent className="flex flex-col items-center px-6 py-9 sm:px-8 sm:py-10">
            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>

            <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Jawaban berhasil dikirim
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Terima kasih,{" "}
              <span className="font-medium text-foreground">
                {candidateName}
              </span>
              . Jawaban Anda sudah kami terima dan akan diproses oleh tim
              rekrutmen.
            </p>

            <div className="mt-7 w-full space-y-3 rounded-xl border bg-muted/30 p-4 text-left">
              <div className="flex items-start justify-between gap-4">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileCheck2 className="size-3.5 shrink-0" />
                  Tahap
                </span>
                <span className="text-right text-xs font-semibold text-foreground">
                  {result.stageName}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserRound className="size-3.5 shrink-0" />
                  Status
                </span>
                <Badge
                  variant="outline"
                  className="border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700"
                >
                  {formatStageStatus(result.status)}
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock3 className="size-3.5 shrink-0" />
                  Dikirim pada
                </span>
                <span className="text-right text-xs font-semibold text-foreground">
                  {submittedAt}
                </span>
              </div>
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
              Anda dapat menutup halaman ini. Hasil seleksi akan diinformasikan
              lebih lanjut oleh tim rekrutmen melalui email.
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="relative pb-6 text-center text-[11px] text-muted-foreground">
        © 2026 PT Mitra Integrasi Informatika
      </footer>
    </div>
  )
}
