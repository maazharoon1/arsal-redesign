import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { categories } from "../config/navigation";
import source from "../data/portfolio-source.json";

const sourceLabels: Record<string, string> = {
  "social-media-post": "socialmediapost",
};

test("category strip uses each category's first project and opens all twelve collections", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/#featured");
  const original = page.locator(".category-strip-group").first();
  await expect(original.locator("a")).toHaveCount(12);
  await expect(page.locator("#featured h2, #featured p")).toHaveCount(0);
  for (const category of categories) {
    const first = source.find(
      (entry) => entry.filter === (sourceLabels[category.id] ?? category.label),
    );
    const link = original.getByRole("link", {
      name: `Explore ${category.label}`,
      exact: true,
    });
    await expect(link).toHaveAttribute("data-project-id", first!.id);
    await link.click();
    await expect(page).toHaveURL(
      new RegExp(`category=${category.id}#portfolio$`),
    );
    await expect(page.locator("#collection-heading")).toHaveText(
      category.label,
    );
    await expect(page.locator("#portfolio")).toBeInViewport();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto("/#featured");
  expect(
    (await new AxeBuilder({ page }).include("#featured").analyze()).violations,
  ).toEqual([]);
});

test("category strip keeps moving on hover, reveals labels and respects reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#featured");
  await page.mouse.move(1400, 5);
  const scene = page.locator(".category-strip-scene");
  const track = page.locator(".category-strip-track");
  await expect(scene).toHaveAttribute("data-in-view", "true");
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).animationPlayState))
    .toBe("running");
  const before = await track.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(200);
  expect(await track.evaluate((el) => getComputedStyle(el).transform)).not.toBe(
    before,
  );
  const cards = page.locator(".category-strip-group").first().locator("a");
  // The leading card can already be behind the fixed sidebar as the strip moves.
  const visibleIndex = await cards.evaluateAll((elements) =>
    elements.findIndex((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left > 260 && bounds.right < innerWidth - 30;
    }),
  );
  expect(visibleIndex).toBeGreaterThanOrEqual(0);
  const card = cards.nth(visibleIndex);
  // This target intentionally moves; don't wait for Playwright's stability check.
  await card.hover({ force: true });
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).animationPlayState))
    .toBe("running");
  await expect
    .poll(() =>
      card
        .locator(".category-preview-caption")
        .evaluate((el) => getComputedStyle(el).opacity),
    )
    .toBe("1");
  const hovered = await track.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(200);
  expect(await track.evaluate((el) => getComputedStyle(el).transform)).not.toBe(
    hovered,
  );
  await expect(page.locator("#featured button")).toHaveCount(0);
  await page.locator("#contact").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-in-view", "false");
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).animationPlayState))
    .toBe("paused");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).animationName))
    .toBe("none");
});

test("mobile and keyboard can browse every preview without overflowing the page", async ({
  page,
  browser,
}) => {
  await page.goto("/#featured");
  const last = page
    .locator(".category-strip-group")
    .first()
    .getByRole("link", { name: "Explore Web Dev" });
  await last.focus();
  await expect(last).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/category=web-dev#portfolio$/);
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  try {
    const mobile = await context.newPage();
    await mobile.goto("/#featured");
    const cards = mobile.locator(".category-strip-group").first().locator("a");
    const index = await cards.evaluateAll((elements) =>
      elements.findIndex((element) => {
        const bounds = element.getBoundingClientRect();
        const center = bounds.left + bounds.width / 2;
        return center > 30 && center < innerWidth - 30;
      }),
    );
    const card = cards.nth(index);
    await expect
      .poll(() =>
        card
          .locator(".category-preview-caption")
          .evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe("1");
    await expect(mobile.locator("#featured button")).toHaveCount(0);
    const category = await card.getAttribute("data-category");
    await card.tap({ force: true });
    await expect(mobile).toHaveURL(
      new RegExp(`category=${category}#portfolio$`),
    );
    expect(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  } finally {
    await context.close();
  }
});
