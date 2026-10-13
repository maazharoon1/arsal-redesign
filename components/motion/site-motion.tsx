"use client";

import { useEffect } from "react";
import { motion } from "@/config/motion";

// Static markup remains visible without JS. One observer handles initial and
// newly selected category content; no scroll listeners or React frame updates.
export function SiteMotion() {
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 1023px)");
    const seen = new WeakSet<Element>();
    const active = new Map<Element, Animation>();
    const hero = main.querySelector(".hero");
    const finishHero = () => {
      hero?.getAnimations({ subtree: true }).forEach((animation) => {
        if (
          animation instanceof CSSAnimation &&
          animation.animationName.startsWith("hero-")
        )
          animation.finish();
      });
    };
    const finish = () => {
      finishHero();
      for (const animation of active.values()) animation.finish();
      active.clear();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) {
            if (!entry.isIntersecting) finishHero();
            continue;
          }
          const element = entry.target as HTMLElement;
          if (!entry.isIntersecting) {
            active.get(element)?.finish();
            continue;
          }
          if (seen.has(element)) continue;
          seen.add(element);
          element.dataset.revealed = "true";
          if (
            reduced.matches ||
            document.hidden ||
            element.matches(":focus-within")
          ) {
            observer.unobserve(element);
            continue;
          }
          const distance = compact.matches
            ? motion.compactRevealDistance
            : motion.revealDistance;
          const order = Math.min(2, Number(element.dataset.revealOrder) || 0);
          const animation = element.animate(
            [
              { opacity: 0.3, translate: `0 ${distance}px` },
              { opacity: 1, translate: "0 0" },
            ],
            {
              duration: compact.matches
                ? motion.compactRevealDuration
                : motion.revealDuration,
              delay:
                order *
                (compact.matches ? motion.compactStagger : motion.stagger),
              easing: motion.easing,
              fill: "backwards",
            },
          );
          active.set(element, animation);
          animation.onfinish = () => {
            active.delete(element);
            observer.unobserve(element);
          };
        }
      },
      { threshold: 0.08 },
    );
    const register = (root: Element) => {
      if (root.matches("[data-reveal]") && !seen.has(root))
        observer.observe(root);
      root.querySelectorAll("[data-reveal]").forEach((element) => {
        if (!seen.has(element)) observer.observe(element);
      });
    };
    register(main);
    if (hero) observer.observe(hero);
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.removedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          observer.unobserve(node);
          node
            .querySelectorAll("[data-reveal]")
            .forEach((element) => observer.unobserve(element));
          for (const [element, animation] of active)
            if (node === element || node.contains(element)) {
              animation.cancel();
              active.delete(element);
              observer.unobserve(element);
            }
        });
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) register(node);
        });
      }
    });
    mutations.observe(main, { childList: true, subtree: true });
    const visibility = () => {
      if (document.hidden) finish();
    };
    const preference = () => {
      if (reduced.matches) finish();
    };
    const focus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      for (const [element, animation] of active)
        if (element.contains(target)) animation.finish();
    };
    main.addEventListener("focusin", focus);
    reduced.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      mutations.disconnect();
      main.removeEventListener("focusin", focus);
      observer.disconnect();
      reduced.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
      for (const animation of active.values()) animation.cancel();
    };
  }, []);
  return null;
}
