import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import type { BoardRecord } from '@/lib/admin/boards';

/**
 * What a compound expense is made of, read beside it.
 *
 * The amount on the record is what was spent; these say what it went on. They
 * sit in the side column for the same reason a bursary's terms do: they are
 * usually why the record was opened, and putting them below means scrolling
 * past every field first.
 *
 * Shown for a compound expense even with nothing in it yet, because an empty
 * panel with a way to fill it is the whole point — otherwise there is nowhere
 * to start from.
 */
export default function RecordEntries({
  record,
  amount = 0,
  editHref,
}: {
  record: BoardRecord;
  /** The amount recorded on the expense, which these break down. */
  amount?: number;
  /** Where to go to add or change them, when this person may. */
  editHref?: string;
}) {
  const lines = record.expense_lines ?? [];
  const itemised = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const remaining = amount - itemised;

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="px-1 text-sm font-semibold tracking-tight">Entries</h2>
      <p className="mb-3 px-1 text-xs text-muted-foreground">
        {lines.length
          ? `${lines.length} ${lines.length === 1 ? 'entry' : 'entries'} making up the amount`
          : 'Nothing itemised yet'}
      </p>

      {lines.length ? (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-1 py-1.5">For</th>
            <th className="px-1 py-1.5">Date</th>
            <th className="px-1 py-1.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr key={line.id ?? index} className="border-b last:border-0">
              <td className="px-1 py-1.5 font-medium">{line.name}</td>
              <td className="px-1 py-1.5 whitespace-nowrap">
                {new Date(String(line.incurred_on)).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                })}
              </td>
              <td className="px-1 py-1.5 text-right tabular">
                {formatNumber(String(line.amount), { money: true })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="px-1 pt-2 font-semibold" colSpan={2}>
              Itemised
            </td>
            <td className="px-1 pt-2 text-right font-bold tabular">
              {formatNumber(String(itemised), { money: true })}
            </td>
          </tr>
          {amount > 0 && remaining !== 0 ? (
            <tr>
              <td className="px-1 pt-1 text-muted-foreground" colSpan={2}>
                {remaining > 0 ? 'Not itemised' : 'Over the recorded amount'}
              </td>
              <td
                className={`px-1 pt-1 text-right tabular ${
                  remaining < 0 ? 'font-semibold text-destructive' : 'text-muted-foreground'
                }`}
              >
                {formatNumber(String(Math.abs(remaining)), { money: true })}
              </td>
            </tr>
          ) : null}
        </tfoot>
      </table>
      ) : (
        <p className="px-1 text-sm text-muted-foreground">
          A compound expense is made up of entries — what each part was for, when, and how much.
        </p>
      )}

      {editHref ? (
        <div className="mt-4 px-1">
          <Button variant="outline" size="sm" asChild>
            <Link href={editHref}>
              {lines.length ? <Pencil /> : <Plus />}
              {lines.length ? 'Change entries' : 'Add entries'}
            </Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
