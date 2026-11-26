// Turns a full-resolution model photo into the set of sizes the shop serves.
// Usage: node scripts/make-shots.mjs <source image> <name>
//   e.g. node scripts/make-shots.mjs public/landing-test/combo-pose1.png white-tee-1
// Writes public/shoot/<name>-<width>.webp for each width in SHOT_WIDTHS that fits,
// plus one at the source's own width so nothing is thrown away.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const SHOT_WIDTHS = [800, 1400, 2400];

const [source, name] = process.argv.slice(2);
if (!source || !name) {
    console.error("Usage: node scripts/make-shots.mjs <source image> <name>");
    process.exit(1);
}

const outDir = path.join("public", "shoot");
await mkdir(outDir, { recursive: true });

const { width: fullWidth, height: fullHeight } = await sharp(source).metadata();
const widths = [...SHOT_WIDTHS.filter((w) => w < fullWidth), fullWidth];

for (const width of widths) {
    const file = path.join(outDir, `${name}-${width}.webp`);
    const info = await sharp(source)
        .resize({ width, kernel: "lanczos3" })
        .webp({ quality: 92, smartSubsample: true, effort: 6 })
        .toFile(file);
    console.log(`${file}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log(`source ${fullWidth}x${fullHeight}; widths: ${widths.join(", ")}`);
