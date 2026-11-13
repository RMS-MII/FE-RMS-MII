import { cn } from "@/shared/lib/utils"
import type { DiscSummaryItem } from "../../types"

interface DiscRadarChartProps {
  summaries: DiscSummaryItem[]
}

interface DiscMeta {
  key: string
  label: string
  color: string
}

const DISC_META: Record<string, DiscMeta> = {
  dominance: { key: "D", label: "Dominance", color: "#2563eb" },
  influence: { key: "I", label: "Influence", color: "#7c3aed" },
  steadiness: { key: "S", label: "Steadiness", color: "#059669" },
  conscientiousness: {
    key: "C",
    label: "Conscientiousness",
    color: "#d97706",
  },
}

const DISC_SHORT_NAMES: Record<string, string> = {
  d: "dominance",
  i: "influence",
  s: "steadiness",
  c: "conscientiousness",
}

const DISC_ORDER = ["dominance", "influence", "steadiness", "conscientiousness"]

function normalizeTrait(trait: string): string {
  const normalized = trait.trim().toLowerCase()
  return DISC_SHORT_NAMES[normalized] ?? normalized
}

function resolveMeta(trait: string): DiscMeta {
  const normalized = normalizeTrait(trait)
  return (
    DISC_META[normalized] ?? {
      key: trait.trim().slice(0, 1).toUpperCase() || "?",
      label: trait.trim() || "Unknown",
      color: "#2563eb",
    }
  )
}

/**
 * Radar chart sederhana untuk hasil tes psikotest berbasis DISC.
 * Memakai SVG bawaan React (tanpa dependency chart library eksternal).
 */
export function DiscRadarChart({ summaries }: DiscRadarChartProps) {
  const orderedSummaries = [...summaries].sort((a, b) => {
    const orderA = DISC_ORDER.indexOf(normalizeTrait(a.trait))
    const orderB = DISC_ORDER.indexOf(normalizeTrait(b.trait))
    return (
      (orderA === -1 ? DISC_ORDER.length : orderA) -
      (orderB === -1 ? DISC_ORDER.length : orderB)
    )
  })
  const axes = orderedSummaries.map((summary) => ({
    summary,
    meta: resolveMeta(summary.trait),
    // Radar tidak bisa menggambarkan nilai negatif; nilai asli tetap tampil di tabel.
    plotValue: Math.max(0, summary.difference),
  }))

  const maxValue = Math.max(1, ...axes.map((axis) => Math.abs(axis.plotValue)))
  const hasAxes = axes.length > 0

  const size = 320
  const center = size / 2
  const radius = 110
  const n = Math.max(axes.length, 3)
  const angle = (index: number) => -Math.PI / 2 + (index * 2 * Math.PI) / n
  const point = (index: number, r: number) => {
    const a = angle(index)
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) }
  }

  const ringPolygon = (ratio: number) =>
    axes
      .map((_axis, index) => {
        const p = point(index, radius * ratio)
        return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
      })
      .join(" ")

  const valuePolygon = axes
    .map((axis, index) => {
      const clamped = Math.max(0, Math.min(maxValue, axis.plotValue))
      const p = point(index, (clamped / maxValue) * radius)
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
    })
    .join(" ")

  const valuePoints = axes.map((axis, index) => {
    const clamped = Math.max(0, Math.min(maxValue, axis.plotValue))
    return point(index, (clamped / maxValue) * radius)
  })

  const labelPosition = (index: number) => {
    const p = point(index, radius * 1.18)
    const a = angle(index)
    const cos = Math.cos(a)
    const anchor: "start" | "end" | "middle" =
      Math.abs(cos) < 0.3 ? "middle" : cos > 0 ? "start" : "end"
    return { x: p.x, y: p.y, anchor }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {hasAxes ? (
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-64 w-64"
          role="img"
          aria-label="Grafik radar DISC"
        >
          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <polygon
              key={ratio}
              points={ringPolygon(ratio)}
              fill={ratio === 1 ? "rgba(148, 163, 184, 0.08)" : "none"}
              stroke="rgba(148, 163, 184, 0.45)"
              strokeWidth={1}
            />
          ))}

          {axes.map((axis, index) => {
            const p = point(index, radius)
            return (
              <line
                key={`axis-${axis.meta.key}-${index}`}
                x1={center}
                y1={center}
                x2={p.x}
                y2={p.y}
                stroke="rgba(148, 163, 184, 0.45)"
                strokeWidth={1}
              />
            )
          })}

          <polygon
            points={valuePolygon}
            fill="rgba(37, 99, 235, 0.18)"
            stroke="#2563eb"
            strokeWidth={2}
          />

          {valuePoints.map((p, index) => (
            <circle
              key={`dot-${axes[index]?.meta.key ?? "axis"}-${index}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          ))}

          {axes.map((axis, index) => {
            const { x, y, anchor } = labelPosition(index)
            return (
              <text
                key={`label-${axis.meta.key}-${index}`}
                x={x}
                y={y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fontSize={11}
                fontWeight={600}
                fill={axis.meta.color}
              >
                {axis.meta.label}
              </text>
            )
          })}
        </svg>
      ) : (
        <p className="text-xs text-muted-foreground">
          Data grafik DISC belum tersedia.
        </p>
      )}

      {hasAxes ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="pb-1.5 text-left font-medium">
                  Trait
                </th>
                <th scope="col" className="pb-1.5 pl-3 text-right font-medium">
                  Most
                </th>
                <th scope="col" className="pb-1.5 pl-3 text-right font-medium">
                  Least
                </th>
                <th scope="col" className="pb-1.5 pl-3 text-right font-medium">
                  Difference
                </th>
              </tr>
            </thead>
            <tbody>
              {axes.map(({ summary, meta }, index) => (
                <tr
                  key={`${meta.key}-${index}`}
                  className="border-t border-border/60"
                >
                  <th
                    scope="row"
                    className="py-1.5 text-left font-medium text-foreground"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: meta.color }}
                        aria-hidden
                      />
                      {meta.label}
                    </span>
                  </th>
                  <td className="py-1.5 pl-3 text-right text-muted-foreground tabular-nums">
                    {summary.totalMost}
                  </td>
                  <td className="py-1.5 pl-3 text-right text-muted-foreground tabular-nums">
                    {summary.totalLeast}
                  </td>
                  <td
                    className={cn(
                      "py-1.5 pl-3 text-right font-semibold tabular-nums",
                      summary.difference > 0
                        ? "text-success"
                        : summary.difference < 0
                          ? "text-danger"
                          : "text-muted-foreground"
                    )}
                  >
                    {summary.difference > 0 ? "+" : ""}
                    {summary.difference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
