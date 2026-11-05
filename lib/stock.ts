export interface StockFields {
    stock_quantity: number | null;
    sizes?: { name: string; stock: number }[] | null;
}

/**
 * How many units can be bought. For a product with sizes, pass the size name:
 * the answer is capped by both that size's stock and the product's total, and
 * is 0 when the size doesn't exist or none was given.
 */
export function availableQuantity(product: StockFields, sizeName?: string | null): number {
    const total = Math.max(0, Number(product.stock_quantity) || 0);
    const sizes = product.sizes ?? [];
    if (sizes.length === 0) return total;
    const size = sizes.find((s) => s.name === sizeName);
    if (!size) return 0;
    return Math.min(total, Math.max(0, Number(size.stock) || 0));
}

/** True when nothing of this product can be bought, in any size. */
export function isSoldOut(product: StockFields): boolean {
    if ((Number(product.stock_quantity) || 0) <= 0) return true;
    const sizes = product.sizes ?? [];
    return sizes.length > 0 && sizes.every((s) => (Number(s.stock) || 0) <= 0);
}
