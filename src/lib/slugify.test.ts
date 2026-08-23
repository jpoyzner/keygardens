import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Key Garden Hats")).toBe("key-garden-hats");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Hats & Caps!!")).toBe("hats-caps");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  --Sale Item--  ")).toBe("sale-item");
  });

  it("returns an empty string for input with no alphanumerics", () => {
    expect(slugify("!!!")).toBe("");
  });
});
