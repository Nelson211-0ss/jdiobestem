import { notFound } from 'next/navigation';

import RecordForm from '@/components/admin/RecordForm';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import type { BoardDetail, BoardRecord } from '@/lib/admin/boards';

export const dynamic = 'force-dynamic';

export default async function RecordPage({
  params,
}: {
  params: Promise<{ boardId: string; recordId: string }>;
}) {
  const { boardId, recordId } = await params;
  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
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

  if (!can(identity, 'boards', 'change')) notFound();

  return (
    <FormShell
      backHref={`/admin/operations/${boardId}/${recordId}`}
      backLabel={`Back to ${record.name}`}
      eyebrow={`Editing · ${board.name}`}
      title={record.name}
    >
      <RecordForm
        board={board}
        options={options}
        record={record}
        canChange
        canDelete={can(identity, 'boards', 'delete')}
      />
    </FormShell>
  );
}
