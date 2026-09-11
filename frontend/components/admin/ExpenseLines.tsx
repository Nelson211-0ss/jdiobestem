'use client';

import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * The entries a compound expense is made of.
 *
 * A trip is a fare, a night's lodging and a meal, each on its own day. Entered
 * as one figure it can only answer how much; entered as lines it answers what
 * on and when.
 *
 * The amount on the expense is what was spent; these say what it went on. They
 * may cover less than all of it — not everything is itemised at once — but they
 * cannot come to more, and the form says so before it is saved rather than
 * leaving the server to refuse it.
 */

export type ExpenseLine = { name: string; incurred_on: string; amount: string };

export function linesTotal(lines: ExpenseLine[]): number {
  return lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
}

export default function ExpenseLines({
  lines,
  currency,
  total = 0,
  disabled,
  onChange,
}: {
  lines: ExpenseLine[];
  currency?: string;
  /** The amount recorded on the expense, which the entries break down. */
  total?: number;
  disabled?: boolean;
  onChange: (lines: ExpenseLine[]) => void;
}) {
  const itemised = linesTotal(lines);
  const remaining = total - itemised;
  const over = total > 0 && itemised > total;
  const update = (index: number, patch: Partial<ExpenseLine>) =>
    onChange(lines.map((line, i) => (i === index ? { ...line, ...patch } : line)));

  return (
    <div className="space-y-3">
      {lines.length ? (
        <div className="space-y-2">
          {lines.map((line, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-lg border bg-muted/30 p-2 sm:grid-cols-[minmax(0,1fr)_10rem_9rem_auto]"
            >
              <Input
                aria-label={`Entry ${index + 1} name`}
                placeholder="What it was for"
                value={line.name}
                disabled={disabled}
                onChange={(e) => update(index, { name: e.target.value })}
              />
              <Input
                aria-label={`Entry ${index + 1} date`}
                type="date"
                value={line.incurred_on}
                disabled={disabled}
                onChange={(e) => update(index, { incurred_on: e.target.value })}
              />
              <Input
                aria-label={`Entry ${index + 1} amount`}
                type="number"
                inputMode="decimal"
                placeholder="Amount"
                className="text-right tabular"
                value={line.amount}
                disabled={disabled}
                onChange={(e) => update(index, { amount: e.target.value })}
              />
              {!disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove entry ${index + 1}`}
                  onClick={() => onChange(lines.filter((_, i) => i !== index))}
                >
                  <X />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          A compound expense is made of entries. Add the first one.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {!disabled ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([...lines, { name: '', incurred_on: '', amount: '' }])}
          >
            <Plus /> Add an entry
          </Button>
        ) : (
          <span />
        )}
        <p className="text-sm">
          <span className="text-muted-foreground">Entries come to</span>{' '}
          <span className={cn('font-bold tabular', over && 'text-destructive')}>
            {currency ? `${currency} ` : ''}
            {formatNumber(String(itemised), { money: true })}
          </span>
        </p>
      </div>

      {total > 0 ? (
        <p className={cn('text-xs', over ? 'font-medium text-destructive' : 'text-muted-foreground')}>
          {over
            ? `That is ${currency ? `${currency} ` : ''}${formatNumber(String(itemised - total), {
                money: true,
              })} more than the ${formatNumber(String(total), { money: true })} recorded for this expense. Raise the amount or reduce an entry.`
            : remaining > 0
              ? `${formatNumber(String(remaining), { money: true })} of the ${formatNumber(
                  String(total),
                  { money: true }
                )} recorded is not itemised yet.`
              : `Every ${currency ? `${currency} ` : ''}${formatNumber(String(total), {
                  money: true,
                })} of this expense is accounted for.`}
        </p>
      ) : null}
    </div>
  );
}
