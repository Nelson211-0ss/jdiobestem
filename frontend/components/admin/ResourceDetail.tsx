import { Badge } from '@/components/ui/badge';
import type { Resource } from '@/lib/admin/resources';
import { formatNumber, isMoneyLabel, toNumber } from '@/lib/format';
import { DetailRow, DetailSection } from './Shell';

/**
 * A record shown as a record, not as a form nobody may submit.
 *
 * Some resources are read by people and written only by the application — the
 * activity log above all. Rendering those through the edit form leaves a page
 * of greyed-out inputs and a Save button that does nothing, which reads as
 * "you lack permission" rather than "this is not a thing anyone edits". This
 * is the same label-and-value layout used elsewhere for detail, so a record
 * that cannot change simply looks like a record.
 */

function formatValue(value: unknown, label = ''): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="font-normal text-muted-foreground">&mdash;</span>;
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';

  const text = String(value);
  // ISO timestamps read badly raw; everything else is left exactly as stored.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) {
    const d = new Date(text);
    return (
      <span className="tabular">
        {d.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    );
  }
  // A figure reads as a figure: grouped. Only where grouping is meaningful,
  // though — a phone number, a reference or a year is a string of digits that
  // separators actively damage, so those are named and left alone.
  const neverGrouped = /\b(phone|mobile|tel|id|code|year|reference|ref|zip|postcode|version|token|account|stripe|intent|session)\b/i;
  const counted = /\b(count|quantity|headcount|enrol(?:l)?ment|beneficiaries|attendees|students|members|places)\b/i;
  const groupable = !neverGrouped.test(label) && (isMoneyLabel(label) || counted.test(label));

  if (groupable && toNumber(text) !== null && /^[-+]?[\d.,]+$/.test(text)) {
    return <span className="tabular">{formatNumber(text, { money: isMoneyLabel(label) })}</span>;
  }
  return <span className="whitespace-pre-wrap">{text}</span>;
}

/**
 * The before-and-after of one action.
 *
 * This is the part of an audit entry anyone actually came to read, so it gets
 * a table of its own rather than being flattened into a line of JSON.
 */
function Changes({ changes }: { changes: Record<string, unknown> }) {
  const entries = Object.entries(changes);
  if (!entries.length) return null;

  const isDiff = entries.some(
    ([, v]) => v && typeof v === 'object' && 'to' in (v as Record<string, unknown>),
  );

  return (
    <DetailSection title="What changed">
      <div className="overflow-x-auto rounded-2xl bg-muted/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">Field</th>
              {isDiff ? <th className="px-4 py-2.5 font-medium">Was</th> : null}
              <th className="px-4 py-2.5 font-medium">{isDiff ? 'Became' : 'Value'}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([field, value]) => {
              const pair = value as { from?: unknown; to?: unknown } | null;
              const isPair = pair && typeof pair === 'object' && 'to' in pair;
              return (
                <tr key={field} className="align-top">
                  <td className="px-4 py-2.5 font-medium">{field}</td>
                  {isDiff ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {isPair ? formatValue(pair!.from) : <span>&mdash;</span>}
                    </td>
                  ) : null}
                  <td className="px-4 py-2.5 font-semibold">
                    {formatValue(isPair ? pair!.to : value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </DetailSection>
  );
}

export default function ResourceDetail({
  resource,
  record,
}: {
  resource: Resource;
  record: Record<string, unknown>;
}) {
  const changes = record.changes;
  const hasChanges =
    changes && typeof changes === 'object' && Object.keys(changes as object).length > 0;

  return (
    <div className="space-y-8">
      <DetailSection>
        {resource.fields
          .filter((f) => f.name !== 'changes' && f.name !== 'change_summary')
          .map((field) => (
            <DetailRow key={field.name} label={field.label}>
              {field.name === 'action_display' && record[field.name] ? (
                <Badge variant="secondary">{String(record[field.name])}</Badge>
              ) : (
                formatValue(record[field.name], field.label)
              )}
            </DetailRow>
          ))}
      </DetailSection>

      {hasChanges ? <Changes changes={changes as Record<string, unknown>} /> : null}
    </div>
  );
}
