'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
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
import { specFor, validateValue } from '@/lib/validation';
import NumberInput from '@/components/ui/number-input';
import { DetailRow } from './Shell';
import PreviewFrame from './PreviewFrame';
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

  // The website, beside the form. Only for resources that declare one, and
  // only once the record exists — a block with no page yet has no page to show.
  const previewTarget = resource.preview ? String(record?.[resource.preview.field] ?? '') : '';
  const previewHref =
    !isNew && resource.preview && previewTarget
      ? `${resource.preview.basePath}/${previewTarget}`
      : '';
  const frame = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);

  /** Push the field being edited into the frame. */
  const push = useCallback(() => {
    if (!previewHref || !frame.current?.contentWindow) return;
    frame.current.contentWindow.postMessage(
      {
        type: 'jdiobe:block-preview',
        page: String(values.page ?? record?.page ?? ''),
        key: String(values.key ?? record?.key ?? ''),
        value: String(values.value ?? ''),
      },
      window.location.origin
    );
  }, [previewHref, values, record]);

  // The frame says when it is listening, so a value typed before it loaded is
  // not swallowed.
  useEffect(() => {
    if (!previewHref) return;
    const onReady = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if ((event.data as { type?: string })?.type === 'jdiobe:preview-ready') setFrameReady(true);
    };
    window.addEventListener('message', onReady);
    return () => window.removeEventListener('message', onReady);
  }, [previewHref]);

  useEffect(() => {
    if (!frameReady) return;
    // Debounced: a keystroke should not be a postMessage.
    const timer = setTimeout(push, 180);
    return () => clearTimeout(timer);
  }, [frameReady, push]);

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const editable = resource.fields.filter((f) => f.type !== 'readonly');

  // What the serializer will accept, read from the generated contract. The
  // registry may mark a field required that the model allows blank — an
  // editorial rule rather than a database one — so the two are OR'd.
  const specOf = (field: Field) => specFor('admin', resource.key, field.name);
  const isRequired = (field: Field) => Boolean(field.required || specOf(field).required);

  /** Check one field and remember the outcome. Returns the message. */
  const check = (field: Field, value: unknown): string => {
    const spec = { ...specOf(field) };
    if (field.required) spec.required = true;
    const message = validateValue(spec, value, field.label);
    setFieldErrors((prev) => {
      if (message === (prev[field.name] ?? '')) return prev;
      const next = { ...prev };
      if (message) next[field.name] = message;
      else delete next[field.name];
      return next;
    });
    return message;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    const found: Record<string, string> = {};
    for (const field of editable) {
      const spec = { ...specOf(field) };
      if (field.required) spec.required = true;
      const message = validateValue(spec, values[field.name], field.label);
      if (message) found[field.name] = message;
    }
    if (Object.keys(found).length) {
      setFieldErrors(found);
      setError('Please check the highlighted fields.');
      setSaving(false);
      // Take them to the first problem; on a twenty-field record the offending
      // one is usually off-screen.
      document.getElementById(`f-${Object.keys(found)[0]}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

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

  /** A value the form shows but does not offer to change. */
  const renderReadonly = (field: Field) => {
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
  };

  const renderField = (field: Field) => {
    // Locked once the record exists: shown as its value rather than as a
    // disabled box, because a greyed-out field invites people to try to type
    // in it and then wonder what is broken.
    if (field.type === 'readonly' || (field.lockedAfterCreate && !isNew)) {
      return renderReadonly(field);
    }

    const id = `f-${field.name}`;
    const value = values[field.name];
    const invalid = fieldErrors[field.name];
    const spec = specOf(field);
    const required = isRequired(field);
    const describedBy = invalid ? `${id}-error` : field.help ? `${id}-help` : undefined;


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
              {required ? (
                <span className="text-accent-foreground" aria-hidden="true">
                  {' '}
                  *
                </span>
              ) : null}
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
                required={required}
                maxLength={spec.maxLength}
                disabled={!canChange}
                aria-invalid={Boolean(invalid)}
                aria-describedby={describedBy}
                onChange={(e) => set(field.name, e.target.value)}
                onBlur={(e) => check(field, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <Select
                value={String(value ?? '')}
                disabled={!canChange}
                onValueChange={(v) => {
                  const next = v === '__blank__' ? '' : v;
                  set(field.name, next);
                  check(field, next);
                }}
              >
                <SelectTrigger
                  id={id}
                  className="h-12"
                  aria-invalid={Boolean(invalid)}
                  aria-describedby={describedBy}
                >
                  <SelectValue placeholder={required ? 'Choose one' : 'Choose one (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((o) => (
                    <SelectItem key={o.value || '__blank__'} value={o.value || '__blank__'}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'number' ? (
              <NumberInput
                id={id}
                className="h-12"
                value={String(value ?? '')}
                required={required}
                disabled={!canChange}
                aria-invalid={Boolean(invalid)}
                aria-describedby={describedBy}
                onChange={(raw) => set(field.name, raw)}
                onBlur={() => check(field, values[field.name])}
              />
            ) : (
              <Input
                id={id}
                className="h-12"
                type={
                  field.type === 'date'
                    ? 'date'
                    : field.type === 'email'
                      ? 'email'
                      : field.type === 'tel'
                        ? 'tel'
                        : 'text'
                }
                value={String(value ?? '')}
                required={required}
                maxLength={spec.maxLength}
                disabled={!canChange}
                aria-invalid={Boolean(invalid)}
                aria-describedby={describedBy}
                onChange={(e) => set(field.name, e.target.value)}
                onBlur={(e) => check(field, e.target.value)}
              />
            )}
          </>
        )}

        {field.help ? (
          <p id={`${id}-help`} className="text-xs text-muted-foreground">
            {field.help}
          </p>
        ) : null}
        {invalid ? (
          <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
            {invalid}
          </p>
        ) : null}
      </div>
    );
  };


  return (
    <form onSubmit={submit} className="space-y-6">
      <div className={cn(previewHref && 'grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]')}>
        <div className="grid gap-5 sm:grid-cols-2">{resource.fields.map(renderField)}</div>

        {previewHref ? (
          <div className="xl:sticky xl:top-24 xl:self-start">
            <PreviewFrame
              src={previewHref}
              title="Live preview"
              frameRef={frame}
              // A frame that finished loading before its ready message arrived
              // would otherwise wait for a message that has already been sent.
              onReady={() => setFrameReady(true)}
            />
          </div>
        ) : null}
      </div>

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
