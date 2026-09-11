'use client';

import { useState } from 'react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Accounting, Row } from './AccountingDashboard';

/**
 * The same money, cut several ways.
 *
 * Every cut is grouped by currency as well as by whatever it breaks down, so
 * a row is always a figure in one currency. Adding UGX to USD would read as
 * authoritative and mean nothing — conversion is a separate, explicit act
 * below, and it names the rate that produced it.
 */

const CUTS = [
  { key: 'by_month', label: 'Month' },
  { key: 'by_year', label: 'Year' },
  { key: 'by_currency', label: 'Currency' },
  { key: 'by_country', label: 'Country' },
  { key: 'by_office', label: 'Office' },
] as const;

type CutKey = (typeof CUTS)[number]['key'];

const money = (n: number, currency: string) =>
  `${currency} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function Table({ rows }: { rows: Row[] }) {
  if (!rows.length) {
    return <p className="px-1 py-6 text-sm text-muted-foreground">Nothing recorded for this.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-2 py-2">&nbsp;</th>
            <th className="px-2 py-2">Currency</th>
            <th className="px-2 py-2 text-right">In</th>
            <th className="px-2 py-2 text-right">Out</th>
            <th className="px-2 py-2 text-right">Net</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.label}-${row.currency}-${index}`} className="border-b last:border-0">
              <td className="px-2 py-2 font-medium">{row.label || '—'}</td>
              <td className="px-2 py-2 text-muted-foreground">{row.currency || '—'}</td>
              <td className="px-2 py-2 text-right tabular">{row.in.toLocaleString()}</td>
              <td className="px-2 py-2 text-right tabular">{row.out.toLocaleString()}</td>
              <td
                className={cn(
                  'px-2 py-2 text-right font-semibold tabular',
                  row.net < 0 && 'text-muted-foreground'
                )}
              >
                {row.net.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AccountingBreakdowns({ data }: { data: Accounting }) {
  const [cut, setCut] = useState<CutKey>('by_month');
  const breakdowns = data.breakdowns;
  const converted = data.converted;
  const targets = data.rates_available ?? [];

  if (!breakdowns) return null;

  return (
    <Card className="overflow-hidden rounded-3xl border shadow-sm">
      <div className="space-y-5 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Breakdowns</p>
            <p className="mt-1 text-lg font-bold">The last twelve months</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CUTS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCut(c.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm transition-colors',
                  cut === c.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <Table rows={breakdowns[cut]} />

        {/* Conversion, said out loud. Reloads the page because the rate that
            applies depends on each figure's own date, which is the server's
            business rather than something to approximate here. */}
        <div className="border-t pt-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">Everything in one currency</p>
            <div className="flex flex-wrap gap-1.5">
              {targets.length ? (
                targets.map((code) => (
                  <Link
                    key={code}
                    href={converted?.currency === code ? '/admin' : `/admin?display=${code}`}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm transition-colors',
                      converted?.currency === code
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {code}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No exchange rates recorded yet, so nothing can be converted.{' '}
                  <Link href="/admin/exchange-rates/new" className="underline underline-offset-2">
                    Add one
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>

          {converted ? (
            <div className="mt-4 space-y-3">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-bold tabular">
                    {money(converted.in_total, converted.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">in</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular">
                    {money(converted.out_total, converted.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">out</p>
                </div>
                <div>
                  <p className="text-2xl font-bold tabular">
                    {money(converted.net, converted.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">net</p>
                </div>
              </div>

              {converted.rates.length ? (
                <p className="text-xs text-muted-foreground">
                  Converted at{' '}
                  {converted.rates
                    .map(
                      (r) =>
                        `1 ${r.from} = ${r.rate} ${r.to}${
                          r.effective_from ? ` from ${r.effective_from}` : ''
                        }`
                    )
                    .join('; ')}
                  .
                </p>
              ) : null}

              {converted.unconverted.length ? (
                <p className="text-xs font-medium text-destructive">
                  Not included, because no rate is recorded for them:{' '}
                  {converted.unconverted
                    .map((u) => `${u.currency} ${(u.in + u.out).toLocaleString()}`)
                    .join(', ')}
                  .
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
