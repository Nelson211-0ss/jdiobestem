'use client';

import { useState } from 'react';
import { Check, KeyRound, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Give an account a password.
 *
 * A seeded account exists but cannot sign in: it is created with no usable
 * password on purpose, so that adding somebody to the team page never quietly
 * issues a credential. That left a gap — activating the account did nothing
 * visible, because the missing piece was never mentioned anywhere.
 *
 * This says it plainly and offers the fix in the same place. The suggestion is
 * generated in the browser from `crypto.getRandomValues`, so a strong password
 * is the easy path rather than the diligent one, and it is shown once for
 * passing on.
 */

/** Unambiguous characters only: nobody should lose an hour to l versus 1. */
const ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function suggest(length = 20) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

export default function SetPasswordCard({
  userId,
  username,
  hasPassword,
  isActive,
}: {
  userId: number;
  username: string;
  hasPassword: boolean;
  isActive: boolean;
}) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          Array.isArray(body?.password)
            ? String(body.password[0])
            : String(body?.error || body?.detail || 'Could not set the password.')
        );
        return;
      }
      setDone(true);
    } catch {
      setError('Could not set the password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className={cn(
        'rounded-2xl border p-5',
        !hasPassword && !done ? 'border-accent-foreground/40 bg-accent/5' : 'bg-muted/30'
      )}
    >
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Password</h2>

          {done ? (
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-green-700">
              <Check className="h-4 w-4" />
              Set. Give it to {username} directly, and ask them to change it once they are in.
            </p>
          ) : hasPassword ? (
            <p className="mt-1 text-sm text-muted-foreground">
              This account has a password. Setting a new one here signs {username} out everywhere —
              do it if they are locked out, not as routine.
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {username} has no password and cannot sign in
              </span>
              {isActive
                ? ' — the account is active, but there is nothing to sign in with yet.'
                : ' — and the account is not active either. Both are needed.'}
            </p>
          )}

          {!done ? (
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="new-password"
                    className="h-11 min-w-[16rem] flex-1 font-mono"
                    value={value}
                    autoComplete="new-password"
                    placeholder="At least 8 characters, not a common word"
                    onChange={(e) => {
                      setValue(e.target.value);
                      setError('');
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => setValue(suggest())}>
                    Suggest one
                  </Button>
                </div>
              </div>

              {error ? (
                <p role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              ) : null}

              <Button type="button" onClick={save} disabled={busy || value.length === 0}>
                {busy ? <Loader2 className="animate-spin" /> : <KeyRound />}
                {busy ? 'Setting…' : 'Set password'}
              </Button>

              <p className="text-xs text-muted-foreground">
                Shown once, here. It is stored only as a hash, so it cannot be read back later —
                if it is lost, set another.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
