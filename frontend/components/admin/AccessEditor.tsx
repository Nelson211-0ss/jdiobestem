'use client';

import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Check, Loader2, Minus, Pencil, Save, ShieldAlert, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DetailRow, DetailSection } from './Shell';
import type { AccessPayload, OverrideEntry } from '@/lib/admin/access';

type Cell = 'inherit' | 'allow' | 'deny';

const ACTION_LABEL: Record<string, string> = {
  view: 'View',
  add: 'Add',
  change: 'Edit',
  delete: 'Delete',
};

/**
 * Assign what somebody can and cannot reach.
 *
 * Three layers, shown together because they only make sense together:
 *
 *   1. the role, which is the sensible default
 *   2. the country, which decides which rows they see rather than which screens
 *   3. per-action exceptions, for the cases a role does not fit
 *
 * Each cell cycles inherit -> allow -> deny. Inherit shows what the role
 * already gives, so it is always visible what an exception is changing.
 * Deny beats allow: an explicit denial cannot be undone by a later grant.
 */
export default function AccessEditor({
  access,
  canEdit,
  editHref,
}: {
  access: AccessPayload;
  canEdit: boolean;
  /**
   * Where to go to change this, when the page is only showing it. Without it a
   * superuser reading the record was told they were not one.
   */
  editHref?: string;
}) {
  const router = useRouter();

  const [account, setAccount] = useState(access.user);
  const [profile, setProfile] = useState(access.profile);
  const [cells, setCells] = useState<Record<string, Cell>>(() => {
    const initial: Record<string, Cell> = {};
    for (const group of access.matrix) {
      for (const resource of group.resources) {
        for (const [action, state] of Object.entries(resource.actions)) {
          initial[`${resource.key}:${action}`] = state.override ?? 'inherit';
        }
      }
    }
    return initial;
  });
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const roleGrants = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const group of access.matrix) {
      for (const resource of group.resources) {
        for (const [action, state] of Object.entries(resource.actions)) {
          map[`${resource.key}:${action}`] = state.role;
        }
      }
    }
    return map;
  }, [access.matrix]);

  const exceptionCount = Object.values(cells).filter((c) => c !== 'inherit').length;

  const cycle = (key: string) => {
    if (!canEdit) return;
    setSaved(false);
    setCells((prev) => {
      const next: Cell = prev[key] === 'inherit' ? 'allow' : prev[key] === 'allow' ? 'deny' : 'inherit';
      return { ...prev, [key]: next };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    const overrides: OverrideEntry[] = Object.entries(cells)
      .filter(([, state]) => state !== 'inherit')
      .map(([key, state]) => {
        const [resource, action] = key.split(':');
        return { resource, action, effect: state as 'allow' | 'deny', reason };
      });

    const res = await fetch(`/api/admin/users/${account.id}/access`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          email: account.email,
          first_name: account.first_name,
          last_name: account.last_name,
          is_active: account.is_active,
          is_staff: account.is_staff,
          is_superuser: account.is_superuser,
        },
        profile,
        overrides,
      }),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(String(body?.error || body?.detail || 'Could not save.'));
      return;
    }
    setSaved(true);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-10">
      {/* ---------------------------------------------------------- account */}
      <DetailSection title="Account">
        <DetailRow label="Username">{account.username}</DetailRow>
        <DetailRow label="Last signed in">
          {account.last_login
            ? new Date(account.last_login).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
            : <span className="font-normal text-muted-foreground">Never</span>}
        </DetailRow>
      </DetailSection>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First name</Label>
          <Input
            id="first_name"
            className="h-12"
            value={account.first_name}
            disabled={!canEdit}
            onChange={(e) => setAccount({ ...account, first_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last name</Label>
          <Input
            id="last_name"
            className="h-12"
            value={account.last_name}
            disabled={!canEdit}
            onChange={(e) => setAccount({ ...account, last_name: e.target.value })}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="h-12"
            value={account.email}
            disabled={!canEdit}
            onChange={(e) => setAccount({ ...account, email: e.target.value })}
          />
        </div>

        <div className="flex flex-wrap gap-6 sm:col-span-2">
          {(
            [
              ['is_active', 'Account active'],
              ['is_staff', 'Can sign in to the dashboard'],
              ['is_superuser', 'Superuser'],
            ] as const
          ).map(([flag, label]) => (
            <label key={flag} className="flex items-center gap-2 text-sm font-medium" htmlFor={flag}>
              <Checkbox
                id={flag}
                checked={account[flag]}
                disabled={!canEdit}
                onCheckedChange={(c) => setAccount({ ...account, [flag]: c === true })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {account.is_superuser ? (
        <p className="flex items-start gap-2 rounded-lg bg-accent/10 px-4 py-3 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
          <span>
            A superuser bypasses every rule below — role, country and exceptions all stop applying.
            Grant it sparingly.
          </span>
        </p>
      ) : null}

      {/* ------------------------------------------------------------- role */}
      <div className="space-y-5 border-t pt-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Role and scope</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The role sets the default. The country decides which records they see, not which screens.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={profile.role}
              disabled={!canEdit}
              onValueChange={(v) => setProfile({ ...profile, role: v })}
            >
              <SelectTrigger id="role" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {access.options.roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={profile.country || '__all__'}
              disabled={!canEdit}
              onValueChange={(v) => setProfile({ ...profile, country: v === '__all__' ? '' : v })}
            >
              <SelectTrigger id="country" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All countries</SelectItem>
                {access.options.countries
                  .filter((c) => c.value)
                  .map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A country-scoped person sees their own country plus records not yet assigned to one.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              className="h-12"
              value={profile.position}
              disabled={!canEdit}
              onChange={(e) => setProfile({ ...profile, position: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              className="h-12"
              value={profile.department}
              disabled={!canEdit}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              className="h-12"
              value={profile.phone}
              disabled={!canEdit}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------- matrix */}
      <div className="space-y-5 border-t pt-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">What they can reach</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Click a cell to cycle: inherit from the role, allow, deny.
            </p>
          </div>
          {exceptionCount ? (
            <Badge variant="accent">
              {exceptionCount} {exceptionCount === 1 ? 'exception' : 'exceptions'}
            </Badge>
          ) : (
            <Badge variant="muted">No exceptions</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CellChip state="inherit" granted /> Inherited, allowed
          </span>
          <span className="flex items-center gap-1.5">
            <CellChip state="inherit" granted={false} /> Inherited, not allowed
          </span>
          <span className="flex items-center gap-1.5">
            <CellChip state="allow" granted /> Explicitly allowed
          </span>
          <span className="flex items-center gap-1.5">
            <CellChip state="deny" granted={false} /> Explicitly denied
          </span>
        </div>

        {access.bypasses_policy ? (
          <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
            This account is a superuser, so the matrix does not apply. Remove superuser to use it.
          </p>
        ) : null}

        <div className="space-y-6">
          {access.matrix.map((group) => (
            <div key={group.group} className="overflow-x-auto">
              <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.group}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-normal text-muted-foreground">Area</th>
                    {access.options.actions.map((a) => (
                      <th key={a} className="w-20 pb-2 text-center font-normal text-muted-foreground">
                        {ACTION_LABEL[a] ?? a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.resources.map((resource) => (
                    <tr key={resource.key} className="border-b border-border/70 last:border-0">
                      <td className="py-2.5 pr-3">{resource.label}</td>
                      {access.options.actions.map((action) => {
                        const key = `${resource.key}:${action}`;
                        const state = cells[key] ?? 'inherit';
                        const granted =
                          state === 'allow' ? true : state === 'deny' ? false : Boolean(roleGrants[key]);
                        return (
                          <td key={action} className="py-2.5 text-center">
                            <button
                              type="button"
                              disabled={!canEdit || access.bypasses_policy}
                              onClick={() => cycle(key)}
                              aria-label={`${ACTION_LABEL[action] ?? action} ${resource.label}: ${state}`}
                              className="disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <CellChip state={state} granted={granted} />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {exceptionCount && canEdit ? (
          <div className="space-y-2">
            <Label htmlFor="reason">Why these exceptions exist</Label>
            <Textarea
              id="reason"
              rows={2}
              value={reason}
              placeholder="e.g. Covering the finance role while the post is vacant"
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Recorded against every exception saved now. Worth writing down — the next person to
              read this will want to know.
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-0">
          {saved ? (
            <p className="text-sm font-medium text-green-700">Saved.</p>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            {canEdit ? (
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {saving ? 'Saving…' : 'Save access'}
              </Button>
            ) : editHref ? (
              // Read-only because this is the record, not the form. The way in
              // belongs here as well as at the top: on a screen this long the
              // header button is far off-screen by the time anyone wonders why
              // nothing can be typed.
              <Button asChild>
                <Link href={editHref}>
                  <Pencil /> Edit access
                </Link>
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Only a superuser can change access.</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

/** The tri-state cell: what it is now, and whether it results in access. */
function CellChip({ state, granted }: { state: Cell; granted: boolean }) {
  const base = 'inline-flex h-7 w-7 items-center justify-center rounded-md border transition-colors';

  if (state === 'allow') {
    return (
      <span className={`${base} border-green-300 bg-green-100 text-green-800`}>
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (state === 'deny') {
    return (
      <span className={`${base} border-red-300 bg-red-100 text-red-800`}>
        <X className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span
      className={`${base} border-dashed ${
        granted ? 'border-border text-muted-foreground' : 'border-border text-muted-foreground/50'
      }`}
    >
      {granted ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
    </span>
  );
}
