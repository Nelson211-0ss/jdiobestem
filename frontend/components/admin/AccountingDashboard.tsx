'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';

/**
 * Money in and money out, at a glance.
 *
 * Every figure is read from the rows that produced it — the Expenses and
 * Gifts & Pledges boards, and the donations table — so nothing here can drift
 * away from what those pages show.
 *
 * Nothing is converted between currencies. A shilling total and a dollar total
 * are different facts, and adding them would produce a number that looks
 * authoritative and means nothing, so one currency is shown at a time and the
 * rest are a click away.
 *
 * The charts are drawn as plain SVG rather than pulled from a charting library:
 * a dozen bars and one ring do not justify the weight of one, and hand-drawn
 * shapes inherit the dashboard's own colours in both themes.
 */

export type Month = { key: string; label: string; year: string; in: number; out: number };
export type Day = { in: number; out: number };
export type Series = {
  months: Month[];
  /** Only the days that saw something, keyed `2026-08-22`. */
  days: Record<string, Day>;
  in_total: number;
  out_total: number;
  in_previous: number;
  out_previous: number;
  by_category: { label: string; amount: number }[];
};
export type Accounting = {
  /** '' is every country at once, and is always first. */
  countries: { code: string; label: string }[];
  currencies: string[];
  /** Keyed by country code, then by currency. */
  series: Record<string, Record<string, Series>>;
  recent: {
    id: number;
    name: string;
    amount: number;
    currency: string;
    date: string;
    board: string;
    category: string;
    status: string;
    paid_by: string;
    country: string;
  }[];
  has_any: boolean;
};

/** Mid-tone, so one palette reads on both the light and the dark dashboard. */
const SLICE_COLOURS = ['#fe5c00', '#2a9d8f', '#e9b949', '#7c5cff', '#3d9970', '#8a8a94'];

function amountWith(currency: string, value: number) {
  return `${currency} ${formatNumber(value, { money: true })}`;
}

/** A round number at or above `value`, for an axis a person can read. */
function niceStep(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const scaled = value / magnitude;
  const rounded = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
  return rounded * magnitude;
}

/**
 * `1.2M`, `1M`, `450k`, `900` — an axis, a bar label and the middle of a ring
 * have no room for `1,000,000.00`.
 *
 * A round figure loses its decimal: `1M` is what a person says, and `1.0M`
 * implies a precision that the rounding has already thrown away.
 */
function compact(value: number) {
  const abs = Math.abs(value);
  const trim = (n: number) => String(Number(n.toFixed(1)));
  if (abs >= 1_000_000) return `${trim(value / 1_000_000)}M`;
  if (abs >= 1_000) return `${trim(value / 1_000)}k`;
  return String(Math.round(value));
}

/** The change against the previous stretch of the same length. */
function Delta({ now, before }: { now: number; before: number }) {
  if (!before) {
    // Dividing by nothing gives a percentage that is either infinite or a lie.
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        <Minus className="h-3 w-3" /> no earlier figure
      </span>
    );
  }
  const change = ((now - before) / before) * 100;
  const up = change >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        up ? 'bg-emerald-500/15 text-emerald-600' : 'bg-destructive/15 text-destructive'
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

/**
 * Twelve months, as bars.
 *
 * Each bar carries a short rule near its top — the reference's cap — which
 * gives an otherwise flat block a readable top edge, and the most recent month
 * is filled and labelled with its own figure. A month with nothing recorded
 * draws a hairline on the baseline rather than nothing at all, because an
 * absent bar and a zero bar are different facts and the gap between them is
 * where a missing entry hides.
 */
