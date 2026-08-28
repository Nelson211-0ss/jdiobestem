'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BoardDetail } from '@/lib/admin/boards';

/**
 * Search, group, and one filter per status column.
 *
 * Which filters exist is decided by the board's own columns, so every imported
 * board gets filters that match its data without anyone configuring them.
 */
export default function BoardFilters({ board }: { board: BoardDetail }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [term, setTerm] = useState(params.get('search') ?? '');

  const statusColumns = board.columns.filter((c) => c.column_type === 'status' && c.choices.length);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  };

  const hasFilters =
    Boolean(params.get('search')) ||
    Boolean(params.get('group')) ||
    statusColumns.some((c) => params.get(`col.${c.monday_id}`));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        className="relative min-w-[14rem] flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          setParam('search', term.trim());
        }}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={`Search ${board.name.toLowerCase()}`}
          className="pl-9"
          aria-label="Search records"
        />
      </form>

      {board.groups.length > 1 ? (
        <Select
          value={params.get('group') ?? '__all__'}
          onValueChange={(v) => setParam('group', v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-auto min-w-[10rem]">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All groups</SelectItem>
            {board.groups.map((g) => (
              <SelectItem key={g.monday_id} value={g.monday_id}>
                {g.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {statusColumns.slice(0, 3).map((column) => (
        <Select
          key={column.monday_id}
          value={params.get(`col.${column.monday_id}`) ?? '__all__'}
          onValueChange={(v) => setParam(`col.${column.monday_id}`, v === '__all__' ? '' : v)}
        >
          <SelectTrigger className="w-auto min-w-[10rem]">
            <SelectValue placeholder={column.title} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All {column.title.toLowerCase()}</SelectItem>
            {column.choices.map((c) => (
              <SelectItem key={c.value} value={c.label}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {hasFilters ? (
        <Button variant="ghost" size="sm" onClick={() => startTransition(() => router.push(pathname))}>
          <X /> Clear
        </Button>
      ) : null}
    </div>
  );
}
