'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, FileText, Loader2, Send, TestTube2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Sending a newsletter, and checking it first.
 *
 * The fields live in the ordinary resource form above this, so composing a
 * newsletter looks and behaves like editing anything else in the dashboard.
 * What is genuinely different is down here: an audience count, a preview of
 * the real email, a test to one address, and the send itself.
 *
 * Sending is the only thing in this dashboard that cannot be undone, so the
 * screen is built to make the consequence visible before it happens rather
 * than to confirm it afterwards.
 */

type Props = {
  id: number;
  subject: string;
  status: string;
  statusDisplay: string;
  sentCount: number;
  failedCount: number;
  hasPdf: boolean;
  canSend: boolean;
};

export default function NewsletterActions({
  id,
  subject,
  status,
  statusDisplay,
  sentCount,
  failedCount,
  hasPdf,
  canSend,
}: Props) {
  const [audience, setAudience] = useState<{ will_send: number; already_sent: number } | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState('');
  const [testTo, setTestTo] = useState('');

  const loadAudience = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/newsletter-action/${id}/audience`);
      if (res.ok) setAudience(await res.json());
    } catch {
      /* the count is informational; a failure here must not block the page */
    }
  }, [id]);

  useEffect(() => {
    loadAudience();
  }, [loadAudience]);

  async function run<T>(action: string, body: unknown, onDone: (data: T) => void) {
    setBusy(action);
    setError('');
    setNotice('');
    try {
      const res = await fetch(`/api/admin/newsletter-action/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'That did not work.');
      onDone(data as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work.');
    } finally {
      setBusy('');
    }
  }

  async function showPreview() {
    setBusy('preview');
    setError('');
    try {
      const res = await fetch(`/api/admin/newsletter-action/${id}/preview`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? 'Could not build the preview.');
      setPreview(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build the preview.');
    } finally {
      setBusy('');
    }
  }

  const send = () => {
    const count = audience?.will_send ?? 0;
    const ok = window.confirm(
      `Send "${subject}" to ${count} subscriber${count === 1 ? '' : 's'}?\n\n` +
        'This cannot be undone — an email cannot be recalled once it has gone.',
    );
    if (!ok) return;
    run('send', { confirm: true }, (data: { detail: string }) => {
      setNotice(data.detail);
      loadAudience();
    });
  };

  const willSend = audience?.will_send ?? 0;

  return (
    <section className="mt-8 rounded-3xl bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">Sending</h2>
        <p className="text-sm text-muted-foreground">
          {statusDisplay}
          {sentCount > 0 && ` · ${sentCount} sent`}
          {failedCount > 0 && ` · ${failedCount} failed`}
        </p>
      </div>

      {!hasPdf ? (
        <p className="mt-4 flex items-start gap-2 rounded-md bg-muted px-4 py-3 text-sm">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          Attach the newsletter PDF above and save. The email is a covering note pointing at it,
          so there is nothing to send until it is there.
        </p>
      ) : null}

      {status === 'sent' || sentCount > 0 ? (
        <p className="mt-4 rounded-md bg-muted px-4 py-3 text-sm">
          This has gone to {sentCount} subscriber{sentCount === 1 ? '' : 's'}, so the fields above
          are locked. What is on file has to keep matching what people received.
        </p>
      ) : null}

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Still to receive it</dt>
          <dd className="text-2xl font-bold tabular">{willSend}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Already received it</dt>
          <dd className="text-2xl font-bold tabular">{audience?.already_sent ?? 0}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Failed</dt>
          <dd className="text-2xl font-bold tabular">{failedCount}</dd>
        </div>
      </dl>

      {error ? (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-6 rounded-md bg-muted px-4 py-3 text-sm font-medium">{notice}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[16rem] flex-1">
          <Label htmlFor="test-to">Send yourself a test</Label>
          <Input
            id="test-to"
            type="email"
            className="mt-1.5 h-12"
            placeholder="you@jdiobestem.org"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-12"
          disabled={!!busy || !testTo.trim()}
          onClick={() => run('test', { email: testTo.trim() }, (d: { detail: string }) => setNotice(d.detail))}
        >
          {busy === 'test' ? <Loader2 className="animate-spin" /> : <TestTube2 />}
          Send test
        </Button>
        <Button type="button" variant="outline" className="h-12" disabled={!!busy} onClick={showPreview}>
          Preview
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        A test goes only to that address. Nobody is added to the mailing list and nothing is
        recorded against the campaign.
      </p>

      {canSend ? (
        <div className="mt-6 border-t pt-6">
          <Button type="button" className="h-12" disabled={!!busy || !willSend || !hasPdf} onClick={send}>
            {busy === 'send' ? <Loader2 className="animate-spin" /> : <Send />}
            Send to {willSend} subscriber{willSend === 1 ? '' : 's'}
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Sending cannot be undone. If the provider fails part way, sending again picks up where
            it stopped — it never mails anyone twice.
          </p>
        </div>
      ) : null}

      {preview ? (
        <div className="mt-8 overflow-hidden rounded-2xl border">
          <p className="border-b px-4 py-2 text-sm text-muted-foreground">
            Preview — this is the email itself
          </p>
          <iframe
            title="Newsletter preview"
            srcDoc={preview}
            className="h-[600px] w-full border-0"
            sandbox=""
          />
        </div>
      ) : null}
    </section>
  );
}
