# Phase 0 — Content Inventory Notes

Crawled the live site at https://keygardens.ca on 2026-08-20 (public scrape, no admin/FTP access). Structured data is in [inventory.json](inventory.json); downloaded assets are under `images/`.

## What's on the live site

- **4 categories** (rebuild): hoodie, sport hat, hats, t-shirt — the live site only has 3 category pages (hoodie, sport hat, t-shurt) and nests "Hats" under "sport hat"; the rebuild splits it into its own `hats` category and corrects the "t-shurt" typo to `t-shirt`
- **4 products** total: `sport-hat` ($35, on sale $15), `Hoodies` ($35), `Hats` ($20, now its own category), `key garden` ($20, free shipping)
- **1 "coming soon" carousel** with 4 slides (standalone section on the homepage)
- GoDaddy Website Builder top bar ad, present as required by the rebuild scope to remove

This is a very small catalog. If more products/categories exist behind a login, search, or unlisted URLs, they were not discoverable via public crawling — flag for the client to confirm this is the complete catalog.

## Flags for manual follow-up

1. **No product descriptions found.** None of the 4 product pages rendered a description block — only name, price, and images. Need to confirm with the client whether descriptions exist elsewhere (e.g. only visible after adding to cart) or need to be written from scratch.
2. ~~Category name "t-shurt"~~ — resolved: corrected to `t-shirt` in `inventory.json`.
3. ~~"Hats" categorization~~ — resolved: `hats` is now its own dedicated category in `inventory.json` instead of being nested under "sport hat".
4. **Low/inconsistent image quality.** `hoodies.jpg` and `hats.jpg` are 1177x2560 phone screenshots (EXIF `description=Screenshot`), not clean product photography like `sport-hat.png` (2160x1440). Recommend asking the client for better source images for these two products.
5. **`key-garden` product image is byte-identical** to `coming-soon/slide-1-grayscale.jpg` — the CMS reused the same uploaded asset in both places. Confirm whether a distinct product photo should be used instead.
6. **Coming-soon slides are a mix of asset types**: 2 heavily-cropped/grayscale images (same source as flag #5) and 2 real iPhone photos (`IMG_5448.jpeg`, `IMG_9599.jpeg`, taken 2024-10-28 and 2025-10-24 respectively per EXIF). Confirm with the client whether these are final images or placeholders to replace.

## Downloaded assets

- `images/products/` — 4 product images (best resolution available from the public CDN, resize/crop query params stripped)
- `images/coming-soon/` — 4 carousel slide images

All other images (logo, hero/banner) were not explicitly called out as needed in Phase 0 requirements (product + site images); revisit if the design phase needs the raw hero/banner assets too.
