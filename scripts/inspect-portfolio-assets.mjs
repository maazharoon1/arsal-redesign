import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
const rows = JSON.parse(await readFile("data/portfolio-source.json", "utf8"));
const references = [
  ...new Set(
    rows.flatMap((row) => [row.mainImage, ...(row.coverImages ?? [])]),
  ),
];
const result = {};
let position = 0;
function url(reference) {
  if (reference.startsWith("https://")) return reference;
  return `https://res.cloudinary.com/hcn0f9nu/image/upload/c_limit,w_384/f_auto/q_auto/v1/${reference}`;
}
async function worker() {
  while (position < references.length) {
    const reference = references[position++];
    try {
      const response = await fetch(url(reference), {
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
        result[reference] = {
          status: response.status,
          error: response.headers.get("x-cld-error"),
        };
        continue;
      }
      const metadata = await sharp(
        Buffer.from(await response.arrayBuffer()),
      ).metadata();
      result[reference] = {
        status: 200,
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      result[reference] = { error: error.message };
    }
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
await mkdir("artifacts", { recursive: true });
const dimensions = JSON.parse(
  await readFile("data/portfolio-dimensions.json", "utf8"),
);
for (const [reference, entry] of Object.entries(result)) {
  if (entry.status === 200 && entry.width && entry.height)
    dimensions[reference] = { width: entry.width, height: entry.height };
}
await writeFile(
  "data/portfolio-dimensions.json",
  JSON.stringify(dimensions, null, 2) + "\n",
);
await writeFile(
  "artifacts/asset-inspection.json",
  JSON.stringify(result, null, 2),
);
console.log(
  JSON.stringify(
    {
      assets: references.length,
      failures: Object.entries(result).filter(
        ([, entry]) => entry.status !== 200,
      ),
      webDimensions: rows
        .filter((x) => x.filter === "Web Dev")
        .map((x) => ({ id: x.id, ...result[x.mainImage] })),
    },
    null,
    2,
  ),
);
