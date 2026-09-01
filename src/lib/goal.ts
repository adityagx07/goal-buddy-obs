import {
  Armchair,
  Camera,
  Car,
  Gamepad2,
  Mic,
  Monitor,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ThemeId = "minimal" | "gaming" | "neon" | "glass";
export type BackgroundId = "transparent" | "dark" | "light";
export type SizeId = "sm" | "md" | "lg";

export type Goal = {
  name: string;
  currentAmount: number;
  targetAmount: number;
  currency: string;
  icon: string;
  customImage: string | null;
  theme: ThemeId;
  barColor: string;
  background: BackgroundId;
  textColor: string;
  size: SizeId;
};

export const ICONS: { id: string; label: string; Icon: LucideIcon }[] = [
  { id: "pc", label: "PC", Icon: Monitor },
  { id: "chair", label: "Chair", Icon: Armchair },
  { id: "camera", label: "Cam", Icon: Camera },
  { id: "mic", label: "Mic", Icon: Mic },
  { id: "console", label: "Console", Icon: Gamepad2 },
  { id: "car", label: "Car", Icon: Car },
  { id: "phone", label: "Phone", Icon: Smartphone },
  { id: "custom", label: "Custom", Icon: Sparkles },
];

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: "minimal", label: "Minimal" },
  { id: "gaming", label: "Gaming" },
  { id: "neon", label: "Neon" },
  { id: "glass", label: "Glass" },
];

export const BAR_COLORS = ["#d8b26a", "#a78bfa", "#fb7185", "#34d399", "#38bdf8"];
export const TEXT_COLORS = ["#f2e7d4", "#eecb86", "#ffffff", "#140f22"];

export const DEFAULT_GOAL: Goal = {
  name: "Gaming PC",
  currentAmount: 400,
  targetAmount: 1000,
  currency: "$",
  icon: "pc",
  customImage: null,
  theme: "gaming",
  barColor: "#d8b26a",
  background: "transparent",
  textColor: "#f2e7d4",
  size: "md",
};

export function percentOf(goal: Pick<Goal, "currentAmount" | "targetAmount">) {
  const target = Number(goal.targetAmount) || 0;
  const current = Number(goal.currentAmount) || 0;
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

export function formatAmount(currency: string, value: number) {
  const rounded = Math.round((Number(value) || 0) * 100) / 100;
  return `${currency}${rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

/** Maps a database row (snake_case) onto the client Goal shape. */
export function rowToGoal(row: Record<string, unknown>): Goal {
  return {
    name: String(row["name"] ?? DEFAULT_GOAL.name),
    currentAmount: Number(row["current_amount"] ?? 0),
    targetAmount: Number(row["target_amount"] ?? 0),
    currency: String(row["currency"] ?? "$"),
    icon: String(row["icon"] ?? "pc"),
    customImage: (row["custom_image"] as string | null) ?? null,
    theme: (row["theme"] as ThemeId) ?? "gaming",
    barColor: String(row["bar_color"] ?? DEFAULT_GOAL.barColor),
    background: (row["background"] as BackgroundId) ?? "transparent",
    textColor: String(row["text_color"] ?? DEFAULT_GOAL.textColor),
    size: (row["size"] as SizeId) ?? "md",
  };
}

export function goalToRow(goal: Goal) {
  return {
    name: goal.name,
    current_amount: goal.currentAmount,
    target_amount: goal.targetAmount,
    currency: goal.currency,
    icon: goal.icon,
    custom_image: goal.customImage,
    theme: goal.theme,
    bar_color: goal.barColor,
    background: goal.background,
    text_color: goal.textColor,
    size: goal.size,
  };
}
