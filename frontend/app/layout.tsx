import type { Metadata } from 'next';
import localFont from 'next/font/local';

// Import order reproduces the cascade the design system expects: the site's own
// stylesheets first, Tailwind's layers last. Several utilities the markup relies
// on (e.g. lg:text-[3.5rem]) share single-class specificity with the size rules
// in typography.css, so Tailwind has to come last to win.
import '../styles/scroll-animations.css';
import '../styles/typography.css';
import '../styles/brand-colors.css';
import './globals.css';
import '../styles/pages.css';


// Chivo, self-hosted, for the whole site. One variable file covering 100-900,
// Latin subset — 32 KB, against the nine static files and 280 KB that Vistol
// Sans took to cover the same range.
//
// One family throughout: headings are a matter of weight (900 for display, 700
// for the smaller ones) and tracking, not of a second typeface. Vistol's files
// are still in ./fonts if this turns out to be one voice too few.
const chivo = localFont({
  src: './fonts/Chivo-Variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-chivo',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: {
    default: 'Jdiobe STEM Foundation',
    template: '%s - Jdiobe STEM Foundation',
  },
  description:
    'The Jdiobe STEM Foundation provides underserved students in Uganda and South Sudan with access to education, scholarships, mentorship, and real world STEM opportunities.',
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
    <html lang="en" className={chivo.variable}>
      <body className="min-h-screen text-charcoal-700 antialiased">{children}</body>
    </html>
  );
}
