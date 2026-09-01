import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const goalPayload = z.object({
  name: z.string().min(1).max(80),
  currentAmount: z.number().finite().min(0).max(1_000_000_000),
  targetAmount: z.number().finite().min(0).max(1_000_000_000),
  currency: z.string().min(1).max(4),
  icon: z.string().max(24),
  customImage: z.string().max(400_000).nullable(),
  theme: z.enum(["minimal", "gaming", "neon", "glass"]),
  barColor: z.string().max(32),
  background: z.enum(["transparent", "dark", "light"]),
  textColor: z.string().max(32),
  size: z.enum(["sm", "md", "lg"]),
});

function toRow(goal: z.infer<typeof goalPayload>) {
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

function randomId(length: number) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const createOverlay = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => goalPayload.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const slug = randomId(8);
    const editToken = randomId(32);

    const { error } = await supabaseAdmin
      .from("goals")
      .insert({ slug, edit_token: editToken, ...toRow(data) });

    if (error) throw new Error(error.message);
    return { slug, editToken };
  });

export const updateOverlay = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().max(32), editToken: z.string().max(64), goal: goalPayload }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("goals")
      .update(toRow(data.goal))
      .eq("slug", data.slug)
      .eq("edit_token", data.editToken)
      .select("slug");

    if (error) throw new Error(error.message);
    if (!rows || rows.length === 0) throw new Error("Overlay not found or edit key invalid");
    return { ok: true };
  });
