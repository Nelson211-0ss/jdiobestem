import { notFound } from 'next/navigation';

import RecordForm from '@/components/admin/RecordForm';
import { FormShell } from '@/components/admin/Shell';
import { api, can, getIdentity, getOptionLists } from '@/lib/admin/api';
import type { BoardDetail } from '@/lib/admin/boards';

export const dynamic = 'force-dynamic';

export default async function NewRecordPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const [identity, options] = await Promise.all([getIdentity(), getOptionLists()]);
  if (!identity || !can(identity, 'boards', 'add')) notFound();

  let board: BoardDetail;
  try {
    board = await api.get<BoardDetail>(`/admin/boards/${boardId}/`);
  } catch {
    notFound();
  }

  return (
    <FormShell
      backHref={`/admin/boards/${boardId}`}
      backLabel={`Back to ${board.name.toLowerCase()}`}
      eyebrow="New record"
      title={board.name}
    >
      <RecordForm board={board} record={null} options={options} canChange canDelete={false} />
    </FormShell>
  );
}
