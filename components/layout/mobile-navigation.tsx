"use client";
import { useState } from "react";
import { ArrowUpRight, Grid2X2, Menu } from "lucide-react";
import { site, contactTarget } from "@/config/site";
import { navigation } from "@/config/navigation";
import { CategoryList } from "./category-list";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <header className="mobile-header">
        <a className="brand" href="#home">
          {site.name}
          <span>{site.tagline}</span>
        </a>
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild>
            <button
              className="mobile-menu-trigger"
              aria-label="Open navigation"
            >
              <Menu size={24} />
            </button>
          </DialogTrigger>
          <DialogContent
            className="category-drawer mobile-menu"
            closeLabel="Close navigation"
          >
            <DialogTitle className="drawer-title">{site.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Navigate Arsal’s portfolio.
            </DialogDescription>
            <nav aria-label="Mobile navigation">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </DialogContent>
        </Dialog>
      </header>
      <div className="mobile-bottom-bar">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="mobile-category-trigger">
              <Grid2X2 size={18} />
              Categories
            </button>
          </DialogTrigger>
          <DialogContent
            className="category-drawer"
            closeLabel="Close categories"
          >
            <DialogTitle className="drawer-title">
              Explore the collection
            </DialogTitle>
            <DialogDescription className="sr-only">
              Select a category to browse its artwork.
            </DialogDescription>
            <nav aria-label="Portfolio categories">
              <CategoryList onSelect={() => setOpen(false)} />
            </nav>
          </DialogContent>
        </Dialog>
        <a
          className="mobile-talk"
          href={contactTarget}
          target="_blank"
          rel="noopener noreferrer"
        >
          Let’s Talk
          <ArrowUpRight size={18} />
        </a>
      </div>
    </>
  );
}
