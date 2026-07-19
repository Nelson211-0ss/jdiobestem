/*
 * Brand palette (from the "Group 1316" design-token spec) mapped onto Tailwind's
 * scale. Must load immediately after the Tailwind Play CDN script, before the
 * page body, so generated utilities use these values.
 *
 * NOTE: the spec's scale runs opposite to Tailwind's — its Orange 100 is the
 * saturated primary (#FE5C00) and its Orange 700 is near-black (#662500). The
 * class names below are therefore mapped by ROLE and lightness, not by number,
 * so existing `orange-700` / `gray-600` markup keeps its visual intent.
 *
 * Accessibility — the reason the roles are split by number:
 *   white on #FE5C00 ...... 3.11  FAIL   (never put white labels on vivid orange)
 *   charcoal on #FE5C00 ... 5.86  PASS   <- filled buttons use charcoal text
 *   #FE5C00 on charcoal ... 5.86  PASS   <- accents on dark surfaces
 *   #FE5C00 on white ...... 3.11  FAIL for small text, PASS for large (>=3.0)
 *   #C85200 on white ...... 4.50  PASS   <- the vivid ceiling for small text
 *
 * So: 400-600 are the vivid fills/accents (paired with charcoal or a dark
 * surface), and 700 is the deepest-still-vivid tone reserved for small orange
 * TEXT on white, where the vivid range cannot reach AA.
 *
 * Values marked "derived" are interpolated: the source spec left those hexes blank.
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF7F2', // derived (spec Orange 5, hex omitted)
          100: '#FFEFE5', // spec Orange 10
          200: '#FFD9C2', // derived (spec Orange 50, hex omitted)
          300: '#FFB185', // derived
          400: '#FF7D33', // spec Orange 200 — accent on charcoal (7.15:1)
          500: '#FE5C00', // spec Orange 100 — vivid primary; fills, CTAs
          600: '#E65300', // spec Orange 300 — button hover / pressed
          700: '#BE4E00', // small orange text — 4.91 on white, 4.50+ on the grey/orange tints
          800: '#993700', // spec Orange 400
          900: '#662500', // spec Orange 700
        },
        // The spec ships one neutral ramp; alias Tailwind's three so mixed
        // gray-/slate-/stone- markup across the site resolves consistently.
        // Neutrals are charcoal tints (not the spec's blue-cast greys) so the
        // whole page reads in three colours: orange, white, charcoal.
        gray: {
          50: '#F7F7F8',
          100: '#EFEFF1',
          200: '#DCDDE0',
          300: '#BFC1C5', // 10.11 on charcoal — secondary text on dark surfaces
          400: '#8E9095', // placeholders / non-text UI only
          500: '#6A6C72', // 5.25 on white — smallest passing meta text
          600: '#4E5055', // 8.07 on white — secondary text
          700: '#35373C',
          800: '#232428',
          900: '#14151A', // charcoal — primary ink + dark surface
          950: '#0B0E11',
        },
        red: {
          50: '#FEF1F2', // spec Red 10
          100: '#FDBAB9', // spec Red 100
          200: '#FC9897', // spec Red 200
          300: '#FC6E75', // spec Red 300
          400: '#F84960', // spec Red 400
          500: '#D9304E', // spec Red 500
          600: '#982A42', // spec Red 600
          700: '#5C1929', // spec Red 700
          800: '#35141D', // spec Red 800
          900: '#280F16', // derived
          950: '#1A0A0E', // derived
        },
        green: {
          50: '#E2FDF4', // spec Green 10
          100: '#B8F5DF', // derived
          200: '#54E8B4', // spec Green 200
          300: '#2ED191', // spec Green 300
          400: '#02C076', // spec Green 400
          500: '#0F8F62', // spec Green 500
          600: '#0B7150', // derived
          700: '#08533B', // derived
          800: '#102821', // spec Green 800
          900: '#0A1B16', // derived
          950: '#06110E', // derived
        },
      },
    },
  },
};

// The spec ships one neutral, one brand, one destructive, and one success ramp.
// Alias the interchangeable Tailwind families used across the site onto them so
// stray `amber-`/`rose-`/`emerald-` markup can't reintroduce off-palette colors.
(function aliasPalettes() {
  var c = tailwind.config.theme.extend.colors;
  c.orange[950] = '#4D1C00'; // derived — deepest brand shade
  c.slate = c.stone = c.zinc = c.neutral = c.gray;
  c.amber = c.orange;
  c.rose = c.pink = c.red;
  c.emerald = c.teal = c.green;
})();
