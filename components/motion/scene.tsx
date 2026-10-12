"use client";
import { useEffect, useRef, type ReactNode } from "react";
// One pending frame, no React updates per pointer movement. Work is disconnected
// offscreen, on coarse pointers, in hidden tabs and with reduced motion.
export function Scene({
  children,
  className = "",
  parallax = false,
}: {
  children: ReactNode;
  className?: string;
  parallax?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0,
      visible = false,
      attached = false;
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      element!.style.setProperty("--pointer-x", "0deg");
      element!.style.setProperty("--pointer-y", "0deg");
    }
    function move(event: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = element!.getBoundingClientRect();
        element!.style.setProperty(
          "--pointer-x",
          `${((event.clientX - rect.left) / rect.width - 0.5) * 5}deg`,
        );
        element!.style.setProperty(
          "--pointer-y",
          `${((event.clientY - rect.top) / rect.height - 0.5) * -4}deg`,
        );
        frame = 0;
      });
    }
    function sync() {
      const running = visible && !motion.matches && !document.hidden;
      element!.dataset.inView = String(running);
      const enabled = running && parallax && pointer.matches;
      if (enabled === attached) return;
      attached = enabled;
      if (enabled) {
        element!.addEventListener("pointermove", move);
        element!.addEventListener("pointerleave", reset);
      } else {
        element!.removeEventListener("pointermove", move);
        element!.removeEventListener("pointerleave", reset);
        reset();
      }
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.08 },
    );
    observer.observe(element);
    motion.addEventListener("change", sync);
    pointer.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", sync);
      pointer.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [parallax]);
  return (
    <div ref={ref} className={`motion-scene ${className}`} data-in-view="false">
      {children}
    </div>
  );
}
