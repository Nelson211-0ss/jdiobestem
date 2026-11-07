'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type NewAccountOptions = {
  roles: { value: string; label: string }[];
  countries: { value: string; label: string }[];
  /** Colleagues on the team list who do not have an account yet. */
  team_members: { value: number; label: string; email: string; role: string }[];
  email_domain: string;
};

const ALPHABET = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Same generator as the password card: no 0/O or 1/l to misread aloud. */
function suggest(length = 20) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

const NONE = '__none__';
const ALL = '__all__';

/**
 * Who they are, what they may do, and how they get in — in one form.
 *
 * Choosing a team member fills the name and email from their record, which is
 * where both are already kept; they can still be corrected here.
 */
export default function NewAccountForm({
  options,
  memberId = '',
}: {
  options: NewAccountOptions;
  memberId?: string;
}) {
  const router = useRouter();
  const preset = options.team_members.find((m) => String(m.value) === memberId);
  const split = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
  };

  const [member, setMember] = useState(preset ? String(preset.value) : NONE);
  const [firstName, setFirstName] = useState(preset ? split(preset.label).first : '');
  const [lastName, setLastName] = useState(preset ? split(preset.label).last : '');
  const [email, setEmail] = useState(preset?.email ?? '');
  const [role, setRole] = useState('viewer');
  const [country, setCountry] = useState(ALL);
  const [position, setPosition] = useState(preset?.role ?? '');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const domain = options.email_domain;
  const emailHint = useMemo(
    () => (email && !email.toLowerCase().endsWith(`@${domain}`) ? `Must be an @${domain} address.` : ''),
    [email, domain]
  );

  const pickMember = (value: string) => {
    setMember(value);
    const m = options.team_members.find((t) => String(t.value) === value);
    if (!m) return;
    const { first, last } = split(m.label);
    setFirstName(first);
    setLastName(last);
    if (m.email) setEmail(m.email);
    if (m.role) setPosition(m.role);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await fetch('/api/admin/staff-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          role,
          country: country === ALL ? '' : country,
          position,
          team_member: member === NONE ? null : Number(member),
          password,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const next: Record<string, string> = {};
        for (const [key, value] of Object.entries(body ?? {})) {
          next[key] = Array.isArray(value) ? String(value[0]) : String(value);
        }
        if (!Object.keys(next).length) next.detail = 'Could not create the account.';
        setErrors(next);
        return;
      }
      router.push(`/admin/users/${body.id}`);
      router.refresh();
    } catch {
      setErrors({ detail: 'Could not create the account.' });
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (name: string) =>
    errors[name] ? (
      <p role="alert" className="text-sm font-medium text-destructive">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="team-member">Team member</Label>
          <Select value={member} onValueChange={pickMember}>
            <SelectTrigger id="team-member" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Not on the team list</SelectItem>
              {options.team_members.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                  {m.role ? ` — ${m.role}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Links the account to their team record, so their photo and name follow them. Only
            colleagues without an account are listed.
          </p>
          {fieldError('team_member')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="first-name">First name</Label>
          <Input
            id="first-name"
            className="h-12"
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)}
          />
          {fieldError('first_name')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last name</Label>
          <Input id="last-name" className="h-12" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            type="email"
            className="h-12"
            value={email}
            required
            placeholder={`name@${domain}`}
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            What they sign in with. Their username is made from it.
          </p>
          {emailHint && !errors.email ? (
            <p className="text-sm text-destructive">{emailHint}</p>
          ) : null}
          {fieldError('email')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.roles.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Sets what they can open. Exceptions for one person are added on their page afterwards.
          </p>
          {fieldError('role')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country" className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All countries</SelectItem>
              {options.countries
                .filter((c) => c.value)
                .map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Which country&apos;s records they see.</p>
          {fieldError('country')}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="position">Position</Label>
          <Input id="position" className="h-12" value={position} onChange={(e) => setPosition(e.target.value)} />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="password">First password (optional)</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="password"
              className="h-12 min-w-[16rem] flex-1 font-mono"
              value={password}
              autoComplete="new-password"
              placeholder="Leave blank to set it later"
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="button" variant="outline" className="h-12" onClick={() => setPassword(suggest())}>
              Suggest one
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Give it to them directly and ask them to change it once they are in. It is stored only as
            a hash and cannot be shown again. Without one, they cannot sign in until it is set.
          </p>
          {fieldError('password')}
        </div>
      </div>

      {errors.detail || errors.error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {errors.detail || errors.error}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <UserPlus />}
          {busy ? 'Creating…' : 'Create account'}
        </Button>
      </div>
    </form>
  );
}
