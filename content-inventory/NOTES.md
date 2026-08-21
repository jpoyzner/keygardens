# Phase 0 — Content Inventory Notes

Crawled the live site at https://keygardens.ca on 2026-08-20 (public scrape, no admin/FTP access). Structured data is in [inventory.json](inventory.json); downloaded assets are under `images/`.

## What's on the live site

- **3 categories** (rebuild): hoodie, hats, t-shirt — the live site only has 3 category pages (hoodie, sport hat, t-shurt) and nests "Hats" under "sport hat"; the rebuild splits it into its own `hats` category and corrects the "t-shurt" typo to `t-shirt`. The live site's separate "sport hat" category/product was removed from the rebuild as a duplicate of `hats`.
- **3 products** total: `Hoodies` ($35), `Hats` ($20, its own category), `key garden` ($20)
- **1 "coming soon" carousel** with 4 slides (standalone section on the homepage)
- GoDaddy Website Builder top bar ad, present as required by the rebuild scope to remove

This is a very small catalog. If more products/categories exist behind a login, search, or unlisted URLs, they were not discoverable via public crawling — flag for the client to confirm this is the complete catalog.

## Flags for manual follow-up

1. **No product descriptions found.** None of the product pages rendered a description block — only name, price, and images. Need to confirm with the client whether descriptions exist elsewhere (e.g. only visible after adding to cart) or need to be written from scratch.
2. ~~Category name "t-shurt"~~ — resolved: corrected to `t-shirt` in `inventory.json`.
3. ~~"Hats" categorization~~ — resolved: `hats` is now its own dedicated category in `inventory.json` instead of being nested under "sport hat"; the duplicate "sport hat" category/product was subsequently removed entirely from the rebuild.
4. **Low/inconsistent image quality.** `hoodies.jpg` and `hats.jpg` are 1177x2560 phone screenshots (EXIF `description=Screenshot`), not clean product photography. Recommend asking the client for better source images for these two products.
5. **`key-garden` product image is byte-identical** to `coming-soon/slide-1-grayscale.jpg` — the CMS reused the same uploaded asset in both places. Confirm whether a distinct product photo should be used instead.
6. **Coming-soon slides are a mix of asset types**: 2 heavily-cropped/grayscale images (same source as flag #5) and 2 real iPhone photos (`IMG_5448.jpeg`, `IMG_9599.jpeg`, taken 2024-10-28 and 2025-10-24 respectively per EXIF). Confirm with the client whether these are final images or placeholders to replace.

## Downloaded assets

- `images/products/` — includes `sport-hat.png`, no longer referenced by `inventory.json` since that product/category was removed as a duplicate of `hats` — kept on disk in case it's needed again, otherwise unused
- `images/coming-soon/` — 4 carousel slide images

All other images (logo, hero/banner) were not explicitly called out as needed in Phase 0 requirements (product + site images); revisit if the design phase needs the raw hero/banner assets too.
