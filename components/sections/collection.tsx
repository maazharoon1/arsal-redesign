"use client";
import { useEffect } from "react";
import { ArrowUpRight, Grid2X2 } from "lucide-react";
import { categories } from "@/config/navigation";
import { site } from "@/config/site";
import { projects } from "@/data/portfolio";
import {
  usePortfolio,
  revealCollection,
} from "@/components/layout/portfolio-provider";
import { MediaCard } from "@/components/portfolio/media-card";
export function Collection() {
  const { category } = usePortfolio();
  const selected = categories.find((item) => item.id === category)!;
  const visible = projects.filter((project) => project.categoryId === category);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("category"))
      revealCollection();
    const handleHistory = () => {
      if (window.location.hash === "#portfolio") revealCollection();
    };
    window.addEventListener("popstate", handleHistory);
    return () => window.removeEventListener("popstate", handleHistory);
  }, []);
  return (
    <section
      id="portfolio"
      className="section collection"
      aria-labelledby="collection-heading"
    >
      <p className="eyebrow" data-reveal>
        {site.collection.eyebrow}
      </p>
      <div key={category} className="section-heading-row" data-reveal>
        <h2 id="collection-heading">{selected.label}</h2>
        <span className="collection-marker" aria-hidden="true">
          <span className="status-dot" />
          SELECTED COLLECTION
        </span>
      </div>
      <p
        key={`${category}-copy`}
        className="supporting-copy"
        data-reveal
        data-reveal-order="1"
      >
        {site.collection.copy}
      </p>
      <span className="sr-only" role="status">
        {selected.label}: {visible.length} artworks
      </span>
      {visible.length ? (
        <div
          key={`${category}-grid`}
          className={`collection-grid ${category === "web-dev" ? "web-collection-grid" : ""}`}
        >
          {visible.map((project, index) => (
            <MediaCard
              key={project.id}
              project={project}
              revealOrder={index % 3}
            />
          ))}
        </div>
      ) : (
        <div className="empty-collection">
          <Grid2X2 size={32} aria-hidden="true" />
          <p>{site.collection.empty}</p>
          <span>{site.collection.emptyCopy}</span>
          <a href="#contact" className="text-link">
            Have something in mind?
            <ArrowUpRight size={16} />
          </a>
        </div>
      )}
    </section>
  );
}
