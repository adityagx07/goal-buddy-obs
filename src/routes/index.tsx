import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Loader2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { GoalWidget } from "@/components/GoalWidget";
import { createOverlay, updateOverlay } from "@/lib/goals.functions";
import {
  BAR_COLORS,
  DEFAULT_GOAL,
  ICONS,
  TEXT_COLORS,
  THEMES,
  formatAmount,
  type BackgroundId,
  type Goal,
  type SizeId,
} from "@/lib/goal";
import { cn } from "@/lib/utils";

const TITLE = "Gilded — OBS Goal Overlay Studio";
const DESCRIPTION =
  "Build a transparent goal progress-bar overlay for OBS Studio in seconds. Set a target, pick an icon and theme, then paste the URL into a Browser Source.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

const GOAL_KEY = "gilded.goal";
const OVERLAY_KEY = "gilded.overlay";

type OverlayRef = { slug: string; editToken: string };

function Studio() {
  const [goal, setGoal] = useState<Goal>(DEFAULT_GOAL);
  const [overlay, setOverlay] = useState<OverlayRef | null>(null);
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useServerFn(createOverlay);
  const update = useServerFn(updateOverlay);
  const fileInput = useRef<HTMLInputElement>(null);

  // Restore local draft
  useEffect(() => {
    try {
      const g = localStorage.getItem(GOAL_KEY);
      if (g) setGoal({ ...DEFAULT_GOAL, ...(JSON.parse(g) as Partial<Goal>) });
      const o = localStorage.getItem(OVERLAY_KEY);
      if (o) setOverlay(JSON.parse(o) as OverlayRef);
    } catch {
      /* ignore corrupt drafts */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
  }, [goal]);

  // Push changes to the published overlay (debounced)
  useEffect(() => {
    if (!overlay) return;
    setSyncing(true);
    const timer = setTimeout(() => {
      void update({ data: { slug: overlay.slug, editToken: overlay.editToken, goal } })
        .catch((e: Error) => setError(e.message))
        .finally(() => setSyncing(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [goal, overlay, update]);

  const set = useCallback(<K extends keyof Goal>(key: K, value: Goal[K]) => {
    setGoal((g) => ({ ...g, [key]: value }));
  }, []);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const res = await create({ data: goal });
      const ref = { slug: res.slug, editToken: res.editToken };
      setOverlay(ref);
      localStorage.setItem(OVERLAY_KEY, JSON.stringify(ref));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  function handleUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 256;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setGoal((g) => ({
          ...g,
          customImage: canvas.toDataURL("image/webp", 0.85),
          icon: "custom",
        }));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const overlayUrl =
    overlay && typeof window !== "undefined"
      ? `${window.location.origin}/overlay/${overlay.slug}`
      : "";

  function copyUrl() {
    void navigator.clipboard.writeText(overlayUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="stage-glow min-h-screen bg-velvet text-cream">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="glow-gold grid size-9 place-items-center rounded-full bg-gradient-to-br from-gold-2 to-gold font-display text-lg font-bold text-velvet">
            G
          </div>
          <div>
            <p className="font-display text-xl leading-none tracking-tight">Gilded</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-inksoft">
              Goal Overlay Studio
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-inksoft">
          <span
            className={cn(
              "inline-block size-2 rounded-full",
              overlay ? "bg-success shadow-[0_0_10px_var(--success)]" : "bg-inksoft/50",
            )}
          />
          {overlay ? (syncing ? "Syncing…" : "Live · OBS ready") : "Draft · not published"}
        </div>
      </header>

      <main className="grid grid-cols-1 gap-8 px-8 pb-12 lg:grid-cols-12">
        {/* LEFT — settings */}
        <section className="space-y-6 lg:col-span-5">
          <div className="shadow-panel rounded-2xl border border-border bg-velvet-2/70 p-6">
            <h1 className="mb-5 font-display text-2xl">Goal Settings</h1>

            <label className="mb-4 block">
              <span className="label-mono">Goal Name</span>
              <input
                value={goal.name}
                onChange={(e) => set("name", e.target.value)}
                className="field mt-2 w-full px-4 py-3 font-display text-lg"
              />
            </label>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="label-mono">Current</span>
                <div className="field mt-2 flex items-center px-3">
                  <span className="font-mono text-gold-2">{goal.currency}</span>
                  <input
                    type="number"
                    min={0}
                    value={goal.currentAmount}
                    onChange={(e) => set("currentAmount", Number(e.target.value))}
                    className="w-full bg-transparent px-2 py-3 font-mono text-lg outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="label-mono">Target</span>
                <div className="field mt-2 flex items-center px-3">
                  <span className="font-mono text-gold-2">{goal.currency}</span>
                  <input
                    type="number"
                    min={0}
                    value={goal.targetAmount}
                    onChange={(e) => set("targetAmount", Number(e.target.value))}
                    className="w-full bg-transparent px-2 py-3 font-mono text-lg outline-none"
                  />
                </div>
              </label>
            </div>

            <label className="mb-5 block">
              <span className="label-mono">Currency Symbol</span>
              <input
                value={goal.currency}
                maxLength={3}
                onChange={(e) => set("currency", e.target.value)}
                className="field mt-2 w-20 px-3 py-2 text-center font-mono text-lg"
              />
            </label>

            <div>
              <span className="label-mono">Goal Icon</span>
              <div className="mt-3 grid grid-cols-4 gap-2 font-mono text-[11px]">
                {ICONS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      setGoal((g) => ({
                        ...g,
                        icon: id,
                        customImage: id === "custom" ? g.customImage : null,
                      }))
                    }
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3",
                      goal.icon === id ? "chip-active" : "chip",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>

              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold/30 py-3 font-mono text-xs text-inksoft transition-colors hover:border-gold/60 hover:text-gold-2"
              >
                <Upload className="size-3.5" />
                {goal.customImage ? "Replace Custom Image" : "Upload Custom Image (PNG / JPG / WebP)"}
              </button>
              {goal.customImage && (
                <button
                  type="button"
                  onClick={() => set("customImage", null)}
                  className="mt-2 w-full font-mono text-[11px] text-inksoft underline-offset-4 hover:text-gold-2 hover:underline"
                >
                  Remove custom image
                </button>
              )}
            </div>
          </div>

          {/* Customize */}
          <div className="rounded-2xl border border-border bg-velvet-2/70 p-6">
            <h2 className="mb-5 font-display text-2xl">Customize</h2>

            <p className="label-mono mb-2 block">Theme</p>
            <div className="mb-5 grid grid-cols-4 gap-2 font-mono text-[11px]">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("theme", t.id)}
                  className={cn("py-2.5", goal.theme === t.id ? "chip-active" : "chip")}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <p className="label-mono mb-2 block">Bar Color</p>
                <div className="flex gap-2">
                  {BAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Bar color ${c}`}
                      onClick={() => set("barColor", c)}
                      className={cn(
                        "size-8 rounded-full border border-border transition-transform",
                        goal.barColor === c && "scale-110 ring-2 ring-gold-2",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="label-mono mb-2 block">Background</p>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  {(
                    [
                      ["transparent", "Clear"],
                      ["dark", "Dark"],
                      ["light", "Light"],
                    ] as [BackgroundId, string][]
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => set("background", id)}
                      className={cn("py-2", goal.background === id ? "chip-active" : "chip")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-mono mb-2 block">Text Color</p>
                <div className="flex gap-2">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Text color ${c}`}
                      onClick={() => set("textColor", c)}
                      className={cn(
                        "size-8 rounded-full border border-border transition-transform",
                        goal.textColor === c && "scale-110 ring-2 ring-gold-2",
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="label-mono mb-2 block">Size</p>
                <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                  {(["sm", "md", "lg"] as SizeId[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set("size", s)}
                      className={cn("py-2 uppercase", goal.size === s ? "chip-active" : "chip")}
                    >
                      {s === "sm" ? "S" : s === "md" ? "M" : "L"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — preview */}
        <section className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-border bg-velvet-2/40 p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl">Live Preview</h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-inksoft">
                Updates instantly
              </span>
            </div>

            <div className="flex justify-center">
              <GoalWidget goal={goal} />
            </div>

            <div className="mx-auto mt-6 max-w-md rounded-xl border border-border bg-plum/30 p-5">
              <p className="label-mono mb-3 block">Update Goal — Current Amount</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    set("currentAmount", Math.max(0, Number(goal.currentAmount) - 10))
                  }
                  className="chip px-4 py-3 font-mono text-lg"
                >
                  −10
                </button>
                <div className="flex-1 rounded-lg border border-border bg-velvet/60 px-4 py-3 text-center font-mono text-lg text-gold-2">
                  {formatAmount(goal.currency, goal.currentAmount)}
                </div>
                <button
                  type="button"
                  onClick={() => set("currentAmount", Number(goal.currentAmount) + 10)}
                  className="glow-gold rounded-lg bg-gold px-4 py-3 font-mono text-lg font-bold text-velvet transition-colors hover:bg-gold-2"
                >
                  +10
                </button>
              </div>
            </div>
          </div>

          {/* OBS overlay */}
          <div className="rounded-2xl border border-border bg-gradient-to-br from-plum/50 to-velvet-2/60 p-6">
            {overlay ? (
              <>
                <p className="mb-1 font-display text-xl">Your OBS Overlay is Ready</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate rounded-md border border-border bg-velvet/70 px-3 py-2 font-mono text-sm text-gold-2">
                    {overlayUrl}
                  </code>
                  <button
                    type="button"
                    onClick={copyUrl}
                    className="flex shrink-0 items-center gap-1.5 rounded-md bg-gold px-3 py-2 font-mono text-xs font-bold text-velvet transition-colors hover:bg-gold-2"
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "Copied" : "Copy URL"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-1 font-display text-xl">Take it into OBS</p>
                <p className="mb-4 font-mono text-xs text-inksoft">
                  Publish this goal to get a transparent overlay URL that updates itself.
                </p>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="glow-gold flex items-center gap-2 rounded-lg bg-gold px-5 py-3 font-mono text-sm font-bold text-velvet transition-colors hover:bg-gold-2 disabled:opacity-60"
                >
                  {creating && <Loader2 className="size-4 animate-spin" />}
                  Create OBS Overlay
                </button>
              </>
            )}

            {error && (
              <p className="mt-3 font-mono text-xs text-destructive">{error}</p>
            )}

            <ol className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 font-mono text-xs text-inksoft sm:grid-cols-2">
              {[
                "Open OBS Studio",
                "Add a Browser Source",
                "Paste the URL above",
                "Set the width and height",
                "Click OK",
              ].map((step, i) => (
                <li key={step} className="flex gap-2">
                  <span className="text-gold-2">{i + 1}</span> {step}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
    </div>
  );
}
