'use client';

import { useRef, useState } from 'react';

import { uploadFile } from '@/lib/upload';
import { FileText, Image as ImageIcon, Loader2, Upload, WifiOff, X } from 'lucide-react';

/**
 * Dropping, choosing, or pasting a path to a file.
 *
 * Uploading is delegated to `lib/upload`, which sends anything sizeable in
 * pieces so a dropped connection costs the last piece rather than the whole
 * file. The percentage here counts pieces the server has acknowledged, not
 * bytes handed to the browser — on a Ugandan mobile connection those are very
 * different numbers, and only one of them is true.
 *
 * The manual path box is kept alongside. Much of the site's artwork already
 * sits under /public and is referenced by path; making people re-upload it to
 * satisfy the form would be busywork that also duplicates the file.
 */

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Where to POST. The admin uploader and the public CV route differ. */
  endpoint?: string;
  /** Sent alongside the file, so the server files it in the right place. */
  folder?: string;
  accept?: string;
  /** Shown under the prompt, e.g. "PDF, JPG or PNG · up to 15 MB". */
  supports?: string;
  disabled?: boolean;
  /** "image" softens the wording and icon for artwork fields. */
  kind?: 'image' | 'file';
};

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif|svg)(\?|#|$)/i;

function fileNameFrom(url: string): string {
  try {
    return decodeURIComponent(url.split('?')[0].split('/').pop() || url);
  } catch {
    return url;
  }
}

export default function FileDropzone({
  id = 'file',
  value,
  onChange,
  endpoint = '/api/admin/upload',
  folder = 'misc',
  accept = 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf',
  supports = 'JPG, PNG, WebP or PDF',
  disabled = false,
  kind = 'file',
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');

  const busy = progress !== null;

  async function send(file: File) {
    setError('');
    setProgress(0);
    setWaiting(false);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const result = await uploadFile(file, {
        folder,
        signal: controller.signal,
        onProgress: setProgress,
        onWaiting: setWaiting,
      });
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That file could not be uploaded.');
    } finally {
      abort.current = null;
      setProgress(null);
      setWaiting(false);
    }
  }

  function take(files: FileList | null) {
    const file = files?.[0];
    if (file) send(file);
  }

  const Icon = kind === 'image' ? ImageIcon : Upload;
  const noun = kind === 'image' ? 'image' : 'file';

  return (
    <div className="dropzone-wrap">
      {value && !busy ? (
        <div className="dropzone-done">
          {IMAGE_RE.test(value) ? (
            <img src={value} alt="" className="dropzone-thumb" />
          ) : (
            <span className="dropzone-thumb dropzone-thumb--file">
              <FileText className="h-6 w-6" />
              <span>{(value.split('?')[0].split('.').pop() || 'file').slice(0, 4).toUpperCase()}</span>
            </span>
          )}
          <span className="dropzone-done__text">
            <span className="dropzone-done__name">{fileNameFrom(value)}</span>
            <a href={value} target="_blank" rel="noopener" className="dropzone-done__link">
              Open
            </a>
          </span>
          {!disabled ? (
            <button
              type="button"
              className="dropzone-remove"
              onClick={() => onChange('')}
              aria-label={`Remove this ${noun}`}
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={`dropzone${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
          onDragOver={(e) => {
            if (disabled) return;
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            if (disabled) return;
            e.preventDefault();
            setDragging(false);
            take(e.dataTransfer.files);
          }}
          onClick={() => !disabled && !busy && input.current?.click()}
        >
          <input
            ref={input}
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            disabled={disabled}
            onChange={(e) => {
              take(e.target.files);
              e.target.value = '';
            }}
          />

          {busy ? (
            <>
              {waiting ? (
                <WifiOff className="dropzone-icon" />
              ) : (
                <Loader2 className="dropzone-icon animate-spin" />
              )}
              <p className="dropzone-prompt">
                {waiting ? 'Waiting for the connection…' : `Uploading… ${progress}%`}
              </p>
              <div className="dropzone-bar" role="progressbar" aria-valuenow={progress ?? 0}>
                <span style={{ width: `${progress ?? 0}%` }} />
              </div>
              <button
                type="button"
                className="dropzone-cancel"
                onClick={(e) => {
                  e.stopPropagation();
                  abort.current?.abort();
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <Icon className="dropzone-icon" />
              <p className="dropzone-prompt">
                Drop your {noun} here, or <span className="dropzone-browse">browse</span>
              </p>
              <p className="dropzone-supports">Supports: {supports}</p>
            </>
          )}
        </div>
      )}

      {error ? <p className="dropzone-error">{error}</p> : null}

    </div>
  );
}
