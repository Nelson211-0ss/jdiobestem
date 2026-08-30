import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ClickableRow from '@/components/admin/ClickableRow';
import FilePreview from '@/components/admin/FilePreview';
import { api, can, getIdentity, type Page } from '@/lib/admin/api';
import { displayValue, type BoardDetail, type BoardRecord } from '@/lib/admin/boards';
import { formatNumber, isMoneyLabel } from '@/lib/format';
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
  // File columns come first: a receipt is the reason the row exists, and the
  // six-column cap would otherwise drop it off the end on a wide board.
  const listable = board.columns.filter((c) => c.show_in_list && c.monday_id !== 'name');
  const columns = [
    ...listable.filter((c) => c.column_type === 'file'),
    ...listable.filter((c) => c.column_type !== 'file'),
  ].slice(0, 6);

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
                <ClickableRow key={record.id} href={`/admin/operations/${boardId}/${record.id}`}>
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
                    const shown = displayValue(record.values?.[c.monday_id]);
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
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/operations/${boardId}/${record.id}`}
                      className="text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
                    >
                      Open
                    </Link>
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
