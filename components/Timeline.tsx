import { CASE_STATUS_ORDER } from "@/lib/types";
import type { CaseStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

export function Timeline({ status, t }: { status: CaseStatus; t: Dictionary }) {
  const idx = CASE_STATUS_ORDER.indexOf(status);
  return (
    <ol className="grid gap-2">
      {CASE_STATUS_ORDER.map((s, i) => {
        const reached = idx >= 0 && i <= idx;
        const current = i === idx;
        const label = (t.dashboard.status as Record<string, string>)[s] ?? s;
        return (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold ${
                current
                  ? "border-primary bg-primary text-primary-foreground"
                  : reached
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-2"
              }`}
            >
              {i + 1}
            </span>
            <span className={reached ? "text-foreground" : "text-muted"}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
