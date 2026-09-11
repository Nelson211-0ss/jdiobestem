import { notFound } from 'next/navigation';

import Link from 'next/link';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ExportMenu from '@/components/admin/ExportMenu';
import RecordDetail from '@/components/admin/RecordDetail';
import RecordEntries from '@/components/admin/RecordEntries';
import RelatedRecords from '@/components/admin/RelatedRecords';
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

  // The entries panel belongs to a compound expense whether or not anything
  // has been put in it yet — an empty one with a way in is the point.
  const typeColumn = board.columns.find((c) => c.title === 'Expense type');
  const amountColumn = board.columns.find((c) => c.title === 'Amount');
  const typeLabel = typeColumn
    ? (typeColumn.choices.find(
        (o) => o.value === String(record.values?.[typeColumn.monday_id] ?? '')
      )?.label ?? '')
    : '';
  const isCompound = typeLabel.trim().toLowerCase() === 'compound';
  const recordedAmount = amountColumn
    ? Number(record.values?.[amountColumn.monday_id] ?? 0) || 0
    : 0;

  const editable = can(identity, 'boards', 'change');

  // The bills this expense settled, read beside it. Only on the expenses page:
  // an invoice is a thing a payment answers, and no other page records one.
  const showsInvoices = boardId === 'expenses' || board.name.toLowerCase() === 'expenses';

  return (
    <FormShell
      backHref={`/admin/operations/${boardId}`}
      backLabel={`Back to ${board.name.toLowerCase()}`}
      eyebrow={board.name}
      title={record.name}
      // A compound expense is its entries, so they are read beside the
      // record rather than after it.
      aside={
        isCompound || record.expense_lines?.length || showsInvoices ? (
          <>
            {isCompound || record.expense_lines?.length ? (
              <RecordEntries
                record={record}
                amount={recordedAmount}
                editHref={editable ? `/admin/operations/${boardId}/${recordId}/edit` : undefined}
              />
            ) : null}
            {showsInvoices ? (
              <RelatedRecords
                spec={{
                  resource: 'invoices',
                  by: 'expense',
                  label: 'Invoices this settled',
                  columns: ['supplier', 'number', 'amount'],
                }}
                id={String(record.id)}
                identity={identity}
              />
            ) : null}
          </>
        ) : null
      }
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
