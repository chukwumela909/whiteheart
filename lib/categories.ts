/**
 * Product categories are typed in by hand in the admin form, so the same
 * category can appear as "Caps", "caps " or "Cap". `categoryKey` folds those
 * into one key so the shop shows a single filter for them.
 */
export function categoryKey(name: string | null | undefined): string {
    const key = (name ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (key.endsWith("ies")) return `${key.slice(0, -3)}y`;
    if (key.endsWith("s") && !key.endsWith("ss")) return key.slice(0, -1);
    return key;
}

/**
 * Broad groups the homepage tiles link to (e.g. /shop?category=headwear).
 * Each group matches any of the category names an admin is likely to use.
 */
const CATEGORY_GROUPS: Record<string, string[]> = {
    tee: ["tee", "tshirt", "shirt"],
    set: ["set", "tracksuit", "twopiece", "coordset"],
    accessory: ["accessory"],
    headwear: ["headwear", "cap", "hat", "beanie", "buckethat"],
    outerwear: ["outerwear", "jacket", "hoodie", "sweatshirt"],
};

/** True when a product's category belongs to the selected filter key. */
export function matchesCategory(
    productCategory: string | null | undefined,
    selectedKey: string
): boolean {
    if (!selectedKey || selectedKey === "all") return true;
    const key = categoryKey(productCategory);
    const group = CATEGORY_GROUPS[selectedKey];
    return group ? group.includes(key) : key === selectedKey;
}