function Bars({
  months,
  field,
  currency,
  onPick,
  activeKey,
}: {
  months: Month[];
  field: 'in' | 'out';
  currency: string;
  onPick: (key: string) => void;
  activeKey: string;
}) {
  const max = Math.max(...months.map((m) => m[field]), 0);

  if (!max) {
    return (
      <div className="flex h-full min-h-[17rem] items-center justify-center rounded-xl bg-muted/40 text-center text-sm text-muted-foreground">
        Nothing recorded in these twelve months.
      </div>
    );
  }

  // Four gridlines, rounded to something a person would actually say.
  const step = niceStep(max / 4);
  const ceiling = Math.max(step * 4, max);
  const ticks = [4, 3, 2, 1, 0].map((i) => step * i);

  return (
    // `h-full` with a floor: the chart stretches to whatever the calendar
    // beside it needs, so both columns finish on the same line instead of the
    // chart floating above a gap.
    <div className="flex h-full min-h-[17rem] gap-3">
      <div className="flex shrink-0 flex-col">
        <div className="flex w-14 flex-1 flex-col justify-between py-1 text-right text-[0.625rem] tabular text-muted-foreground">
          {ticks.map((t) => (
            <span key={t}>{compact(t)}</span>
          ))}
        </div>
        {/* Holds the axis clear of the month labels, so a tick lines up with
            the gridline it belongs to rather than with the row beneath. */}
        <div aria-hidden="true" className="mt-2 h-4" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="relative flex-1">
          {/* Gridlines sit behind the bars so the eye can read a height. */}
          <div aria-hidden="true" className="absolute inset-0">
            {ticks.map((t, i) => (
              <div
                key={t}
                style={{ top: `${(i / 4) * 100}%` }}
                className="absolute inset-x-0 border-t border-border/60"
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-end gap-1 sm:gap-1.5">
            {months.map((month) => {
            const value = month[field];
            const height = value ? Math.max((value / ceiling) * 100, 4) : 0;
            const active = month.key === activeKey;
            return (
              <button
                key={month.key}
                type="button"
                onClick={() => onPick(month.key)}
                aria-pressed={active}
                title={`${month.label} ${month.year}: ${amountWith(currency, value)}`}
                className="group flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                {value === 0 ? (
                  <span className="h-px w-full rounded bg-border" />
                ) : (
                  <span
                    style={{ height: `${height}%` }}
                    className={cn(
                      'relative flex w-full items-start justify-center rounded-lg transition-colors',
                      active
                        ? 'bg-accent-foreground'
                        : 'bg-muted-foreground/20 group-hover:bg-muted-foreground/30'
                    )}
                  >
                    {/* The cap. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'mt-2 h-[3px] w-1/3 rounded-full',
                        active ? 'bg-background/70' : 'bg-muted-foreground/50'
                      )}
                    />
                    {active ? (
                      <span className="absolute inset-x-0 bottom-2 truncate px-1 text-center text-[0.625rem] font-bold text-background">
                        {compact(value)}
                      </span>
                    ) : null}
                  </span>
                )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex gap-1 sm:gap-1.5">
          {months.map((month) => (
            <span
              key={month.key}
              className={cn(
                'min-w-0 flex-1 truncate text-center text-[0.625rem]',
                month.key === activeKey ? 'font-bold text-foreground' : 'text-muted-foreground'
              )}
            >
              {month.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Spending split by category, as a ring. */
function Donut({ rows, currency }: { rows: { label: string; amount: number }[]; currency: string }) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  if (!total) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No spending recorded yet. Categories appear here as expenses are added.
      </p>
    );
  }

  let offset = 0;
  const segments = rows.map((row, i) => {
    const fraction = row.amount / total;
    const segment = {
      ...row,
      colour: SLICE_COLOURS[i % SLICE_COLOURS.length],
      dash: fraction * circumference,
      offset,
      percent: fraction * 100,
    };
    offset += segment.dash;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0">
        <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90" role="img" aria-label="Spending by category">
          <circle cx="80" cy="80" r={radius} fill="none" strokeWidth="22" className="stroke-muted" />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              strokeWidth="22"
              stroke={s.colour}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold tabular leading-tight" title={amountWith(currency, total)}>
            {compact(total)}
          </span>
          <span className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
            {currency} total
          </span>
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.colour }}
            />
            <span className="min-w-0 flex-1 truncate">{s.label}</span>
            <span className="shrink-0 tabular text-muted-foreground">{s.percent.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The pill-shaped switch used for money in/out, currency and country. */
function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  if (options.length < 2) return null;
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-full bg-muted p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The month, day by day.
 *
 * A bar says how much a month held; this says which days it happened on, which
 * is the question asked when a figure looks wrong. Days with an entry carry a
 * dot and can be opened; the rest are inert, so the calendar never suggests
 * there is something to see where there is nothing.
 */
function MonthView({
  monthKey,
  days,
  field,
  currency,
  onStep,
  selected,
  onSelect,
  canStepBack,
  canStepForward,
}: {
  monthKey: string;
  days: Record<string, Day>;
  field: 'in' | 'out';
  currency: string;
  onStep: (delta: number) => void;
  selected: string | null;
  onSelect: (day: string | null) => void;
  canStepBack: boolean;
  canStepForward: boolean;
}) {
  const [year, month] = monthKey.split('-').map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Monday-first, matching how the Foundation's week is written down.
  const lead = (first.getUTCDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthTotal = Object.entries(days)
    .filter(([key]) => key.startsWith(monthKey))
    .reduce((sum, [, value]) => sum + value[field], 0);

  const shown = selected ? (days[selected]?.[field] ?? 0) : monthTotal;

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl bg-muted/40 p-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canStepBack}
          onClick={() => onStep(-1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold">
          {first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
        </p>
        <button
          type="button"
          aria-label="Next month"
          disabled={!canStepForward}
          onClick={() => onStep(1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[0.625rem] font-semibold text-muted-foreground">
            {d}
          </span>
        ))}

        {cells.map((day, i) => {
          if (day === null) {
            return <span key={`blank-${i}`} className="aspect-square rounded-md bg-border/30" />;
          }
          const key = `${monthKey}-${String(day).padStart(2, '0')}`;
          const value = days[key]?.[field] ?? 0;
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!value}
              aria-pressed={active}
              title={value ? `${day}: ${amountWith(currency, value)}` : undefined}
              onClick={() => onSelect(active ? null : key)}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-md text-xs tabular transition-colors',
                active
                  ? 'bg-accent-foreground font-bold text-background'
                  : value
                    ? 'font-semibold text-foreground hover:bg-background'
                    : 'text-muted-foreground'
              )}
            >
              {day}
              {value && !active ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-accent-foreground"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-auto rounded-lg bg-background px-3 py-2.5">
        <p className="text-[0.625rem] uppercase tracking-wide text-muted-foreground">
          {selected
            ? new Date(`${selected}T00:00:00Z`).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                timeZone: 'UTC',
              })
            : 'This month'}
        </p>
        <p className="truncate text-lg font-bold tabular">{amountWith(currency, shown)}</p>
      </div>
    </div>
  );
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'accent' | 'destructive' | 'muted'> = {
  Approved: 'default',
  Paid: 'default',
  Pending: 'accent',
  Rejected: 'destructive',
};

export default function AccountingDashboard({ data }: { data: Accounting }) {
  const [country, setCountry] = useState(data.countries[0]?.code ?? '');
  const [currency, setCurrency] = useState(data.currencies[0] ?? 'UGX');
  const [field, setField] = useState<'out' | 'in'>('out');

  const series = data.series[country]?.[currency];

  // The month the calendar is showing. Starts on the most recent month that
  // actually holds something, because opening on an empty month suggests the
  // whole dashboard is empty.
  const monthKeys = series?.months.map((m) => m.key) ?? [];
  const lastWithData =
    [...(series?.months ?? [])].reverse().find((m) => m[field] > 0)?.key ??
    monthKeys[monthKeys.length - 1];
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);

  if (!series) return null;

  const shownMonth = monthKey && monthKeys.includes(monthKey) ? monthKey : lastWithData;
  const monthIndex = monthKeys.indexOf(shownMonth);

  const stepMonth = (delta: number) => {
    const next = monthKeys[monthIndex + delta];
    if (!next) return;
    setMonthKey(next);
    setDay(null);
  };

  const total = field === 'out' ? series.out_total : series.in_total;
  const before = field === 'out' ? series.out_previous : series.in_previous;

  // A row is shown when it matches the chosen country, or when everything is.
  const recent = data.recent.filter((r) => !country || r.country === country);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Accounting
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Country"
            value={country}
            options={data.countries.map((c) => ({ value: c.code, label: c.label }))}
            onChange={(next) => {
              setCountry(next);
              setDay(null);
            }}
          />
          <Segmented
            label="Currency"
            value={currency}
            options={data.currencies.map((c) => ({ value: c, label: c }))}
            onChange={(next) => {
              setCurrency(next);
              setDay(null);
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-3xl tabular">{amountWith(currency, total)}</CardTitle>
              <Delta now={total} before={before} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {field === 'out' ? 'Spent' : 'Received'} in the last twelve months
              {before ? ` · ${amountWith(currency, before)} the twelve before` : ''}
            </p>
          </div>

          <Segmented
            label="Money in or out"
            value={field}
            options={[
              { value: 'out' as const, label: 'Money out' },
              { value: 'in' as const, label: 'Money in' },
            ]}
            onChange={(next) => {
              setField(next);
              setDay(null);
            }}
          />
        </CardHeader>

        <CardContent className="pt-4">
          {/* Chart and calendar side by side, as in the reference; stacked
              below `xl`, where a twelve-bar chart already wants the width. */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
            <Bars
              months={series.months}
              field={field}
              currency={currency}
              activeKey={shownMonth}
              onPick={(key) => {
                setMonthKey(key);
                setDay(null);
              }}
            />
            <MonthView
              monthKey={shownMonth}
              days={series.days}
              field={field}
              currency={currency}
              selected={day}
              onSelect={setDay}
              onStep={stepMonth}
              canStepBack={monthIndex > 0}
              canStepForward={monthIndex < monthKeys.length - 1}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Spending by category</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Donut rows={series.by_category} currency={currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent spending</CardTitle>
            <Link
              href="/admin/operations/5100927218"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              All expenses <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            {recent.length ? (
              <ul className="divide-y">
                {recent.map((row) => (
                  <li key={row.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/operations/${row.board}/${row.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {row.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(row.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {row.paid_by ? ` · ${row.paid_by}` : ''}
                      </p>
                    </div>
                    {row.status ? (
                      <Badge variant={STATUS_VARIANT[row.status] ?? 'secondary'}>{row.status}</Badge>
                    ) : null}
                    <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular">
                      {amountWith(row.currency, row.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nothing recorded yet. Expenses appear here as they are added.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
