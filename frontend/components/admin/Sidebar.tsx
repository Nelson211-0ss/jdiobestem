'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

import { cn } from '@/lib/utils';
import { GROUP_ORDER, RESOURCES, type Resource } from '@/lib/admin/resources';
import type { BoardIndex } from '@/lib/admin/boards';

/**
 * Navigation, built from the resource registry and the operations boards,
 * filtered by what this person may see. A group with nothing visible in it is
 * not drawn at all, so a finance user is never shown an empty "Programmes"
 * heading.
 *
 * The boards are grouped behind expandable rows rather than listed flat —
 * forty-nine of them in one column would bury the rest of the dashboard. The
 * group holding the current page opens itself, so a board is never one click
 * from the nav but invisible in it.
 */

const iconFor = (name: string) => {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  return Icon ?? Icons.Circle;
};

/** Which icon each board category gets, matching its meaning. */
const CATEGORY_ICON: Record<string, string> = {
  Fundraising: 'HeartHandshake',
  Finance: 'Wallet',
  Programmes: 'Rocket',
  'People & HR': 'Users',
  'Governance & compliance': 'ShieldCheck',
  'Marketing & events': 'Megaphone',
  Operations: 'Settings2',
};

/** Icon for a nested resource group, keyed by its `parent` name. */
const PARENT_ICON: Record<string, string> = {
  Newsletter: 'Mail',
  Documents: 'FileStack',
  Hiring: 'Briefcase',
  'Countries & offices': 'Globe',
  Volunteers: 'HeartHandshake',
  Scholarships: 'GraduationCap',
};

/** Where each board category sits among the existing sections. */
const CATEGORY_SECTION: Record<string, Resource['group'] | 'Operations'> = {
  Fundraising: 'Giving',
  Finance: 'Giving',
  Programmes: 'Programmes',
  'People & HR': 'Operations',
  'Governance & compliance': 'Operations',
  'Marketing & events': 'Website',
  Operations: 'Operations',
};

const SECTION_ORDER: (Resource['group'] | 'Operations')[] = [
  'Inbox',
  'Giving',
  'Programmes',
  'Website',
  'Operations',
  'Access',
];

