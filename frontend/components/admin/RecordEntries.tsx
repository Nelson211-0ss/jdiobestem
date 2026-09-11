import { formatNumber } from '@/lib/format';
import type { BoardRecord } from '@/lib/admin/boards';

/**
 * What a compound expense is made of, read beside it.
 *
 * The amount on the record is the sum of these and nothing else, so the lines
 * are not supporting detail — they are the expense. They sit in the side column
 * for the same reason a bursary's terms do: they are usually why the record was
 * opened, and putting them below means scrolling past every field first.
 */
export default function RecordEntries({ record }: { record: BoardRecord }) {
  const lines = record.expense_lines ?? [];
  if (!lines.length) return null;

  const total = lines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="px-1 text-sm font-semibold tracking-tight">Entries</h2>
      <p className="mb-3 px-1 text-xs text-muted-foreground">
        {lines.length} {lines.length === 1 ? 'entry' : 'entries'} making up the amount
      </p>

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
              Total
            </td>
            <td className="px-1 pt-2 text-right font-bold tabular">
              {formatNumber(String(total), { money: true })}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
