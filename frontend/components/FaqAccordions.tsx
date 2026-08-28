'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Expand/collapse for the FAQ lists on /faqs and /secondary-research.
 *
 * A delegated listener, as in the old main.js, because the two pages use
 * slightly different button markup and both just need "toggle the .faq-content
 * next to me and flip my caret".
 */
export default function FaqAccordions() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const button = target?.closest<HTMLElement>('.faq-toggle');
      if (!button) return;

      const content = button.parentElement?.querySelector('.faq-content');
      if (!content) return;
      content.classList.toggle('hidden');

      const icon = button.querySelector('svg') ?? button.querySelector('i');
      icon?.classList.toggle('rotate-180');
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [pathname]);

  return null;
}
