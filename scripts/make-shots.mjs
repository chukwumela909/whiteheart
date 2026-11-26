// Turns a full-resolution model photo into the set of sizes the shop serves.
//
//   node scripts/make-shots.mjs <source image> <name>
//     e.g. node scripts/make-shots.mjs public/landing-test/combo-pose1.png white-tee-1
//   node scripts/make-shots.mjs --rebuild
//     re-exports the smaller sizes of every photo from its full-width file in public/shoot
//
// Writes public/shoot/<name>-<width>.webp for each width below, plus one at the source's own
// width so nothing is thrown away, and records a tiny blurred preview of each photo in
// lib/shotPlaceholders.json for the page to show while the real photo downloads.
//
// Small sizes are compressed harder: at tile size the difference is not visible, and they are
// what phones on mobile data download. The full-width file keeps the highest quality.
import sharp from "sharp";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SIZES = [
    { width: 480, quality: 76 },
    { width: 800, quality: 78 },
    { width: 1400, quality: 80 },
    { width: 2400, quality: 84 },
];
const FULL_QUALITY = 92;

const OUT_DIR = path.join("public", "shoot");
const PLACEHOLDERS = path.join("lib", "shotPlaceholders.json");

async function readPlaceholders() {
    try {
        return JSON.parse(await readFile(PLACEHOLDERS, "utf8"));
    } catch {
        return {};
    }
}

async function exportShot(source, name, { keepFull = false } = {}) {
    const { width: fullWidth } = await sharp(source).metadata();
    const widths = [];

    for (const { width, quality } of SIZES.filter((s) => s.width < fullWidth)) {
        const file = path.join(OUT_DIR, `${name}-${width}.webp`);
        const info = await sharp(source)
            .resize({ width, kernel: "lanczos3" })
            .webp({ quality, smartSubsample: true, effort: 6 })
            .toFile(file);
        widths.push(width);
        console.log(`${file}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
    }

    if (!keepFull) {
        const file = path.join(OUT_DIR, `${name}-${fullWidth}.webp`);
        const info = await sharp(source)
            .webp({ quality: FULL_QUALITY, smartSubsample: true, effort: 6 })
            .toFile(file);
        console.log(`${file}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
    }
    widths.push(fullWidth);

    const preview = await sharp(source).resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
    return { widths, placeholder: `data:image/webp;base64,${preview.toString("base64")}` };
}

await mkdir(OUT_DIR, { recursive: true });
const placeholders = await readPlaceholders();
const args = process.argv.slice(2);

if (args[0] === "--rebuild") {
    // The widest file of each photo is its untouched full-resolution copy: rebuild the rest from it.
    const widest = new Map();
    for (const file of await readdir(OUT_DIR)) {
        const match = file.match(/^(.+)-(\d+)\.webp$/);
        if (!match) continue;
        const [, name, width] = match;
        if (!widest.has(name) || Number(width) > widest.get(name)) widest.set(name, Number(width));
    }
    for (const [name, width] of [...widest].sort()) {
        const result = await exportShot(path.join(OUT_DIR, `${name}-${width}.webp`), name, { keepFull: true });
        placeholders[name] = result.placeholder;
    }
} else {
    const [source, name] = args;
    if (!source || !name) {
        console.error("Usage: node scripts/make-shots.mjs <source image> <name>   |   --rebuild");
        process.exit(1);
    }
    const result = await exportShot(source, name);
    placeholders[name] = result.placeholder;
    console.log(`widths: ${result.widths.join(", ")}`);
}

const sorted = Object.fromEntries(Object.entries(placeholders).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(PLACEHOLDERS, JSON.stringify(sorted, null, 2) + "\n");
console.log(`previews written to ${PLACEHOLDERS}`);
