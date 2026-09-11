import { notFound } from 'next/navigation';

import Link from 'next/link';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ExportMenu from '@/components/admin/ExportMenu';
import RecordDetail from '@/components/admin/RecordDetail';
import RecordEntries from '@/components/admin/RecordEntries';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity } from '@/lib/admin/api';
import type { BoardDetail, BoardRecord } from '@/lib/admin/boards';

export const dynamic = 'force-dynamic';

export default async function RecordPage({
  params,
}: {
  params: Promise<{ boardId: string; recordId: string }>;
}) {
  const { boardId, recordId } = await params;
  const identity = await getIdentity();
  if (!identity || !can(identity, 'boards', 'view')) notFound();

  let board: BoardDetail;
  let record: BoardRecord;
  try {
    [board, record] = await Promise.all([
      api.get<BoardDetail>(`/admin/boards/${boardId}/`),
      api.get<BoardRecord>(`/admin/boards/${boardId}/records/${recordId}/`),
    ]);
  } catch {
    notFound();
  }

  // This one record as a document. A board record keeps its columns in one
  // JSON blob, so each is addressed by path rather than by key.
  const exportHref =
    `/api/admin/boards/${boardId}/records/${recordId}/export` +
    `?title=${encodeURIComponent(board.name)}` +
    `&fields=${[
      `name:${encodeURIComponent('Name')}`,
      ...board.columns
        // The board's own Name column holds the same value as the record's
        // name, which was listing it twice.
        .filter((c) => c.column_type !== 'subtasks' && c.monday_id !== 'name')
        .map((c) => `values.${c.monday_id}:${encodeURIComponent(c.title)}`),
    ].join(',')}`;

  const editable = can(identity, 'boards', 'change');

  return (
    <FormShell
      backHref={`/admin/operations/${boardId}`}
      backLabel={`Back to ${board.name.toLowerCase()}`}
      eyebrow={board.name}
      title={record.name}
      // A compound expense is its entries, so they are read beside the
      // record rather than after it.
      aside={record.expense_lines?.length ? <RecordEntries record={record} /> : null}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <ExportMenu href={exportHref} label={record.name} />
          {editable ? (
            <Button variant="outline" asChild>
              <Link href={`/admin/operations/${boardId}/${recordId}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
          ) : null}
        </div>
      }
    >
      <RecordDetail board={board} record={record} />
    </FormShell>
  );
}
