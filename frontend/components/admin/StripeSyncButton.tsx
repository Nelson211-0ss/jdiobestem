'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Fetch anything Stripe has that this table does not.
 *
 * The webhook records a gift as it happens, so this is for the gaps: the period
 * before it was connected, and any delivery attempted while the site was down.
 * It is keyed on the Checkout session id, so pressing it twice is harmless —
 * which is the point, because the honest answer to "did that work?" is usually
 * to press it again.
 */
export default function StripeSyncButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>('');

  const run = async () => {
    setBusy(true);
    setResult('');
    try {
      const res = await fetch('/api/admin/donations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: 24 }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setResult(body.error ?? 'Could not reach Stripe.');
        return;
      }

      const parts = [];
      if (body.imported) parts.push(`${body.imported} added`);
      if (body.updated) parts.push(`${body.updated} already recorded`);
      if (body.failed) parts.push(`${body.failed} failed`);
      setResult(parts.length ? parts.join(' · ') : 'Nothing new in Stripe.');
      if (body.imported || body.updated) router.refresh();
    } catch {
      setResult('Could not reach Stripe.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {result ? <span className="text-xs text-muted-foreground">{result}</span> : null}
      <Button variant="outline" onClick={run} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        {busy ? 'Pulling…' : 'Pull from Stripe'}
      </Button>
    </div>
  );
}
