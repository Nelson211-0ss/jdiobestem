/**
 * Precompute the dashboard's dotted world map.
 *
 * Point-in-polygon over 177 countries for a few thousand grid points is far too
 * slow to do per request, and the answer never changes — so it is computed once
 * here and committed as data. Re-run with `node scripts/build-world-dots.mjs`.
 *
 * Uses Natural Earth geometry via world-atlas, so the coastlines and the
 * highlighted countries are real rather than approximated.
 */

import { writeFileSync } from 'node:fs';
import { geoContains, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-110m.json' with { type: 'json' };

const WIDTH = 1000;
const HEIGHT = 480;
const STEP = 9; // px between dot centres

const countries = feature(world, world.objects.countries).features;

/** Natural Earth names for the places the Foundation works in. */
const HIGHLIGHT = {
  Uganda: 'UG',
  'S. Sudan': 'SS',
  'United States of America': 'US',
};

const projection = geoNaturalEarth1().fitExtent(
  [
    [8, 8],
    [WIDTH - 8, HEIGHT - 8],
  ],
  { type: 'Sphere' }
);

const marked = countries.filter((c) => HIGHLIGHT[c.properties.name]);
const dots = [];

for (let row = 0; row * STEP < HEIGHT; row++) {
  const y = row * STEP + STEP / 2;
  // Offset every other row, which is what gives the reference its hex feel.
  const offset = row % 2 ? STEP / 2 : 0;

  for (let x = offset + STEP / 2; x < WIDTH; x += STEP) {
    const lonLat = projection.invert([x, y]);
    if (!lonLat) continue;

    const country = countries.find((c) => geoContains(c, lonLat));
    if (!country) continue;

    const code = HIGHLIGHT[country.properties.name];
    dots.push(code ? [Math.round(x), Math.round(y), code] : [Math.round(x), Math.round(y)]);
  }
}

/** Where to anchor each callout: the projected centroid of the country. */
const path = geoPath(projection);
const anchors = {};
for (const c of marked) {
  const [cx, cy] = path.centroid(c);
  anchors[HIGHLIGHT[c.properties.name]] = [Math.round(cx), Math.round(cy)];
}

const output = { width: WIDTH, height: HEIGHT, step: STEP, dots, anchors };
writeFileSync('lib/admin/world-dots.json', JSON.stringify(output));

const highlighted = dots.filter((d) => d[2]).length;
console.log(
  `${dots.length} dots (${highlighted} highlighted), anchors:`,
  Object.entries(anchors).map(([k, v]) => `${k}@${v}`).join(' ')
);
