import { test, expect } from "@playwright/test";

test("perspective changes preserve zoom and popup dimensions, support wraparound and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open logo artwork 1" })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  const carousel = dialog.getByRole("region", {
    name: "Project media carousel",
  });
  await expect(carousel).toHaveAttribute("data-motion", "animated");
  const before = await dialog.locator(".viewer-panel").boundingBox();
  await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(dialog.getByLabel("Zoom level")).toHaveText("125%");
  // Sample during the interaction, rather than after slower image/DOM checks
  // have already allowed the short transition to finish.
  await carousel.evaluate((root) => {
    let frame = 0;
    const timer = setTimeout(() => cancelAnimationFrame(frame), 2500);
    function sample() {
      const slide = root.querySelector('[data-active="true"]');
      if (
        slide &&
        Math.abs(new DOMMatrix(getComputedStyle(slide).transform).m13) > 0.001
      ) {
        root.setAttribute("data-test-perspective-observed", "true");
        clearTimeout(timer);
      } else frame = requestAnimationFrame(sample);
    }
    frame = requestAnimationFrame(sample);
  });
  await dialog.getByRole("button", { name: "Next image" }).click();
  await expect(dialog.locator(".viewer-count")).toHaveText("2 / 114");
  await expect(dialog.getByLabel("Zoom level")).toHaveText("125%");
  const active = carousel.locator('[data-active="true"]');
  await expect(carousel).toHaveAttribute(
    "data-test-perspective-observed",
    "true",
  );
  await expect
    .poll(() =>
      active.evaluate((element) => {
        const matrix = new DOMMatrix(getComputedStyle(element).transform);
        return (
          Math.abs(matrix.m41) < 0.5 &&
          Math.abs(matrix.m13) < 0.001 &&
          Math.abs(matrix.m11 - 1) < 0.001
        );
      }),
    )
    .toBe(true);
  const after = await dialog.locator(".viewer-panel").boundingBox();
  expect(after!.width).toBe(before!.width);
  expect(after!.height).toBe(before!.height);
  expect(
    await carousel.locator(".perspective-carousel-slide").count(),
  ).toBeLessThanOrEqual(5);
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator(".viewer-count")).toHaveText("1 / 114");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.locator(".viewer-count")).toHaveText("114 / 114");
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator(".viewer-count")).toHaveText("1 / 114");
  await expect(dialog.getByLabel("Zoom level")).toHaveText("125%");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(carousel).toHaveAttribute("data-motion", "instant");
  await dialog.getByRole("button", { name: "Next image" }).click();
  await expect(dialog.locator(".viewer-count")).toHaveText("2 / 114");
  await expect(dialog.getByLabel("Zoom level")).toHaveText("125%");
  await dialog.getByRole("button", { name: "Fit image", exact: true }).click();
  await expect(dialog.getByLabel("Zoom level")).toHaveText("100%");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open logo artwork 1" }).first(),
  ).toBeFocused();
});
