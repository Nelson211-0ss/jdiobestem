'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Logo from '@/components/Logo';
import LogoMark from '@/components/LogoMark';
import HeaderSearch from './HeaderSearch';
import ActivityPanel, { type Entry, type Queue } from './ActivityPanel';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';
import type { Identity } from '@/lib/admin/api';
import type { BoardIndex } from '@/lib/admin/boards';

/** Where the rail's state is remembered between visits. */
const NAV_KEY = 'jdiobe-admin-nav';

/** Tailwind's `lg`, the width at which the nav stops being a drawer. */
const DESKTOP = '(min-width: 1024px)';

/** The frame: header, navigation, and the sign-out control. */
export default function AdminShell({
  identity,
  boardIndex,
  queues = [],
  entries = [],
  children,
}: {
  identity: Identity;
  boardIndex: BoardIndex;
  queues?: Queue[];
  entries?: Entry[];
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  // The rail used to collapse to a strip of icons. It no longer does: the
  // control for it was one more thing in a header meant to be quiet, and a nav
  // whose labels disappear is a nav somebody has to learn by shape.
  const router = useRouter();

  const initials =
    (identity.name || identity.username)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const signOut = async () => {
    setSigningOut(true);
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <div className="admin-ground flex min-h-screen">
        {/* Wider than before: the items sit further in and still have room for
            their labels, and the wordmark at the top needs the width. */}
        <aside
          className={cn(
            'admin-ground fixed bottom-0 left-0 top-16 z-30 w-80 transition-transform lg:static lg:top-0 lg:z-auto lg:translate-x-0 lg:border-r lg:border-border/40',
            navOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <Sidebar
            permissions={identity.permissions}
            boardIndex={boardIndex}
            onNavigate={() => setNavOpen(false)}
          />
        </aside>
        {navOpen ? (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setNavOpen(false)}
          />
        ) : null}

      {/* The header sits beside the rail rather than over it, so the wordmark
          at the top of the nav is level with the search rather than below it. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="admin-ground sticky top-0 z-40">
        {/* Indented to the same rhythm as the nav beneath it and the page
                beside it, so the wordmark, the first nav label and the card's
                edge all start from one line — and the account never sits
                against the window. */}
          <div className="flex items-center gap-3 px-5 pb-5 pt-5 sm:px-6 sm:pr-8 lg:px-8 lg:pb-6 lg:pr-12 lg:pt-9 xl:pr-16">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? <X /> : <Menu />}
          </Button>

          {/* The wordmark lives at the top of the nav now, over the items it
              belongs to. Only the phone keeps one here, where there is no nav
              on screen to put it in. */}
          <Link
            href="/admin"
            aria-label="Jdiobe STEM Foundation dashboard"
            className="shrink-0 lg:hidden"
          >
            <Logo className="h-7 w-auto text-foreground" />
          </Link>

          <div className="min-w-0 flex-1">
            <HeaderSearch />
          </div>

          <ActivityPanel queues={queues} entries={entries} />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 transition-colors hover:bg-muted"
              >
                {identity.avatar ? (
                  // Their own photograph from the team page. Initials only when
                  // there is none, so the fallback is never a broken image.
                  <img
                    src={identity.avatar}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
                  >
                    {initials}
                  </span>
                )}
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-medium leading-tight">{identity.name}</span>
                  <span className="block text-xs leading-tight text-muted-foreground">
                    {identity.role_display}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold">{identity.name}</p>
                <p className="text-xs text-muted-foreground">{identity.email || identity.username}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                <p>{identity.role_display}</p>
                <p>{identity.country_label}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/account">
                  <UserRound />
                  Your account and password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={signOut} disabled={signingOut}>
                <LogOut />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
          <main className="min-w-0 flex-1 p-4 pr-5 sm:p-6 sm:pr-8 lg:p-8 lg:pr-12 xl:pr-16">
            {children}
          </main>
      </div>
    </div>
  );
}
