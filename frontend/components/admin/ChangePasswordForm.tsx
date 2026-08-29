'use client';

import { useState } from 'react';
import { AlertTriangle, Check, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Changing your own password.
 *
 * The requirements are shown as a live checklist rather than as an error after
 * the fact, because a rule you only learn by failing it is what produces
 * `Password1!` on the second attempt. The server validates independently — this
 * is guidance, not the gate.
 */

const RULES = [
  { label: 'At least 12 characters', test: (v: string) => v.length >= 12 },
  { label: 'A lower-case letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'An upper-case letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'A number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'A symbol', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

/** Length plus variety, matching what the server enforces. */
function meetsPolicy(value: string) {
  const classes = RULES.slice(1).filter((r) => r.test(value)).length;
  return value.length >= 12 && classes >= 3 && new Set(value).size >= 5;
}

export default function ChangePasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState('');

  const mismatch = confirm.length > 0 && next !== confirm;
  const ready = current.length > 0 && meetsPolicy(next) && next === confirm && !busy;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setDone('');
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: current,
          new_password: next,
          confirm_password: confirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Field errors keep their own key; anything else is shown as a whole.
        setErrors(
          typeof data === 'object' && data
            ? Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v : [String(v)]]),
              )
            : { detail: ['Could not change the password.'] },
        );
        return;
      }
      setDone(data.detail);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      setErrors({ detail: ['Could not reach the server.'] });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="max-w-md space-y-5">
        <div>
          <Label htmlFor="current">Current password</Label>
          <Input
            id="current"
            type="password"
            autoComplete="current-password"
            className="mt-1.5 h-12"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          {errors.current_password?.map((m) => (
            <p key={m} className="mt-1.5 text-sm font-medium text-destructive">{m}</p>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="next">New password</Label>
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          <Input
            id="next"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            className="mt-1.5 h-12"
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          {errors.new_password?.map((m) => (
            <p key={m} className="mt-1.5 text-sm font-medium text-destructive">{m}</p>
          ))}

          <ul className="mt-3 space-y-1.5">
            {RULES.map((rule) => {
              const ok = rule.test(next);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    next.length === 0
                      ? 'text-muted-foreground'
                      : ok
                        ? 'text-foreground'
                        : 'text-muted-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                      ok ? 'bg-foreground text-background' : 'border border-muted-foreground/40',
                    )}
                  >
                    {ok ? <Check className="h-3 w-3" /> : null}
                  </span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            Any three of the four character types is enough — length matters more than symbols.
          </p>
        </div>

        <div>
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            className="mt-1.5 h-12"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {mismatch ? (
            <p className="mt-1.5 text-sm font-medium text-destructive">
              The two passwords do not match.
            </p>
          ) : null}
          {errors.confirm_password?.map((m) => (
            <p key={m} className="mt-1.5 text-sm font-medium text-destructive">{m}</p>
          ))}
        </div>
      </div>

      {errors.detail?.map((m) => (
        <p
          key={m}
          role="alert"
          className="flex max-w-md items-start gap-2 rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {m}
        </p>
      ))}

      {done ? (
        <p className="max-w-md rounded-md bg-muted px-4 py-3 text-sm font-medium">{done}</p>
      ) : null}

      <Button type="submit" className="h-12" disabled={!ready}>
        {busy ? <Loader2 className="animate-spin" /> : <KeyRound />}
        Change password
      </Button>
    </form>
  );
}
