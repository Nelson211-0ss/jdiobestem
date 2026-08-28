'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Loader2, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Hit = { resource: string; kind: string; id: number; title: string; href: string };

/**
 * Search across everything this person is allowed to open.
 *
 * The backend runs the same country scope as the lists, so a Uganda
 * coordinator's search never surfaces a South Sudan record — the results
 * cannot disagree with what they would find by browsing.
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced: a query per keystroke would be a query per keystroke.
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setHits([]);
      setBusy(false);
      return;
    }
    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const body = await res.json().catch(() => ({ results: [] }));
        setHits(Array.isArray(body.results) ? body.results : []);
        setActive(0);
        setOpen(true);
      } finally {
        setBusy(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      // Slash focuses search, the way most tools do it.
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (hit: Hit) => {
    setOpen(false);
    setTerm('');
    router.push(hit.href);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={term}
        placeholder="Search everything…"
        aria-label="Search the dashboard"
        aria-expanded={open}
        role="combobox"
        aria-controls="header-search-results"
        className="h-10 rounded-full border-0 bg-muted pl-9 pr-9"
        onChange={(e) => setTerm(e.target.value)}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !hits.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => (i + 1) % hits.length);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => (i - 1 + hits.length) % hits.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            go(hits[active]);
          }
        }}
      />
      {busy ? (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : null}

      {open && term.trim().length >= 2 ? (
        <div
          id="header-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-12 z-50 max-h-96 overflow-y-auto rounded-xl bg-popover p-1.5 shadow-lg"
        >
          {hits.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {busy ? 'Searching…' : `Nothing matching “${term.trim()}”.`}
            </p>
          ) : (
            hits.map((hit, i) => (
              <Link
                key={`${hit.resource}-${hit.id}`}
                href={hit.href}
                role="option"
                aria-selected={i === active}
                onClick={() => {
                  setOpen(false);
                  setTerm('');
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  i === active ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                )}
              >
                <span className="min-w-0 flex-1 truncate font-medium">{hit.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{hit.kind}</span>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
