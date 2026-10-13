import Image from "next/image";
import { site } from "@/config/site";
import { ContactActions } from "./contact-actions";
export function Contact() {
  return (
    <>
      <section
        id="contact"
        className="contact section"
        aria-labelledby="contact-heading"
      >
        <div className="contact-art" aria-hidden="true">
          <Image
            src="/media/reference/contact-scene.webp"
            fill
            alt=""
            sizes="(max-width: 767px) 100vw, 60vw"
          />
        </div>
        <div className="contact-copy">
          <p className="eyebrow" data-reveal>
            {site.contact.eyebrow}
          </p>
          <h2 id="contact-heading" data-reveal>
            {site.contact.heading}
            <br />
            <em>{site.contact.accent}</em>
          </h2>
          <p className="supporting-copy" data-reveal data-reveal-order="1">
            {site.contact.copy}
          </p>
          <ContactActions />
        </div>
      </section>
      <footer className="footer">
        <a className="footer-brand" href="#home">
          {site.name}
        </a>
        <span>{site.tagline}</span>
        <nav aria-label="Footer navigation">
          <a href="#portfolio">Work</a>
          <a href="#studio">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <span>© 2026 Arsal</span>
      </footer>
    </>
  );
}
