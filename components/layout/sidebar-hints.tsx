"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Hint = { label: string; left: number; top: number; bridge: number };

/** Keep icon labels outside the sidebar's scrolling menu so they aren't clipped. */
export function SidebarHints({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: ReactNode;
}) {
  const [hint, setHint] = useState<Hint | null>(null);
  const anchor = useRef<HTMLElement | null>(null);

  function hide() {
    anchor.current = null;
    setHint(null);
  }

  function show(target: EventTarget, sidebar: HTMLElement) {
    if (!collapsed || !(target instanceof Element)) return;
    const element = target.closest<HTMLElement>("[data-sidebar-label]");
    if (!element || element === anchor.current) return;
    anchor.current = element;
    const bounds = element.getBoundingClientRect();
    const left =
      Math.max(sidebar.getBoundingClientRect().right, bounds.right) + 8;
    setHint({
      label: element.dataset.sidebarLabel!,
      left,
      bridge: Math.max(8, left - bounds.right),
      top: Math.max(
        24,
        Math.min(innerHeight - 24, bounds.top + bounds.height / 2),
      ),
    });
  }

  useEffect(() => {
    function dismiss(event: KeyboardEvent | UIEvent) {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      anchor.current = null;
      setHint(null);
    }
    window.addEventListener("keydown", dismiss);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("resize", dismiss);
    };
  }, []);

  return (
    <aside
      className={`desktop-sidebar ${collapsed ? "is-collapsed" : ""}`}
      onPointerOver={(event) => {
        if (event.pointerType !== "touch")
          show(event.target, event.currentTarget);
      }}
      onFocusCapture={(event) => show(event.target, event.currentTarget)}
      onPointerLeave={() => {
        if (anchor.current !== document.activeElement) hide();
      }}
      onBlurCapture={hide}
      onClickCapture={hide}
      onScrollCapture={(event) => {
        const sidebar = event.currentTarget;
        const hovered = sidebar.querySelector<HTMLElement>(
          "[data-sidebar-label]:hover",
        );
        const focused =
          anchor.current === document.activeElement ? anchor.current : null;
        hide();
        if (hovered || focused) show((hovered ?? focused)!, sidebar);
      }}
      onTransitionEnd={(event) => {
        if (
          event.target !== event.currentTarget ||
          event.propertyName !== "width"
        )
          return;
        const current = anchor.current;
        if (current) {
          anchor.current = null;
          show(current, event.currentTarget);
        }
      }}
    >
      {children}
      {collapsed && hint && (
        <span
          role="tooltip"
          className="sidebar-tooltip"
          style={
            {
              left: hint.left,
              top: hint.top,
              "--tooltip-bridge-width": `${hint.bridge}px`,
            } as CSSProperties
          }
        >
          {hint.label}
        </span>
      )}
    </aside>
  );
}
