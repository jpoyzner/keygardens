import { describe, expect, it } from "vitest";
import { calculateSubtotal, calculateTotalQuantity } from "./cart-context";
import type { CartItem } from "./cart-context";

function item(overrides: Partial<CartItem>): CartItem {
  return {
    productId: overrides.productId ?? "1",
    slug: overrides.slug ?? "product-1",
    name: overrides.name ?? "Product 1",
    price: overrides.price ?? 10,
    currency: overrides.currency ?? "usd",
    imageUrl: overrides.imageUrl ?? null,
    quantity: overrides.quantity ?? 1,
  };
}

describe("calculateTotalQuantity", () => {
  it("returns 0 for an empty cart", () => {
    expect(calculateTotalQuantity([])).toBe(0);
  });

  it("sums quantities across line items", () => {
    const items = [item({ quantity: 2 }), item({ productId: "2", quantity: 3 })];
    expect(calculateTotalQuantity(items)).toBe(5);
  });
});

describe("calculateSubtotal", () => {
  it("returns 0 for an empty cart", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("sums price * quantity across line items", () => {
    const items = [
      item({ price: 10, quantity: 2 }),
      item({ productId: "2", price: 5.5, quantity: 3 }),
    ];
    expect(calculateSubtotal(items)).toBeCloseTo(36.5);
  });
});
