'use client';

import { useState } from 'react';
import { Check, Loader2, LogOut, ShieldOff, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Take access away, give it back, or end someone's sessions.
 *
 * Revoking is the thing to do when a colleague leaves: the account is switched
 * off and signed out everywhere in one step, and nothing is deleted — their
 * name stays on everything they recorded, and if they come back it is one
 * click to restore. Signing out alone is for a lost phone or a shared
 * computer: their access is untouched and their password still works.
 *
 * Both ask before acting, in the page rather than a browser dialog.
 */
export default function AccountActionsCard({
  userId,
  username,
  isActive,
  isSelf,
}: {
  userId: number;
  username: string;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [confirming, setConfirming] = useState<'revoke' | 'restore' | 'sign-out' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const run = async (kind: 'revoke' | 'restore' | 'sign-out') => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(
        kind === 'sign-out' ? `/api/admin/users/${userId}/sign-out` : `/api/admin/users/${userId}/active`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: kind === 'sign-out' ? '{}' : JSON.stringify({ active: kind === 'restore' }),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(String(body?.detail || body?.error || 'That did not work.'));
        return;
      }
      if (kind === 'sign-out') {
        setNotice(`${username} has been signed out everywhere.`);
        setConfirming(null);
        return;
      }
      // A full reload, not a refresh: the access form below keeps its own copy
      // of "Account active", and saving it afterwards would quietly undo this.
      window.location.reload();
    } catch {
      setError('That did not work.');
    } finally {
      setBusy(false);
    }
  };

  const confirmText = {
    revoke: `Revoke ${username}'s access? They are signed out everywhere and cannot sign in again until it is restored. Nothing they recorded is deleted.`,
    restore: `Restore ${username}'s access? They can sign in again with their existing password and role.`,
    'sign-out': `Sign ${username} out of every device? Their access stays as it is and their password still works.`,
  } as const;

  return (
    <section
      className={cn(
        'rounded-2xl border p-5',
        isActive ? 'bg-muted/30' : 'border-destructive/40 bg-destructive/5'
      )}
    >
      <div className="flex items-start gap-3">
        {isActive ? (
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ShieldOff className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isActive ? (
              <>
                <span className="font-medium text-foreground">{username} can sign in.</span> Revoke
                access when someone leaves; sign them out if a device is lost.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">Access revoked.</span> {username} cannot
                sign in. Their account and history are kept.
              </>
            )}
          </p>

          {notice ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" /> {notice}
            </p>
          ) : null}

          {confirming ? (
            <div className="mt-4 space-y-3 rounded-xl border bg-card p-4">
              <p className="text-sm">{confirmText[confirming]}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={confirming === 'revoke' ? 'destructive' : 'default'}
                  disabled={busy}
                  onClick={() => run(confirming)}
                >
                  {busy ? <Loader2 className="animate-spin" /> : null}
                  {confirming === 'revoke'
                    ? 'Yes, revoke access'
                    : confirming === 'restore'
                      ? 'Yes, restore access'
                      : 'Yes, sign them out'}
                </Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => setConfirming(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : isSelf ? (
            <p className="mt-3 text-xs text-muted-foreground">
              This is your own account. Another superuser has to revoke it.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {isActive ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setConfirming('sign-out')}>
                    <LogOut /> Sign out everywhere
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => setConfirming('revoke')}
                  >
                    <ShieldOff /> Revoke access
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setConfirming('restore')}>
                  <ShieldCheck /> Restore access
                </Button>
              )}
            </div>
          )}

          {error ? (
            <p role="alert" className="mt-3 text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
