import type { Config } from 'tailwindcss';

/*
 * Five colours, nothing else: cream, charcoal, orange, white, black.
 *
 *   cream     #FFF1E0   the page. Warm, low-glare, and what makes white cards read as cards.
 *   charcoal  #3A3B47   body ink and dark surfaces. Softer and warmer than pure black.
 *   orange    #FE5C00   the one accent. CTAs, links, eyebrows, and rules — nothing else.
 *   white     #FFFFFF   cards and alternating bands.
 *   black     #000000   display headings only, where charcoal would go muddy at weight.
 *
 * Each is expanded into a Tailwind ramp so the utility classes already spread
 * across the markup (`bg-orange-500`, `text-stone-600`, `border-gray-200`, …)
 * resolve into this palette instead of Tailwind's defaults. The ramps are tints
 * and shades of the five hexes above, not new hues.
 *
 * Contrast notes, because vivid orange is the trap here:
 *   white    on #FE5C00 ... 3.11  FAIL for body copy, PASS for >=24px / >=18.7px bold
 *   charcoal on #FE5C00 ... 5.31  PASS
 *   #FE5C00  on #FFF1E0 ... 3.03  large text only
 *   #C2410C  on #FFF1E0 ... 4.85  PASS  <- orange-700, for small orange text
 *   charcoal on #FFF1E0 ... 9.72  PASS
 * So: orange-500 is for fills and large type; orange-700 is the small-text orange.
 */

// Brand orange. 500 is the literal brand hex; darker steps exist so small text
// and hover states can stay in-family without dropping below AA.
const orange = {
  50: '#FFF4EC',
  100: '#FFE4D1',
  200: '#FFC7A5',
  300: '#FFA26E',
  400: '#FF7C33',
  500: '#FE5C00', // brand
  600: '#E04F00',
  700: '#C2410C', // 4.85 on cream — the smallest passing orange text
  800: '#963400',
  900: '#6B2500',
  950: '#3D1500',
};

// Charcoal ramp. The light end leans warm so tints sit on cream without
// turning grey-blue; 700 is the brand charcoal.
const charcoal = {
  50: '#F7F5F3',
  100: '#EDEAE6',
  200: '#DAD6D1',
  300: '#BBB7B5',
  400: '#8B8A92',
  500: '#65656F', // 6.05 on white — smallest passing meta text
  600: '#4E4F5A',
  700: '#3A3B47', // brand charcoal — body ink and dark surfaces
  800: '#2B2C35',
  900: '#1C1D23',
  950: '#101116',
};

// Cream ramp, for the rare case a section needs a step between cream and white.
const cream = {
  50: '#FFFBF6',
  100: '#FFF1E0', // brand cream — the page background
  200: '#FBE6CF',
  300: '#F3D6B8',
  400: '#E7C09B',
};

/*
 * Feedback colours. The brief is five colours, and these are the one deliberate
 * exception: a form that cannot signal "this failed" in a colour distinct from
 * its accent is a usability problem, not a style choice. Both are held close to
 * the palette — the error red is warm and orange-adjacent, the success green
 * desaturated — so they read as part of the system rather than bolted on.
 */
const red = {
  50: '#FDF0EC',
  100: '#FADACF',
  200: '#F3B3A0',
  300: '#E88872',
  400: '#D95F4C',
  500: '#C0392B',
  600: '#A02A20',
  700: '#7C1F18',
  800: '#551512',
  900: '#330D0B',
  950: '#1F0706',
};

const green = {
  50: '#EFF6EF',
  100: '#D6E9D7',
  200: '#AED3B0',
  300: '#7FB783',
  400: '#549A5A',
  500: '#3A7D42',
  600: '#2D6234',
  700: '#224A28',
  800: '#17321B',
  900: '#0E1F11',
  950: '#08130A',
};

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './content/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // --- shadcn/ui tokens -------------------------------------------
        // Only resolve inside `.admin-shell`, where styles/admin.css defines
        // the variables. The public site never sees them, so adding shadcn
        // could not restyle a single page of it.
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        orange,
        cream,
        charcoal,
        red,
        green,
        // Every neutral family in the markup collapses onto the charcoal ramp so
        // stray `slate-`/`stone-`/`zinc-` classes cannot reintroduce a cool grey.
        gray: charcoal,
        slate: charcoal,
        stone: charcoal,
        zinc: charcoal,
        neutral: charcoal,
        // Likewise for the accent and feedback aliases.
        amber: orange,
        yellow: orange,
        rose: red,
        pink: red,
        emerald: green,
        teal: green,
      },
      fontFamily: {
        sans: ['var(--font-vistol)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Headings run on Overpass; everything else stays on Vistol.
        heading: ['var(--font-overpass)'],
        body: ['var(--font-vistol)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Buttons are pills; cards and panels use the large soft radii that give
        // the reference sites their friendly, un-corporate feel.
        lg: '0.875rem',
        xl: '1.125rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        // Warm, low-contrast lifts — a neutral black shadow goes grey on cream.
        card: '0 2px 4px -2px rgb(58 59 71 / 0.06), 0 12px 28px -12px rgb(58 59 71 / 0.14)',
        'card-hover': '0 4px 8px -4px rgb(58 59 71 / 0.08), 0 24px 48px -16px rgb(58 59 71 / 0.20)',
        panel: '0 32px 64px -24px rgb(58 59 71 / 0.22)',
      },
      maxWidth: {
        // Matches the reference sites' content column.
        content: '75rem', // 1200px
        prose: '42rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
