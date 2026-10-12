"use client";
import { useState } from "react";
import { ArrowUpRight, Grid2X2 } from "lucide-react";
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
  return (
    <>
      <header className="mobile-header">
        <a className="brand" href="#home">
          {site.name}
          <span>{site.tagline}</span>
        </a>
        <nav aria-label="Mobile navigation">
          {navigation
            .filter(
              (item) => item.label === "About" || item.label === "Contact",
            )
            .map((item) => (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
        </nav>
      </header>
      <div className="mobile-bottom-bar">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="mobile-category-trigger">
              <Grid2X2 size={18} />
              Categories
            </button>
          </DialogTrigger>
          <DialogContent className="category-drawer">
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
