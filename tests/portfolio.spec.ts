import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { categories } from "../config/navigation";

async function ready(page: Page, url = "/") {
  await page.goto(url);
  await expect(page.locator("#home")).toBeVisible();
  // The interactive selection confirms hydration before testing client controls.
  await expect(page.locator(".category-button.active").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("all configured desktop categories, active state, direct entry, refresh and history", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const sidebar = page.getByRole("navigation", { name: "Main navigation" });
  for (const category of categories) {
    await sidebar
      .getByRole("button", { name: category.label, exact: true })
      .click();
    await expect(page.locator("#collection-heading")).toHaveText(
      category.label,
    );
    await expect(
      sidebar.getByRole("button", { name: category.label, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(
      new RegExp(`category=${category.id}#portfolio`),
    );
    expect(
      await page
        .locator("#portfolio")
        .evaluate((element) => element.getBoundingClientRect().top),
    ).toBeLessThan(100);
  }
  await page.goBack();
  await expect(page.locator("#collection-heading")).toHaveText(
    categories.at(-2)!.label,
  );
  await page.goForward();
  await expect(page.locator("#collection-heading")).toHaveText("Web Dev");
  for (const category of categories) {
    await page.goto(`/?category=${category.id}#portfolio`);
    await expect(page.locator("#collection-heading")).toHaveText(
      category.label,
    );
  }
  await page.reload();
  await expect(page.locator("#collection-heading")).toHaveText("Web Dev");
  await page.goto("/?category=invalid");
  await expect(page.locator("#collection-heading")).toHaveText("Logo Design");
});

test("mobile drawer selects every category, traps focus, restores focus and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  const trigger = page.getByRole("button", { name: "Categories", exact: true });
  for (const category of categories) {
    await trigger.click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByRole("button", { name: category.label, exact: true }),
    ).toBeVisible();
    await drawer
      .getByRole("button", { name: category.label, exact: true })
      .click();
    await expect(drawer).toHaveCount(0);
    await expect(page.locator("#collection-heading")).toHaveText(
      category.label,
    );
    await expect(trigger).toBeFocused();
    await noOverflow(page);
    expect(
      await page
        .locator("#portfolio")
        .evaluate((element) => element.getBoundingClientRect().top),
    ).toBeLessThan(140);
  }
  await trigger.click();
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest('[role="dialog"]'),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.context().route("https://www.upwork.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>Upwork link check</title>",
    }),
  );
  const talkPopup = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Let’s Talk" }).click();
  const profile = await talkPopup;
  await expect(profile).toHaveURL(
    "https://www.upwork.com/freelancers/~01248943391f6622e5?mp_source=share",
  );
  await profile.close();
});

test("media-only viewer, multiple images, buttons, arrow keys, Escape and restored focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const artwork = page
    .getByRole("button", { name: "Open logo artwork 1" })
    .first();
  await artwork.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".viewer-navigation")).toContainText("1 / 114");
  await page.getByRole("button", { name: "Next image" }).click();
  await expect(page.locator(".viewer-navigation")).toContainText("2 / 114");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".viewer-navigation")).toContainText("3 / 114");
  await page.getByRole("button", { name: "Previous image" }).click();
  await expect(page.locator(".viewer-navigation")).toContainText("2 / 114");
  // Screen reader titles are visually hidden. No visible project headings or prose.
  await expect(page.locator(".project-viewer h2")).toHaveClass("sr-only");
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest('[role="dialog"]'),
      ),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(artwork).toBeFocused();
  await artwork.click();
  await page.getByRole("button", { name: "Close preview" }).click();
  await expect(artwork).toBeFocused();
  await expect(
    page.locator(".media-card h2, .media-card h3, .media-card p"),
  ).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
});

test("desktop navigation stays accessible during project previews", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page
    .getByRole("button", { name: "Open logo artwork 1" })
    .first()
    .click();
  const viewer = page.getByRole("dialog");
  const navigation = viewer.getByRole("navigation", {
    name: "Main navigation",
  });
  await expect(navigation).toBeVisible();
  await navigation
    .getByRole("button", { name: "Editorials", exact: true })
    .click();
  await expect(viewer).toHaveCount(0);
  await expect(page.locator("#collection-heading")).toHaveText("Editorials");
  await expect(
    page.getByRole("button", { name: "Editorials", exact: true }),
  ).toBeFocused();
  for (const [label, hash] of [
    ["Home", "home"],
    ["About", "studio"],
    ["Contact", "contact"],
  ]) {
    await page.locator("#portfolio .media-card").first().click();
    await page
      .getByRole("dialog")
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`#${hash}$`));
    await expect(page.locator(`#${hash}`)).toBeInViewport();
  }
});

