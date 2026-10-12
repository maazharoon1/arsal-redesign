import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { GlowBorderCard } from "@/components/ui/glow-border-card";
import { Scene } from "@/components/motion/scene";
export function Process() {
  return (
    <section
      id="process"
      className="section process"
      aria-labelledby="process-heading"
    >
      <p className="eyebrow">{site.process.eyebrow}</p>
      <h2 id="process-heading">
        {site.process.heading} <em>{site.process.accent}</em>
      </h2>
      <Scene className="process-grid">
        <ol>
          {site.process.steps.map((step, index) => (
            <li key={step.title}>
              <GlowBorderCard>
                <span className="step-number">0{index + 1}</span>
                <div
                  className={`process-object object-${step.shape}`}
                  aria-hidden="true"
                />
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </GlowBorderCard>
              {index < 3 && (
                <ArrowRight
                  className="step-arrow"
                  size={17}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </Scene>
    </section>
  );
}
