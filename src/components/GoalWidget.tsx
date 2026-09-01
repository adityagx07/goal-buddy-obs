import { ICONS, formatAmount, percentOf, type Goal } from "@/lib/goal";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { wrap: "w-[280px] p-4", icon: "size-9", title: "text-lg", meta: "text-[10px]", bar: "h-3" },
  md: { wrap: "w-[360px] p-6", icon: "size-12", title: "text-2xl", meta: "text-xs", bar: "h-4" },
  lg: { wrap: "w-[460px] p-8", icon: "size-16", title: "text-3xl", meta: "text-sm", bar: "h-5" },
} as const;

function surfaceClasses(goal: Goal) {
  const dark = goal.background === "dark";
  const light = goal.background === "light";

  const base =
    goal.background === "transparent"
      ? "bg-transparent"
      : dark
        ? "bg-velvet/95"
        : "bg-cream/95";

  switch (goal.theme) {
    case "minimal":
      return cn(base, "rounded-xl border border-border");
    case "neon":
      return cn(base, "rounded-2xl border-2 border-transparent");
    case "glass":
      return cn(
        goal.background === "transparent" ? "bg-plum-2/25" : base,
        "rounded-2xl border border-border backdrop-blur-md",
      );
    case "gaming":
    default:
      return cn(
        goal.background === "transparent"
          ? "bg-gradient-to-b from-plum-2/80 to-velvet/90"
          : base,
        "rounded-2xl border border-border shadow-widget widget-glow",
      );
  }
}

export function GoalWidget({ goal, animate = true }: { goal: Goal; animate?: boolean }) {
  const pct = percentOf(goal);
  const complete = pct >= 100;
  const s = SIZES[goal.size] ?? SIZES.md;
  const iconEntry = ICONS.find((i) => i.id === goal.icon) ?? ICONS[0]!;
  const Icon = iconEntry.Icon;
  const text = goal.textColor;

  return (
    <div
      className={cn(surfaceClasses(goal), s.wrap, "relative overflow-hidden")}
      style={
        goal.theme === "neon"
          ? {
              borderColor: goal.barColor,
              boxShadow: `0 0 24px ${goal.barColor}66, inset 0 0 24px ${goal.barColor}22`,
            }
          : undefined
      }
    >
      {complete && animate && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {[8, 24, 40, 56, 72, 88].map((left, i) => (
            <span
              key={left}
              className="confetti-bit absolute top-0 block size-1.5 rounded-[2px]"
              style={{
                left: `${left}%`,
                backgroundColor: i % 2 ? goal.barColor : "var(--gold-2)",
                animationDelay: `${i * 0.28}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex items-center gap-3">
        <div
          className={cn(
            s.icon,
            "grid shrink-0 place-items-center rounded-xl overflow-hidden",
            complete && animate && "goal-pop",
          )}
          style={{
            background: goal.customImage ? "transparent" : `${goal.barColor}`,
            boxShadow: goal.customImage ? "none" : `0 0 20px ${goal.barColor}80`,
          }}
        >
          {goal.customImage ? (
            <img
              src={goal.customImage}
              alt=""
              className="size-full rounded-xl object-cover"
            />
          ) : (
            <Icon className="size-1/2" style={{ color: "var(--velvet)" }} strokeWidth={2.2} />
          )}
        </div>

        <div className="min-w-0">
          <p
            className={cn("font-display leading-none tracking-tight truncate", s.title)}
            style={{ color: text }}
          >
            {complete ? "🎉 Goal Completed!" : goal.name}
          </p>
          <p
            className={cn("font-mono mt-1.5 truncate", s.meta)}
            style={{ color: text, opacity: 0.72 }}
          >
            {formatAmount(goal.currency, goal.currentAmount)} /{" "}
            {formatAmount(goal.currency, goal.targetAmount)}
            {"  ·  "}
            <span style={{ color: goal.barColor, opacity: 1 }}>{Math.round(pct)}%</span>
          </p>
        </div>
      </div>

      <div
        className={cn(
          "relative mt-5 w-full overflow-hidden rounded-full border border-border",
          s.bar,
        )}
        style={{ backgroundColor: goal.background === "light" ? "#00000018" : "#00000066" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${goal.barColor}, ${goal.barColor}cc)`,
            boxShadow: `0 0 14px ${goal.barColor}80`,
          }}
        >
          {animate && (
            <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
          )}
        </div>
      </div>

      <div
        className="mt-2 flex justify-between font-mono text-[10px]"
        style={{ color: text, opacity: 0.6 }}
      >
        <span>{formatAmount(goal.currency, 0)}</span>
        <span>{complete ? "Fully funded" : `${Math.round(pct)}% funded`}</span>
        <span>{formatAmount(goal.currency, goal.targetAmount)}</span>
      </div>
    </div>
  );
}
