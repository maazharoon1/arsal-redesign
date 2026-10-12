"use client";
import {
  Badge,
  BookOpen,
  Files,
  Grid2X2,
  Monitor,
  Shirt,
  Box,
  PanelsTopLeft,
  Orbit,
  Smile,
  Layers,
  Check,
} from "lucide-react";
import { categories } from "@/config/navigation";
import { usePortfolio } from "./portfolio-provider";
const icons = {
  badge: Badge,
  book: BookOpen,
  files: Files,
  grid: Grid2X2,
  monitor: Monitor,
  shirt: Shirt,
  box: Box,
  panels: PanelsTopLeft,
  orbit: Orbit,
  smile: Smile,
  layers: Layers,
};
export function CategoryList({
  onSelect,
  showIconHints = false,
}: {
  onSelect?: () => void;
  showIconHints?: boolean;
}) {
  const { category, selectCategory } = usePortfolio();
  return (
    <ul className="category-list">
      {categories.map(({ id, label, icon }) => {
        const Icon = icons[icon];
        return (
          <li key={id}>
            <button
              type="button"
              className={`category-button ${category === id ? "active" : ""}`}
              aria-pressed={category === id}
              aria-label={label}
              data-category={id}
              data-sidebar-label={showIconHints ? label : undefined}
              onClick={() => {
                selectCategory(id);
                onSelect?.();
              }}
            >
              <Icon size={15} aria-hidden="true" />
              <span className="category-label">{label}</span>
              {category === id && (
                <Check
                  className="category-check"
                  size={12}
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
