'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Eye,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Save,
  SplitSquareHorizontal,
  Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import UploadField from './UploadField';

/**
 * The story editor.
 *
 * Two halves: the fields, and a live preview that is the website's own article
 * page rendered in an iframe. The preview route sits outside the dashboard's
 * styling scope and picks up the site's stylesheets, so what is on screen is
 * what will publish — not an approximation that drifts the first time the
 * article layout changes.
 *
 * Bodies are Markdown. The toolbar wraps the selection rather than replacing
 * it, so it behaves the way people expect from a text editor.
 */

type Story = {
  id?: number;
  title: string;
  slug: string;
  category: string;
  date: string;
  date_label?: string;
  reading_time: string;
  excerpt: string;
  body: string;
  image: string;
  image_alt: string;
  caption: string;
  is_published: boolean;
};

const BLANK: Story = {
  title: '',
  slug: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  reading_time: '',
  excerpt: '',
  body: '',
  image: '',
  image_alt: '',
  caption: '',
  is_published: false,
};

/** Roughly 200 words a minute, which is the usual reading estimate. */
function readingTimeFor(body: string) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return '';
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export default function NewsEditor({
  story,
  canChange,
  canDelete,
}: {
  story: Story | null;
  canChange: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const isNew = story === null;
  const [draft, setDraft] = useState<Story>(story ?? BLANK);
  const [layout, setLayout] = useState<'split' | 'preview'>('split');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [frameReady, setFrameReady] = useState(false);

  const set = <K extends keyof Story>(key: K, value: Story[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const dateLabel = useMemo(() => {
    if (!draft.date) return '';
    const d = new Date(draft.date);
    return Number.isNaN(d.getTime())
      ? ''
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [draft.date]);

  /** Push the draft into the preview frame whenever it changes. */
  const pushPreview = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      {
        type: 'jdiobe:news-preview',
        draft: {
          title: draft.title,
          category: draft.category,
          dateLabel,
          readingTime: draft.reading_time || readingTimeFor(draft.body),
          excerpt: draft.excerpt,
          body: draft.body,
          image: draft.image,
          imageAlt: draft.image_alt,
          caption: draft.caption,
        },
      },
      window.location.origin
    );
  }, [draft, dateLabel]);

  // The push has to read the newest draft from a ref: the frame can announce
  // itself at any moment, and a stale closure would send it an empty story.
  const pushRef = useRef(pushPreview);
  useEffect(() => {
    pushRef.current = pushPreview;
  }, [pushPreview]);

  useEffect(() => {
    const onReady = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if ((event.data as { type?: string })?.type !== 'jdiobe:preview-ready') return;
      setFrameReady(true);
      pushRef.current();
    };
    window.addEventListener('message', onReady);
    return () => window.removeEventListener('message', onReady);
  }, []);

  useEffect(() => {
    if (!frameReady) return;
    // A short debounce: typing should not repaint the frame on every keystroke.
    const timer = setTimeout(pushPreview, 250);
    return () => clearTimeout(timer);
  }, [frameReady, pushPreview]);

  /** Wrap or prefix the current selection, the way a text editor should. */
  const applyMarkdown = (kind: 'bold' | 'italic' | 'h2' | 'quote' | 'ul' | 'ol' | 'link') => {
    const el = bodyRef.current;
    if (!el || !canChange) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = draft.body.slice(start, end);
    const before = draft.body.slice(0, start);
    const after = draft.body.slice(end);

    const wrap = (open: string, close = open) => `${open}${selected || 'text'}${close}`;
    const prefixLines = (prefix: string | ((i: number) => string)) =>
      (selected || 'item')
        .split('\n')
        .map((line, i) => `${typeof prefix === 'function' ? prefix(i) : prefix}${line}`)
        .join('\n');

    let inserted = '';
    switch (kind) {
      case 'bold':
        inserted = wrap('**');
        break;
      case 'italic':
        inserted = wrap('_');
        break;
      case 'h2':
        inserted = `## ${selected || 'Heading'}`;
        break;
      case 'quote':
        inserted = prefixLines('> ');
        break;
      case 'ul':
        inserted = prefixLines('- ');
        break;
      case 'ol':
        inserted = prefixLines((i) => `${i + 1}. `);
        break;
      case 'link':
        inserted = `[${selected || 'link text'}](https://)`;
        break;
    }

    const next = `${before}${inserted}${after}`;
    set('body', next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + inserted.length, start + inserted.length);
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});

    const payload = {
      ...draft,
      reading_time: draft.reading_time || readingTimeFor(draft.body),
      date_label: dateLabel,
    };

    const res = await fetch(isNew ? '/api/admin/news' : `/api/admin/news/${story!.id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      if (body && typeof body === 'object' && !body.error) {
        const errs: Record<string, string> = {};
        for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
          errs[k] = Array.isArray(v) ? String(v[0]) : String(v);
        }
        setFieldErrors(errs);
        setError('Please check the highlighted fields.');
      } else {
        setError(String(body?.error || 'Could not save.'));
      }
      return;
    }
    router.push('/admin/news');
    router.refresh();
  };

  const remove = async () => {
    setSaving(true);
    const res = await fetch(`/api/admin/news/${story!.id}`, { method: 'DELETE' });
    setSaving(false);
    if (res.ok) {
      router.push('/admin/news');
      router.refresh();
    } else setError('Could not delete that.');
  };

  const TOOLS = [
    { kind: 'h2', icon: Heading2, label: 'Heading' },
    { kind: 'bold', icon: Bold, label: 'Bold' },
    { kind: 'italic', icon: Italic, label: 'Italic' },
    { kind: 'link', icon: Link2, label: 'Link' },
    { kind: 'ul', icon: List, label: 'Bulleted list' },
    { kind: 'ol', icon: ListOrdered, label: 'Numbered list' },
    { kind: 'quote', icon: Quote, label: 'Quote' },
  ] as const;

  const field = (name: keyof Story) => fieldErrors[name as string];

  return (
    <form onSubmit={submit} className="pb-20">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={draft.is_published ? 'default' : 'muted'}>
            {draft.is_published ? 'Published' : 'Draft'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {readingTimeFor(draft.body) || 'No body yet'}
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {(
            [
              ['split', SplitSquareHorizontal, 'Edit and preview'],
              ['preview', Eye, 'Preview only'],
            ] as const
          ).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              aria-label={label}
              aria-pressed={layout === mode}
              onClick={() => setLayout(mode)}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-sm transition-colors',
                layout === mode ? 'bg-secondary font-medium' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{mode === 'split' ? 'Edit' : 'Preview'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={cn('grid gap-6', layout === 'split' ? 'xl:grid-cols-2' : '')}>
        {layout === 'split' ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">
                Headline<span className="text-accent-foreground"> *</span>
              </Label>
              <Input
                id="title"
                className="h-12"
                required
                value={draft.title}
                disabled={!canChange}
                onChange={(e) => set('title', e.target.value)}
              />
              {field('title') ? <p className="text-xs text-destructive">{field('title')}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category<span className="text-accent-foreground"> *</span>
                </Label>
                <Input
                  id="category"
                  className="h-12"
                  required
                  value={draft.category}
                  disabled={!canChange}
                  onChange={(e) => set('category', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date<span className="text-accent-foreground"> *</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="h-12"
                  required
                  value={draft.date}
                  disabled={!canChange}
                  onChange={(e) => set('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  className="h-12"
                  placeholder="made from the headline"
                  value={draft.slug}
                  disabled={!canChange}
                  onChange={(e) => set('slug', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading_time">Reading time</Label>
                <Input
                  id="reading_time"
                  className="h-12"
                  placeholder={readingTimeFor(draft.body) || 'counted from the body'}
                  value={draft.reading_time}
                  disabled={!canChange}
                  onChange={(e) => set('reading_time', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">
                Standfirst<span className="text-accent-foreground"> *</span>
              </Label>
              <Textarea
                id="excerpt"
                rows={2}
                required
                value={draft.excerpt}
                disabled={!canChange}
                onChange={(e) => set('excerpt', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                One sentence. Used on the index card and under the headline.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="body">
                  Body<span className="text-accent-foreground"> *</span>
                </Label>
                <div className="flex items-center gap-0.5">
                  {TOOLS.map(({ kind, icon: Icon, label }) => (
                    <button
                      key={kind}
                      type="button"
                      title={label}
                      aria-label={label}
                      disabled={!canChange}
                      onClick={() => applyMarkdown(kind)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                id="body"
                ref={bodyRef}
                rows={18}
                required
                className="font-mono text-sm"
                value={draft.body}
                disabled={!canChange}
                onChange={(e) => set('body', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Markdown.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Lead photograph</Label>
              <UploadField
                id="image"
                value={draft.image}
                folder="news"
                disabled={!canChange}
                onChange={(v) => set('image', v)}
              />
              <p className="text-xs text-muted-foreground">
                Optional. A story with no photograph of our own reads better than one with a stock
                image that misrepresents where it happened.
              </p>
            </div>

            {draft.image ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="image_alt">Alt text</Label>
                  <Input
                    id="image_alt"
                    className="h-12"
                    value={draft.image_alt}
                    disabled={!canChange}
                    onChange={(e) => set('image_alt', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    className="h-12"
                    value={draft.caption}
                    disabled={!canChange}
                    onChange={(e) => set('caption', e.target.value)}
                  />
                </div>
              </div>
            ) : null}

            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="is_published">
              <Checkbox
                id="is_published"
                checked={draft.is_published}
                disabled={!canChange}
                onCheckedChange={(c) => set('is_published', c === true)}
              />
              Published on the website
            </label>
          </div>
        ) : null}

        <div className={cn(layout === 'preview' && 'mx-auto w-full max-w-5xl')}>
          {/* Stays white in both themes on purpose: this frames a preview of
              the published article, and the public site has no dark mode. A
              dark chrome around a white page would misrepresent it. */}
          <div className="sticky top-20 overflow-hidden rounded-2xl border bg-white">
            <div className="flex items-center justify-between bg-muted/60 px-4 py-2">
              <p className="text-xs font-medium text-muted-foreground">
                Preview &mdash; exactly as the website renders it
              </p>
              {draft.slug ? (
                <code className="text-xs text-muted-foreground">/news/{draft.slug}</code>
              ) : null}
            </div>
            <iframe
              ref={frameRef}
              src="/preview/news"
              title="Story preview"
              onLoad={pushPreview}
              className={cn('w-full border-0 bg-white', layout === 'preview' ? 'h-[80vh]' : 'h-[70vh]')}
            />
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-5 rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
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
                {saving ? 'Saving…' : draft.is_published ? 'Save and publish' : 'Save draft'}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
