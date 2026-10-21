import { test, expect } from "@playwright/test";
import source from "../data/portfolio-source.json";

test("portfolio curation retains the requested projects and their order", () => {
  expect(source).toHaveLength(109);
  expect(
    source.filter((project) =>
      ["Menu", "Pitch Deck", "Banners", "Merchandise"].includes(project.filter),
    ),
  ).toHaveLength(0);
  expect(
    source
      .filter((project) => project.filter === "Editorials")
      .map((project) => project.id),
  ).toEqual(Array.from({ length: 10 }, (_, index) => `bookcover${index + 1}`));
  expect(
    source
      .filter((project) => project.filter === "Stationery")
      .map((project) => project.id),
  ).toEqual(Array.from({ length: 20 }, (_, index) => `Ss${index + 21}`));
});

for (const width of [390, 1440]) {
  test(`curated collections, navigation and removed category URLs at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/?category=editorials#portfolio");
    await expect(page.locator("#collection-heading")).toHaveText("Editorials");
    await expect(page.locator("#portfolio .media-card")).toHaveCount(10);
    const navigation =
      width < 1024
        ? page.getByRole("dialog")
        : page.getByRole("navigation", { name: "Main navigation" });
    if (width < 1024)
      await page
        .getByRole("button", { name: "Categories", exact: true })
        .click();
    await expect(navigation.locator(".category-button")).toHaveCount(8);
    for (const label of ["Menu", "Pitch Deck", "Banners", "Merchandise"])
      await expect(
        navigation.getByRole("button", { name: label, exact: true }),
      ).toHaveCount(0);
    await navigation
      .getByRole("button", { name: "Stationery", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("#collection-heading")).toHaveText("Stationery");
    await expect(page.locator("#portfolio .media-card")).toHaveCount(20);
    await page.locator("#portfolio .media-card").last().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("#portfolio .media-card").last()).toBeFocused();
    for (const removed of ["menu", "pitch-deck", "banners", "merchandise"]) {
      await page.goto(`/?category=${removed}#portfolio`);
      await expect(page.locator("#collection-heading")).toHaveText(
        "Logo Design",
      );
      await expect(
        page.locator(`.category-preview[data-category="${removed}"]`),
      ).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}
