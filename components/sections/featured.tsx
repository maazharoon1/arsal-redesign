import { categories } from "@/config/navigation";
import { projects } from "@/data/portfolio";
import { CategoryMarquee, type CategoryPreview } from "./category-marquee";

export function Featured() {
  const previews: CategoryPreview[] = categories.flatMap(({ id, label }) => {
    const project = projects.find((entry) => entry.categoryId === id);
    if (!project) return [];
    const first = project.media[0];
    const src =
      project.cover?.src ??
      project.poster ??
      (first.type === "image"
        ? first.src
        : first.type === "video"
          ? first.poster
          : undefined);
    return [
      {
        categoryId: id,
        label,
        projectId: project.id,
        src,
        alt: project.cover?.alt ?? first.alt,
      },
    ];
  });
  return (
    <section
      id="featured"
      className="section featured category-showcase"
      aria-label="Explore portfolio categories"
    >
      <CategoryMarquee previews={previews} />
    </section>
  );
}
