import { cn } from "@workspace/ui/lib/utils"
import type { CandidateTestQuestion, ExamAnswers } from "../types"

interface QuestionNavigatorProps {
  questions: CandidateTestQuestion[]
  answers: ExamAnswers
  currentIndex: number
  disabled?: boolean
  onSelect: (index: number) => void
}

function LegendDot({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-2.5 rounded-[3px] border", className)}
    />
  )
}

export function QuestionNavigator({
  questions,
  answers,
  currentIndex,
  disabled = false,
  onSelect,
}: QuestionNavigatorProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
        {questions.map((question, index) => {
          const answered = (answers[question.id]?.length ?? 0) > 0
          const current = index === currentIndex

          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onSelect(index)}
              disabled={disabled}
              aria-label={`Soal ${index + 1}, ${
                answered ? "sudah dijawab" : "belum dijawab"
              }${current ? ", sedang dikerjakan" : ""}`}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border text-sm font-semibold transition-all",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                current &&
                  "border-primary bg-primary/10 text-primary ring-2 ring-primary/25",
                !current &&
                  answered &&
                  "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
                !current &&
                  !answered &&
                  "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted hover:text-foreground",
                current &&
                  answered &&
                  "border-primary bg-primary text-primary-foreground ring-2 ring-primary/25",
                disabled && "cursor-not-allowed opacity-70"
              )}
            >
              {index + 1}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <LegendDot className="border-border bg-background" />
          Belum dijawab
        </span>
        <span className="flex items-center gap-1.5">
          <LegendDot className="border-primary bg-primary" />
          Sudah dijawab
        </span>
        <span className="flex items-center gap-1.5">
          <LegendDot className="border-primary bg-primary/10 ring-2 ring-primary/25" />
          Aktif
        </span>
      </div>
    </div>
  )
}
