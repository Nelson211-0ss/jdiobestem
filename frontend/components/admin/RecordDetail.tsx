import { Badge } from '@/components/ui/badge';
import { displayValue, inputFor, type BoardDetail, type BoardRecord } from '@/lib/admin/boards';
import { formatNumber, isMoneyLabel } from '@/lib/format';
import FilePreview from './FilePreview';
import { DetailTable, DetailTableRow } from './Shell';

/**
 * One board record, shown rather than edited.
 *
 * Opening a row used to put a form in front of whoever clicked it, which meant
 * reading a record and changing one were the same act. This is the reading
 * half: every column the board still carries, in its own order, formatted the
 * way the table formats it so the two agree.
 */

function Value({ column, record }: { column: BoardDetail['columns'][number]; record: BoardRecord }) {
  const raw = record.values?.[column.monday_id];
  const text = displayValue(raw);

  if (column.column_type === 'file') {
    const url = String(raw ?? '');
    return url ? (
      <FilePreview url={url} alt={`${column.title} for ${record.name}`} />
    ) : (
      <span className="font-normal text-muted-foreground">&mdash;</span>
    );
  }

  if (!text) return <span className="font-normal text-muted-foreground">&mdash;</span>;

  if (column.column_type === 'status' || column.column_type === 'dropdown') {
    return <Badge variant="secondary">{text}</Badge>;
  }

  if (column.column_type === 'numbers') {
    return (
      <span className="tabular">{formatNumber(text, { money: isMoneyLabel(column.title) })}</span>
    );
  }

  if (column.column_type === 'date' && /^\d{4}-\d{2}-\d{2}/.test(text)) {
    return (
      <span className="tabular">
        {new Date(`${text.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        })}
      </span>
    );
  }

  if (column.column_type === 'link') {
    return (
      <a
        href={text}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {text}
      </a>
    );
  }

  if (column.column_type === 'email') {
    return <a href={`mailto:${text}`} className="underline underline-offset-2">{text}</a>;
  }

  if (column.column_type === 'phone') {
    return <a href={`tel:${text}`} className="underline underline-offset-2">{text}</a>;
  }

  return <span className="whitespace-pre-wrap">{text}</span>;
}

export default function RecordDetail({
  board,
  record,
}: {
  board: BoardDetail;
  record: BoardRecord;
}) {
  // The name is already the page's title, and a column with no editing path is
  // a monday leftover that says nothing to anyone reading this.
  const columns = board.columns.filter(
    (c) => c.monday_id !== 'name' && inputFor(c) !== 'readonly'
  );

  return (
    <DetailTable>
      {columns.map((column) => (
        <DetailTableRow key={column.monday_id} label={column.title}>
          <Value column={column} record={record} />
        </DetailTableRow>
      ))}

      {board.groups.length > 1 ? (
        <DetailTableRow label="Group">
          {record.group_title || <span className="font-normal text-muted-foreground">&mdash;</span>}
        </DetailTableRow>
      ) : null}

      <DetailTableRow label="Country">
        {record.office_name
          ? `${record.country || 'Global'} · ${record.office_name}`
          : record.country || 'Global'}
      </DetailTableRow>

      {record.created_by_name ? (
        <DetailTableRow label="Added by">{record.created_by_name}</DetailTableRow>
      ) : null}
    </DetailTable>
  );
}
