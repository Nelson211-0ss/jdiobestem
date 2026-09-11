import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, can, type Identity, type Page } from '@/lib/admin/api';
import { RESOURCE_BY_KEY, type Column, type Related } from '@/lib/admin/resources';

/**
 * What hangs off a record, listed beneath it.
 *
 * A bursary on its own is a commitment; with its terms and the money sent under
 * it, it is something somebody can act on. The same holds for a school and its
 * students, or a project and its awards — so this is one component driven by
 * each resource's `related` declaration rather than a hand-built panel per page.
 *
 * The rows come from the related resource's own list endpoint, so this person's
 * role and country scope apply here exactly as they do on that resource's page:
 * there is no second way in to keep in step.
 */

/** A column beside the record, not a page of its own: enough rows to show
 *  what is there, with a link to the full list when there is more. */
const PREVIEW = 6;
const COLUMNS = 3;

function cell(row: Record<string, unknown>, column: Column) {
  // The readable form first, as on a detail page: `_display` for a choices
  // field, `_name` for a link.
  for (const key of [`${column.name}_display`, `${column.name}_name`]) {
    const readable = row[key];
    if (readable !== undefined && readable !== null && readable !== '') return String(readable);
  }
  const raw = row[column.name];
  if (raw === null || raw === undefined || raw === '') return '—';
  if (typeof raw === 'boolean') return raw ? 'Yes' : 'No';
  const text = String(raw);
  if (column.date && /^\d{4}-\d{2}-\d{2}/.test(text)) {
    return new Date(text).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return text;
}

export default async function RelatedRecords({
  spec,
  id,
  identity,
}: {
  spec: Related;
  id: string;
  identity: Identity;
}) {
  const target = RESOURCE_BY_KEY[spec.resource];
  // Silent when the person may not see it: a heading over an empty box reads as
  // "there are none", which is a different and wrong answer.
  if (!target || !can(identity, spec.resource, 'view')) return null;

  const query = new URLSearchParams({ [spec.by]: id });
  let page: Page<Record<string, unknown>>;
  try {
    page = await api.get<Page<Record<string, unknown>>>(
      `/admin/${spec.resource}/?${query.toString()}`
    );
  } catch {
    return null;
  }

  const columns = (
    spec.columns
      ? target.columns.filter((c) => spec.columns!.includes(c.name))
      : target.columns.filter((c) => !c.thumb)
  ).slice(0, COLUMNS);

  const rows = page.results.slice(0, PREVIEW);
  const listHref = `/admin/${spec.resource}?${query.toString()}`;

  return (
    <section className="rounded-3xl bg-card p-5 shadow-sm">
      <h2 className="px-1 text-sm font-semibold tracking-tight">{spec.label ?? target.label}</h2>
      <p className="mb-3 px-1 text-xs text-muted-foreground">
        {page.count} {page.count === 1 ? target.singular : target.label.toLowerCase()}
      </p>
      {rows.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                {columns.map((c) => (
                  <th key={c.name} className={`px-1 py-1.5 ${c.numeric ? 'text-right' : ''}`}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-b last:border-0 hover:bg-muted/50">
                  {columns.map((c, index) => (
                    <td
                      key={c.name}
                      className={`px-1 py-1.5 ${c.numeric ? 'text-right tabular' : ''}`}
                    >
                      {index === 0 ? (
                        <Link
                          href={`/admin/${spec.resource}/${row.id}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {cell(row, c)}
                        </Link>
                      ) : c.badge ? (
                        <Badge variant="secondary">{cell(row, c)}</Badge>
                      ) : (
                        cell(row, c)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-1 py-2 text-sm text-muted-foreground">
          No {target.label.toLowerCase()} yet.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
        {page.count > rows.length ? (
          <Link href={listHref} className="text-sm font-medium underline underline-offset-2">
            View all {page.count}
          </Link>
        ) : null}
        {!target.noCreate && can(identity, spec.resource, 'add') ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/${spec.resource}/new`}>
              <Plus /> New {target.singular}
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
