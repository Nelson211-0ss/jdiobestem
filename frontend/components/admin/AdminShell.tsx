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
  children,
}: {
  identity: Identity;
  boardIndex: BoardIndex;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  // Starts expanded and is corrected on mount from what this person chose last
  // time. Reading storage during render would make the server and the client
  // disagree about the first paint.
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  // Below `lg` the nav is a drawer that is either open or shut, so collapsing
  // does not apply there — a rail of icons inside a full-width drawer would be
  // the worst of both.
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(NAV_KEY) === 'collapsed');
    } catch {
      // A browser refusing storage is not a reason to fail to draw the nav.
    }

    const query = window.matchMedia(DESKTOP);
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const railCollapsed = collapsed && isDesktop;

  const toggleRail = () => {
    setCollapsed((was) => {
      const next = !was;
      try {
        window.localStorage.setItem(NAV_KEY, next ? 'collapsed' : 'expanded');
      } catch {
        // Preference is lost on reload; the dashboard still works.
      }
      return next;
    });
  };

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
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-40 bg-background">
        <div className="flex h-16 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? <X /> : <Menu />}
          </Button>

          <Link
            href="/admin"
            aria-label="Jdiobe STEM Foundation dashboard"
            className="shrink-0"
          >
            {/* Collapsed, the rail is too narrow for the wordmark, so the mark
                stands in for it — still the Foundation's, still a link home. */}
            <span
              className={cn(
                'hidden lg:block',
                // Matches the rail beneath it, so the mark sits over the icons
                // rather than floating above the middle of nothing.
                railCollapsed ? 'lg:w-8' : 'lg:w-56'
              )}
            >
              {railCollapsed ? (
                <LogoMark className="h-8 w-auto" />
              ) : (
                <Logo className="h-7 w-auto text-foreground" />
              )}
            </span>
            <Logo className="h-7 w-auto text-foreground lg:hidden" />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="hidden shrink-0 lg:inline-flex"
            aria-label={railCollapsed ? 'Expand the menu' : 'Collapse the menu'}
            aria-pressed={railCollapsed}
            title={railCollapsed ? 'Expand the menu' : 'Collapse the menu'}
            onClick={toggleRail}
          >
            {railCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>

          <div className="min-w-0 flex-1">
            <HeaderSearch />
          </div>

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
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
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

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-16 left-0 z-30 w-64 bg-background transition-all lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
            navOpen ? 'translate-x-0' : '-translate-x-full',
            // Narrow only from `lg` up. On a phone the nav is a drawer that is
            // either open or shut, and a 4rem drawer would be neither.
            railCollapsed && 'lg:w-16'
          )}
        >
          <Sidebar
            permissions={identity.permissions}
            boardIndex={boardIndex}
            collapsed={railCollapsed}
            onExpand={() => setCollapsed(false)}
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

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
