import Link from 'next/link';
import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import { FileText, Pencil, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClickableRow from '@/components/admin/ClickableRow';
import FilePreview from '@/components/admin/FilePreview';
import { toFileList } from '@/lib/files';
import { api, can, getIdentity, type Page } from '@/lib/admin/api';
import { displayValue, type BoardDetail, type BoardRecord } from '@/lib/admin/boards';
import { formatNumber, isMoneyLabel } from '@/lib/format';
import { cn } from '@/lib/utils';
import SiteFavicon from '@/components/admin/SiteFavicon';
import BoardFilters from '@/components/admin/BoardFilters';
import ExportMenu from '@/components/admin/ExportMenu';
import { ListCard, ListHeader } from '@/components/admin/Shell';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  try {
    const board = await api.get<BoardDetail>(`/admin/boards/${boardId}/`);
    return { title: board.name };
  } catch {
    return { title: 'Board' };
  }
}

/**
 * One column's value, as it reads in a table cell.
 *
 * Pulled out of the table so the stacked phone view below renders a value by
 * exactly the same rules. Two copies of "how a date looks" is two copies that
 * drift, and the one nobody is looking at is the one that goes wrong.
 */
function BoardValue({
  column,
  record,
}: {
  column: BoardDetail['columns'][number];
  record: BoardRecord;
}) {
  // A file column is the attachment itself, so it shows rather than printing a
  // URL nobody can read at a glance.
  if (column.column_type === 'file') {
    // One field can hold several receipts, so show them all. String() on a
    // list would have produced "a.jpg,b.jpg" and one broken thumbnail.
    const urls = toFileList(record.values?.[column.monday_id]);
    return urls.length ? (
      <div className="flex items-center gap-1">
        {urls.slice(0, 3).map((url, index) => (
          <FilePreview
            key={`${url}-${index}`}
            url={url}
            preview={record.file_previews?.[url]}
            alt={`${column.title} ${index + 1} for ${record.name}`}
          />
        ))}
        {urls.length > 3 ? (
          <span className="text-xs text-muted-foreground">+{urls.length - 3}</span>
        ) : null}
      </div>
    ) : (
      <FilePreview url="" alt={`${column.title} for ${record.name}`} />
    );
  }

  // A website shows as the site's own icon and its host. The full URL is
  // unreadable in a cell and the same for every row until the very end of it.
  if (column.column_type === 'link') {
    const url = String(record.values?.[column.monday_id] ?? '');
    let host = '';
    try {
      host = url ? new URL(url).hostname.replace(/^www\./, '') : '';
    } catch {
      host = url;
    }
    return url ? (
      <span className="flex items-center gap-2">
        <SiteFavicon url={url} name={record.name} />
        <span className="truncate">{host}</span>
      </span>
    ) : (
      <span className="text-muted-foreground">&mdash;</span>
    );
  }

  const raw = displayValue(record.values?.[column.monday_id]);
  // Dates are stored as `2026-11-30`, which is right for sorting and wrong for
  // reading. Shown the way every other table in the dashboard shows one.
  const shown =
    column.column_type === 'date' && /^\d{4}-\d{2}-\d{2}/.test(raw)
      ? new Date(`${raw.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : raw;

  if (!shown) return <span className="text-muted-foreground">&mdash;</span>;
  if (column.column_type === 'status') return <Badge variant="secondary">{shown}</Badge>;
  if (column.column_type === 'numbers') {
    return (
      <span className="tabular whitespace-nowrap">
        {formatNumber(shown, { money: isMoneyLabel(column.title) })}
      </span>
    );
  }
  return <span>{shown}</span>;
}

/** Whether a column has anything to say for this record. */
function hasValue(column: BoardDetail['columns'][number], record: BoardRecord) {
  if (column.column_type === 'file') return toFileList(record.values?.[column.monday_id]).length > 0;
  return Boolean(displayValue(record.values?.[column.monday_id]));
}

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { boardId } = await params;
  const sp = await searchParams;

  const identity = await getIdentity();
  if (!identity || !can(identity, 'boards', 'view')) notFound();

  let board: BoardDetail;
  try {
    board = await api.get<BoardDetail>(`/admin/boards/${boardId}/`);
  } catch {
    notFound();
  }

  const query = new URLSearchParams();
  if (typeof sp.search === 'string' && sp.search) query.set('search', sp.search);
  if (typeof sp.group === 'string' && sp.group) query.set('group', sp.group);
  for (const column of board.columns) {
    const key = `col.${column.monday_id}`;
    const value = sp[key];
    if (typeof value === 'string' && value) query.set(key, value);
  }

  const data = await api.get<Page<BoardRecord>>(
    `/admin/boards/${boardId}/records/?${query.toString()}`
  );

  // Long text, files and relations are opened on the record rather than
  // squeezed into a cell.
  // Pictures first: a receipt or a funder's icon is what the eye finds the
  // row by, and the six-column cap would otherwise drop it off the end on a
  // wide board.
  const listable = board.columns.filter((c) => c.show_in_list && c.monday_id !== 'name');
  const isThumb = (t: string) => t === 'file' || t === 'link';
  const columns = [
    ...listable.filter((c) => isThumb(c.column_type)),
    ...listable.filter((c) => !isThumb(c.column_type)),
  ].slice(0, 6);

  // The same filters, minus paging. A board record keeps its values in one
  // JSON column, so each column is addressed by path rather than by key.
  const exportQuery = new URLSearchParams(query);
  exportQuery.delete('page');
  exportQuery.set('title', board.name);
  exportQuery.set(
    'columns',
    [
      `name:${encodeURIComponent('Name')}`,
      ...columns.map((c) => `values.${c.monday_id}:${encodeURIComponent(c.title)}`),
    ].join(',')
  );
  const exportHref = `/api/admin/boards/${boardId}/records/export?${exportQuery.toString()}`;

  const canEdit = can(identity, 'boards', 'change');

  // Bills received live beside the expenses that settle them, so the way to
  // them is from here rather than only from the sidebar. Outstanding first:
  // the reason to open the list is almost always what is still owed.
  const showsInvoices =
    (boardId === 'expenses' || board.name.toLowerCase() === 'expenses') &&
    can(identity, 'invoices', 'view');

  return (
    <div>
      <ListCard>
      <ListHeader
        title={board.name}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {showsInvoices ? (
              <Button variant="outline" asChild>
                <Link href="/admin/invoices?settled=false">
                  <FileText /> Invoices
                </Link>
              </Button>
            ) : null}
            <ExportMenu href={exportHref} label={board.name} />
            {can(identity, 'boards', 'add') ? (
              <Button variant="accent" asChild>
                <Link href={`/admin/operations/${boardId}/new`}>
                  <Plus /> New record
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <BoardFilters board={board} />

      {/* Wide boards show three of their columns on a phone and hide the
          rest behind a scroll inside the page. Below `sm` each record is
          stacked instead — see the list after this table. */}
      <div className="mt-5 hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {columns.map((c) => (
                <TableHead
                  key={c.monday_id}
                  className={c.column_type === 'numbers' ? 'text-right' : undefined}
                >
                  {c.title}
                </TableHead>
              ))}
              {board.groups.length > 1 ? <TableHead>Group</TableHead> : null}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 3} className="py-12 text-center text-muted-foreground">
                  No records match.
                </TableCell>
              </TableRow>
            ) : (
              data.results.map((record) => (
                <ClickableRow key={record.id} href={`/admin/operations/${boardId}/${record.id}`}
                  className="group/row">
                  <TableCell className="font-medium">
                    {/* There was a badge here marking records created in the
                        dashboard rather than imported from monday. Every record
                        is now created here — nothing was ever imported — so it
                        marked every row and distinguished nothing.

                        The name carries the row's link. The row is clickable
                        anywhere, but ClickableRow needs a real anchor in it —
                        that is what a screen reader announces and what the
                        keyboard reaches. */}
                    <Link
                      href={`/admin/operations/${boardId}/${record.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {record.name}
                    </Link>
                  </TableCell>
                  {columns.map((c) => (
                    <TableCell
                      key={c.monday_id}
                      className={cn(
                        c.column_type === 'numbers' && 'text-right',
                        c.column_type === 'file' && 'pr-0'
                      )}
                    >
                      <BoardValue column={c} record={record} />
                    </TableCell>
                  ))}                  {board.groups.length > 1 ? (
                    <TableCell className="text-muted-foreground">{record.group_title}</TableCell>
                  ) : null}
                  <TableCell className="w-px whitespace-nowrap text-right">
                    <span className="flex items-center justify-end gap-3">
                      {/* Revealed on hover, and on keyboard focus — a control
                          that only appears under a pointer cannot be reached by
                          anyone navigating with a keyboard. */}
                      {canEdit ? (
                        <Link
                          href={`/admin/operations/${boardId}/${record.id}/edit`}
                          aria-label={`Edit ${record.name}`}
                          title="Edit"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/row:opacity-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      ) : null}
                    </span>
                  </TableCell>
                </ClickableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ul className="mt-5 space-y-3 sm:hidden">
        {data.results.length === 0 ? (
          <li className="py-12 text-center text-muted-foreground">No records match.</li>
        ) : (
          data.results.map((record) => (
            <li key={record.id} className="rounded-2xl border border-border/40 bg-card p-3.5">
              <div className="flex items-start gap-3">
                <Link
                  href={`/admin/operations/${boardId}/${record.id}`}
                  className="min-w-0 flex-1 font-semibold underline-offset-4 hover:underline"
                >
                  {record.name}
                </Link>
                {canEdit ? (
                  <Link
                    href={`/admin/operations/${boardId}/${record.id}/edit`}
                    aria-label={`Edit ${record.name}`}
                    title="Edit"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>

              {/* Only the columns this record has filled in. A stack of a
                  dozen em-dashes is longer to read past than the row it
                  replaced and says nothing. */}
              <dl className="mt-2.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm">
                {columns
                  .filter((c) => hasValue(c, record))
                  .map((c) => (
                    <Fragment key={c.monday_id}>
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                        {c.title}
                      </dt>
                      <dd className="min-w-0">
                        <BoardValue column={c} record={record} />
                      </dd>
                    </Fragment>
                  ))}
                {board.groups.length > 1 && record.group_title ? (
                  <Fragment>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Group</dt>
                    <dd className="min-w-0">{record.group_title}</dd>
                  </Fragment>
                ) : null}
              </dl>
            </li>
          ))
        )}
      </ul>

      <p className="pt-4 text-sm text-muted-foreground">
        {data.count === 0
          ? 'No records yet'
          : `Showing ${data.results.length} of ${data.count} ${data.count === 1 ? 'record' : 'records'}`}
      </p>
      </ListCard>
    </div>
  );
}
