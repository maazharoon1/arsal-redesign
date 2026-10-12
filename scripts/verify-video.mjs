// Browser verification with a temporary synthetic video. Never ships as portfolio work.
// Run only against a dev server and while nobody is editing data/portfolio.ts.
import { readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";
import ffmpeg from "ffmpeg-static";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const dataPath = new URL("../data/portfolio.ts", import.meta.url);
const mediaPath = new URL(
  "../public/media/projects/__qa-video.mp4",
  import.meta.url,
);
const original = await readFile(dataPath, "utf8");
const fixture = `\nprojects.push({
  id: '__qa-video', categoryId: 'stationery', mediaType: 'video',
  accessibleLabel: 'Open QA video', poster: '/media/reference/logo-01.webp',
  media: [
    { type: 'video', src: '/media/projects/__qa-video.mp4', alt: 'Synthetic test clip', width: 640, height: 360 },
    { type: 'image', src: '/media/reference/logo-01.webp', alt: 'Test still', width: 194, height: 117 },
  ],
});\n`;
let browser;
try {
  await mkdir(new URL("../public/media/projects/", import.meta.url), {
    recursive: true,
  });
  execFileSync(ffmpeg, [
    "-hide_banner",
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    "color=c=0x3b2856:s=640x360:r=24",
    "-t",
    "5",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-y",
    fileURLToPath(mediaPath),
  ]);
  await writeFile(dataPath, original + fixture);
  browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROME_PATH ??
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  page.setDefaultTimeout(15_000);
  console.log("Video fixture prepared; opening browser.");
  let videoRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("__qa-video.mp4")) videoRequests++;
  });
  await page.goto(
    `${process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"}/?category=stationery#portfolio`,
    { waitUntil: "domcontentloaded", timeout: 45_000 },
  );
  const card = page.getByRole("button", { name: "Open QA video" });
  await card.waitFor();
  console.log("Video card ready; checking lazy loading.");
  assert.equal(
    await page.locator("video").count(),
    0,
    "No video elements in grid",
  );
  assert.equal(videoRequests, 0, "No grid video download");
  await card.click();
  const video = page.locator("video");
  await video.waitFor();
  assert.equal(await video.getAttribute("preload"), "none");
  assert.equal(await video.getAttribute("controls"), "");
  assert.equal(videoRequests, 0, "No video download until playback");
  console.log("Viewer ready; starting native playback.");
  await video.evaluate((element) => {
    window.__qaVideo = element;
    void element.play().catch((error) => {
      window.__qaPlayError = error.message;
    });
  });
  await page.waitForFunction(() => window.__qaVideo.currentTime > 0.1);
  assert.ok(videoRequests > 0, "Playback requested video");
  assert.equal(await video.evaluate((element) => element.paused), false);
  await page.getByRole("button", { name: "Next image" }).click();
  console.log("Navigated to still; checking released source.");
  await page.waitForFunction(
    () =>
      window.__qaVideo.paused &&
      !window.__qaVideo.hasAttribute("src") &&
      !window.__qaVideo.isConnected,
  );
  await page.getByRole("button", { name: "Previous image" }).click();
  await page.locator("video").evaluate((element) => {
    window.__qaVideo = element;
    void element.play().catch((error) => {
      window.__qaPlayError = error.message;
    });
  });
  await page.keyboard.press("Escape");
  console.log("Closed video; checking cleanup.");
  await page.waitForFunction(
    () =>
      window.__qaVideo.paused &&
      !window.__qaVideo.hasAttribute("src") &&
      !window.__qaVideo.isConnected,
  );
  assert.equal(
    await card.evaluate((element) => document.activeElement === element),
    true,
    "Focus restored to video card",
  );
  // Force a failed video to exercise the actual error boundary without bad final assets.
  await page.route("**/__qa-video.mp4", (route) => route.abort());
  await card.click();
  await page.locator("video").evaluate((element) => {
    element.load();
    void element.play().catch(() => {});
  });
  await page.getByText("Video unavailable", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  console.log(
    "PASS: no grid downloads, native video controls, playback, source release on image navigation/close, focus restoration and failed-video fallback.",
  );
} finally {
  await browser?.close();
  await writeFile(dataPath, original);
  await unlink(mediaPath).catch(() => {});
  console.log("Restored portfolio data and removed synthetic video.");
}
