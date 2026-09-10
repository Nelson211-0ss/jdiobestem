'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import UploadField from './UploadField';

/**
 * Several files against one field.
 *
 * An expense usually has more than one receipt — the parts, the labour, the
 * transport — and a single slot meant the second one had nowhere to go, so it
 * either replaced the first or was left out of the record entirely.
 *
 * Stored as a list. A value saved before this existed is a plain string, so
 * reading normalises either shape and writing always produces the list.
 */

export function toFileList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  const single = String(value ?? '').trim();
  return single ? [single] : [];
}

function nameOf(url: string) {
  try {
    return decodeURIComponent(new URL(url).pathname.split('/').pop() || url);
  } catch {
    return url;
  }
}

export default function MultiUploadField({
  id,
  value,
  folder,
  disabled,
  onChange,
}: {
  id: string;
  value: unknown;
  folder: string;
  disabled?: boolean;
  onChange: (value: string[]) => void;
}) {
  const files = toFileList(value);

  return (
    <div className="space-y-3">
      {files.length ? (
        <ul className="space-y-2">
          {files.map((url, index) => (
            <li
              key={`${url}-${index}`}
              className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2"
            >
              <a
                href={url}
                target="_blank"
                rel="noopener"
                className="min-w-0 flex-1 truncate text-sm underline underline-offset-2"
              >
                {nameOf(url)}
              </a>
              {!disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${nameOf(url)}`}
                  onClick={() => onChange(files.filter((_, i) => i !== index))}
                >
                  <X />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Always empty: it adds the next file rather than replacing the last. */}
      <UploadField
        id={id}
        value=""
        folder={folder}
        disabled={disabled}
        onChange={(added) => {
          if (added && !files.includes(added)) onChange([...files, added]);
        }}
      />
      <p className="text-xs text-muted-foreground">
        {files.length
          ? `${files.length} file${files.length === 1 ? '' : 's'} attached. Add another above.`
          : 'You can attach more than one file.'}
      </p>
    </div>
  );
}
