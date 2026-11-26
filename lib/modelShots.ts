// On-model photos kept in /public/shoot, keyed by product id.
// Shop tiles show these ahead of the product's own photos: the first by default, the second on hover.
// Each photo is exported at several widths by scripts/make-shots.mjs, up to its full resolution,
// and the browser picks the sharpest one the screen can use.
export interface ModelShot {
    name: string;
    widths: number[];
}

const WIDTHS = [800, 1400, 2400, 3392];

/** The two poses of one product: `<name>-1` shows by default, `<name>-2` on hover. */
const poses = (name: string): ModelShot[] => [
    { name: `${name}-1`, widths: WIDTHS },
    { name: `${name}-2`, widths: WIDTHS },
];

export const MODEL_SHOTS: Record<string, ModelShot[]> = {
    "8e7bed4e-e891-4ce3-bb9e-7e22da238759": poses("white-tee"), // The White Tee
    "75fdb755-9803-4470-8ac8-b65760bf1ad1": poses("simplicity"), // Simplicity 2.0
    "574cd0fc-37b3-4d79-826c-bf96ed4fe650": poses("wrap"), // The White Wrap
    "723ed219-f0d1-48bf-8f86-1cc7dc662d80": poses("vinsic"), // The Vinsic
    "d3b8c8b2-993f-4d5b-b230-5a53f2ec8dd8": poses("track-suit"), // The 2Track Suit
    "06493a41-752d-4680-9585-89d8b58e4c9f": poses("dragon-flair"), // The Dragon Flair
};

const shotFile = (shot: ModelShot, width: number) => `/shoot/${shot.name}-${width}.webp`;

/** Fallback source for browsers that ignore srcset. */
export const shotSrc = (shot: ModelShot) => shotFile(shot, shot.widths[Math.min(1, shot.widths.length - 1)]);

export const shotSrcSet = (shot: ModelShot) => shot.widths.map((w) => `${shotFile(shot, w)} ${w}w`).join(", ");
