"use client";

import Image from "next/image";
import { useState } from "react";
import { site } from "@/config/site";

export function HeroPortrait() {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const portrait = site.hero.portrait;
  if (failed)
    return (
      <span
        className="hero-portrait-fallback"
        role="img"
        aria-label={`${portrait.alt}. Portrait unavailable`}
      >
        ARSAL
      </span>
    );
  return (
    <Image
      src={portrait.src}
      alt={portrait.alt}
      width={portrait.width}
      height={portrait.height}
      sizes="(max-width: 1023px) 95vw, (min-width: 1600px) 760px, 65vw"
      preload
      data-entered={loaded}
      onLoad={(event) => {
        const bounds = event.currentTarget
          .closest(".hero")
          ?.getBoundingClientRect();
        setLoaded(
          !document.hidden &&
            !!bounds &&
            bounds.bottom > 0 &&
            bounds.top < window.innerHeight,
        );
      }}
      onError={() => setFailed(true)}
      className="hero-portrait"
    />
  );
}
