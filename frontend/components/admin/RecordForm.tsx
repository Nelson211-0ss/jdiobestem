'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FileText, Loader2, Save, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { displayValue, inputFor, type BoardDetail, type BoardRecord } from '@/lib/admin/boards';
import { DetailRow, DetailSection } from './Shell';
import UploadField from './UploadField';

/**
 * Edit one record on any board.
 *
 * The fields are built from the board's own column definitions, so a board
 * nobody anticipated still gets a usable form, and a column added later appears
 * without a code change.
 */
/**
 * What was attached, at a glance.
 *
 * A receipt is usually a photograph, so it shows as one. A PDF has no
 * thumbnail without rendering it, and this is a board value rather than a
 * model field with somewhere to keep a rendered page — so it gets a labelled
 * chip, which still answers "is the receipt attached?".
 */
function FilePreview({ url }: { url: string }) {
  const isImage = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(url);
  if (isImage) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        className="h-24 w-24 rounded-md object-cover"
      />
    );
  }
  const extension = url.split('?')[0].split('.').pop()?.slice(0, 4).toUpperCase() ?? 'FILE';
  return (
    <span className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md bg-muted">
      <FileText className="h-6 w-6 text-muted-foreground" />
      <span className="text-[0.625rem] font-semibold tracking-wide text-muted-foreground">
        {extension}
      </span>
    </span>
  );
}

