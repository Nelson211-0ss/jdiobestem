'use client';

import { useState } from 'react';
import { GraduationCap, HeartHandshake, Rocket, School, Users } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import worldDots from '@/lib/admin/world-dots.json';

/**
 * Where the Foundation works, and what is there.
 *
 * The dots are real Natural Earth geometry, sampled once by
 * scripts/build-world-dots.mjs and committed as data — testing a few thousand
 * grid points against 177 countries is far too slow to repeat per request, and
 * the coastlines do not move.
 *
 * The figures come through the same country scope as every list, so a Uganda
 * coordinator sees Uganda's numbers and a blank South Sudan rather than totals
 * for records they cannot open.
 */

export type CountryFigures = {
  code: string;
  label: string;
  mentees: number;
  mentors: number;
  projects: number;
  volunteers: number;
  /** Schools live on an operations board, so this is merged in by the page. */
  schools: number;
};

type DotMap = {
  width: number;
  height: number;
  dots: [number, number, string?][];
  anchors: Record<string, [number, number]>;
};

const { width, height, dots, anchors } = worldDots as unknown as DotMap;

/** Where the callout sits relative to its country, so the two do not collide. */
const CALLOUT_OFFSET: Record<string, { dx: number; dy: number }> = {
  US: { dx: -70, dy: -72 },
  UG: { dx: 26, dy: 34 },
  SS: { dx: -150, dy: -58 },
};

/** What the map can be asked to show. Each reads one figure per country. */
const METRICS = [
  { key: 'mentees', label: 'Students', noun: 'student', icon: GraduationCap },
  { key: 'mentors', label: 'Mentors', noun: 'mentor', icon: Users },
  { key: 'schools', label: 'Schools', noun: 'school', icon: School },
  { key: 'projects', label: 'Projects', noun: 'project', icon: Rocket },
  { key: 'volunteers', label: 'Volunteers', noun: 'volunteer', icon: HeartHandshake },
] as const;

type MetricKey = (typeof METRICS)[number]['key'];

export default function OperationsMap({ countries }: { countries: CountryFigures[] }) {
  const [metric, setMetric] = useState<MetricKey>('mentees');
  const active = METRICS.find((m) => m.key === metric)!;

  const valueFor = (c: CountryFigures) => Number(c[metric] ?? 0);
  const total = countries.reduce((n, c) => n + valueFor(c), 0);
  const largest = Math.max(...countries.map(valueFor), 1);

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:p-8">
        <div className="space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Areas of operation</p>
            <p className="mt-1 text-3xl font-bold tabular">
              {countries.length} <span className="text-base font-normal">countries</span>
            </p>
          </div>

          {/* Choosing a measure repaints the map: the dots stay, the figures
              and the callouts follow whatever is selected. */}
          <div role="radiogroup" aria-label="What to show on the map" className="space-y-1">
            {METRICS.map((m) => {
              const Icon = m.icon;
              const selected = m.key === metric;
              const sum = countries.reduce((n, c) => n + Number(c[m.key] ?? 0), 0);
              return (
                <button
                  key={m.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMetric(m.key)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    selected
                      ? 'bg-secondary font-semibold text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{m.label}</span>
                  <span className="tabular text-xs">{sum}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2.5 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {active.label} by country
            </p>
            {countries.map((c) => {
              const value = valueFor(c);
              return (
                <div key={c.code} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{c.label}</span>
                    <span className="tabular font-semibold">{value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${(value / largest) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={`World map. The Foundation works in ${countries
              .map((c) => c.label)
              .join(' and ')}, with an administrative office in the United States.`}
          >
            {dots.map(([x, y, code], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={code ? 2.6 : 2}
                className={
                  code
                    ? countries.find((c) => c.code === code && valueFor(c) > 0)
                      ? 'fill-accent'
                      : 'fill-accent/40'
                    : /* the rest of the world: present, but never competing
                         with the countries we work in, in either theme */
                      'fill-muted-foreground/25'
                }
              />
            ))}

            {countries.map((c) => {
              const anchor = anchors[c.code];
              if (!anchor) return null;
              const offset = CALLOUT_OFFSET[c.code] ?? { dx: 24, dy: -50 };
              const [ax, ay] = anchor;
              const x = ax + offset.dx;
              const y = ay + offset.dy;

              return (
                <g key={c.code}>
                  <line
                    x1={ax}
                    y1={ay}
                    x2={x + 70}
                    y2={y + 26}
                    className="stroke-muted-foreground/50"
                    strokeWidth={1}
                  />
                  <circle cx={ax} cy={ay} r={4} className="fill-accent" />

                  <foreignObject x={x} y={y} width={148} height={54}>
                    {/* Reads as the inverse of the map in both themes: a dark
                        chip on the light map, a pale one on the dark map. */}
                    <div className="rounded-lg bg-primary px-3 py-2 text-primary-foreground shadow-md">
                      <p className="text-[11px] leading-tight text-primary-foreground/70">
                        {c.label}
                      </p>
                      <p className="text-sm font-bold leading-tight tabular">
                        {valueFor(c)} {valueFor(c) === 1 ? active.noun : `${active.noun}s`}
                      </p>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </Card>
  );
}
