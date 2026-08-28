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


// Vistol Sans, self-hosted. One family across the whole site — headings lean on
// weight (700–800) rather than a second typeface for contrast.
const vistol = localFont({
  src: [
    { path: './fonts/VistolSans-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/VistolSans-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/VistolSans-Italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/VistolSans-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/VistolSans-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/VistolSans-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/VistolSans-BoldItalic.woff2', weight: '700', style: 'italic' },
    { path: './fonts/VistolSans-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './fonts/VistolSans-Black.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-vistol',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});

// Overpass, self-hosted, for headings only. One variable file covering 100-900
// rather than a stack of statics, subset to the Latin range the site actually
// uses (verified against every character in content/, components/ and app/) —
// 63 KB instead of 315 KB. Anything outside that range falls through to Vistol,
// which is why it heads the fallback list rather than a generic sans.
const overpass = localFont({
  src: './fonts/Overpass-Variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-overpass',
  display: 'swap',
  fallback: ['var(--font-vistol)'],
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
  themeColor: '#fff1e0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${vistol.variable} ${overpass.variable}`}>
      <body className="min-h-screen text-charcoal-700 antialiased">{children}</body>
    </html>
  );
}