export default function RecordForm({
  board,
  record,
  options,
  canChange,
  canDelete,
}: {
  board: BoardDetail;
  record: BoardRecord | null;
  options: {
    countries: { value: string; label: string }[];
    offices: { value: string; label: string; country: string }[];
  };
  canChange: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const isNew = record === null;

  const [name, setName] = useState(record?.name ?? '');
  const [groupId, setGroupId] = useState(record?.group_id ?? board.groups[0]?.monday_id ?? '');
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const column of board.columns) {
      if (column.monday_id === 'name') continue;
      initial[column.monday_id] = record?.values?.[column.monday_id] ?? '';
    }
    return initial;
  });
  const [country, setCountry] = useState(record?.country ?? 'GL');
  const [office, setOffice] = useState(record?.office ? String(record.office) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Offices belong to a country, so the list follows the country above it. A
  // Global record has no single office, so the picker stands down.
  const officeChoices = options.offices.filter((o) => o.country === country);

  const editable = board.columns.filter(
    (c) => c.monday_id !== 'name' && inputFor(c) !== 'readonly'
  );
  const readOnly = board.columns.filter(
    (c) => c.monday_id !== 'name' && inputFor(c) === 'readonly'
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name,
      group_id: groupId,
      country,
      office: office ? Number(office) : null,
      values: Object.fromEntries(
        editable.map((c) => {
          const raw = values[c.monday_id];
          // Preserve the structured shape the import produced for anything we
          // are not editing here.
          return [c.monday_id, inputFor(c) === 'number' && raw === '' ? null : raw];
        })
      ),
    };

    const base = `/api/admin/operations/${board.monday_id}/records`;
    const res = await fetch(isNew ? base : `${base}/${record!.id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(String(body?.error || body?.detail || 'Could not save.'));
      return;
    }
    router.push(`/admin/operations/${board.monday_id}`);
    router.refresh();
  };

  const remove = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/operations/${board.monday_id}/records/${record!.id}`, {
      method: 'DELETE',
    });
    setSaving(false);
    if (res.ok) {
      router.push(`/admin/operations/${board.monday_id}`);
      router.refresh();
    } else {
      setError('Could not delete that.');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="record-name">
            Name<span className="text-accent-foreground"> *</span>
          </Label>
          <Input
            id="record-name"
            className="h-12"
            required
            value={name}
            disabled={!canChange}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="record-country">Country</Label>
          <Select
            value={country}
            disabled={!canChange}
            onValueChange={(v) => {
              setCountry(v);
              // An office from the previous country would now be wrong.
              setOffice('');
            }}
          >
            <SelectTrigger id="record-country" className="h-12">
              <SelectValue placeholder="Choose a country" />
            </SelectTrigger>
            <SelectContent>
              {options.countries.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="record-office">Office</Label>
          <Select
            value={office || '__none__'}
            disabled={!canChange || officeChoices.length === 0}
            onValueChange={(v) => setOffice(v === '__none__' ? '' : v)}
          >
            <SelectTrigger id="record-office" className="h-12">
              <SelectValue placeholder="No office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No office</SelectItem>
              {officeChoices.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {officeChoices.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {country === 'GL'
                ? 'A Global record is not tied to one office.'
                : 'No offices recorded for this country yet.'}
            </p>
          ) : null}
        </div>

        {board.groups.length > 1 ? (
          <div className="space-y-2">
            <Label htmlFor="record-group">Group</Label>
            <Select value={groupId} onValueChange={setGroupId} disabled={!canChange}>
              <SelectTrigger id="record-group" className="h-12">
                <SelectValue placeholder="Choose a group" />
              </SelectTrigger>
              <SelectContent>
                {board.groups.map((g) => (
                  <SelectItem key={g.monday_id} value={g.monday_id}>
                    {g.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {editable.map((column) => {
          const kind = inputFor(column);
          const id = `c-${column.monday_id}`;
          const value = values[column.monday_id];
          const set = (v: unknown) => setValues((prev) => ({ ...prev, [column.monday_id]: v }));

          if (kind === 'checkbox') {
            return (
              <label key={column.monday_id} className="flex items-center gap-2 text-sm font-medium" htmlFor={id}>
                <Checkbox id={id} checked={Boolean(value)} disabled={!canChange} onCheckedChange={(c) => set(c === true)} />
                {column.title}
              </label>
            );
          }

          return (
            <div key={column.monday_id} className={`space-y-2 ${kind === 'textarea' ? 'sm:col-span-2' : ''}`}>
              <Label htmlFor={id}>{column.title}</Label>

              {kind === 'file' ? (
                <div className="space-y-3">
                  <UploadField
                    id={id}
                    value={String(value ?? '')}
                    folder="receipts"
                    disabled={!canChange}
                    onChange={(v) => set(v)}
                  />
                  {String(value ?? '') ? (
                    <a
                      href={String(value)}
                      target="_blank"
                      rel="noopener"
                      className="inline-block"
                    >
                      <FilePreview url={String(value)} />
                    </a>
                  ) : null}
                </div>
              ) : kind === 'select' ? (
                <Select
                  value={String(value ?? '')}
                  disabled={!canChange}
                  onValueChange={(v) => set(v === '__blank__' ? '' : v)}
                >
                  <SelectTrigger id={id} className="h-12">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__blank__">—</SelectItem>
                    {column.choices.map((c) => (
                      // Values are stored as the label, which is what the import
                      // produced and what reads correctly everywhere else.
                      <SelectItem key={c.value} value={c.label}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : kind === 'textarea' ? (
                <Textarea id={id} rows={5} value={String(value ?? '')} disabled={!canChange} onChange={(e) => set(e.target.value)} />
              ) : (
                <Input
                  id={id}
                  className="h-12"
                  type={kind === 'number' ? 'number' : kind === 'date' ? 'date' : 'text'}
                  value={String(value ?? '')}
                  disabled={!canChange}
                  onChange={(e) => set(kind === 'number' ? e.target.value : e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      {readOnly.length ? (
        <div className="border-t pt-6">
          <DetailSection title="Not editable here">
            {readOnly.map((column) => (
              <DetailRow key={column.monday_id} label={column.title}>
                {displayValue(record?.values?.[column.monday_id]) || (
                  <span className="font-normal text-muted-foreground">&mdash;</span>
                )}
              </DetailRow>
            ))}
          </DetailSection>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3 sm:px-0">
          {canDelete && !isNew ? (
            <Button type="button" variant="outline" className="text-destructive" onClick={remove} disabled={saving}>
              <Trash2 /> Delete
            </Button>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            {canChange ? (
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {saving ? 'Saving…' : isNew ? 'Create record' : 'Save changes'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">View only for your role.</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
