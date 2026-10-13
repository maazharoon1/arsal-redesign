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

`npm run test:video` separately verifies video playback, lazy loading, cleanup, focus restoration and failures using a temporary synthetic clip against development. It temporarily changes `data/portfolio.ts`, restores the file in `finally` and deletes the clip. Run it while nobody is editing portfolio data. The supplied `design-references/walkthrough.mp4` remains a local, ignored interaction reference and is never embedded or presented as portfolio work.

## Editing guide

| Change                                                                 | Location                                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Colors, typography, spacing, sidebar widths and motion                 | `app/globals.css`                                                              |
| Branding, homepage copy and buttons                                    | `config/site.ts`                                                               |
| Navigation and the 12 categories                                       | `config/navigation.ts`                                                         |
| Hero and Studio portrait paths and labels                              | `config/site.ts`, `site.hero.portrait` and `site.studio`                        |
| Optimized hero portrait / existing Studio portrait                      | `public/media/hero-portrait.webp` / `public/media/arsal.webp`                   |
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
| Hero layout, colors and decorative layers                              | `components/sections/hero.css`, `components/sections/hero-decorations.tsx`     |
| Reveal duration, distance and stagger settings                         | `config/motion.ts`, `components/motion/site-motion.tsx`                       |
| Shared interaction and overlay motion                                 | `components/motion/motion.css`, motion tokens in `app/globals.css`            |

ARSAL is presented as a freelance graphic designer, using concise personal copy adapted from the supplied live portfolio. Desktop and contact-section Start a Project links, plus mobile Let’s Talk, open the supplied Upwork profile in a new tab. Edit the shared destination at `config/site.ts`, `site.contact.projectUrl`. The local brief builder was removed. Home, About, Portfolio and Contact section navigation remains internal.

## Supplied media and navigation

The collection contains 211 supplied projects. Titles, descriptions and commented-out entries were excluded. Bare Cloudinary references become `https://res.cloudinary.com/hcn0f9nu/image/upload/c_limit,w_384/f_auto/q_auto/v1/[reference]` thumbnails; full images request up to 2000 pixels. Supplied absolute URLs are preserved. Cloudinary optimizes directly; image dimensions reserve space and failed media has a fallback.

Add/replace supplied records in `data/portfolio-source.json` using `filter`, stable `id`, `type`, `mainImage`, optional `coverImages` and optional `liveUrl`. Additional cover images appear in the gallery. The typed `Project` model in `data/portfolio.ts` also supports local image/video records, independent optional covers/posters and future visually hidden metadata.

The retained categories are Logo Design, Editorials, Stationery, Social Media Post, Banners, Menu, Merchandise, Packaging, Flyers & Brochures, Brand Guidelines, Pitch Deck and Web Dev. 2D Animations, 3D Animations, Emotes and Overlay are removed. Stationery now contains 28 supplied projects, Merchandise 29 and Pitch Deck 16.

Category URLs use `/?category=logo-design#portfolio`, supporting refresh, direct entry and browser history. Unknown/removed IDs fall back to Logo Design. The sidebar opens by default and animates into an icon rail; previews share its collapse state.

Brand Guidelines cards show first-page covers. Mobile opens the original Cloudinary PDF in a new tab. Desktop lazily loads a PDF.js viewer with page selection, previous/next page, zoom, fit page/width, download and accessible document text. Only the selected page renders; closing cleans up loading/rendering. A failed PDF offers its original link.

Web Dev follows the supplied walkthrough: tall screenshots, three fluid columns on desktop and two on mobile/tablet, vertical preview on hover/focus and click to open the live website. Mobile does not require hover; reduced motion disables screenshot scrolling.

