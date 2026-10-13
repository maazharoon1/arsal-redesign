import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const viewport of [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 360, height: 568 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1280, height: 600 },
  { width: 1920, height: 1080 },
]) {
  test(`portrait hero at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    const portrait = page.locator(".hero-portrait");
    await expect(portrait).toBeVisible();
    await expect
      .poll(() =>
        portrait.evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
    const geometry = await page.evaluate(() => {
      const hero = document.querySelector("#home")!.getBoundingClientRect();
      const image = document
        .querySelector(".hero-portrait")!
        .getBoundingClientRect();
      const featured = document
        .querySelector("#featured")!
        .getBoundingClientRect();
      return {
        heroBottom: hero.bottom,
        featuredTop: featured.top,
        imageRatio: image.width / image.height,
        faceTop: image.top + image.height * 0.03,
        faceBottom: image.top + image.height * 0.29,
        heroTop: hero.top,
        heroRight: hero.right,
        wordmarkRight: document
          .querySelector(".hero-wordmark")!
          .getBoundingClientRect().right,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(geometry.overflow).toBe(false);
    expect(geometry.imageRatio).toBeCloseTo(1083 / 1452, 2);
    expect(geometry.faceTop).toBeGreaterThanOrEqual(geometry.heroTop - 2);
    expect(geometry.faceBottom).toBeLessThan(geometry.heroBottom);
    expect(Math.abs(geometry.featuredTop - geometry.heroBottom)).toBeLessThan(
      2,
    );
    if (viewport.width < 1024) {
      await expect(page.locator("#hero-heading")).toBeHidden();
      await expect(page.locator(".hero-copy .button")).toBeHidden();
      expect(geometry.heroBottom / viewport.height).toBeGreaterThanOrEqual(
        0.55,
      );
      expect(geometry.heroBottom / viewport.height).toBeLessThanOrEqual(0.65);
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "About", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(page).toHaveURL(/#studio$/);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
    } else {
      expect(geometry.wordmarkRight).toBeLessThanOrEqual(
        geometry.heroRight + 1,
      );
      await expect(page.locator("#hero-heading")).toBeVisible();
      await expect(page.locator(".hero-copy .button")).toBeInViewport();
    }
    await page.screenshot({
      path: `test-results/hero-${viewport.width}-${viewport.height}.png`,
    });
    expect(errors).toEqual([]);
  });
}

test("hero layers stay stable while scrolling and entrances run only once", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page
    .locator(".hero-portrait")
    .evaluate((image: HTMLImageElement) => image.decode());
  await expect(page.locator(".hero-portrait")).toHaveAttribute(
    "data-entered",
    "true",
  );
  await page.locator("#home").evaluate(async (element) => {
    await Promise.all(
      element
        .getAnimations({ subtree: true })
        .map((animation) => animation.finished),
    );
  });
  const layers = () =>
    page.locator("#home").evaluate((element) =>
      [
        ".hero-ribbons",
        ".hero-curves",
        ".hero-wordmark",
        ".hero-portrait-layer",
      ].map((selector) => {
        const style = getComputedStyle(element.querySelector(selector)!);
        return [style.transform, style.translate, style.scale];
      }),
    );
  const initial = await layers();
  await page.evaluate(() => window.scrollTo({ top: 320, behavior: "instant" }));
  expect(await layers()).toEqual(initial);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  expect(await layers()).toEqual(initial);
  expect(
    await page
      .locator("#home")
      .evaluate(
        (element) =>
          element
            .getAnimations({ subtree: true })
            .filter(
              (animation) =>
                animation instanceof CSSAnimation &&
                animation.playState === "running",
            ).length,
      ),
  ).toBe(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator(".hero-wordmark > span")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});

test("portrait failure preserves the hero and navigation", async ({ page }) => {
  await page.route("**/_next/image*", (route) =>
    route.request().url().includes("hero-portrait")
      ? route.abort()
      : route.continue(),
  );
  await page.goto("/");
  await expect(page.locator(".hero-portrait-fallback")).toBeVisible();
  await expect(page.locator(".hero-copy .button")).toBeVisible();
});

test("mobile header menu traps focus, restores it and keeps shared links accessible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open navigation" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("link")).toHaveCount(4);
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest('[role="dialog"]'),
      ),
    ).toBe(true);
  }
  expect(
    (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("hero is rendered without JavaScript and only its portrait is preloaded", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000");
  await expect(page.locator("#hero-heading")).toBeVisible();
  await expect(page.locator(".hero-portrait")).toBeVisible();
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(1);
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveAttribute(
    "imagesrcset",
    /hero-portrait/,
  );
  await context.close();
});
