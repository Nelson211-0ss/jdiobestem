/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Where the build output goes. `next dev` and `next build` both write here,
  // and a production build run while a dev server is up overwrites the chunks
  // the dev server is still serving — which surfaces as
  // "Cannot find module './5611.js'" until one of them is restarted. Setting
  // NEXT_DIST_DIR lets a verification build go somewhere else and leave the
  // running dev server alone.
  distDir: process.env.NEXT_DIST_DIR || '.next',

  // Static assets live in public/ and are referenced by plain <img>, so Next's
  // image optimizer is not in the path. Keep it available for future use.
  images: {
    // The site ships pre-sized artwork; no remote sources.
    remotePatterns: [],
  },

  // Two pages were folded into larger ones. Permanent redirects so existing
  // links, bookmarks, and search results land on the content rather than a 404.
  async redirects() {
    return [
      { source: '/faqs', destination: '/contact#faqs', permanent: true },
      { source: '/regina-henry-scholarship', destination: '/scholarship', permanent: true },
      // The programmes index was folded away; the Science Fair is what its
      // links now point at. Redirected rather than left to 404, because the
      // address is in old newsletters and search results.
      { source: '/programs', destination: '/secondary-research', permanent: true },
    ];
  },
};

export default nextConfig;
