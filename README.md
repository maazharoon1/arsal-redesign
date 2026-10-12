# ARSAL portfolio

Approved indigo/lavender/coral design in the existing Next.js App Router project, with six homepage sections, a left desktop sidebar, mobile drawer/bottom bar and accessible media previews. Project titles and descriptions are never displayed.

## Develop and verify

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

PowerShell may require `npm.cmd`. Browser tests expect a running server; `PLAYWRIGHT_BASE_URL` defaults to `http://localhost:3000`. Tests use installed Chrome on Windows; set `PLAYWRIGHT_CHROME_PATH` elsewhere. Reports, traces and screenshots are ignored under `playwright-report/`, `test-results/` and `artifacts/`.

Dev/build scripts copy the installed PDF.js worker into ignored `public/pdfjs/`. Use these package scripts when preparing deployments. Existing Next.js, React, routing and Tailwind configuration are retained.

`npm run test:video` separately verifies video playback, lazy loading, cleanup, focus restoration and failures using a temporary synthetic clip against development. It temporarily changes `data/portfolio.ts`, restores the file in `finally` and deletes the clip. Run it while nobody is editing portfolio data. The supplied `public/walkthrough.mp4` remains an interaction reference and is never embedded or presented as portfolio work.

## Editing guide

| Change                                                                 | Location                                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Colors, typography, spacing, sidebar widths and motion                 | `app/globals.css`                                                              |
| Branding, homepage copy and buttons                                    | `config/site.ts`                                                               |
| Navigation and the 12 categories                                       | `config/navigation.ts`                                                         |
| Portrait path and label                                                | `config/site.ts`, `site.studio`                                                |
| Portrait asset                                                         | `public/media/arsal.webp`                                                      |
| Upwork project and inquiry destination                                 | `config/site.ts`, `site.contact`                                               |
| Supplied project IDs, categories, Cloudinary references and live links | `data/portfolio-source.json`                                                   |
| Measured image dimensions                                              | `data/portfolio-dimensions.json`                                               |
| Typed media model, mapping and featured selection                      | `data/portfolio.ts`                                                            |
| Cloudinary image/PDF URL helpers                                       | `lib/cloudinary.ts`                                                            |
| Additional local media                                                 | `public/media/projects/`                                                       |
| Hero-adjacent category strip                                           | `components/sections/featured.tsx`, `components/sections/category-marquee.tsx` |
| Homepage composition                                                   | `components/sections/`                                                         |
| Sidebar, mobile drawer, category URL and collapse state                | `components/layout/`                                                           |
| Cards, image/video/PDF previews and fallbacks                          | `components/portfolio/`                                                        |
| Adapted perspective carousel                                           | `components/ui/perspective-carousel.tsx`                                       |
| Hero parallax                                                          | `components/motion/scene.tsx`                                                  |

ARSAL is presented as a freelance graphic designer, using concise personal copy adapted from the supplied live portfolio. Desktop and contact-section Start a Project links, plus mobile Let’s Talk, open the supplied Upwork profile in a new tab. Edit the shared destination at `config/site.ts`, `site.contact.projectUrl`. The local brief builder was removed. Home, About, Portfolio and Contact section navigation remains internal.

## Supplied media and navigation

The collection contains 211 supplied projects. Titles, descriptions and commented-out entries were excluded. Bare Cloudinary references become `https://res.cloudinary.com/hcn0f9nu/image/upload/c_limit,w_384/f_auto/q_auto/v1/[reference]` thumbnails; full images request up to 2000 pixels. Supplied absolute URLs are preserved. Cloudinary optimizes directly; image dimensions reserve space and failed media has a fallback.

Add/replace supplied records in `data/portfolio-source.json` using `filter`, stable `id`, `type`, `mainImage`, optional `coverImages` and optional `liveUrl`. Additional cover images appear in the gallery. The typed `Project` model in `data/portfolio.ts` also supports local image/video records, independent optional covers/posters and future visually hidden metadata.

