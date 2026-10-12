// Temporary artwork crops from the supplied approved design, never final client work.
import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
const [reference, portrait] = process.argv.slice(2);
if (!reference || !portrait)
  throw new Error("Supply the approved image and portrait paths.");
await mkdir("public/media/reference", { recursive: true });
await copyFile(portrait, "public/media/arsal.webp");
const crops = {
  "hero-coral": [434, 141, 81, 154],
  "hero-lavender": [528, 106, 87, 212],
  "hero-mint": [678, 151, 67, 160],
  "featured-identity": [170, 504, 194, 145],
  "featured-digital": [378, 504, 195, 145],
  "featured-sculpture": [447, 164, 63, 103],
  "logo-01": [170, 812, 194, 117],
  "logo-02": [378, 812, 195, 117],
  "logo-03": [589, 812, 192, 117],
  "logo-04": [170, 973, 194, 117],
  "logo-05": [378, 973, 195, 117],
  "logo-06": [589, 973, 192, 117],
  "contact-scene": [480, 1720, 329, 172],
};
for (const [name, [left, top, width, height]] of Object.entries(crops)) {
  await sharp(reference)
    .extract({ left, top, width, height })
    .webp({ quality: 92 })
    .toFile(`public/media/reference/${name}.webp`);
}
console.log("Prepared 13 isolated reference crops and original portrait.");
