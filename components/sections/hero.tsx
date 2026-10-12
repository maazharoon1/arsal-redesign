import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { Scene } from "@/components/motion/scene";
export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <div className="hero-topline">
        <span>{site.hero.topline}</span>
        <span>{site.hero.disciplines}</span>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">{site.hero.eyebrow}</p>
        <h1 id="hero-heading">
          {site.hero.heading}
          <br />
          <span>{site.hero.accent}</span>
          <br />
          {site.hero.ending}
        </h1>
        <p className="supporting-copy">{site.hero.copy}</p>
        <a className="button button-primary" href="#featured">
          {site.hero.button}
          <ArrowUpRight size={18} />
        </a>
      </div>
      <Scene className="hero-art" parallax>
        <div className="hero-arch" aria-hidden="true" />
        <div className="hero-orbit orbit-back" aria-hidden="true" />
        <div className="hero-panels" aria-hidden="true">
          <div className="art-panel panel-coral">
            <Image
              src="/media/reference/hero-coral.webp"
              alt=""
              fill
              sizes="(max-width: 767px) 26vw, 15vw"
              preload
            />
          </div>
          <div className="art-panel panel-lavender">
            <Image
              src="/media/reference/hero-lavender.webp"
              alt=""
              fill
              sizes="(max-width: 767px) 30vw, 18vw"
              preload
            />
          </div>
          <div className="art-panel panel-mint">
            <Image
              src="/media/reference/hero-mint.webp"
              alt=""
              fill
              sizes="(max-width: 767px) 23vw, 12vw"
              preload
            />
          </div>
        </div>
        <div className="hero-orbit orbit-front" aria-hidden="true" />
        <div className="hero-floor" aria-hidden="true" />
        <span className="art-coordinate" aria-hidden="true">
          ARSAL / CREATIVE PORTFOLIO
        </span>
      </Scene>
      <a className="scroll-cue" href="#featured">
        <ArrowDown size={23} />
        <span>{site.hero.scrollLabel}</span>
      </a>
      <span className="hero-index" aria-hidden="true">
        01 — 06
      </span>
    </section>
  );
}