The section immediately below Hero is an image-only category strip following the supplied `design-references/heronechay.mp4` walkthrough. It uses the first project in each retained category, ordered by shared navigation. Hover reveals the category while the CSS loop keeps moving; clicking opens that collection. No pause button is shown. Touch shows category labels, keyboard browsing keeps every link reachable, and reduced motion provides a static horizontally scrollable row. The existing visibility observer stops animation offscreen and in hidden tabs. Change first-project selections by reordering portfolio source records; category names come from navigation configuration.

The artwork collection uses three fluid columns on desktop and two on mobile/tablet, including narrow phones. Square cards use contain-fit images without hover scaling, so artwork is shown without cropping. Video cards retain landscape proportions. Cards open the image viewer beside the desktop sidebar. Zoom buttons, wheel/pinch zoom, mouse/touch drag, fit width/image, double-click reset and keyboard controls remain available. Image scrollbars are hidden while native scroll offsets support panning. Fit sizing uses stable integer viewport measurements, and repeated Fit width keeps the dimensions steady. The adapted [Vengeance UI Perspective Carousel](https://raw.githubusercontent.com/Ashutoshx7/VengeanceUI/main/public/r/perspective-carousel.json) animates changes while preserving zoom. Only the active image and nearby previews mount. Reduced motion, offscreen sections and hidden tabs stop motion. Framer Motion loads with the lazy viewer.

Video assets use a poster/play control and native controls with `preload="none"`. They mount only in previews, retain landscape proportions and pause/release their source on close or media change. No actual video projects were supplied.

## Visual assets and accessibility

The portrait-led hero uses `public/media/hero-portrait.webp`, a 120 KB alpha-preserving WebP optimized from the supplied original PNG without resizing, cropping or changing its content. The original PNG and desktop/mobile mockups are preserved byte-for-byte in ignored `design-references/`, outside the deployed public folder. Next Image provides responsive delivery, reserved proportions and hero preloading. Studio retains its existing portrait. The superseded hero panels, rings and their three unused raster crops were removed. Flowing background shapes and fine lines are separate SVG layers; oversized ARSAL remains HTML text. Portfolio cards and the immediately following category strip retain their supplied media and order.

The adapted shadcn/Radix dialog provides focus trapping, Escape, scroll locking and focus restoration. Desktop navigation remains usable inside previews. Mobile has a compact header menu and the existing Categories/Let’s Talk bottom bar, shared navigation, safe-area padding and touch targets. Below 1024px, the portrait-only hero and header together occupy 62svh (60svh on short screens); the desktop heading, copy, CTA and scroll cue are hidden. All hero layers stay stable during scroll. The ARSAL word uses a one-time masked entrance, the loaded portrait fades gently upward, and desktop copy/CTA enter in a short sequence. `components/sections/hero.css` controls these entrances.

One IntersectionObserver reveals marked section text/cards once per mount using the browser’s native animation API. Newly selected category cards use the same short stagger. Movement is halved on compact screens; reduced motion, keyboard focus and hidden tabs finish/skip reveals. Markup stays visible without JavaScript, and interactions never wait for animations. Removed nodes and animation observers/listeners are cleaned up. There are no hero scroll listeners, pointer-follow effects or frame-by-frame React updates. Shared easing and 200–450ms interaction/overlay timings live in motion tokens; hero entrances use 400–650ms. Radix keeps overlays mounted through their closing fade, with video source cleanup starting immediately on dismissal. Full-viewport backdrop blur and continuous process-border rotation were removed; the existing purposeful category strip keeps its original scrolling behavior. One local variable sans font serves the used 400–500 weight range; the unused mono font is no longer loaded.

Process cards adapt the inspected [Vengeance UI Glow Border Card](https://www.vengenceui.com/components/glow-border-card). Lucide supplies navigation/control icons.

## Verification coverage

Motion refinement: lint, TypeScript and production build passed. All 33 development browser checks passed, including stable hero layers, one-time entrances, section/card reveals, category changes, keyboard/focus behavior, accessibility and existing portfolio functionality. Three focused production motion checks passed on desktop and mobile. Production screenshots and measurements confirmed no console errors, horizontal overflow or initial layout shift, no remaining running hero animation after entrance, one portrait preload and closing overlay fades. Chrome checks include 360px and 390px phones, short screens, tablet and desktop. The video check now runs with motion enabled and passed lazy loading, playback, source release during dismissal, focus restoration and failure handling; it restored portfolio data and removed its fixture. Earlier checks also verified all nine supplied PDFs and their failure fallback.

Browser tests cover category navigation/history, drawer focus/dismissal, sidebar collapse inside/outside previews, image navigation/zoom/pan/pinch, perspective transitions, reduced motion, PDF rendering/controls, mobile direct PDF links, Web Dev, contact and missing-media fallbacks. Viewports: 320x740, 390x844, 540x800, 768x1024, 1024x768, 1280x600, 1440x900 and 1920x1080. Tests check overflow/browser errors and use axe on the page, drawer and viewers.

`node scripts/inspect-portfolio-assets.mjs` checks thumbnail references and updates dimensions for successful assets. Asset inspections verified all 302 unique image/cover references, including the 73 newly supplied projects. Real mobile hardware and browser engines other than Chrome were not tested.
## GitHub and Vercel readiness

Use the project root as Vercel's Root Directory. `vercel.json` selects Next.js, installs the preserved npm lockfile with `npm ci --include=dev`, and runs `npm run build`. The build script prepares the required PDF.js worker before Next builds. Leave Output Directory at the Next.js default; no static export or custom server is configured. Node 24.x is declared in `package.json` and the lockfile, matching the locally verified runtime. No runtime environment variables are currently required; `.env.example` contains sanitized optional browser-test settings. See [Vercel build settings](https://vercel.com/docs/builds/configure-a-build) and [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

Keep source, configuration, documentation, tests/helpers, `package.json`, `package-lock.json`, `app/icon.svg`, `app/favicon.ico` and active public assets in Git. The font comes from the installed `geist` package, so do not copy or commit `node_modules`. The retained reference images are `contact-scene.webp` (used on the page) and `logo-01.webp` (used by the video verification fixture). `public/pdfjs/` stays ignored because dev/build regenerate its worker from the locked dependency.

Local-only files remain on disk and are ignored: dependencies/build output, test reports/screenshots/traces, caches, local environment/credential files, editor metadata, Vercel metadata and `design-references/`. The latter contains the three supplied design/portrait PNGs and two walkthrough videos; the tracked walkthroughs were selectively removed from Git's index, with local content preserved. No Git history was rewritten.

Cleanup removed `public/debug.mp4`, five unused starter SVGs (file, globe, next, vercel, window), unused featured crops (digital, identity, sculpture), logo crops 02–06 and the abandoned `scripts/prepare-reference-assets.mjs`. Earlier hero-panel deletions were preserved. Public/CSS/configuration/data/metadata/test references were checked before removal. Existing screenshots and unrelated edits were retained. A filename and known-signature audit of the current files and tracked HEAD found no tracked environment/credential files or obvious secret signatures; this is not an exhaustive historical secret scan.

Cleanup verification passed lint, type-check and production build. Hash checks confirmed retained source and relocated references were unchanged, all dependency versions were preserved, and no tracked files matched ignore rules. Production HTTP checks returned 200 for the homepage, both metadata icons, both portraits, contact artwork, the video-test poster, bundled font and PDF.js worker; the worker matches its installed locked dependency. The final Git deletion list contained only the verified cleanup targets and prior approved hero-asset deletions.

No commit, push or deployment was performed. Review all prior feature changes as well as this cleanup when preparing your commit. The local build and configuration were verified; an actual Vercel cloud deployment was not run.

# arsal-redesign

TODO:
continue krna hai portfolio section ko aur  hero ko redesign krwana hai sath mai images public section mai hai phir fully optimized krna hai gpt ko logo lagana hai seo aur optimized krny hai fazul chizen git phr push nhi krny
