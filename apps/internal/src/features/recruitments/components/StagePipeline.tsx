import { Check, X } from "lucide-react"
import { CreateButton } from "@/shared/components"
import { cn } from "@/shared/lib/utils"
import type { PipelineItem, StageState } from "../types"

const stateLabel: Record<StageState, string> = {
  done: "Completed",
  current: "Running",
  upcoming: "Upcoming",
  halted: "Halted",
}

const segmentStyles: Record<StageState, string> = {
  done: "bg-[#DCE3F0] text-[#113576]",
  current: "bg-primary text-primary-foreground font-medium",
  upcoming: "bg-muted text-muted-foreground",
  halted: "bg-destructive/10 text-destructive",
}

export interface StagePipelineProps {
  items: PipelineItem[]
  label?: string
  size?: "full" | "compact"
  onSelect?: (index: number) => void
  selected?: number | null
  className?: string
  onCreateStage?: () => void
}

function Marker({ state, index }: { state: StageState; index: number }) {
  if (state === "done") {
    return <Check className="size-3.5 shrink-0 stroke-[2.5]" aria-hidden />
  }
  if (state === "halted") {
    return <X className="size-3.5 shrink-0 stroke-[2.5]" aria-hidden />
  }
  return <span className="shrink-0 tabular-nums opacity-85 font-semibold">{index + 1}</span>
}


export function StagePipeline({
  items,
  label = "Recruitment stages",
  size = "full",
  onSelect,
  selected = null,
  className,
  onCreateStage,
}: StagePipelineProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-dashed border-border bg-card/60 px-5 py-4 text-center sm:text-left",
          className
        )}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            No selection stages configured yet
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stages define the sequential selection pipeline for candidate progression.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateButton onClick={onCreateStage}>
            Configure Stage
          </CreateButton>
        </div>
      </div>
    )
  }

  const compact = size === "compact"
  const lastIndex = items.length - 1

  const renderContent = (it: PipelineItem, i: number) => (
    <>
      <span
        className={cn(
          "flex min-w-0 items-center gap-1.5 font-medium",
          compact ? "text-xs" : "text-sm"
        )}
      >
        <Marker state={it.state} index={i} />
        <span className="truncate">{it.name}</span>
      </span>
      {it.count !== undefined && (
        <span
          className={cn(
            "tabular-nums",
            compact ? "text-sm font-semibold" : "mt-0.5 text-xl font-semibold"
          )}
        >
          {it.count}
          {!compact && (
            <span className="ml-1 text-xs font-normal opacity-80">candidates</span>
          )}
        </span>
      )}
      {it.note && (
        <span className={cn("truncate text-xs", !compact && "mt-0.5 opacity-80")}>
          {it.note}
        </span>
      )}
      <span className="sr-only">, {stateLabel[it.state]}</span>
      {selected === i && (
        <span
          aria-hidden
          className="absolute right-7 bottom-1.5 left-6 h-0.5 rounded-sm bg-current"
        />
      )}
    </>
  )

  const layoutClass = compact
    ? "h-11 items-center justify-between gap-2"
    : "min-h-[72px] flex-col justify-center py-2"

  const paddingClass = (i: number) =>
    cn("pr-6 pl-7", i === 0 && "pl-4", i === lastIndex && "pr-4")

  return (
    <div className={cn("w-full", className)}>
      <ol
        aria-label={label}
        className="hidden overflow-hidden rounded-xl md:flex select-none"
      >
        {items.map((it, i) => (
          <li
            key={i}
            aria-current={it.state === "current" ? "step" : undefined}
            className={cn(
              "stage-chevron relative flex min-w-0 flex-1 transition-all duration-150",
              i > 0 && "-ml-2",
              segmentStyles[it.state],
              !onSelect && [layoutClass, paddingClass(i)].join(" ")
            )}
          >
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-pressed={selected === i}
                title={`Filter candidates by stage: ${it.name}`}
                className={cn(
                  "relative flex w-full min-w-0 text-left transition-[filter] duration-150 hover:brightness-95 focus-visible:outline-none cursor-pointer",
                  layoutClass,
                  paddingClass(i),
                  it.state === "current" && "focus-visible:outline-white"
                )}
              >
                {renderContent(it, i)}
              </button>
            ) : (
              renderContent(it, i)
            )}
          </li>
        ))}
      </ol>

      <ol
        aria-label={label}
        className="divide-y divide-border overflow-hidden rounded-xl border border-border md:hidden bg-card"
      >
        {items.map((it, i) => {
          const rowContent = (
            <>
              <span className="flex w-5 justify-center text-xs">
                <Marker state={it.state} index={i} />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">{it.name}</span>
              {it.count !== undefined && (
                <span className="tabular-nums font-semibold">{it.count}</span>
              )}
              <span className="w-24 text-right text-xs opacity-75">
                {it.note ?? stateLabel[it.state]}
              </span>
            </>
          )

          const itemClass = cn(
            "flex min-h-11 w-full items-center gap-3 px-3 text-left text-sm transition-colors",
            it.state === "current" && "bg-primary-50 text-primary font-medium",
            it.state === "done" && "text-foreground",
            it.state === "upcoming" && "text-muted-foreground",
            it.state === "halted" && "bg-destructive/10 text-destructive",
            selected === i && "ring-2 ring-primary ring-inset"
          )

          return (
            <li key={i} aria-current={it.state === "current" ? "step" : undefined}>
              {onSelect ? (
                <button
                  type="button"
                  className={itemClass}
                  onClick={() => onSelect(i)}
                  aria-pressed={selected === i}
                >
                  {rowContent}
                </button>
              ) : (
                <div className={itemClass}>{rowContent}</div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

