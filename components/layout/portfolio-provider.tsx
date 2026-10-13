"use client";
import {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import {
  defaultCategory,
  resolveCategory,
  type CategoryId,
} from "@/config/navigation";
import type { Project } from "@/data/portfolio";
const ProjectViewer = dynamic(
  () => import("@/components/portfolio/project-viewer"),
  { ssr: false },
);
const CATEGORY_EVENT = "arsal:category";
function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(CATEGORY_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(CATEGORY_EVENT, callback);
  };
}
function snapshot() {
  return resolveCategory(
    new URLSearchParams(window.location.search).get("category"),
  );
}
export function revealCollection() {
  document.getElementById("portfolio")?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
}
type PortfolioContext = {
  category: CategoryId;
  selectCategory: (id: CategoryId) => void;
  openProject: (project: Project, trigger: HTMLElement) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};
const Context = createContext<PortfolioContext | null>(null);
export function usePortfolio() {
  const context = useContext(Context);
  if (!context) throw new Error("Portfolio controls require PortfolioProvider");
  return context;
}
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const category = useSyncExternalStore(
    subscribe,
    snapshot,
    () => defaultCategory,
  );
  const [project, setProject] = useState<Project | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  function selectCategory(id: CategoryId) {
    if (project) {
      returnFocus.current = document.querySelector<HTMLButtonElement>(
        `.desktop-sidebar [data-category="${id}"]`,
      );
      setViewerOpen(false);
    }
    const url = new URL(window.location.href);
    url.searchParams.set("category", id);
    url.hash = "portfolio";
    if (snapshot() !== id || window.location.hash !== "#portfolio")
      window.history.pushState(null, "", url);
    window.dispatchEvent(new Event(CATEGORY_EVENT));
    requestAnimationFrame(revealCollection);
  }
  return (
    <Context.Provider
      value={{
        category,
        selectCategory,
        sidebarCollapsed,
        toggleSidebar: () => setSidebarCollapsed((collapsed) => !collapsed),
        openProject: (item, trigger) => {
          returnFocus.current = trigger;
          setProject(item);
          setViewerOpen(true);
        },
      }}
    >
      <div
        className={`portfolio-layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        {children}
      </div>
      {project && (
        <ProjectViewer
          key={project.id}
          project={project}
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          onClosed={() => setProject(null)}
          restoreFocus={() =>
            returnFocus.current?.focus({ preventScroll: true })
          }
        />
      )}
    </Context.Provider>
  );
}
