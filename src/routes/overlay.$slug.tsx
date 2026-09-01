import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { GoalWidget } from "@/components/GoalWidget";
import { supabase } from "@/integrations/supabase/client";
import { rowToGoal, type Goal } from "@/lib/goal";

export const Route = createFileRoute("/overlay/$slug")({
  head: () => ({
    meta: [
      { title: "Goal Overlay — Gilded" },
      { name: "description", content: "Transparent OBS browser-source overlay for a live funding goal." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Goal Overlay — Gilded" },
      { property: "og:description", content: "Transparent OBS browser-source overlay for a live funding goal." },
    ],
  }),
  component: OverlayPage,
});

function OverlayPage() {
  const { slug } = Route.useParams();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("goals")
        .select(
          "name,current_amount,target_amount,currency,icon,custom_image,theme,bar_color,background,text_color,size",
        )
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) {
        setMissing(true);
        return;
      }
      setMissing(false);
      setGoal(rowToGoal(data as Record<string, unknown>));
    }

    void load();
    const timer = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [slug]);

  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = "transparent";
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  return (
    <div className="grid min-h-screen place-items-center bg-transparent p-2">
      {goal ? (
        <GoalWidget goal={goal} />
      ) : missing ? (
        <p className="font-mono text-xs text-muted-foreground">Overlay not found</p>
      ) : null}
    </div>
  );
}
