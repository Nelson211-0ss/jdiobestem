import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { metadataBase, siteDescription, socialMetadata } from '@/lib/social-metadata';

// Import order reproduces the cascade the design system expects: the site's own
// stylesheets first, Tailwind's layers last. Several utilities the markup relies
// on (e.g. lg:text-[3.5rem]) share single-class specificity with the size rules
// in typography.css, so Tailwind has to come last to win.
import '../styles/scroll-animations.css';
import '../styles/typography.css';
import '../styles/brand-colors.css';
import './globals.css';
import '../styles/pages.css';
import '../styles/editorial.css';
import '../styles/programs.css';
import '../styles/type-sofia.css';


// Sofia Sans, self-hosted, in two widths of the same family: the regular width
// for body copy and the Extra Condensed width for headings. One variable file
// each, Latin subset, weights 1-1000.
const sofia = localFont({
  src: './fonts/SofiaSans-Variable.woff2',
  weight: '1 1000',
  style: 'normal',
  variable: '--font-sofia',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

const sofiaCondensed = localFont({
  src: './fonts/SofiaSansExtraCondensed-Variable.woff2',
  weight: '1 1000',
  style: 'normal',
  variable: '--font-sofia-condensed',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  metadataBase,
  ...socialMetadata(),
  title: {
    default: 'Jdiobe STEM Foundation',
    template: '%s - Jdiobe STEM Foundation',
  },
  description: siteDescription,
  icons: {
    icon: [{ url: '/favicon.png?v=3', type: 'image/png', sizes: '256x256' }],
    apple: '/favicon.png?v=3',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f5f5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The admin's saved theme is stamped on <html> by a script before React
    // loads, so the page never flashes the wrong one. The server cannot know
    // it, so that one attribute is expected to differ.
    <html lang="en" className={`${sofia.variable} ${sofiaCondensed.variable}`} suppressHydrationWarning>
      <body className="min-h-screen text-charcoal-700 antialiased">{children}</body>
    </html>
  );
}
