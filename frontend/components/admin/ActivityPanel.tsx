'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * What is waiting, and what has just happened — in one panel off the header.
 *
 * The queues used to be three cards at the top of the overview, which is the
 * one screen somebody opens to read figures rather than to be told there is
 * post. They belong where a person looks when they want to know what needs
 * them, which is a bell, not a dashboard.
 *
 * The log arrives with them. "Three volunteers waiting" and "Nelson changed a
 * bursary an hour ago" are the same question asked twice — what has happened
 * that I have not seen — so they are one list with a filter across the top.
 */

export type Queue = { key: string; label: string; count: number; href: string };
export type Entry = {
  id: number | string;
  when: string;
  who: string;
  what: string;
  where: string;
  href?: string;
};

const FILTERS = ['All', 'Waiting', 'Log'] as const;
type Filter = (typeof FILTERS)[number];

function ago(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ActivityPanel({
  queues,
  entries,
}: {
  queues: Queue[];
  entries: Entry[];
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>('All');
  const waiting = queues.reduce((n, q) => n + q.count, 0);

  // Escape closes it, as it does every other overlay in the dashboard.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const showQueues = filter !== 'Log' && queues.length > 0;
  const showLog = filter !== 'Waiting' && entries.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={waiting ? `Activity — ${waiting} waiting` : 'Activity'}
        title="Activity"
        className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-[1.1rem] w-[1.1rem]" />
        {waiting > 0 ? (
          // A count, not a dot: three waiting and thirty waiting are different
          // days, and the dot said the same thing for both.
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-accent-foreground">
            {waiting > 99 ? '99+' : waiting}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close activity"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          />

          <aside
            role="dialog"
            aria-label="Activity"
            className="admin-ground fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border/40 shadow-2xl"
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <h2 className="text-lg font-bold tracking-tight">Activity</h2>
              {waiting > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {waiting} waiting
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 px-5 pb-4">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
              {showQueues ? (
                <div className="space-y-2">
                  {queues.map((q) => (
                    <Link
                      key={q.key}
                      href={q.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 transition-colors hover:bg-muted"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{q.label}</span>
                      <span
                        className={cn(
                          'tabular text-sm font-bold',
                          q.count ? 'text-accent-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {q.count}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}

              {showQueues && showLog ? <div className="h-5" /> : null}

              {showLog ? (
                <ul className="space-y-1">
                  {entries.map((e) => {
                    const row = (
                      <>
                        <p className="text-xs text-muted-foreground">{ago(e.when)}</p>
                        <p className="mt-0.5 text-sm font-semibold">{e.what}</p>
                        <p className="text-sm text-muted-foreground">
                          {e.where}
                          {e.who ? ` · ${e.who}` : ''}
                        </p>
                      </>
                    );
                    return (
                      <li key={e.id}>
                        {e.href ? (
                          <Link
                            href={e.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-4 py-3 transition-colors hover:bg-card"
                          >
                            {row}
                          </Link>
                        ) : (
                          <div className="px-4 py-3">{row}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {!showQueues && !showLog ? (
                <p className="px-1 py-10 text-center text-sm text-muted-foreground">
                  Nothing here.
                </p>
              ) : null}
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}
