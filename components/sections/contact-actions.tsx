import { ArrowUpRight } from "lucide-react";
import { site, contactTarget } from "@/config/site";

export function ContactActions() {
  return (
    <div className="contact-actions">
      <a
        className="button button-primary"
        href={contactTarget}
        target="_blank"
        rel="noopener noreferrer"
      >
        {site.contact.button}
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}
