import type { CategoryId } from "@/config/navigation";
import {
  cloudinaryImage,
  cloudinaryPdf,
  cloudinaryPdfCover,
} from "@/lib/cloudinary";
import source from "./portfolio-source.json";
import dimensions from "./portfolio-dimensions.json";

export type ImageAsset = {
  type: "image";
  src: string;
  alt: string;
  width: number;
  height: number;
};
export type VideoAsset = {
  type: "video";
  src: string;
  alt: string;
  poster?: string;
  width: number;
  height: number;
  captions?: string;
};
export type PdfAsset = { type: "pdf"; src: string; alt: string };
export type MediaAsset = ImageAsset | VideoAsset | PdfAsset;
export type Project = {
  id: string;
  categoryId: CategoryId;
  mediaType: "image" | "video" | "pdf";
  cover?: ImageAsset;
  poster?: string;
  media: [MediaAsset, ...MediaAsset[]];
  accessibleLabel: string;
  featured?: boolean;
  liveUrl?: string;
  temporary?: boolean;
  metadata?: { name?: string; year?: number; description?: string };
};
const categoryMap: Record<string, CategoryId> = {
  "Logo Design": "logo-design",
  Editorials: "editorials",
  Stationery: "stationery",
  socialmediapost: "social-media-post",
  "Social Media Post": "social-media-post",
  Banners: "banners",
  Menu: "menu",
  Merchandise: "merchandise",
  Packaging: "packaging",
  "Flyers & Brochures": "flyers-brochures",
  "Brand Guidelines": "brand-guidelines",
  "Pitch Deck": "pitch-deck",
  "Web Dev": "web-dev",
};
type SourceProject = {
  filter: string;
  id: string;
  type: string;
  mainImage: string;
  coverImages?: string[];
  liveUrl?: string;
};
const measured: Record<string, { width: number; height: number }> = dimensions;
const counters: Partial<Record<CategoryId, number>> = {};
function image(reference: string, alt: string, thumbnail = false): ImageAsset {
  const size = measured[reference] ?? { width: 1600, height: 1600 };
  return {
    type: "image",
    src: cloudinaryImage(reference, thumbnail ? 384 : 2000),
    alt,
    ...size,
  };
}

// Supplied project assets only. Titles/descriptions are intentionally not imported.
export const projects: Project[] = (source as SourceProject[]).map((entry) => {
  const categoryId = categoryMap[entry.filter];
  if (!categoryId)
    throw new Error(`Unknown portfolio category: ${entry.filter}`);
  const position = (counters[categoryId] = (counters[categoryId] ?? 0) + 1);
  const accessibleLabel =
    categoryId === "logo-design"
      ? `Open logo artwork ${position}`
      : categoryId === "web-dev"
        ? `Open website ${position}`
        : entry.type === "pdf"
          ? `Open Brand Guidelines PDF ${position}`
          : `Open ${entry.filter} artwork ${position}`;
  if (entry.type === "pdf") {
    return {
      id: entry.id,
      categoryId,
      mediaType: "pdf",
      accessibleLabel,
      cover: {
        type: "image",
        src: cloudinaryPdfCover(entry.mainImage),
        alt: `Brand Guidelines document ${position}`,
        ...(measured[entry.mainImage] ?? { width: 600, height: 800 }),
      },
      media: [
        {
          type: "pdf",
          src: cloudinaryPdf(entry.mainImage),
          alt: `Brand Guidelines document ${position}`,
        },
      ],
    };
  }
  const references = [
    ...new Set([entry.mainImage, ...(entry.coverImages ?? [])]),
  ];
  return {
    id: entry.id,
    categoryId,
    mediaType: "image",
    accessibleLabel,
    liveUrl: entry.liveUrl,
    cover: image(entry.mainImage, `${entry.filter} artwork ${position}`, true),
    media: references.map((reference, index) =>
      image(
        reference,
        `${entry.filter} artwork ${position}, image ${index + 1}`,
      ),
    ) as [ImageAsset, ...ImageAsset[]],
    featured: ["HHFarm", "bookcover1", "Packaging1"].includes(entry.id),
  };
});
