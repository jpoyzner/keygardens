import { describe, expect, it } from "vitest";
import { filterProductsByCategory, matchesSearchQuery, sortByPopularity } from "./catalog";
import type { ProductSummary } from "./catalog";

function product(overrides: Partial<ProductSummary>): ProductSummary {
  return {
    id: overrides.id ?? "1",
    slug: overrides.slug ?? "product-1",
    name: overrides.name ?? "Product 1",
    price: overrides.price ?? 10,
    salePrice: overrides.salePrice ?? null,
    currency: overrides.currency ?? "usd",
    freeShipping: overrides.freeShipping ?? false,
    categorySlug: overrides.categorySlug ?? null,
    categoryName: overrides.categoryName ?? null,
    imageUrl: overrides.imageUrl ?? null,
    imageAlt: overrides.imageAlt ?? null,
    reviewCount: overrides.reviewCount ?? 0,
    createdAt: overrides.createdAt ?? new Date().toISOString(),
  };
}

describe("filterProductsByCategory", () => {
  const products = [
    product({ id: "1", categorySlug: "hats" }),
    product({ id: "2", categorySlug: "shirts" }),
    product({ id: "3", categorySlug: "hats" }),
  ];

  it("returns all products when no category is given", () => {
    expect(filterProductsByCategory(products, undefined)).toHaveLength(3);
  });

  it("returns only products matching the given category slug", () => {
    const result = filterProductsByCategory(products, "hats");
    expect(result.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("returns an empty array when no products match", () => {
    expect(filterProductsByCategory(products, "socks")).toEqual([]);
  });
});

describe("sortByPopularity", () => {
  it("orders products by review count, descending", () => {
    const products = [
      product({ id: "low", reviewCount: 1 }),
      product({ id: "high", reviewCount: 10 }),
      product({ id: "mid", reviewCount: 5 }),
    ];
    expect(sortByPopularity(products).map((p) => p.id)).toEqual(["high", "mid", "low"]);
  });

  it("does not mutate the input array", () => {
    const products = [product({ id: "a", reviewCount: 1 }), product({ id: "b", reviewCount: 2 })];
    const original = [...products];
    sortByPopularity(products);
    expect(products).toEqual(original);
  });
});

describe("matchesSearchQuery", () => {
  it("matches case-insensitively against any provided field", () => {
    expect(matchesSearchQuery(["Key Garden Hat", "Hats", "A cozy hat"], "COZY")).toBe(true);
  });

  it("returns false when no field contains the query", () => {
    expect(matchesSearchQuery(["Key Garden Hat", "Hats", "A cozy hat"], "shoes")).toBe(false);
  });

  it("ignores null/undefined fields", () => {
    expect(matchesSearchQuery([null, undefined, "T-Shirt"], "shirt")).toBe(true);
  });

  it("returns false for a blank query", () => {
    expect(matchesSearchQuery(["Anything"], "   ")).toBe(false);
  });
});
