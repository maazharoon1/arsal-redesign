// Keep this easing aligned with --motion-ease in app/globals.css.
export const motion = {
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  revealDuration: 400,
  compactRevealDuration: 280,
  revealDistance: 12,
  compactRevealDistance: 6,
  stagger: 40,
  compactStagger: 25,
} as const;
