import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import '@/styles/admin.css';
import AdminShell from '@/components/admin/AdminShell';
import type { Entry, Queue } from '@/components/admin/ActivityPanel';
import { api, can, getIdentity, type Page } from '@/lib/admin/api';
import type { BoardIndex } from '@/lib/admin/boards';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s · Jdiobe Dashboard' },
  robots: { index: false, follow: false },
};

/*
 * Sets `data-admin-theme` on <html> before the first paint, so a dark-theme
 * user never sees a white flash while React boots. It has to be inline and
 * blocking for that reason — a module import would run too late.
 *
 * Stored preference wins; with nothing stored we follow the operating system.
 * The script resolves that itself and always writes an explicit light/dark, so
 * admin.css needs only one dark block rather than a `prefers-color-scheme`
 * duplicate of it.
 */
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('jdiobe-admin-theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-admin-theme',d?'dark':'light');}catch(e){document.documentElement.setAttribute('data-admin-theme','light');}})();`;

/**
 * `.admin-shell` is what scopes the shadcn theme. Every token the components
 * use is defined on this class and nowhere else, so none of it can reach the
 * public site.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const identity = await getIdentity();

  // The operations boards live in the navigation now, so they are fetched once
  // per render here rather than by every page that draws the sidebar.
  let boardIndex: BoardIndex = { categories: [] };
  if (identity && can(identity, 'boards', 'view')) {
    boardIndex = await api.get<BoardIndex>('/admin/board-index/').catch(() => ({ categories: [] }));
  }

  // What is waiting, and what has just happened. Fetched here rather than on
  // the overview, because the bell is in the header of every page and a count
  // that is only right on one screen is worse than no count at all.
  let queues: Queue[] = [];
  let entries: Entry[] = [];
  if (identity) {
    const [stats, log] = await Promise.all([
      api.get<{ inbox: Record<string, number> }>('/admin/stats/').catch(() => null),
      can(identity, 'activity', 'view')
        ? api.get<Page<Record<string, unknown>>>('/admin/activity/?page=1').catch(() => null)
        : null,
    ]);

    if (stats?.inbox) {
      queues = (
        [
          ['volunteers', 'Volunteers waiting', stats.inbox.volunteers],
          ['contact-messages', 'Contact messages', stats.inbox.contact],
          ['proposals', 'Science Fair registrations', stats.inbox.proposals],
        ] as const
      )
        .filter(([key]) => can(identity, key, 'view'))
        .map(([key, label, count]) => ({ key, label, count: count ?? 0, href: `/admin/${key}` }));
    }

    entries = (log?.results ?? []).slice(0, 25).map((row) => ({
      id: String(row.id),
      when: String(row.created_at ?? ''),
      who: String(row.actor_name ?? ''),
      what: String(row.action_display ?? 'Changed'),
      where: String(row.object_label ?? row.resource ?? ''),
    }));
  }

  if (!identity) {
    // Reached when the cookie exists but the token was revoked or expired.
    // Middleware catches the no-cookie case before a page ever renders.
    return (
      <>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <div className="admin-shell min-h-screen">{children}</div>
      </>
    );
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      <div className="admin-shell">
          <AdminShell
            identity={identity}
            boardIndex={boardIndex}
            queues={queues}
            entries={entries}
          >
          {children}
        </AdminShell>
      </div>
    </>
  );
}
