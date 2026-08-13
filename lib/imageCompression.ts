// Client-side image compression for the admin product image uploader.
// Caps resolution to a web-appropriate size, then binary-searches JPEG
// quality for the highest value that still fits under the size budget, so
// the result lands just under the cap (e.g. 5.7MB -> ~4.95MB) rather than
// overshooting to something much smaller. Files already under the cap are
// left untouched. This is not truly "lossless" — no encoder can guarantee
// that under a hard size budget — but at these settings the result is
// visually indistinguishable from the original for product photos.

export const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_DIMENSION = 2560; // longest edge, in px
const DEFAULT_MIN_QUALITY = 0.5;
const QUALITY_SEARCH_STEPS = 6; // binary search iterations — enough to land within ~1.5% of the size budget
const DIMENSION_SHRINK_FACTOR = 0.85;
const MAX_DIMENSION_ATTEMPTS = 4;

export interface CompressImageOptions {
    maxSizeBytes?: number;
    maxDimension?: number;
    minQuality?: number;
    /** Called with a 0–1 fraction as this single image's compression proceeds. */
    onProgress?: (fraction: number) => void;
}

export interface CompressImageResult {
    file: File;
    originalSize: number;
    compressedSize: number;
    didCompress: boolean;
}

export function isCompressibleImage(file: File): boolean {
    return file.type.startsWith("image/") && file.type !== "image/svg+xml";
}

export async function compressImage(
    file: File,
    options: CompressImageOptions = {}
): Promise<CompressImageResult> {
    const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
    const onProgress = options.onProgress ?? (() => {});

    if (file.size <= maxSizeBytes) {
        onProgress(1);
        return { file, originalSize: file.size, compressedSize: file.size, didCompress: false };
    }

    if (!isCompressibleImage(file)) {
        throw new Error(`"${file.name}" can't be compressed automatically — please resize it manually.`);
    }

    const baseMaxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
    const minQuality = options.minQuality ?? DEFAULT_MIN_QUALITY;

    const bitmap = await createImageBitmap(file);
    onProgress(0.05); // decode done

    // Total encode passes if everything fits on the first resolution attempt
    // (the common case): one quality-floor check + the binary search steps.
    // Used purely to turn "steps completed" into a smooth, monotonic percent;
    // if more attempts are needed the fraction just keeps climbing past this
    // estimate rather than resetting, so it never jumps backwards.
    const estimatedSteps = MAX_DIMENSION_ATTEMPTS * (QUALITY_SEARCH_STEPS + 1);
    let stepsDone = 0;
    const reportStep = () => {
        stepsDone++;
        onProgress(Math.min(0.95, 0.05 + 0.9 * (stepsDone / estimatedSteps)));
    };

    let blob: Blob;
    try {
        let maxDimension = baseMaxDimension;
        let best: Blob | null = null;

        // Each attempt fixes a resolution and binary-searches JPEG quality for
        // the highest value that still fits the budget, so the result lands
        // just under the cap instead of overshooting to a much smaller file.
        // If even the lowest quality at this resolution doesn't fit, the image
        // is downscaled further and the search repeats.
        for (let attempt = 0; attempt < MAX_DIMENSION_ATTEMPTS && !best; attempt++) {
            const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
            const width = Math.max(1, Math.round(bitmap.width * scale));
            const height = Math.max(1, Math.round(bitmap.height * scale));

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("This browser doesn't support image compression.");
            ctx.drawImage(bitmap, 0, 0, width, height);

            // Keep PNGs with real transparency as PNG; everything else compresses
            // far better as JPEG, which is what actually gets us under budget.
            const outputType =
                file.type === "image/png" && hasTransparency(ctx, width, height) ? "image/png" : "image/jpeg";

            const atMinQuality = await canvasToBlob(canvas, outputType, minQuality);
            reportStep();
            if (atMinQuality.size > maxSizeBytes) {
                // Doesn't fit even at the quality floor — shrink resolution and try again.
                maxDimension = Math.round(maxDimension * DIMENSION_SHRINK_FACTOR);
                continue;
            }

            let lo = minQuality;
            let hi = 1;
            let bestForThisSize = atMinQuality;
            for (let i = 0; i < QUALITY_SEARCH_STEPS; i++) {
                const mid = (lo + hi) / 2;
                const candidate = await canvasToBlob(canvas, outputType, mid);
                reportStep();
                if (candidate.size <= maxSizeBytes) {
                    bestForThisSize = candidate;
                    lo = mid;
                } else {
                    hi = mid;
                }
            }
            best = bestForThisSize;
        }

        if (!best) {
            throw new Error(
                `Couldn't compress "${file.name}" under ${formatBytes(maxSizeBytes)} without losing too much quality. Try a smaller image.`
            );
        }
        blob = best;

        const outputType = blob.type;
        const newName =
            outputType === "image/jpeg" && !/\.jpe?g$/i.test(file.name)
                ? file.name.replace(/\.[^./\\]+$/, "") + ".jpg"
                : file.name;

        const compressedFile = new File([blob], newName, { type: outputType, lastModified: Date.now() });
        onProgress(1);

        return {
            file: compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            didCompress: true,
        };
    } finally {
        bitmap.close();
    }
}

export async function compressImages(
    files: File[],
    options: CompressImageOptions = {},
    /** Called with a 0–1 fraction of the whole batch as it progresses. */
    onOverallProgress?: (fraction: number) => void
): Promise<CompressImageResult[]> {
    const results: CompressImageResult[] = [];
    const total = files.length;
    for (let i = 0; i < total; i++) {
        const result = await compressImage(files[i], {
            ...options,
            onProgress: (fraction) => onOverallProgress?.((i + fraction) / total),
        });
        results.push(result);
    }
    return results;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Image encoding failed."))),
            type,
            quality
        );
    });
}

function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
    const { data } = ctx.getImageData(0, 0, width, height);
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) return true;
    }
    return false;
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
}
