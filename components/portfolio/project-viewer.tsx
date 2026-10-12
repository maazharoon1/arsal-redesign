"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ZoomableImage } from "./zoomable-image";
import { projects, type VideoAsset, type Project } from "@/data/portfolio";
import { categories } from "@/config/navigation";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { usePortfolio } from "@/components/layout/portfolio-provider";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("./pdf-viewer"), { ssr: false });
function VideoPlayer({
  asset,
  poster,
}: {
  asset: VideoAsset;
  poster?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    // Restore the source on effect setup: React Strict Mode intentionally runs
    // setup/cleanup/setup in development, and cleanup releases the old source.
    if (video) video.src = asset.src;
    return () => {
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
  }, [asset.src]);
  return failed ? (
    <div className="media-fallback">
      <AlertCircle />
      <span>Video unavailable</span>
    </div>
  ) : (
    <video
      ref={ref}
      src={asset.src}
      poster={asset.poster ?? poster}
      controls
      playsInline
      preload="none"
      aria-label={asset.alt}
      onError={() => setFailed(true)}
    >
      {asset.captions && (
        <track
          kind="captions"
          src={asset.captions}
          srcLang="en"
          label="English"
          default
        />
      )}
    </video>
  );
}
export default function ProjectViewer({
  project,
  onClose,
  restoreFocus,
}: {
  project: Project;
  onClose: () => void;
  restoreFocus: () => void;
}) {
  const { sidebarCollapsed } = usePortfolio();
  const categoryProjects = projects.filter(
    (item) => item.categoryId === project.categoryId,
  );
  const entries = (
    categoryProjects.some((item) => item.id === project.id)
      ? categoryProjects
      : [project]
  ).flatMap((item) => item.media.map((asset) => ({ project: item, asset })));
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      entries.findIndex((entry) => entry.project.id === project.id),
    ),
  );
  const media = entries[index].asset;
  const activeProject = entries[index].project;
  function navigate(direction: number) {
    setIndex(
      (current) => (current + direction + entries.length) % entries.length,
    );
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="viewer-shell"
        data-sidebar-collapsed={sidebarCollapsed}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          restoreFocus();
        }}
        onKeyDown={(event) => {
          if (
            event.target instanceof HTMLVideoElement ||
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            entries.length < 2
          )
            return;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            navigate(1);
          }
        }}
      >
        <DesktopSidebar onNavigate={onClose} />
        <div className="viewer-panel">
          <div className="project-viewer">
            <DialogTitle className="sr-only">
              {activeProject.accessibleLabel}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Media preview. Use Escape to close
              {entries.length > 1
                ? " and the arrow keys to browse images."
                : "."}
            </DialogDescription>
            <header className="viewer-header">
              <p className="viewer-category">
                {
                  categories.find(
                    (category) => category.id === project.categoryId,
                  )?.label
                }
              </p>
              <span className="viewer-count" aria-live="polite">
                {index + 1} / {entries.length}
              </span>
            </header>
            <div className="viewer-stage">
              <div className="viewer-media">
                {media.type === "image" ? (
                  <ZoomableImage
                    asset={media}
                    activeIndex={index}
                    onActiveIndexChange={setIndex}
                    items={entries.map((entry, entryIndex) => ({
                      id: `${entry.project.id}-${entryIndex}`,
                      title: entry.project.accessibleLabel,
                      alt: entry.asset.alt,
                      src:
                        entry.asset.type === "image"
                          ? entry.asset.src
                          : ((entry.asset.type === "video"
                              ? entry.asset.poster
                              : undefined) ??
                            entry.project.poster ??
                            entry.project.cover?.src),
                      mediaType: entry.asset.type,
                    }))}
                  />
                ) : media.type === "pdf" ? (
                  <PdfViewer key={media.src} asset={media} />
                ) : (
                  <VideoPlayer
                    key={media.src}
                    asset={media}
                    poster={activeProject.poster ?? activeProject.cover?.src}
                  />
                )}
              </div>
              {entries.length > 1 && (
                <div className="viewer-navigation">
                  <button
                    className="icon-button"
                    aria-label={
                      media.type === "pdf"
                        ? "Previous document"
                        : "Previous image"
                    }
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <span className="sr-only">
                    {index + 1} / {entries.length}
                  </span>
                  <button
                    className="icon-button"
                    aria-label={
                      media.type === "pdf" ? "Next document" : "Next image"
                    }
                    onClick={() => navigate(1)}
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
