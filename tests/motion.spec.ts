import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`reveals, category changes and smooth overlay dismissal at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.locator(".media-card").first().scrollIntoViewIfNeeded();
    await expect(page.locator(".media-card").first()).toHaveAttribute(
      "data-revealed",
      "true",
    );
    const count = await page
      .locator(".media-card")
      .first()
      .evaluate((element) => element.getAnimations().length);
    expect(count).toBeLessThanOrEqual(1);
    await page.locator("#studio").scrollIntoViewIfNeeded();
    await expect(page.locator("#studio-heading")).toHaveAttribute(
      "data-revealed",
      "true",
    );
    await page.locator(".media-card").first().scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page
          .locator(".media-card")
          .first()
          .evaluate((element) => element.getAnimations().length),
      )
      .toBe(0);
    if (width < 1024) {
      await page
        .getByRole("button", { name: "Categories", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveAttribute(
        "data-state",
        "open",
      );
      expect(
        await page
          .getByRole("dialog")
          .evaluate((element) => getComputedStyle(element).animationName),
      ).toBe("dialog-in");
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Stationery", exact: true })
        .click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Categories", exact: true }),
      ).toBeFocused();
    } else {
      await page
        .getByRole("navigation", { name: "Main navigation" })
        .getByRole("button", { name: "Stationery", exact: true })
        .click();
    }
    await expect(page.locator("#collection-heading")).toHaveText("Stationery");
    await expect(page.locator(".media-card").first()).toHaveAttribute(
      "data-revealed",
      "true",
    );
    await page.locator(".media-card").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".media-card").first()).toBeFocused();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.locator("#contact-heading")).toHaveAttribute(
      "data-revealed",
      "true",
    );
    expect(
      await page
        .locator("#contact-heading")
        .evaluate((element) => element.getAnimations().length),
    ).toBe(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    expect(errors).toEqual([]);
  });
}
