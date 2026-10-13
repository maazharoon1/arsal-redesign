import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
// Adapted from Vengeance UI GlowBorderCard's CSS conic-gradient implementation:
// https://www.vengenceui.com/components/glow-border-card
// Removed fixed dimensions, blur layers, palettes and client boundary.
// Static gradient responds gently to interaction without continuous rotation.
export function GlowBorderCard({
  children,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glow-card", className)} style={style} {...props}>
      <div className="glow-conic" aria-hidden="true" />
      <div className="glow-card-content">{children}</div>
    </div>
  );
}
