"use client";

// Adapted from the user-requested Vengeance UI perspective-carousel registry.
// Preserves its controlled selection, rotateY/scale and spring transitions.
// Windowed slides, next/image, hidden titles and external controls keep the
// existing ARSAL lightbox size, accessibility and zoom behavior intact.
import { useRef, useSyncExternalStore } from "react";
import { motion, useInView, type Transition } from "framer-motion";
import { Play } from "lucide-react";
import { MediaImage } from "@/components/portfolio/media-image";

export interface PerspectiveCarouselItem {
  id: string;
  src?: string;
  title: string;
  alt?: string;
  mediaType?: "image" | "video" | "pdf";
}
export interface PerspectiveCarouselProps {
  items: PerspectiveCarouselItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  slideWidth: number;
  slideHeight: number;
  rotationStep?: number;
  inactiveScale?: number;
}

const DEFAULT_TRANSITION: Transition = {
  type: "spring",
  bounce: 0.14,
  duration: 0.65,
};
function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}
function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function offsetFromActive(index: number, active: number, count: number) {
  let offset = index - active;
  if (count > 2) {
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
  }
  return offset;
}

export function PerspectiveCarousel({
  items,
  activeIndex,
  onActiveIndexChange,
  slideWidth,
  slideHeight,
  rotationStep = 48,
  inactiveScale = 0.84,
}: PerspectiveCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    reducedMotionSnapshot,
    () => true,
  );
  const inView = useInView(ref);
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => true,
  );
  const animate = !reducedMotion && inView && visible;
  const currentIndex = Math.min(
    Math.max(0, activeIndex),
    Math.max(0, items.length - 1),
  );
  const transition = animate ? DEFAULT_TRANSITION : { duration: 0 };
  const slides = items
    .map((item, index) => ({
      item,
      index,
      offset: offsetFromActive(index, currentIndex, items.length),
    }))
    .filter(({ offset }) => Math.abs(offset) <= 2);

  return (
    <div
      ref={ref}
      className="perspective-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Project media carousel"
      data-motion={animate ? "animated" : "instant"}
    >
      {slides.map(({ item, index, offset }) => {
        const active = index === currentIndex;
        const neighbor = Math.abs(offset) === 1;
        const image = item.src ? (
          <MediaImage
            src={item.src}
            alt={active ? (item.alt ?? item.title) : ""}
            sizes="(max-width: 1023px) 100vw, 85vw"
            className="viewer-image"
          />
        ) : (
          <span className="media-fallback" aria-hidden="true">
            <Play size={32} />
          </span>
        );
        return (
          <motion.div
            key={item.id}
            className="perspective-carousel-slide"
            data-active={active}
            data-slide-index={index}
            aria-hidden={!active && !neighbor ? true : undefined}
            initial={false}
            animate={{
              x: offset * slideWidth * 0.82,
              rotateY: reducedMotion ? 0 : -offset * rotationStep,
              scale: active ? 1 : inactiveScale,
              opacity: active ? 1 : reducedMotion ? 0 : neighbor ? 0.38 : 0,
            }}
            transition={transition}
            style={{
              width: slideWidth,
              height: slideHeight,
              marginLeft: -slideWidth / 2,
              marginTop: -slideHeight / 2,
              zIndex: active ? 3 : 1,
              pointerEvents:
                active || (neighbor && !reducedMotion) ? "auto" : "none",
              transformStyle: "preserve-3d",
            }}
          >
            {active ? (
              image
            ) : (
              <button
                className="perspective-neighbor"
                type="button"
                aria-label={`View artwork ${index + 1}`}
                tabIndex={neighbor && !reducedMotion ? 0 : -1}
                aria-hidden={reducedMotion || !neighbor ? true : undefined}
                onClick={() => onActiveIndexChange(index)}
              >
                {image}
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default PerspectiveCarousel;
