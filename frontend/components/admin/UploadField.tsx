'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * A path input with a file picker beside it.
 *
 * The stored value is always a path or URL, so artwork that already sits in
 * /public can simply be typed in — moving every existing image into object
 * storage is not a precondition for editing a record.
 */
export default function UploadField({
  id,
  value,
  folder,
  disabled,
  onChange,
}: {
  id: string;
  value: string;
  folder: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File) => {
    setBusy(true);
    setError('');
    const form = new FormData();
    form.append('file', file);
    form.append('folder', folder);

    const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
    const body = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(String(body?.error || 'Upload failed.'));
      return;
    }
    onChange(String(body.url));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          disabled={disabled}
          placeholder="/images/example.jpg or an uploaded URL"
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          ref={input}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void pick(file);
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Upload />}
          <span className="hidden sm:inline">{busy ? 'Uploading…' : 'Upload'}</span>
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear"
            disabled={disabled}
            onClick={() => onChange('')}
          >
            <X />
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}

      {value && /\.(jpe?g|png|webp|gif|svg)$/i.test(value) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-24 w-auto rounded-md border object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : null}
    </div>
  );
}
