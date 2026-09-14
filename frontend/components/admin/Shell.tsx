import Link from 'next/link';

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
    <div className={cn('rounded-2xl border border-border/40 bg-card p-6 sm:p-8', className)}>{children}</div>
  );
}

export function ListHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    // The description that used to sit under the title is gone. It explained
    // the screen to somebody opening it for the first time and then said the
    // same thing every day after — and being the widest thing in the row, it
    // pushed the actions onto a line of their own. They sit beside the title
    // now, which is where the eye already is.
    <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
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
  title,
  children,
  footer,
  actions,
  wide = false,
  aside,
}: {
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
  // The name of the record, and nothing above it. There used to be a back
  // tile and the resource's name in small grey type over every title — a
  // breadcrumb two levels deep, on a dashboard whose nav is always on screen
  // and already says where you are.
  const header = <h1 className="text-3xl font-bold tracking-tight">{title}</h1>;

  const card = (
    <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8">
      {actions ? (
        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
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
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:left-80">
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
    <div className="overflow-hidden rounded-xl">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border/40">{children}</tbody>
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
