"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  jobId: string;
  initialRating?: number | null;
  onRated?: (rating: number) => void;
}

export function StarRating({ jobId, initialRating, onRated }: StarRatingProps) {
  const [saved, setSaved] = useState<number | null>(initialRating ?? null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const display = hovered ?? saved ?? 0;

  async function handleRate(rating: number) {
    if (saving || saved === rating) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        setSaved(rating);
        onRated?.(rating);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] text-(--hint) uppercase tracking-[.06em]">
        {saved ? "Your rating" : "Rate this agent"}
      </span>
      <div className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={saving || !!saved}
            onMouseEnter={() => !saved && setHovered(star)}
            onClick={() => handleRate(star)}
            className={cn(
              "transition-transform duration-100 cursor-pointer disabled:cursor-default",
              !saved && "hover:scale-110"
            )}
          >
            <Star
              size={18}
              strokeWidth={1.5}
              className={cn(
                "transition-colors duration-100",
                star <= display
                  ? "text-amber-400 fill-amber-400"
                  : "text-[rgba(255,255,255,0.15)]"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
