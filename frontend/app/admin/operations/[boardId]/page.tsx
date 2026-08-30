import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClickableRow from '@/components/admin/ClickableRow';
import FilePreview from '@/components/admin/FilePreview';
import { api, can, getIdentity, type Page } from '@/lib/admin/api';
import { displayValue, type BoardDetail, type BoardRecord } from '@/lib/admin/boards';
import { formatNumber, isMoneyLabel } from '@/lib/format';
import SiteFavicon from '@/components/admin/SiteFavicon';
import BoardFilters from '@/components/admin/BoardFilters';
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

  const canEdit = can(identity, 'boards', 'change');

  return (
    <div>
      <ListCard>
      <ListHeader
        title={board.name}
        subtitle={board.description}
        actions={
          can(identity, 'boards', 'add') ? (
            <Button variant="accent" asChild>
              <Link href={`/admin/operations/${boardId}/new`}>
                <Plus /> New record
              </Link>
            </Button>
          ) : null
        }
      />

      <BoardFilters board={board} />

      <div className="mt-5">
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
                        marked every row and distinguished nothing. */}
                    {record.name}
                  </TableCell>
                  {columns.map((c) => {
                    // A file column is the attachment itself, so the cell shows
                    // it rather than a URL nobody can read at a glance.
                    if (c.column_type === 'file') {
                      const url = String(record.values?.[c.monday_id] ?? '');
                      return (
                        <TableCell key={c.monday_id} className="w-14 pr-0">
                          <FilePreview url={url} alt={`${c.title} for ${record.name}`} />
                        </TableCell>
                      );
                    }
                    // A website shows as the site's own icon and its host.
                    // The full URL is unreadable in a cell and the same for
                    // every row until the very end of it.
                    if (c.column_type === 'link') {
                      const url = String(record.values?.[c.monday_id] ?? '');
                      let host = '';
                      try {
                        host = url ? new URL(url).hostname.replace(/^www\./, '') : '';
                      } catch {
                        host = url;
                      }
                      return (
                        <TableCell key={c.monday_id}>
                          {url ? (
                            <span className="flex items-center gap-2">
                              <SiteFavicon url={url} name={record.name} />
                              <span className="truncate">{host}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">&mdash;</span>
                          )}
                        </TableCell>
                      );
                    }
                    const raw = displayValue(record.values?.[c.monday_id]);
                    // Dates are stored as `2026-11-30`, which is right for
                    // sorting and wrong for reading. Shown the way every other
                    // table in the dashboard shows one.
                    const shown =
                      c.column_type === 'date' && /^\d{4}-\d{2}-\d{2}/.test(raw)
                        ? new Date(`${raw.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'UTC',
                          })
                        : raw;
                    const isStatus = c.column_type === 'status';
                    return (
                      <TableCell
                        key={c.monday_id}
                        className={c.column_type === 'numbers' ? 'text-right' : undefined}
                      >
                        {shown ? (
                          isStatus ? (
                            <Badge variant="secondary">{shown}</Badge>
                          ) : (
                            <span
                              className={
                                c.column_type === 'numbers'
                                  ? 'tabular whitespace-nowrap'
                                  : undefined
                              }
                            >
                              {c.column_type === 'numbers'
                                ? formatNumber(shown, { money: isMoneyLabel(c.title) })
                                : shown}
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">&mdash;</span>
                        )}
                      </TableCell>
                    );
                  })}
                  {board.groups.length > 1 ? (
                    <TableCell className="text-muted-foreground">{record.group_title}</TableCell>
                  ) : null}
                  <TableCell className="w-px whitespace-nowrap text-right">
                    <span className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/operations/${boardId}/${record.id}`}
                        className="text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
                      >
                        Open
                      </Link>
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

      <p className="pt-4 text-sm text-muted-foreground">
        {data.count === 0
          ? 'No records yet'
          : `Showing ${data.results.length} of ${data.count} ${data.count === 1 ? 'record' : 'records'}`}
      </p>
      </ListCard>
    </div>
  );
}