test("navigation targets, category previews, personal ARSAL branding and Upwork project links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const sidebar = page.getByRole("navigation", { name: "Main navigation" });
  for (const [label, id] of [
    ["Home", "home"],
    ["About", "studio"],
    ["Portfolio", "portfolio"],
    ["Contact", "contact"],
  ]) {
    await sidebar.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await sidebar
    .getByRole("button", { name: "Collapse portfolio categories" })
    .click();
  await expect(page.locator(".sidebar-categories")).toBeHidden();
  await sidebar
    .getByRole("button", { name: "Expand portfolio categories" })
    .click();
  await expect(page.locator(".sidebar-categories")).toBeVisible();
  await expect(
    page.locator("#featured .category-strip-group").first().locator("a"),
  ).toHaveCount(categories.length);
  await expect(page.locator("body")).not.toContainText(/warsal/i);
  await expect(page.locator("#studio-heading")).toContainText("I’m Arsal.");
  await expect(page).toHaveTitle("ARSAL — Freelance graphic designer");
  await page.context().route("https://www.upwork.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>Upwork link check</title>",
    }),
  );
  for (const link of [
    page.locator(".sidebar-bottom a"),
    page.locator(".contact-actions a"),
  ]) {
    await expect(link).toHaveAttribute(
      "href",
      "https://www.upwork.com/freelancers/~01248943391f6622e5?mp_source=share",
    );
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const opened = page.waitForEvent("popup");
    await link.click();
    const profile = await opened;
    await expect(profile).toHaveURL(
      "https://www.upwork.com/freelancers/~01248943391f6622e5?mp_source=share",
    );
    await profile.close();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});

test("viewport layouts, short sidebar, no clipping, screenshots and console errors", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const [name, width, height] of [
    ["mobile-small", 320, 740],
    ["mobile", 390, 844],
    ["mobile-wide", 540, 800],
    ["tablet", 768, 1024],
    ["tablet-landscape", 1024, 768],
    ["desktop-short", 1280, 600],
    ["desktop", 1440, 900],
    ["desktop-large", 1920, 1080],
  ] as const) {
    await page.setViewportSize({ width, height });
    await ready(page);
    for (const id of [
      "home",
      "featured",
      "portfolio",
      "studio",
      "process",
      "contact",
    ]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await noOverflow(page);
    }
    await page.locator("#home").scrollIntoViewIfNeeded();
    if (width >= 1024) {
      const start = await page.locator(".sidebar-bottom").boundingBox();
      expect(start!.y + start!.height).toBeLessThanOrEqual(height);
      await page
        .locator(".desktop-sidebar")
        .getByRole("button", { name: "Web Dev", exact: true })
        .scrollIntoViewIfNeeded();
      await expect(
        page
          .locator(".desktop-sidebar")
          .getByRole("button", { name: "Web Dev", exact: true }),
      ).toBeInViewport();
    } else {
      await page.locator(".footer").scrollIntoViewIfNeeded();
      const footer = await page.locator(".footer").boundingBox();
      const bar = await page.locator(".mobile-bottom-bar").boundingBox();
      expect(footer!.y + footer!.height).toBeLessThanOrEqual(bar!.y);
    }
    await page.screenshot({
      path: `artifacts/${name}-verified.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

test("reduced motion and visibility-aware category scene with stable hero layers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.locator("#process").scrollIntoViewIfNeeded();
  await expect(page.locator(".process-grid")).toHaveAttribute(
    "data-in-view",
    "false",
  );
  expect(
    await page
      .locator(".glow-conic")
      .first()
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".process-grid")).toHaveAttribute(
    "data-in-view",
    "true",
  );
  await page.locator("#home").scrollIntoViewIfNeeded();
  await expect(page.locator(".process-grid")).toHaveAttribute(
    "data-in-view",
    "false",
  );
  const transform = await page
    .locator(".hero-portrait-layer")
    .evaluate((element) => getComputedStyle(element).transform);
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: "instant" }));
  expect(
    await page
      .locator(".hero-portrait-layer")
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe(transform);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".hero-wordmark > span")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("touch devices have no pointer-follow motion and retain readable navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000");
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.locator("#home").dispatchEvent("pointermove", {
    clientX: 350,
    clientY: 550,
    pointerType: "touch",
  });
  const value = await page
    .locator("#home")
    .evaluate((element) => element.style.getPropertyValue("--pointer-x"));
  expect(["", "0deg"]).toContain(value);
  await page.getByRole("button", { name: "Categories", exact: true }).tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Logo Design", exact: true })
    .tap();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await noOverflow(page);
  await context.close();
});

test("failed project media has a graceful fallback and remains closable", async ({
  page,
}) => {
  await page.route("**/*", async (route) => {
    const source =
      new URL(route.request().url()).searchParams.get("url") ??
      route.request().url();
    if (source?.includes("Upwork_Dimensions_for_portfolio_pHASE_3-24"))
      await route.abort();
    else await route.continue();
  });
  await ready(page);
  await page.locator("#portfolio").scrollIntoViewIfNeeded();
  const card = page
    .getByRole("button", { name: "Open logo artwork 1" })
    .first();
  await expect(card).toContainText("Media unavailable");
  await card.click();
  await expect(page.getByRole("dialog")).toContainText("Media unavailable");
  await page.keyboard.press("Escape");
  await expect(card).toBeFocused();
});

test("keyboard skip link and accessibility checks on desktop, viewer and mobile drawer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole("button", { name: "Open logo artwork 1" })
    .first()
    .click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Categories", exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
