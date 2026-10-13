import { ArrowDown, ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { HeroDecorations } from "./hero-decorations";
import { HeroPortrait } from "./hero-portrait";
import "./hero.css";

export function Hero() {
  return (
    <section id="home" className="hero" aria-label="Arsal design portfolio">
      <HeroDecorations />
 
      <div className="hero-wordmark" aria-hidden="true">
        <span>{site.name}</span>
      </div>
      <div
        className="hero-portrait-layer"
        style={{
          aspectRatio: `${site.hero.portrait.width} / ${site.hero.portrait.height}`,
        }}
      >
        <HeroPortrait />
      </div>
      <div className="hero-copy">
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
          <ArrowRight size={22} />
        </a>
      </div>
      <a className="scroll-cue" href="#featured">
        <ArrowDown size={23} />
        <span>{site.hero.scrollLabel}</span>
      </a>
    </section>
  );
}
