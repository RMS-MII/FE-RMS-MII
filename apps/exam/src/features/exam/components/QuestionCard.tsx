import { Check, Info } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import type { CandidateTestQuestion } from "../types"
import { formatQuestionType, isMultipleChoice } from "../utils"

interface QuestionCardProps {
  question: CandidateTestQuestion
  index: number
  total: number
  selectedOptionIds: string[]
  disabled: boolean
  onSelect: (optionId: string) => void
}

export function QuestionCard({
  question,
  index,
  total,
  selectedOptionIds,
  disabled,
  onSelect,
}: QuestionCardProps) {
  const multiple = isMultipleChoice(question.questionType)

  return (
    <Card className="scroll-mt-24 gap-0 overflow-hidden py-0 ring-border/70">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b bg-muted/30 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full px-3 text-[11px]">
            Soal {index + 1}
          </Badge>
          <span className="text-xs text-muted-foreground">dari {total}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {question.isRequired ? (
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/5 text-[11px] text-destructive"
            >
              Wajib dijawab
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[11px]">
              Opsional
            </Badge>
          )}
          <Badge variant="outline" className="text-[11px]">
            {formatQuestionType(question.questionType)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-6 sm:px-6 sm:py-7">
        <h2
          id={`question-${question.id}`}
          className="scroll-mt-24 font-heading text-lg leading-relaxed font-semibold tracking-tight text-foreground sm:text-xl"
        >
          {question.questionText}
        </h2>

        <div
          role={multiple ? "group" : "radiogroup"}
          aria-labelledby={`question-${question.id}`}
          className="mt-6 space-y-2.5"
        >
          {question.options.map((option) => {
            const selected = selectedOptionIds.includes(option.id)

            return (
              <button
                key={option.id}
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={selected}
                disabled={disabled}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "group flex w-full items-start gap-3.5 rounded-xl border p-3.5 text-left transition-all sm:p-4",
                  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
                  selected
                    ? "border-primary bg-primary/[0.045] shadow-[0_0_0_1px_var(--color-primary)]"
                    : "border-border bg-card hover:border-primary/35 hover:bg-muted/40",
                  disabled && "cursor-not-allowed opacity-70"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center border text-xs font-bold transition-colors",
                    multiple ? "rounded-md" : "rounded-full",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground"
                  )}
                >
                  {selected ? (
                    <Check className="size-3.5" />
                  ) : (
                    option.optionLabel
                  )}
                </span>
                <span className="flex-1 text-sm leading-relaxed text-foreground">
                  {option.optionText}
                </span>
              </button>
            )
          })}
        </div>

        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {multiple
              ? "Anda dapat memilih lebih dari satu jawaban."
              : "Pilih satu jawaban yang paling sesuai."}{" "}
            Jawaban masih dapat diubah sebelum dikumpulkan.
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
