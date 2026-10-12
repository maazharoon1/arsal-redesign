"use client";
import { useId, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  House,
  UserRound,
  Layers,
  Mail,
} from "lucide-react";
import { navigation } from "@/config/navigation";
import { site, contactTarget } from "@/config/site";
import { CategoryList } from "./category-list";
import { usePortfolio } from "./portfolio-provider";
import { SidebarHints } from "./sidebar-hints";
const navIcons = {
  Home: House,
  About: UserRound,
  Portfolio: Layers,
  Contact: Mail,
};

export function DesktopSidebar({
  onNavigate,
}: { onNavigate?: () => void } = {}) {
  const [expanded, setExpanded] = useState(true);
  const categoryListId = useId();
  const menuId = useId();
  const { sidebarCollapsed, toggleSidebar } = usePortfolio();
  return (
    <SidebarHints collapsed={sidebarCollapsed}>
      <a
        className="brand"
        href="#home"
        aria-label="ARSAL home"
        data-sidebar-label="ARSAL home"
        onClick={onNavigate}
      >
        <span className="brand-wordmark">{site.name}</span>
        <span className="brand-monogram" aria-hidden="true">
          A
        </span>
        <span className="branch-label">{site.tagline}</span>
      </a>
      <button
        className="sidebar-toggle icon-button"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        data-sidebar-label="Expand sidebar"
        aria-expanded={!sidebarCollapsed}
        aria-controls={menuId}
        onClick={toggleSidebar}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen size={19} />
        ) : (
          <PanelLeftClose size={19} />
        )}
      </button>
      <nav id={menuId} className="sidebar-menu" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = navIcons[item.label];
          if (item.label === "Portfolio")
            return (
              <div key={item.label} className="portfolio-menu">
                <div className="portfolio-menu-heading">
                  <a
                    href={item.href}
                    onClick={onNavigate}
                    aria-label={item.label}
                    data-sidebar-label={item.label}
                  >
                    <Icon size={16} aria-hidden="true" />
                    <span className="nav-label">{item.label}</span>
                  </a>
                  <button
                    className="expand-button"
                    aria-label={
                      expanded
                        ? "Collapse portfolio categories"
                        : "Expand portfolio categories"
                    }
                    aria-expanded={expanded}
                    aria-controls={categoryListId}
                    onClick={() => setExpanded(!expanded)}
                  >
                    <ChevronDown
                      size={15}
                      className={expanded ? "" : "collapsed"}
                    />
                  </button>
                </div>
                <div
                  id={categoryListId}
                  className="sidebar-categories"
                  hidden={!expanded}
                >
                  <CategoryList showIconHints />
                </div>
              </div>
            );
          return (
            <a
              key={item.label}
              className="nav-link"
              href={item.href}
              onClick={onNavigate}
              aria-label={item.label}
              data-sidebar-label={item.label}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="nav-label">{item.label}</span>
            </a>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <span className="sidebar-note">
          <i />
          {site.sidebarNote}
        </span>
        <a
          className="button button-primary"
          href={contactTarget}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          aria-label={site.contact.button}
          data-sidebar-label={site.contact.button}
        >
          <span className="nav-label">{site.contact.button}</span>
          <ArrowUpRight size={16} />
        </a>
      </div>
    </SidebarHints>
  );
}
