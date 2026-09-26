import type { Metadata } from 'next';

export const siteName = 'Jdiobe STEM Foundation';
export const siteDescription =
  'The Jdiobe STEM Foundation provides underserved students in Uganda and South Sudan with access to education, scholarships, mentorship, and real world STEM opportunities.';

export const metadataBase = new URL(
  process.env.PUBLIC_SITE_URL || 'https://www.jdiobestem.org',
);

/** Supply complete nested objects: Next.js replaces, rather than merges, them. */
export function socialMetadata({
  title = siteName,
  description = siteDescription,
  path,
  card = 'home',
  image,
  imageAlt,
  article = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  card?: string;
  image?: string | null;
  imageAlt?: string | null;
  article?: boolean;
} = {}): Pick<Metadata, 'title' | 'description' | 'openGraph' | 'twitter'> {
  const images = image
    ? [{ url: image, alt: imageAlt || title }]
    : [{
        url: `/images/og/${card}.png`,
        width: 1200,
        height: 630,
        alt: `${title} — ${siteName}`,
      }];

  return {
    title,
    description,
    openGraph: {
      type: article ? 'article' : 'website',
      locale: 'en_US',
      siteName,
      title,
      description,
      ...(path ? { url: path } : {}),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}
