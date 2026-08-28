/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    ];
  },
};

export default nextConfig;
