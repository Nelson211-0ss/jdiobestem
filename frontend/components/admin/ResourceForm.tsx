'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { DetailRow } from './Shell';
import UploadField from './UploadField';
import type { Field, Resource } from '@/lib/admin/resources';

type Values = Record<string, unknown>;

/**
 * The edit form for any resource.
 *
 * Read-only fields are rendered as text, not as disabled inputs: a greyed-out
 * box invites people to try to type in it. On submitted records — a volunteer
 * application, a donation — most of the form is exactly that, because the
 * record is evidence of what someone sent.
 */
/**
 * A repeatable group of fields — the magazine's cover stories, for instance.
 *
 * Order is position in the array, so moving a row is a reorder rather than an
 * index somebody has to keep in their head. The backend replaces the whole set
 * on save, which keeps deletes honest.
 */
function ListField({
  field,
  rows,
  disabled,
  onChange,
}: {
  field: Field;
  rows: Record<string, string>[];
  disabled?: boolean;
  onChange: (rows: Record<string, string>[]) => void;
}) {
  const shape = field.itemFields ?? [];
  const blank = Object.fromEntries(shape.map((f) => [f.name, '']));

  const update = (i: number, name: string, v: string) =>
    onChange(rows.map((row, j) => (i === j ? { ...row, [name]: v } : row)));

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="relative rounded-xl bg-muted/60 p-4">
          {!disabled ? (
            <button
              type="button"
              aria-label={`Remove item ${i + 1}`}
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          <div className="grid gap-3 pr-8">
            {shape.map((sub) => (
              <div key={sub.name} className="space-y-1.5">
                <Label htmlFor={`${field.name}-${i}-${sub.name}`} className="text-xs">
                  {sub.label}
                </Label>
                {sub.type === 'textarea' ? (
                  <Textarea
                    id={`${field.name}-${i}-${sub.name}`}
                    rows={2}
                    value={row[sub.name] ?? ''}
                    disabled={disabled}
                    onChange={(e) => update(i, sub.name, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`${field.name}-${i}-${sub.name}`}
                    className="h-10"
                    value={row[sub.name] ?? ''}
                    disabled={disabled}
                    onChange={(e) => update(i, sub.name, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {!disabled ? (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...rows, { ...blank }])}>
          <Plus /> {field.addLabel ?? 'Add'}
        </Button>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing added yet.</p>
      ) : null}
    </div>
  );
}

export default function ResourceForm({
  resource,
  record,
  canChange,
  canDelete,
}: {
  resource: Resource;
  record: Values | null;
  canChange: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const isNew = record === null;
  const [values, setValues] = useState<Values>(() => {
    const initial: Values = {};
    for (const field of resource.fields) {
      const raw = record?.[field.name];
      initial[field.name] =
        raw ?? (field.type === 'boolean' ? false : field.type === 'list' ? [] : '');
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const editable = resource.fields.filter((f) => f.type !== 'readonly');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    const payload: Values = {};
    for (const field of editable) {
      let value = values[field.name];
      // Empty optional numbers must go as null, not '' — an integer column
      // rejects the empty string.
      if (field.type === 'number' && value === '') value = null;
      if (field.type === 'date' && value === '') value = null;
      payload[field.name] = value;
    }

    const res = await fetch(
      isNew ? `/api/admin/${resource.key}` : `/api/admin/${resource.key}/${record!.id}`,
      {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      if (body && typeof body === 'object' && !body.error) {
        const errs: Record<string, string> = {};
        for (const [key, val] of Object.entries(body as Record<string, unknown>)) {
          errs[key] = Array.isArray(val) ? String(val[0]) : String(val);
        }
        setFieldErrors(errs);
        setError('Please check the highlighted fields.');
      } else {
        setError(String(body?.error || 'Could not save.'));
      }
      return;
    }

    router.push(`/admin/${resource.key}`);
    router.refresh();
  };

  const remove = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/${resource.key}/${record!.id}`, { method: 'DELETE' });
    setSaving(false);
    if (res.ok) {
      router.push(`/admin/${resource.key}`);
      router.refresh();
    } else {
      setConfirmDelete(false);
      setError('Could not delete that.');
    }
  };

  const renderField = (field: Field) => {
    const id = `f-${field.name}`;
    const value = values[field.name];
    const invalid = fieldErrors[field.name];

    if (field.type === 'readonly') {
      const shown = record?.[field.name];
      return (
        <div key={field.name} className="sm:col-span-2">
          <DetailRow label={field.label}>
            <span className="whitespace-pre-wrap font-semibold">
              {shown === null || shown === undefined || shown === '' ? (
                <span className="font-normal text-muted-foreground">&mdash;</span>
              ) : typeof shown === 'boolean' ? (
                shown ? 'Yes' : 'No'
              ) : (
                String(shown)
              )}
            </span>
          </DetailRow>
        </div>
      );
    }

    return (
      <div key={field.name} className={cn('space-y-2', field.wide && 'sm:col-span-2')}>
        {field.type === 'boolean' ? (
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor={id}>
            <Checkbox
              id={id}
              checked={Boolean(value)}
              disabled={!canChange}
              onCheckedChange={(c) => set(field.name, c === true)}
            />
            {field.label}
          </label>
        ) : (
          <>
            <Label htmlFor={id}>
              {field.label}
              {field.required ? <span className="text-accent-foreground"> *</span> : null}
            </Label>

            {field.type === 'list' ? (
              <ListField
                field={field}
                rows={Array.isArray(value) ? (value as Record<string, string>[]) : []}
                disabled={!canChange}
                onChange={(rows) => set(field.name, rows)}
              />
            ) : field.type === 'upload' ? (
              <UploadField
                id={id}
                value={String(value ?? '')}
                folder={field.folder ?? 'misc'}
                disabled={!canChange}
                onChange={(v) => set(field.name, v)}
              />
            ) : field.type === 'textarea' ? (
              <Textarea
                id={id}
                rows={field.name === 'body' ? 14 : 4}
                value={String(value ?? '')}
                disabled={!canChange}
                onChange={(e) => set(field.name, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <Select
                value={String(value ?? '')}
                disabled={!canChange}
                onValueChange={(v) => set(field.name, v === '__blank__' ? '' : v)}
              >
                <SelectTrigger id={id} className="h-12">
                  <SelectValue placeholder="Choose one" />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((o) => (
                    <SelectItem key={o.value || '__blank__'} value={o.value || '__blank__'}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={id}
                className="h-12"
                type={
                  field.type === 'number'
                    ? 'number'
                    : field.type === 'date'
                      ? 'date'
                      : field.type === 'email'
                        ? 'email'
                        : field.type === 'tel'
                          ? 'tel'
                          : 'text'
                }
                value={String(value ?? '')}
                disabled={!canChange}
                onChange={(e) => set(field.name, e.target.value)}
              />
            )}
          </>
        )}

        {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
        {invalid ? <p className="text-xs font-medium text-destructive">{invalid}</p> : null}
      </div>
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">{resource.fields.map(renderField)}</div>

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      {/* Pinned to the foot of the viewport by FormShell, so Save stays
          reachable on a record with twenty fields. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3 px-4 py-3 sm:px-0">
          {canDelete && !isNew ? (
            <Button
              type="button"
              variant="outline"
              className="text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
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
                {saving ? 'Saving…' : isNew ? `Create ${resource.singular}` : 'Save changes'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">View only for your role.</p>
            )}
          </div>
        </div>
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this {resource.singular}?</DialogTitle>
            <DialogDescription>
              This cannot be undone. The record will be removed from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Keep it
            </Button>
            <Button variant="destructive" onClick={remove} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
