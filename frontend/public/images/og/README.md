# Social preview cards

These 1200 × 630 PNGs use the existing Jdiobe logo, Chivo font, and brand colours.
Each public page selects its card through `lib/social-metadata.ts`. News articles
use their CMS image, with `news.png` as the fallback. Open Graph and Twitter share
the same images and descriptive alt text.

Set `PUBLIC_SITE_URL` to the site's canonical origin in deployment; the default is
`https://www.jdiobestem.org`. This makes relative image paths resolve to public,
absolute URLs.

To change card copy, edit `scripts/og-cards.json`, then run the instructions at the
top of `scripts/build-og-images.py`. Commit the regenerated PNGs. There is no
runtime image-generation dependency or external image service.

Metadata follows the [Next.js Metadata API](https://nextjs.org/docs/15/app/api-reference/functions/generate-metadata).
