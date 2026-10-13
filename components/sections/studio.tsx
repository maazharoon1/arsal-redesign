import Image from "next/image";
import { Diamond, Monitor, Box } from "lucide-react";
import { site } from "@/config/site";
const icons = [Diamond, Box, Monitor];
export function Studio() {
  return (
    <section
      id="studio"
      className="studio section"
      aria-labelledby="studio-heading"
    >
      <p className="eyebrow" data-reveal>
        {site.studio.eyebrow}
      </p>
      <div className="studio-grid">
        <div className="portrait-stage" data-reveal>
          <div className="portrait-arch" aria-hidden="true" />
          <div className="portrait-orbit" aria-hidden="true" />
          <Image
            src={site.studio.portrait}
            alt={site.studio.portraitAlt}
            fill
            sizes="(max-width: 767px) 95vw, 45vw"
            className="portrait"
          />
        </div>
        <div className="studio-copy">
          <h2 id="studio-heading" data-reveal>
            {site.studio.heading}
            <br />
            <em>{site.studio.accent}</em>
          </h2>
          <p className="supporting-copy" data-reveal data-reveal-order="1">
            {site.studio.copy}
          </p>
          <div className="discipline-grid" data-reveal data-reveal-order="2">
            {site.studio.disciplines.map((label, index) => {
              const Icon = icons[index];
              return (
                <div key={label}>
                  <Icon size={25} strokeWidth={1.2} aria-hidden="true" />
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
          <span className="studio-signature" aria-hidden="true">
            Arsal.
          </span>
        </div>
      </div>
    </section>
  );
}
