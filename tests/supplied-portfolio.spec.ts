import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { categories } from "../config/navigation";

test("supplied assets, configured categories and animated sidebar rail work across viewer navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#portfolio .media-card")).toHaveCount(19);
  for (const label of [
    "2D Animations",
    "3D Animations",
    "Emotes",
    "Overlay",
    "Menu",
    "Pitch Deck",
    "Banners",
    "Merchandise",
  ])
    await expect(
      page.getByRole("button", { name: label, exact: true }),
    ).toHaveCount(0);
  await expect(page.locator(".desktop-sidebar .category-button")).toHaveCount(
    categories.length,
  );
  const main = page.locator(".site-main");
  const opened = await main.boundingBox();
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar", exact: true }),
  ).toHaveAttribute("aria-expanded", "false");
  await expect.poll(async () => (await main.boundingBox())!.x).toBe(76);
  expect(opened!.x).toBeGreaterThan(76);
  await page.getByRole("button", { name: "Logo Design", exact: true }).hover();
  const expand = page.getByRole("button", {
    name: "Expand sidebar",
    exact: true,
  });
  await expand.hover();
  await expect(page.getByRole("tooltip")).toHaveText("Expand sidebar");
  // The tooltip and its hover bridge must never intercept the toggle's hit area.
  await expect
    .poll(() =>
      expand.evaluate((button) => {
        const bounds = button.getBoundingClientRect();
        return [0.25, 0.5, 0.75, 0.9].every((position) =>
          button.contains(
            document.elementFromPoint(
              bounds.left + bounds.width * position,
              bounds.top + bounds.height / 2,
            ),
          ),
        );
      }),
    )
    .toBe(true);
  await expand.click();
  await expect.poll(async () => (await main.boundingBox())!.x).toBe(opened!.x);
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect.poll(async () => (await main.boundingBox())!.x).toBe(76);
  await page.getByRole("button", { name: "Logo Design", exact: true }).click();
  await page
    .locator("#portfolio")
    .getByRole("button", { name: "Open logo artwork 1", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveAttribute(
    "data-sidebar-collapsed",
    "true",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveAttribute(
    "data-sidebar-collapsed",
    "false",
  );
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await main.boundingBox())!.x).toBe(opened!.x);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Collapse sidebar", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  const first = page.locator("#portfolio .media-card img").first();
  await expect(first).toHaveAttribute(
    "src",
    /res\.cloudinary\.com\/hcn0f9nu\/image\/upload\/c_limit,w_384\/f_auto\/q_auto\/v1\//,
  );
  await expect(
    page.locator(
      "#portfolio .media-card h2, #portfolio .media-card h3, #portfolio .media-card p",
    ),
  ).toHaveCount(0);
});

test("desktop PDF renders pages, zooms, fits, closes and has accessible controls", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?category=brand-guidelines#portfolio");
  const link = page.getByRole("link", {
    name: "Open Brand Guidelines PDF 1",
    exact: true,
  });
  await link.click();
  await expect(
    page.getByRole("region", { name: "PDF document pages" }),
  ).toBeVisible();
  await expect(page.locator(".pdf-page-total")).toHaveText("/ 15", {
    timeout: 40_000,
  });
  await expect(page.locator(".pdf-status")).toHaveCount(0, { timeout: 40_000 });
  expect(
    await page
      .locator(".pdf-canvas-wrap canvas")
      .evaluate((element) => (element as HTMLCanvasElement).width),
  ).toBeGreaterThan(100);
  await page
    .getByRole("button", { name: "Next PDF page", exact: true })
    .click();
  await expect(page.getByLabel("PDF page number")).toHaveValue("2");
  await page.getByRole("button", { name: "Zoom PDF in", exact: true }).click();
  await expect(page.getByLabel("PDF zoom level")).toHaveText("125%");
  await page.getByRole("button", { name: "Fit width", exact: true }).click();
  await expect(page.getByLabel("PDF zoom level")).toHaveText("100%");
  await page.getByRole("button", { name: "Fit page", exact: true }).click();
  await page.getByLabel("PDF page number").fill("5");
  await expect(page.getByLabel("PDF page number")).toHaveValue("5");
  await expect(
    page.getByRole("link", { name: "Download PDF", exact: true }),
  ).toHaveAttribute("href", /fl_attachment\/v1\/BR01\.pdf$/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(link).toBeFocused();
});

test("mobile PDFs open Cloudinary directly and Web Dev follows supplied screenshots and live links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?category=brand-guidelines#portfolio");
  const pdf = page.getByRole("link", {
    name: "Open Brand Guidelines PDF 1",
    exact: true,
  });
  await expect(pdf).toHaveAttribute(
    "href",
    "https://res.cloudinary.com/hcn0f9nu/image/upload/v1/BR01.pdf",
  );
  const request = page
    .context()
    .waitForEvent("request", (request) => request.url().endsWith("/BR01.pdf"));
  const popup = page.waitForEvent("popup");
  await pdf.click();
  await request;
  const tab = await popup;
  await tab.close();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/?category=web-dev#portfolio");
  await expect(page.locator(".web-project-card")).toHaveCount(12);
  await expect(page.locator(".web-project-card").first()).toHaveAttribute(
    "href",
    "https://morgan-tattoo-studio.vercel.app/",
  );
  await expect(page.locator(".web-project-card").first()).toHaveAttribute(
    "target",
    "_blank",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const card = page.locator(".web-project-card").first();
  await card.hover();
  await expect
    .poll(() =>
      card
        .locator("img")
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    )
    .toBe("12s");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      card
        .locator("img")
        .evaluate((element) => getComputedStyle(element).objectPosition),
    )
    .toBe("50% 0%");
});
