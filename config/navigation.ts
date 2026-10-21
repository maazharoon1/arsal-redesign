export const categories = [
  { id: "logo-design", label: "Logo Design", icon: "badge" },
  { id: "editorials", label: "Editorials", icon: "book" },
  { id: "stationery", label: "Stationery", icon: "files" },
  { id: "social-media-post", label: "Social Media Post", icon: "grid" },
  { id: "packaging", label: "Packaging", icon: "box" },
  { id: "flyers-brochures", label: "Flyers & Brochures", icon: "files" },
  { id: "brand-guidelines", label: "Brand Guidelines", icon: "book" },
  { id: "web-dev", label: "Web Dev", icon: "monitor" },
] as const;
export type CategoryId = (typeof categories)[number]["id"];
export const defaultCategory: CategoryId = "logo-design";
export function resolveCategory(value: string | null): CategoryId {
  return (
    categories.find((category) => category.id === value)?.id ?? defaultCategory
  );
}
export const navigation = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#studio" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
] as const;
