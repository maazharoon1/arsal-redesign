"use client";
import { ArrowUpRight, Play, FileText, ExternalLink } from "lucide-react";
import type { Project } from "@/data/portfolio";
import { usePortfolio } from "@/components/layout/portfolio-provider";
import { MediaImage } from "./media-image";

export function MediaCard({
  project,
  featured = false,
  revealOrder = 0,
}: {
  project: Project;
  featured?: boolean;
  revealOrder?: number;
}) {
  const { openProject } = usePortfolio();
  const first = project.media[0];
  const website = project.categoryId === "web-dev" && !!project.liveUrl;
  const src =
    project.cover?.src ??
    project.poster ??
    (first.type === "image"
      ? first.src
      : first.type === "video"
        ? first.poster
        : undefined);
  const className = `media-card ${featured ? "featured-card" : ""} ${project.mediaType === "video" ? "video-card" : ""} ${website ? "web-project-card" : ""} ${project.mediaType === "pdf" ? "pdf-card" : ""}`;
  const content = (
    <>
      {src ? (
        <MediaImage
          src={src}
          alt={project.cover?.alt ?? first.alt}
          sizes={
            website
              ? "(max-width: 1023px) 50vw, 33vw"
              : featured
                ? "(max-width: 767px) 100vw, 33vw"
                : "(max-width: 1023px) 50vw, 33vw"
          }
        />
      ) : (
        <span className="media-fallback">
          {project.mediaType === "pdf" ? (
            <FileText size={32} />
          ) : (
            <Play size={32} />
          )}
          <span className="sr-only">Media preview</span>
        </span>
      )}
      <span className="card-shade" aria-hidden="true" />
      {project.mediaType === "pdf" && (
        <span className="pdf-badge" aria-hidden="true">
          <FileText size={13} />
          PDF
        </span>
      )}
      {project.mediaType === "video" ? (
        <span className="play-control">
          <Play size={22} fill="currentColor" aria-hidden="true" />
        </span>
      ) : (
        <span className="card-arrow" aria-hidden="true">
          {website ? <ExternalLink size={17} /> : <ArrowUpRight size={18} />}
        </span>
      )}
    </>
  );
  if (website)
    return (
      <a
        className={className}
        data-reveal
        data-reveal-order={revealOrder}
        href={project.liveUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={project.accessibleLabel}
      >
        {content}
      </a>
    );
  if (first.type === "pdf")
    return (
      <a
        className={className}
        data-reveal
        data-reveal-order={revealOrder}
        href={first.src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={project.accessibleLabel}
        onClick={(event) => {
          if (window.matchMedia("(min-width: 1024px)").matches) {
            event.preventDefault();
            openProject(project, event.currentTarget);
          }
        }}
      >
        {content}
      </a>
    );
  return (
    <button
      type="button"
      className={className}
      data-reveal
      data-reveal-order={revealOrder}
      aria-label={project.accessibleLabel}
      aria-haspopup="dialog"
      onClick={(event) => openProject(project, event.currentTarget)}
    >
      {content}
    </button>
  );
}
