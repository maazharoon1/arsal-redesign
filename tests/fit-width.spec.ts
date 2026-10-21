import { test, expect } from "@playwright/test";

test("fit-width tall artwork stays stable without scrollbars and remains draggable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 600 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/?category=editorials#portfolio");
  await page
    .getByRole("button", { name: "Open Editorials artwork 1", exact: true })
    .click();
  const viewport = page.locator(".zoom-viewport");
  const active = page.locator(
    '.perspective-carousel-slide[data-active="true"]',
  );
  await expect
    .poll(() =>
      active
        .locator("img")
        .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const fit = page.getByRole("button", { name: "Fit width", exact: true });
  await fit.click();
  const level = await page.getByLabel("Zoom level").textContent();
  const measure = () =>
    active.evaluate((slide) => {
      const bounds = slide.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        transform: getComputedStyle(slide).transform,
      };
    });
  const first = await measure();
  for (let index = 0; index < 4; index++) {
    await fit.click();
    await page.waitForTimeout(100);
    expect(await measure()).toEqual(first);
    await expect(page.getByLabel("Zoom level")).toHaveText(level!);
  }
  expect(
    await viewport.evaluate(
      (element) => getComputedStyle(element).scrollbarWidth,
    ),
  ).toBe("none");
  expect(
    await viewport.evaluate(
      (element) => getComputedStyle(element, "::-webkit-scrollbar").display,
    ),
  ).toBe("none");
  const bounds = await viewport.boundingBox();
  const middleX = bounds!.x + bounds!.width / 2;
  const middleY = bounds!.y + bounds!.height / 2;
  await page.mouse.move(middleX, middleY);
  await page.mouse.down();
  await expect(viewport).toHaveAttribute("data-dragging", "true");
  await page.mouse.move(middleX, middleY - 160, { steps: 8 });
  await page.mouse.up();
  await expect(viewport).toHaveAttribute("data-dragging", "false");
  expect(
    await viewport.evaluate((element) => element.scrollTop),
  ).toBeGreaterThan(120);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.mouse.move(middleX, middleY);
  await page.mouse.down();
  await page.mouse.move(middleX - 100, middleY - 80, { steps: 8 });
  await page.mouse.up();
  expect(
    await viewport.evaluate((element) => element.scrollLeft),
  ).toBeGreaterThan(50);
  await page.getByRole("button", { name: "Fit image", exact: true }).click();
  await expect(page.getByLabel("Zoom level")).toHaveText("100%");
  await expect
    .poll(() =>
      viewport.evaluate((element) => element.scrollTop + element.scrollLeft),
    )
    .toBe(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
