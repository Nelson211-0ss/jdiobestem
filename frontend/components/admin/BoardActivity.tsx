import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, can, type Identity, type Page } from '@/lib/admin/api';
import { displayValue, type BoardDetail, type BoardRecord } from '@/lib/admin/boards';
import { formatNumber, isMoneyLabel } from '@/lib/format';

/**
 * What has actually been done under a programme, read on the programme.
 *
 * The Community Outreach page and the Community STEM Outreach programme were
 * two screens describing one thing — the programme said what it is, the page
 * held the work — and nothing linked them, so "how is this going" meant knowing
 * which of the forty-odd pages to open. The programme names its page; this
 * reads it.
 *
 * Fetched through the boards endpoint, so this person's role and country scope
 * apply here exactly as they do on the page itself.
 */

/** Enough rows to show what is there, with a way through to the rest. */
const PREVIEW = 6;
const COLUMNS = 3;

export default async function BoardActivity({
  slug,
  identity,
}: {
  slug: string;
  identity: Identity;
}) {
  if (!slug || !can(identity, 'boards', 'view')) return null;

  let board: BoardDetail;
  let page: Page<BoardRecord>;
  try {
    [board, page] = await Promise.all([
      api.get<BoardDetail>(`/admin/boards/${slug}/`),
      api.get<Page<BoardRecord>>(`/admin/boards/${slug}/records/`),
    ]);
  } catch {
    // A programme pointing at a page that has been renamed should not take the
    // programme down with it.
    return null;
  }

  const columns = board.columns
    .filter((c) => c.show_in_list && c.monday_id !== 'name' && c.column_type !== 'subtasks')
    .slice(0, COLUMNS);
  const rows = page.results.slice(0, PREVIEW);
  const href = `/admin/operations/${slug}`;

  return (
    <section className="rounded-2xl border border-border/40 bg-card p-5">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 px-1">
        <h2 className="text-sm font-semibold tracking-tight">{board.name}</h2>
        <p className="text-xs text-muted-foreground">
          {page.count} {page.count === 1 ? 'record' : 'records'} under this programme
        </p>
      </div>

      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-1 py-1.5">Name</th>
                {columns.map((c) => (
                  <th
                    key={c.monday_id}
                    className={`px-1 py-1.5 ${c.column_type === 'numbers' ? 'text-right' : ''}`}
                  >
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((record) => (
                <tr key={record.id} className="hover:bg-muted/60">
                  <td className="px-1 py-1.5">
                    <Link
                      href={`${href}/${record.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {record.name}
                    </Link>
                  </td>
                  {columns.map((c) => {
                    const shown = displayValue(record.values?.[c.monday_id]);
                    return (
                      <td
                        key={c.monday_id}
                        className={`px-1 py-1.5 ${c.column_type === 'numbers' ? 'text-right tabular' : ''}`}
                      >
                        {!shown ? (
                          <span className="text-muted-foreground">&mdash;</span>
                        ) : c.column_type === 'status' || c.column_type === 'dropdown' ? (
                          <Badge variant="secondary">{shown}</Badge>
                        ) : c.column_type === 'numbers' ? (
                          formatNumber(shown, { money: isMoneyLabel(c.title) })
                        ) : (
                          shown
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-1 py-2 text-sm text-muted-foreground">Nothing recorded yet.</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
        {page.count > rows.length ? (
          <Link href={href} className="text-sm font-medium underline underline-offset-2">
            View all {page.count}
          </Link>
        ) : null}
        {can(identity, 'boards', 'add') ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`${href}/new`}>
              <Plus /> New record
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
