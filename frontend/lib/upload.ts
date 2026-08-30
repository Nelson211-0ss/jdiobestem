/**
 * Sending a file, on a connection that may not hold.
 *
 * Small files go in one request — chunking a 200 KB logo adds three round
 * trips to save nothing. Anything larger is split, and each piece is
 * acknowledged as it lands, so a drop at 90% costs the last piece rather than
 * the whole file.
 *
 * Three failures are handled separately because they need different answers:
 * a piece that fails is retried with backoff; a connection that is gone is
 * waited on rather than retried into a void; and a file the server refuses
 * (wrong type, too large) stops immediately, since retrying will not change
 * its mind.
 */

/** Below this, one request is cheaper than the handshake. */
const CHUNK_THRESHOLD = 4 * 1024 * 1024;
const CHUNK_SIZE = 2 * 1024 * 1024;
const MAX_ATTEMPTS = 4;

export type UploadResult = { url: string; thumbUrl: string; path: string };
export type UploadOptions = {
  folder?: string;
  /** 0-100. Reports bytes actually accepted, not bytes handed to the browser. */
  onProgress?: (percent: number) => void;
  /** Called when the upload is waiting for the connection to come back. */
  onWaiting?: (waiting: boolean) => void;
  signal?: AbortSignal;
};

class UploadError extends Error {
  /** A refusal, not a failure: retrying sends the same file to the same rule. */
  readonly permanent: boolean;
  constructor(message: string, permanent = false) {
    super(message);
    this.permanent = permanent;
  }
}

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new UploadError('Upload cancelled.', true));
    }, { once: true });
  });

/** Resolve once the browser believes it is online again. */
function whenOnline(signal?: AbortSignal): Promise<void> {
  if (navigator.onLine) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const done = () => {
      window.removeEventListener('online', done);
      resolve();
    };
    window.addEventListener('online', done);
    signal?.addEventListener('abort', () => {
      window.removeEventListener('online', done);
      reject(new UploadError('Upload cancelled.', true));
    }, { once: true });
  });
}

async function post(url: string, body: BodyInit, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(url, { method: 'POST', body, signal });
  if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 409) {
    // The server has looked at it and said no. Retrying is just noise.
    const detail = await res.json().catch(() => ({}));
    throw new UploadError(detail.detail ?? 'That file was not accepted.', true);
  }
  if (!res.ok) throw new UploadError(`The server responded ${res.status}.`);
  return res;
}

/** Run `work`, retrying transient failures with widening gaps. */
async function withRetry<T>(work: () => Promise<T>, options: UploadOptions): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      if (!navigator.onLine) {
        options.onWaiting?.(true);
        await whenOnline(options.signal);
        options.onWaiting?.(false);
      }
      return await work();
    } catch (err) {
      if (err instanceof UploadError && err.permanent) throw err;
      lastError = err;
      if (attempt === MAX_ATTEMPTS) break;
      // 0.5s, 1s, 2s — long enough for a cell handover, short enough to feel alive.
      await sleep(500 * 2 ** (attempt - 1), options.signal);
    }
  }
  throw lastError instanceof Error ? lastError : new UploadError('The upload failed.');
}

export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  const folder = options.folder ?? 'misc';

  if (file.size <= CHUNK_THRESHOLD) {
    const data = await withRetry(async () => {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', folder);
      const res = await post('/api/admin/upload', body, options.signal);
      return res.json();
    }, options);
    options.onProgress?.(100);
    return { url: data.url, thumbUrl: data.thumb_url ?? '', path: data.path };
  }

  const started = await withRetry(async () => {
    const res = await fetch('/api/admin/upload/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder }),
      signal: options.signal,
    });
    if (!res.ok) throw new UploadError(`Could not start the upload (${res.status}).`);
    return res.json();
  }, options);

  const uploadId: string = started.upload_id;
  const total = Math.ceil(file.size / CHUNK_SIZE);

  // Anything already stored from a previous attempt is not sent again.
  const done = new Set<number>((started.received ?? []) as number[]);

  for (let index = 0; index < total; index += 1) {
    if (done.has(index)) continue;
    const slice = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE);

    await withRetry(async () => {
      const body = new FormData();
      body.append('chunk', slice);
      body.append('index', String(index));
      const res = await post(`/api/admin/upload/${uploadId}/part`, body, options.signal);
      const payload = await res.json();
      for (const i of payload.received ?? []) done.add(i);
    }, options);

    options.onProgress?.(Math.round((done.size / total) * 100));
  }

  const finished = await withRetry(async () => {
    const res = await fetch(`/api/admin/upload/${uploadId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total,
        content_type: file.type,
        folder,
        filename: file.name,
      }),
      signal: options.signal,
    });
    if (res.status === 409) {
      // Pieces went missing between sending and assembling; the caller can
      // simply run the whole thing again and only the gaps will be sent.
      throw new UploadError('Some pieces did not arrive. Try again.');
    }
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      throw new UploadError(detail.detail ?? 'The upload could not be completed.', res.status < 500);
    }
    return res.json();
  }, options);

  options.onProgress?.(100);
  return { url: finished.url, thumbUrl: finished.thumb_url ?? '', path: finished.path };
}