export default function Sidebar({
  permissions,
  boardIndex,
  onNavigate,
  collapsed = false,
  onExpand,
}: {
  permissions: Record<string, string[]>;
  boardIndex: BoardIndex;
  onNavigate?: () => void;
  /** Icons only, no labels. */
  collapsed?: boolean;
  /** Ask the shell to open the rail again — a group cannot show its children in it. */
  onExpand?: () => void;
}) {
  const pathname = usePathname();
  const visible = RESOURCES.filter((r) => permissions[r.key]?.includes('view'));
  const canSeeBoards = Boolean(permissions.boards?.includes('view'));

  const isCurrent = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  /** The board category containing the page currently open, if any. */
  const currentCategory = boardIndex.categories.find((c) =>
    c.boards.some((b) => pathname.startsWith(`/admin/operations/${b.monday_id}`))
  )?.name;

  /** The parent group holding the page currently open, if any. */
  const currentParent = visible.find(
    (r) => r.parent && pathname.startsWith(`/admin/${r.key}`)
  )?.parent;

  const [open, setOpen] = useState<string | null>(currentCategory ?? currentParent ?? null);

  // Following a link into a group should leave it open behind you.
  useEffect(() => {
    if (currentCategory) setOpen(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    if (currentParent) setOpen(currentParent);
  }, [currentParent]);

  const itemClass = (current: boolean) =>
    cn(
      'flex items-center rounded-md text-sm transition-colors',
      // Collapsed, the icon is the whole control, so it is centred in a square
      // rather than left-aligned with a gap where the label used to be.
      collapsed ? 'h-10 w-10 justify-center' : 'gap-3 px-3 py-2',
      current
        ? 'bg-secondary font-semibold text-secondary-foreground'
        : 'font-medium text-foreground hover:bg-muted'
    );

  const iconClass = (current: boolean) =>
    cn('h-4 w-4 shrink-0', current ? 'text-foreground' : 'text-muted-foreground');

  const Overview = iconFor('LayoutDashboard');

  /**
   * What belongs to one section: the resources shown on their own, the ones
   * gathered under a named parent, and the board categories.
   */
  const sectionContent = (section: (typeof SECTION_ORDER)[number]) => {
    const inSection = visible.filter((r) => (r.group as string) === section);

    const parents: {
      name: string;
      children: Resource[];
      boards?: BoardIndex['categories'][number]['boards'];
    }[] = [];
    for (const r of inSection.filter((r) => r.parent)) {
      const existing = parents.find((p) => p.name === r.parent);
      if (existing) existing.children.push(r);
      else parents.push({ name: r.parent as string, children: [r] });
    }

    const categories = canSeeBoards
      ? boardIndex.categories.filter((c) => CATEGORY_SECTION[c.name] === section)
      : [];

    // Where a parent and a board category share a name, they are one thing to
    // the person reading the nav: the boards are folded into that parent's
    // children rather than drawn as a second row with the same label.
    const merged = new Set<string>();
    for (const parent of parents) {
      const match = categories.find((c) => c.name === parent.name);
      if (match) {
        parent.boards = match.boards;
        merged.add(match.name);
      }
    }

    return {
      resources: inSection.filter((r) => !r.parent),
      parents,
      categories: categories.filter((c) => !merged.has(c.name)),
    };
  };


  return (
    <nav
      className={cn(
        'flex h-full flex-col overflow-y-auto overflow-x-hidden',
        collapsed ? 'items-center gap-3 p-2' : 'gap-5 p-4'
      )}
    >
      <Link
        href="/admin"
        onClick={onNavigate}
        title={collapsed ? 'Overview' : undefined}
        aria-label={collapsed ? 'Overview' : undefined}
        className={itemClass(isCurrent('/admin'))}
      >
        <Overview className={iconClass(isCurrent('/admin'))} />
        {collapsed ? null : 'Overview'}
      </Link>

      {SECTION_ORDER.map((section) => {
        const { resources, parents, categories } = sectionContent(section);
        if (!resources.length && !parents.length && !categories.length) return null;

        return (
          <div key={section} className={collapsed ? 'w-full' : undefined}>
            {collapsed ? (
              <hr className="mx-auto mb-2 w-6 border-t border-border" aria-hidden="true" />
            ) : (
              <p className="px-3 pb-1.5 text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
                {section}
              </p>
            )}

            <div className={cn('space-y-0.5', collapsed && 'flex flex-col items-center')}>
              {resources.map((r) => {
                const Icon = iconFor(r.icon);
                const href = `/admin/${r.key}`;
                const current = isCurrent(href);
                return (
                  <Link
                    key={r.key}
                    href={href}
                    onClick={onNavigate}
                    title={collapsed ? r.label : undefined}
                    aria-label={collapsed ? r.label : undefined}
                    className={itemClass(current)}
                  >
                    <Icon className={iconClass(current)} />
                    {collapsed ? null : <span className="truncate">{r.label}</span>}
                  </Link>
                );
              })}

              {parents.map((parent) => {
                const Icon = iconFor(PARENT_ICON[parent.name] ?? 'Folder');
                const expanded = open === parent.name;
                const holdsCurrent = parent.name === currentParent;

                return (
                  <div key={parent.name}>
                    <button
                      type="button"
                      aria-expanded={collapsed ? false : expanded}
                      title={collapsed ? parent.name : undefined}
                      aria-label={collapsed ? parent.name : undefined}
                      onClick={() => {
                        if (collapsed) {
                          onExpand?.();
                          setOpen(parent.name);
                          return;
                        }
                        setOpen(expanded ? null : parent.name);
                      }}
                      className={cn(itemClass(holdsCurrent && !expanded), !collapsed && 'w-full text-left')}
                    >
                      <Icon className={iconClass(holdsCurrent)} />
                      {collapsed ? null : (
                        <>
                          <span className="flex-1 truncate">{parent.name}</span>
                          <Icons.ChevronDown
                            className={cn(
                              'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                              expanded && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </button>

                    {expanded && !collapsed ? (
                      <div className="ml-5 mt-0.5 space-y-0.5 border-l pl-3">
                        {(parent.boards ?? []).map((board) => {
                          const href = `/admin/operations/${board.monday_id}`;
                          const current = pathname.startsWith(href);
                          return (
                            <Link
                              key={board.monday_id}
                              href={href}
                              onClick={onNavigate}
                              title={board.name}
                              className={cn(
                                'flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                                current
                                  ? 'bg-secondary font-semibold text-secondary-foreground'
                                  : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span className="truncate">{board.name}</span>
                            </Link>
                          );
                        })}
                        {parent.children.map((child) => {
                          const href = `/admin/${child.key}`;
                          const current = isCurrent(href);
                          return (
                            <Link
                              key={child.key}
                              href={href}
                              onClick={onNavigate}
                              className={cn(
                                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                                current
                                  ? 'bg-secondary font-semibold text-secondary-foreground'
                                  : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {categories.map((category) => {
                const Icon = iconFor(CATEGORY_ICON[category.name] ?? 'LayoutGrid');
                const expanded = open === category.name;
                const holdsCurrent = category.name === currentCategory;

                return (
                  <div key={category.name}>
                    <button
                      type="button"
                      aria-expanded={collapsed ? false : expanded}
                      title={collapsed ? `${category.name} (${category.boards.length})` : undefined}
                      aria-label={collapsed ? category.name : undefined}
                      onClick={() => {
                        if (collapsed) {
                          onExpand?.();
                          setOpen(category.name);
                          return;
                        }
                        setOpen(expanded ? null : category.name);
                      }}
                      className={cn(itemClass(holdsCurrent && !expanded), !collapsed && 'w-full text-left')}
                    >
                      <Icon className={iconClass(holdsCurrent)} />
                      {collapsed ? null : (
                        <>
                          <span className="flex-1 truncate">{category.name}</span>
                          <span className="text-xs tabular text-muted-foreground">
                            {category.boards.length}
                          </span>
                          <Icons.ChevronDown
                            className={cn(
                              'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                              expanded && 'rotate-180'
                            )}
                          />
                        </>
                      )}
                    </button>

                    {expanded && !collapsed ? (
                      // The rule down the left is what ties the children to
                      // their parent, as in the reference.
                      <div className="ml-5 mt-0.5 space-y-0.5 border-l pl-3">
                        {category.boards.map((board) => {
                          const href = `/admin/operations/${board.monday_id}`;
                          const current = pathname.startsWith(href);
                          return (
                            <Link
                              key={board.monday_id}
                              href={href}
                              onClick={onNavigate}
                              title={board.name}
                              className={cn(
                                'flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                                current
                                  ? 'bg-secondary font-semibold text-secondary-foreground'
                                  : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span className="truncate">{board.name}</span>
                              {board.item_count ? (
                                <span className="shrink-0 text-xs tabular text-muted-foreground">
                                  {board.item_count}
                                </span>
                              ) : null}
                            </Link>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

    </nav>
  );
}
