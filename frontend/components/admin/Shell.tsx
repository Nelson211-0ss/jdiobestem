import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * The three page shapes the dashboard uses, in one place.
 *
 * Taken from the reference designs: list pages are a single wide card on a
 * tinted ground; forms and detail pages are a narrow centred column with a
 * small eyebrow over a large centred title. Keeping them here means every
 * screen picks up a change to the shape, rather than fourteen pages drifting.
 */

/** A list page: one white card holding the title, controls and table. */
export function ListCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-3xl border bg-card p-6 shadow-sm sm:p-8', className)}>{children}</div>
  );
}

export function ListHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/**
 * A form or detail page: narrow, centred, with the actions on a bar pinned to
 * the bottom of the viewport so Save is reachable without scrolling to the end
 * of a long record.
 */
export function FormShell({
  backHref,
  backLabel,
  eyebrow,
  title,
  children,
  footer,
  actions,
  wide = false,
  aside,
}: {
  backHref: string;
  backLabel: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Shown at the top of the card — Export and Edit on a record being read. */
  actions?: React.ReactNode;
  /** The story editor needs room for its preview; record forms do not. */
  wide?: boolean;
  /**
   * A column beside the record — what belongs to it, read alongside rather than
   * after it. Its presence widens the page, since two columns in the reading
   * width of one would leave neither enough room.
   */
  aside?: React.ReactNode;
}) {
  // The record's own controls sit on the record, not floating above the page:
  // Export and Edit act on what is inside the card, so they belong at the top
  // of it. The way back sits beside the title, which is what the page is about.
  const header = (
    <div className="flex items-start gap-3">
      <Link
        href={backHref}
        aria-label={backLabel}
        title={backLabel}
        className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <div className="min-w-0">
        {eyebrow ? <p className="text-sm text-muted-foreground">{eyebrow}</p> : null}
        <h1 className="mt-0.5 text-3xl font-bold tracking-tight">{title}</h1>
      </div>
    </div>
  );

  const card = (
    <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      {actions ? (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3 border-b pb-5">
          {actions}
        </div>
      ) : null}
      {children}
    </div>
  );

  return (
    <div className="pb-24">
      <div className={cn('mx-auto', wide || aside ? 'max-w-6xl' : 'max-w-3xl')}>
        {header}

        {aside ? (
          // `items-start` so the side column keeps its own height instead of
          // stretching to match a long record.
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
            {card}
            <div className="space-y-6">{aside}</div>
          </div>
        ) : (
          <div className="mt-6">{card}</div>
        )}
      </div>

      {footer ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-3xl items-center justify-end gap-3 px-4 py-3 sm:px-0">
            {footer}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * A record shown as a table: one row per field, the name on the left and the
 * value on the right.
 *
 * The same shape as the list the record came from, so reading one row and
 * reading one record feel like the same act — and a long record stays scannable
 * where a run of loose label/value pairs starts to drift.
 */
export function DetailTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

/** One field in a `DetailTable`. */
export function DetailTableRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr className="align-top">
      <th
        scope="row"
        className="w-[38%] max-w-[16rem] bg-muted/30 px-4 py-3 text-left font-medium text-muted-foreground"
      >
        {label}
      </th>
      <td className="px-4 py-3 font-semibold">{children}</td>
    </tr>
  );
}

/** Detail rows: grey label on the left, the value in bold beside it. */
export function DetailSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      {title ? <h2 className="text-xl font-bold tracking-tight">{title}</h2> : null}
      <dl className="space-y-3.5">{children}</dl>
    </section>
  );
}

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold">{children}</dd>
    </div>
  );
}
