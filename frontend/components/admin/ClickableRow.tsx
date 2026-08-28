'use client';

import { useRouter } from 'next/navigation';

import { TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

/**
 * A table row you can click anywhere on to open the record.
 *
 * Convenient, but it must not take the page away from someone who was doing
 * something else — selecting an email address to copy, or using a control that
 * happens to sit inside the row. Modified clicks are left alone so cmd-click
 * still opens a new tab, and every row that uses this keeps a real link in its
 * last cell: that is what a screen reader announces and what the keyboard
 * reaches. The row itself is not focusable, so tabbing through a long table
 * does not stop twice on every line.
 */
export default function ClickableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const target = e.target as HTMLElement | null;
    if (
      target?.closest(
        'a, button, input, select, textarea, label, [role="button"], [role="checkbox"], [role="menuitem"]',
      )
    ) {
      return;
    }
    if ((window.getSelection()?.toString() ?? '').trim() !== '') return;

    router.push(href);
  };

  return (
    <TableRow onClick={onClick} className={cn('cursor-pointer', className)}>
      {children}
    </TableRow>
  );
}