The retained categories are Logo Design, Editorials, Stationery, Social Media Post, Banners, Menu, Merchandise, Packaging, Flyers & Brochures, Brand Guidelines, Pitch Deck and Web Dev. 2D Animations, 3D Animations, Emotes and Overlay are removed. Stationery now contains 28 supplied projects, Merchandise 29 and Pitch Deck 16.

Category URLs use `/?category=logo-design#portfolio`, supporting refresh, direct entry and browser history. Unknown/removed IDs fall back to Logo Design. The sidebar opens by default and animates into an icon rail; previews share its collapse state.

Brand Guidelines cards show first-page covers. Mobile opens the original Cloudinary PDF in a new tab. Desktop lazily loads a PDF.js viewer with page selection, previous/next page, zoom, fit page/width, download and accessible document text. Only the selected page renders; closing cleans up loading/rendering. A failed PDF offers its original link.

Web Dev follows the supplied walkthrough: tall screenshots, four columns on large desktop, fewer columns on narrower screens, vertical preview on hover/focus and click to open the live website. Mobile does not require hover; reduced motion disables screenshot scrolling.

The section immediately below Hero is an image-only category strip following the supplied `public/heronechay.mp4` walkthrough. It uses the first project in each retained category, ordered by shared navigation. Hover reveals the category while the CSS loop keeps moving; clicking opens that collection. No pause button is shown. Touch shows category labels, keyboard browsing keeps every link reachable, and reduced motion provides a static horizontally scrollable row. The existing visibility observer stops animation offscreen and in hidden tabs. Change first-project selections by reordering portfolio source records; category names come from navigation configuration.

Large square cards open the image viewer beside the desktop sidebar. Zoom buttons, wheel/pinch zoom, drag, fit width/image, double-click reset and keyboard controls remain available. The adapted [Vengeance UI Perspective Carousel](https://raw.githubusercontent.com/Ashutoshx7/VengeanceUI/main/public/r/perspective-carousel.json) animates changes while preserving zoom. Only the active image and nearby previews mount. Reduced motion, offscreen sections and hidden tabs stop motion. Framer Motion loads with the lazy viewer.

Video assets use a poster/play control and native controls with `preload="none"`. They mount only in previews, retain landscape proportions and pause/release their source on close or media change. No actual video projects were supplied.

## Visual assets and accessibility

Studio uses the supplied portrait. Small isolated crops in `public/media/reference/` supply decorative hero panels; the full mockup is never displayed as a webpage. Architecture, orbits, reflections and process objects use lightweight CSS because original scene layers/models were unavailable. Portfolio cards use the supplied project media.

The adapted shadcn/Radix dialog provides focus trapping, Escape, scroll locking and focus restoration. Desktop navigation remains usable inside previews. Mobile uses the same category configuration, safe-area padding and touch targets. Hero pointer effects run only for fine pointers while visible, updating CSS variables without per-frame React state. Reduced motion disables parallax, animated borders and perspective effects.

Process cards adapt the inspected [Vengeance UI Glow Border Card](https://www.vengenceui.com/components/glow-border-card). Lucide supplies navigation/control icons.

## Verification coverage

Completed: production build, TypeScript and lint passed; all 18 browser tests passed against production, including the category strip, first-project selection, category links and mobile/keyboard browsing. The separate video check passed and removed its fixture. All nine supplied PDFs rendered actual artwork in the desktop viewer; the failed-PDF fallback was also checked.

Browser tests cover category navigation/history, drawer focus/dismissal, sidebar collapse inside/outside previews, image navigation/zoom/pan/pinch, perspective transitions, reduced motion, PDF rendering/controls, mobile direct PDF links, Web Dev, contact and missing-media fallbacks. Viewports: 320x740, 390x844, 540x800, 768x1024, 1024x768, 1280x600, 1440x900 and 1920x1080. Tests check overflow/browser errors and use axe on the page, drawer and viewers.

`node scripts/inspect-portfolio-assets.mjs` checks thumbnail references and updates dimensions for successful assets. Asset inspections verified all 302 unique image/cover references, including the 73 newly supplied projects. Real mobile hardware and browser engines other than Chrome were not tested.
#   a r s a l - r e d e s i g n  
 