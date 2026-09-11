'use client';

import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNumber } from '@/lib/format';

/**
 * The entries a compound expense is made of.
 *
 * A trip is a fare, a night's lodging and a meal, each on its own day. Entered
 * as one figure it can only answer how much; entered as lines it answers what
 * on and when.
 *
 * There is deliberately no total to type. The figure below is the sum of the
 * rows and is read-only here and on the record — a total somebody can edit
 * independently of the lines beneath it starts disagreeing with them.
 */

export type ExpenseLine = { name: string; incurred_on: string; amount: string };

export function linesTotal(lines: ExpenseLine[]): number {
  return lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
}

export default function ExpenseLines({
  lines,
  currency,
  disabled,
  onChange,
}: {
  lines: ExpenseLine[];
  currency?: string;
  disabled?: boolean;
  onChange: (lines: ExpenseLine[]) => void;
}) {
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
          <span className="text-muted-foreground">Total</span>{' '}
          <span className="font-bold tabular">
            {currency ? `${currency} ` : ''}
            {formatNumber(String(linesTotal(lines)), { money: true })}
          </span>
        </p>
      </div>
    </div>
  );
}
