import { test, expect } from "@playwright/test";

test("large project lightbox supports zoom, fit controls, drag and category browsing", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Open logo artwork 1" })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".viewer-category")).toHaveText("Logo Design");
  await expect(dialog.locator(".viewer-count")).toHaveText("1 / 114");
  const panel = await dialog.locator(".viewer-panel").boundingBox();
  expect(panel!.height).toBeGreaterThan(850);
  expect(panel!.width).toBeGreaterThan(1150);
  await expect(dialog.getByLabel("Zoom level")).toHaveText("100%");
  await dialog.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(dialog.getByLabel("Zoom level")).toHaveText("125%");
  await dialog.getByRole("button", { name: "Zoom out", exact: true }).click();
  await expect(dialog.getByLabel("Zoom level")).toHaveText("100%");
  await dialog.getByRole("button", { name: "Fit width", exact: true }).click();
  await expect(dialog.getByLabel("Zoom level")).not.toHaveText("100%");
  await dialog.getByRole("button", { name: "Fit image", exact: true }).click();
  await expect(dialog.getByLabel("Zoom level")).toHaveText("100%");
  const viewport = dialog.locator(".zoom-viewport");
  await viewport.hover();
  await page.mouse.wheel(0, -600);
  await expect(dialog.getByLabel("Zoom level")).not.toHaveText("100%");
  const box = await viewport.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box!.x + box!.width / 2 - 120,
    box!.y + box!.height / 2 - 70,
  );
  await page.mouse.up();
  expect(
    await viewport.evaluate(
      (element) => element.scrollLeft + element.scrollTop,
    ),
  ).toBeGreaterThan(0);
  await viewport.dblclick();
  await expect(dialog.getByLabel("Zoom level")).toHaveText("100%");
  await dialog.getByRole("button", { name: "Next image" }).click();
  await expect(dialog.locator(".viewer-count")).toHaveText("2 / 114");
  await expect(dialog.getByLabel("Zoom level")).toHaveText("100%");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open logo artwork 1" }).first(),
  ).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Open logo artwork 1" })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Fit image", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByRole("button", { name: "Close preview", exact: true }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const touch = await page.context().newCDPSession(page);
  await touch.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 2,
  });
  const mobileViewport = await page.locator(".zoom-viewport").boundingBox();
  const middleX = mobileViewport!.x + mobileViewport!.width / 2;
  const middleY = mobileViewport!.y + mobileViewport!.height / 2;
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: middleX - 50, y: middleY, id: 1 },
      { x: middleX + 50, y: middleY, id: 2 },
    ],
  });
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: middleX - 90, y: middleY, id: 1 },
      { x: middleX + 90, y: middleY, id: 2 },
    ],
  });
  await expect(page.getByLabel("Zoom level")).not.toHaveText("100%");
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.getByRole("button", { name: "Fit image", exact: true }).click();
  await expect(page.getByLabel("Zoom level")).toHaveText("100%");
  await page.keyboard.press("Escape");
});
