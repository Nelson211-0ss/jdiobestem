'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, FileText, ImageOff, Search, X } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatNumber, isMoneyLabel } from '@/lib/format';
import type { Column, Resource } from '@/lib/admin/resources';
import ClickableRow from './ClickableRow';
import FilePreview from './FilePreview';

type Row = Record<string, unknown>;

/**
 * Page numbers with gaps, so forty pages do not become forty buttons.
 * Always shows the first and last, and a window around the current page.
 */
function pageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  let previous = 0;
  for (const n of sorted) {
    if (previous && n - previous > 1) out.push(null);
    out.push(n);
    previous = n;
  }
  return out;
}

function PageButton({
  children,
  label,
  current,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? 'page' : undefined}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        current
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

/** Status pills, coloured by meaning rather than by an arbitrary hash. */
function badgeVariant(value: string): 'default' | 'secondary' | 'accent' | 'destructive' | 'muted' {
  const v = value.toLowerCase();
  if (['new', 'proposed', 'in production'].some((s) => v.includes(s))) return 'accent';
  if (['active', 'succeeded', 'published', 'completed', 'subscribed'].some((s) => v.includes(s)))
    return 'default';
  if (['spam', 'failed', 'refunded', 'ended', 'bounced'].some((s) => v.includes(s))) return 'destructive';
  if (['closed', 'unsubscribed', 'paused'].some((s) => v.includes(s))) return 'muted';
  return 'secondary';
}

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif|svg)(\?|#|$)/i;

function renderCell(row: Row, column: Column) {
  const value = row[column.name];

  if (column.thumb) {
    return <FilePreview url={typeof value === 'string' ? value : ''} />;
  }

  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">&mdash;</span>;
  }
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-foreground" aria-label="Yes" />
    ) : (
      <span className="text-muted-foreground" aria-label="No">
        &mdash;
      </span>
    );
  }
  if (column.date) {
    const d = new Date(String(value));
    return (
      <span className="whitespace-nowrap tabular">
        {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>
    );
  }
  if (column.badge) {
    return <Badge variant={badgeVariant(String(value))}>{String(value)}</Badge>;
  }
  if (column.numeric) {
    // A figure the server already formatted — `amount_display` arrives as
    // "USD 1,500.00" — is not a number and comes back from formatNumber
    // untouched, so it is not mangled into something else.
    return (
      <span className="tabular whitespace-nowrap">
        {formatNumber(value, { money: isMoneyLabel(column.label) })}
      </span>
    );
  }
  return <span>{String(value)}</span>;
}

export default function DataTable({
  resource,
  rows,
  count,
  page,
  pageSize,
}: {
  resource: Resource;
  rows: Row[];
  count: number;
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [term, setTerm] = useState(params.get('search') ?? '');

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // Any change to the query resets paging: page 3 of a different filter is
    // rarely where anyone meant to land.
    if (key !== 'page') next.delete('page');
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  };

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);
  const activeFilters = (resource.filters ?? []).filter((f) => params.get(f.name));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="relative min-w-[15rem] flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setParam('search', term.trim());
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={resource.searchHint ? `Search ${resource.searchHint}` : 'Search'}
            className="pl-9"
            aria-label="Search"
          />
        </form>

        {(resource.filters ?? []).map((filter) => (
          <Select
            key={filter.name}
            value={params.get(filter.name) ?? '__all__'}
            onValueChange={(v) => setParam(filter.name, v === '__all__' ? '' : v)}
          >
            <SelectTrigger className="w-auto min-w-[10rem]">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All {filter.label.toLowerCase()}</SelectItem>
              {(filter.options ?? [])
                .filter((o) => o.value !== '')
                .map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        ))}

        {activeFilters.length || params.get('search') ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startTransition(() => router.push(pathname))}
          >
            <X /> Clear
          </Button>
        ) : null}
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              {resource.columns.map((c) => (
                <TableHead
                  key={c.name}
                  className={cn(c.numeric && 'text-right', c.thumb && 'w-14')}
                >
                  {c.label}
                </TableHead>
              ))}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={resource.columns.length + 1} className="py-12 text-center text-muted-foreground">
                  Nothing here yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const href = `/admin/${resource.key}/${row.id}`;
                return (
                  <ClickableRow key={String(row.id)} href={href}>
                    {resource.columns.map((c) => (
                      <TableCell
                        key={c.name}
                        className={cn(c.numeric && 'text-right', c.thumb && 'w-14 pr-0')}
                      >
                        {renderCell(row, c)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      {/* Kept as a real anchor: the row handles the click, but a
                          link is what a screen reader announces, what
                          cmd-click opens in a tab, and what a crawler follows. */}
                      <Link
                        href={href}
                        className="text-sm font-medium text-accent-foreground underline-offset-4 hover:underline"
                      >
                        Open
                      </Link>
                    </TableCell>
                  </ClickableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted-foreground">
        <p aria-live="polite">
          {count === 0
            ? `No ${resource.singular}s`
            : `Showing ${from} to ${to} of ${count} ${count === 1 ? resource.singular : `${resource.singular}s`}`}
          {pending ? ' · loading…' : ''}
        </p>

        {totalPages > 1 ? (
          <nav className="flex items-center gap-1.5" aria-label="Pagination">
            <PageButton
              label="Previous page"
              disabled={page <= 1}
              onClick={() => setParam('page', String(page - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </PageButton>

            {pageNumbers(page, totalPages).map((n, i) =>
              n === null ? (
                <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                  &hellip;
                </span>
              ) : (
                <PageButton
                  key={n}
                  label={`Page ${n}`}
                  current={n === page}
                  onClick={() => setParam('page', String(n))}
                >
                  {n}
                </PageButton>
              )
            )}

            <PageButton
              label="Next page"
              disabled={page >= totalPages}
              onClick={() => setParam('page', String(page + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </PageButton>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
