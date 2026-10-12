"use client";

import { useState, type MouseEvent } from "react";
import { ArrowUpRight, ImageOff } from "lucide-react";
import type { CategoryId } from "@/config/navigation";
import { usePortfolio } from "@/components/layout/portfolio-provider";
import { MediaImage } from "@/components/portfolio/media-image";
import { Scene } from "@/components/motion/scene";

export type CategoryPreview = {
  categoryId: CategoryId;
  label: string;
  projectId: string;
  src?: string;
  alt: string;
};

export function CategoryMarquee({ previews }: { previews: CategoryPreview[] }) {
  const { selectCategory } = usePortfolio();
  const [keyboardBrowsing, setKeyboardBrowsing] = useState(false);

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: CategoryId) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    selectCategory(id);
  }

  return (
    <Scene className="category-strip-scene">
      <div
        className="category-strip"
        data-keyboard={keyboardBrowsing}
        onFocusCapture={(event) => {
          const target = event.target;
          if (
            target instanceof HTMLElement &&
            target.matches(":focus-visible")
          ) {
            setKeyboardBrowsing(true);
            requestAnimationFrame(() =>
              target.scrollIntoView({ block: "nearest", inline: "center" }),
            );
          }
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setKeyboardBrowsing(false);
        }}
      >
        <div className="category-strip-track">
          {[false, true].map((duplicate) => (
            <div
              key={String(duplicate)}
              className="category-strip-group"
              aria-hidden={duplicate || undefined}
            >
              {previews.map((preview) => (
                <a
                  key={preview.categoryId}
                  className="category-preview"
                  href={`/?category=${preview.categoryId}#portfolio`}
                  aria-label={`Explore ${preview.label}`}
                  tabIndex={duplicate ? -1 : undefined}
                  data-category={preview.categoryId}
                  data-project-id={preview.projectId}
                  onClick={(event) => navigate(event, preview.categoryId)}
                >
                  {preview.src ? (
                    <MediaImage
                      src={preview.src}
                      alt={preview.alt}
                      sizes="(max-width: 767px) 200px, 280px"
                    />
                  ) : (
                    <span className="media-fallback">
                      <ImageOff aria-hidden="true" />
                    </span>
                  )}
                  <span className="category-preview-caption" aria-hidden="true">
                    {preview.label}
                    <ArrowUpRight size={18} />
                  </span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Scene>
  );
}
