import { PortfolioProvider } from "@/components/layout/portfolio-provider";
import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Hero } from "@/components/sections/hero";
import { Featured } from "@/components/sections/featured";
import { Collection } from "@/components/sections/collection";
import { Studio } from "@/components/sections/studio";
import { Process } from "@/components/sections/process";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <PortfolioProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <DesktopSidebar />
      <MobileNavigation />
      <main id="main" className="site-main">
        <Hero />
        <Featured />
        <Collection />
        <Studio />
        <Process />
        <Contact />
      </main>
    </PortfolioProvider>
  );
}
