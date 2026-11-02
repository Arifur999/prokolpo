import { cn } from "@/lib/utils";

export type LineCell = { text: string; tone?: "ink" | "muted" | "success" | "gold" | "danger" | "faint"; strong?: boolean };
export type Line = {
  key: string;
  name: string;
  sub?: string;
  subRed?: boolean;
  // Bar width and colour as a share of the track; `mark` puts the 100% budget line on it.
  bar: { width: number; tone: "ok" | "near" | "over"; mark?: number };
  cells: LineCell[];
  dim?: "faint" | "soft";
};

type ExpenseLinesProps = {
  labelledBy: string;
  grid: string;
  heads: { label: string; right?: boolean }[];
  lines: Line[];
  foot: { label: string; cells: LineCell[] };
};

const TONE = { ink: "text-ink", muted: "text-ink-2", success: "text-success", gold: "text-gold-ink", danger: "text-danger", faint: "text-ink-5" };
const BAR = { ok: "bg-brand-mid", near: "bg-gold-strong", over: "bg-danger-strong" };

// The expense report's table (board Reports): a name, a bar, then figures; unused lines fade.
export function ExpenseLines({ labelledBy, grid, heads, lines, foot }: ExpenseLinesProps) {
  return (
    <div role="table" aria-labelledby={labelledBy}>
      <div
        role="row"
        className={cn("hidden h-10 border-b border-line-2 bg-surface-2 px-5 text-[13px] font-semibold text-ink-2 lg:grid lg:items-center lg:gap-x-3", grid)}
      >
        {heads.map((h, i) => (
          <span key={i} role="columnheader" className={h.right ? "text-right" : undefined}>
            {h.label}
          </span>
        ))}
      </div>
      {lines.map((l) => (
        <div
          key={l.key}
          role="row"
          className={cn(
            "flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-line-3 px-5 py-2.25 lg:grid lg:gap-y-0",
            grid,
            l.dim === "faint" && "opacity-45",
            l.dim === "soft" && "opacity-55",
          )}
        >
          <span role="cell" className="flex w-full min-w-0 flex-col lg:w-auto">
            <span className="truncate text-[15px] font-semibold">{l.name}</span>
            {l.sub && <span className={cn("text-xs", l.subRed ? "text-danger" : "text-ink-3")}>{l.sub}</span>}
          </span>
          <span role="cell" className="relative flex h-3 grow items-center rounded-full bg-line-3 lg:grow-0">
            <span className={cn("block h-full rounded-full", BAR[l.bar.tone])} style={{ width: `${l.bar.width.toFixed(1)}%` }} />
            {l.bar.mark !== undefined && (
              <span aria-hidden="true" className="absolute -top-1 -bottom-1 border-l-2 border-ink" style={{ left: `${l.bar.mark.toFixed(1)}%` }} />
            )}
          </span>
          {l.cells.map((c, i) => (
            <span
              key={i}
              role="cell"
              className={cn("text-right whitespace-nowrap", c.strong ? "text-[15px] font-bold" : "text-sm font-medium", TONE[c.tone ?? "ink"])}
            >
              {c.text}
            </span>
          ))}
        </div>
      ))}
      <div role="row" className={cn("flex flex-wrap items-center gap-x-3 bg-surface-2 px-5 py-3 text-sm font-bold lg:grid", grid)}>
        <span role="cell">{foot.label}</span>
        <span role="cell" className="hidden lg:block" />
        {foot.cells.map((c, i) => (
          <span key={i} role="cell" className={cn("ml-auto text-right lg:ml-0", TONE[c.tone ?? "ink"])}>
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}
