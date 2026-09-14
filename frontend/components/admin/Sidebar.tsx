'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';

import Logo from '@/components/Logo';
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
  'Compliance & offices': 'ShieldCheck',
  'Marketing & events': 'Megaphone',
  Operations: 'Settings2',
};

/** Icon for a nested resource group, keyed by its `parent` path. */
const PARENT_ICON: Record<string, string> = {
  Website: 'LayoutTemplate',
  // Shared with CATEGORY_ICON: this is both a board category and a group
  // holding the countries, offices and rates, drawn as one row.
  'Compliance & offices': 'ShieldCheck',
  // Shared with CATEGORY_ICON: People & HR is both a board category and a
  // group holding the team and what they are paid, drawn as one row.
  'People & HR': 'Users',
  'Website/Newsletter': 'Mail',
  'Website/Hiring': 'Briefcase',
  // Shared with CATEGORY_ICON: Finance is both a board category and a group
  // holding Invoices, and the two are drawn as one row.
  Finance: 'Wallet',
  Newsletter: 'Mail',
  Documents: 'FileStack',
  Hiring: 'Briefcase',
  Volunteers: 'HeartHandshake',
  Scholarships: 'GraduationCap',
};

/** Where each board category sits among the existing sections. */
const CATEGORY_SECTION: Record<string, Resource['group'] | 'Operations'> = {
  Fundraising: 'Giving',
  Finance: 'Giving',
  Programmes: 'Programmes',
  'People & HR': 'Operations',
  'Compliance & offices': 'Operations',
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

/** One expandable row: the resources under it, and any groups nested inside. */
type Group = {
  name: string;
  /** The full `parent` path, which is what the open state is keyed on. */
  path: string;
  children: Resource[];
  groups: Group[];
  boards?: BoardIndex['categories'][number]['boards'];
};

export default function Sidebar({
  permissions,
  boardIndex,
  onNavigate,
}: {
  permissions: Record<string, string[]>;
  boardIndex: BoardIndex;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // `unlisted` resources are reachable but not navigated to: see the note on
  // the field. They are filtered here rather than at each use, so nothing
  // downstream — the groups, the board merge, the current-page chain — has to
  // know the concept exists.
  const visible = RESOURCES.filter(
    (r) => !r.unlisted && permissions[r.key]?.includes('view')
  );
  const canSeeBoards = Boolean(permissions.boards?.includes('view'));

  const isCurrent = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  /** The board category containing the page currently open, if any. */
  const currentCategory = boardIndex.categories.find((c) =>
    c.boards.some((b) =>
      pathname.startsWith(`/admin/operations/${b.slug || b.monday_id}`)
    )
  )?.name;

  /** The parent path holding the page currently open, if any. */
  const currentParent = visible.find(
    (r) => r.parent && pathname.startsWith(`/admin/${r.key}`)
  )?.parent;

  /** A path and everything above it: opening `Website/Newsletter` has to open
   *  `Website` too, or the row it sits in is shut. */
  const chain = (path?: string) =>
    path ? path.split('/').map((_, i, all) => all.slice(0, i + 1).join('/')) : [];

  const [open, setOpen] = useState<Set<string>>(
    () => new Set([...chain(currentParent), ...(currentCategory ? [currentCategory] : [])])
  );
  const isOpen = (path: string) => open.has(path);
  const toggle = (path: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Shutting a group shuts what is inside it, so reopening does not
        // spring back to a state the reader had already put away.
        for (const p of next) if (p === path || p.startsWith(`${path}/`)) next.delete(p);
      } else {
        for (const p of chain(path)) next.add(p);
      }
      return next;
    });

  // Following a link into a group should leave it open behind you.
  useEffect(() => {
    if (currentCategory) setOpen((prev) => new Set(prev).add(currentCategory));
  }, [currentCategory]);

  useEffect(() => {
    if (currentParent) setOpen((prev) => new Set([...prev, ...chain(currentParent)]));
    // `chain` is a pure read of its argument; only the path itself matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentParent]);

  const itemClass = (current: boolean) =>
    cn(
      'flex items-center rounded-md text-sm transition-colors',
      // Collapsed, the icon is the whole control, so it is centred in a square
      // rather than left-aligned with a gap where the label used to be.
      'gap-3 px-3.5 py-2.5',
      current
        ? 'bg-secondary font-semibold text-secondary-foreground'
        : 'font-medium text-foreground hover:bg-muted'
    );

  const iconClass = (current: boolean) =>
    cn('h-4 w-4 shrink-0', current ? 'text-foreground' : 'text-muted-foreground');

  const Overview = iconFor('LayoutDashboard');

  /**
   * What belongs to one section: the resources shown on their own, the tree of
   * named groups, and the board categories.
   *
   * A group's `parent` may be a path, so the tree is built by walking the
   * segments rather than matching one name. Two levels is the limit — the
   * website group holds the newsletter pair and the hiring pair, and anything
   * deeper is a nav nobody can find their way around.
   */
  const sectionContent = (section: (typeof SECTION_ORDER)[number]) => {
    const inSection = visible.filter((r) => (r.group as string) === section);

    const parents: Group[] = [];
    const nodeAt = (path: string): Group => {
      let siblings = parents;
      let node!: Group;
      let walked = '';
      for (const name of path.split('/')) {
        walked = walked ? `${walked}/${name}` : name;
        const here = walked;
        let found = siblings.find((g) => g.name === name);
        if (!found) {
          found = { name, path: here, children: [], groups: [] };
          siblings.push(found);
        }
        node = found;
        siblings = found.groups;
      }
      return node;
    };
    for (const r of inSection.filter((r) => r.parent)) nodeAt(r.parent as string).children.push(r);

    const categories = canSeeBoards
      ? boardIndex.categories.filter((c) => CATEGORY_SECTION[c.name] === section)
      : [];

    // Where a top-level group and a board category share a name, they are one
    // thing to the person reading the nav: the boards are folded into that
    // group's children rather than drawn as a second row with the same label.
    const merged = new Set<string>();
    for (const group of parents) {
      const match = categories.find((c) => c.name === group.name);
      if (match) {
        group.boards = match.boards;
        merged.add(match.name);
      }
    }

    return {
      resources: inSection.filter((r) => !r.parent),
      parents,
      categories: categories.filter((c) => !merged.has(c.name)),
    };
  };

  /**
   * One expandable row and what is under it.
   *
   * Written as a function rather than inline so a nested group renders by the
   * same rules as a top-level one — only the indent changes, and the rule down
   * the left is what ties children to the row they belong to.
   */
  const renderGroup = (group: Group, depth = 0): React.ReactNode => {
    const Icon = iconFor(PARENT_ICON[group.path] ?? PARENT_ICON[group.name] ?? 'Folder');
    const expanded = isOpen(group.path);
    const holdsCurrent = Boolean(currentParent && (currentParent === group.path ||
      currentParent.startsWith(`${group.path}/`)));
    const nested = depth > 0;

    const childClass = (current: boolean) =>
      cn(
        'flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
        current
          ? 'bg-secondary font-semibold text-secondary-foreground'
          : 'text-foreground hover:bg-muted'
      );

    return (
      <div key={group.path}>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => toggle(group.path)}
          className={cn(
            nested
              ? cn(childClass(holdsCurrent && !expanded), 'w-full text-left')
              : cn(itemClass(holdsCurrent && !expanded), 'w-full text-left')
          )}
        >
          {nested ? null : <Icon className={iconClass(holdsCurrent)} />}
          {(
            <>
              <span className="flex-1 truncate">{group.name}</span>
              <Icons.ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                  expanded && 'rotate-180'
                )}
              />
            </>
          )}
        </button>

        {expanded ? (
          // The rule down the left is what ties the children to their row.
          <div className="ml-5 mt-1.5 space-y-1 border-l border-border/40 pl-3">
            {(group.boards ?? []).map((board) => {
              const href = `/admin/operations/${board.slug || board.monday_id}`;
              return (
                <Link
                  key={board.monday_id}
                  href={href}
                  onClick={onNavigate}
                  title={board.name}
                  className={childClass(pathname.startsWith(href))}
                >
                  <span className="truncate">{board.name}</span>
                </Link>
              );
            })}
            {group.children.map((child) => {
              const href = `/admin/${child.key}`;
              return (
                <Link
                  key={child.key}
                  href={href}
                  onClick={onNavigate}
                  className={childClass(isCurrent(href))}
                >
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
            {group.groups.map((inner) => renderGroup(inner, depth + 1))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <nav
      className={cn(
        'flex h-full flex-col overflow-y-auto overflow-x-hidden',
        // Sticks below the 4rem header while the column behind it stretches
        // to the full page height.
        'lg:sticky lg:top-0 lg:h-screen',
        'gap-1.5 px-11 pb-6 pt-9'
      )}
    >
      {/* The wordmark belongs over the items it names, level with the search
          beside it. Hidden below `lg`, where the header carries one instead —
          there is no rail on screen to put it in. */}
      <Link
        href="/admin"
        onClick={onNavigate}
        aria-label="Jdiobe STEM Foundation dashboard"
        className="mb-8 hidden h-10 shrink-0 items-center px-3.5 lg:flex"
      >
        <Logo className="h-7 w-auto text-foreground" />
      </Link>

      <Link
        href="/admin"
        onClick={onNavigate}
        className={itemClass(isCurrent('/admin'))}
      >
        <Overview className={iconClass(isCurrent('/admin'))} />
        Overview
      </Link>

      {SECTION_ORDER.map((section) => {
        const { resources, parents, categories } = sectionContent(section);
        if (!resources.length && !parents.length && !categories.length) return null;

        return (
          // The section name is still announced, but no longer printed. Six
          // lines of shouting uppercase separated six groups that the space
          // between them already separates — and the groups inside them now
          // say what they hold. Kept in the accessibility tree, because a nav
          // read aloud as one undifferentiated list is worse than one read in
          // sections.
          <section
            key={section}
            aria-label={section}
                      >
            
            <div className={'space-y-1.5'}>
              {resources.map((r) => {
                const Icon = iconFor(r.icon);
                const href = `/admin/${r.key}`;
                const current = isCurrent(href);
                return (
                  <Link
                    key={r.key}
                    href={href}
                    onClick={onNavigate}
                    className={itemClass(current)}
                  >
                    <Icon className={iconClass(current)} />
                    <span className="truncate">{r.label}</span>
                  </Link>
                );
              })}

                {parents.map((group) => renderGroup(group))}

              {categories.map((category) => {
                const Icon = iconFor(CATEGORY_ICON[category.name] ?? 'LayoutGrid');
                const expanded = isOpen(category.name);
                const holdsCurrent = category.name === currentCategory;

                return (
                  <div key={category.name}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => toggle(category.name)}
                      className={cn(itemClass(holdsCurrent && !expanded), 'w-full text-left')}
                    >
                      <Icon className={iconClass(holdsCurrent)} />
                      {(
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

                    {expanded ? (
                      // The rule down the left is what ties the children to
                      // their parent, as in the reference.
                      <div className="ml-5 mt-1.5 space-y-1 border-l border-border/40 pl-3">
                        {category.boards.map((board) => {
                          const href = `/admin/operations/${board.slug || board.monday_id}`;
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
          </section>
        );
      })}

    </nav>
  );
}
