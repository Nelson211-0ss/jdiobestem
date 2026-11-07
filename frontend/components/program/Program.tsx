import Link from 'next/link';
import type { ReactNode } from 'react';
import Icon from '@/components/Icon';

/**
 * The building blocks every programme page is made from.
 *
 * Each page answers the same questions in the same order: what the programme
 * is, the facts a reader needs to decide (who, where, cost, when), how it
 * works, and what to do next. Keeping the parts here means the six pages read
 * as one site rather than six templates, and a change to one part reaches all
 * of them. Styles live in styles/programs.css under the `prog-` prefix.
 */

export type Fact = { term: string; detail: string };
export type Item = { title: string; body: string };
export type Action = { href: string; label: string; download?: boolean };

export function ProgramHero({
  title,
  lede,
  actions = [],
  image,
  imageAlt,
  caption,
  facts = [],
}: {
  title: string;
  lede: string;
  actions?: Action[];
  image: string;
  imageAlt: string;
  caption?: string;
  facts?: Fact[];
}) {
  return (
    <header className="prog-hero">
      <div className="container-page prog-hero__grid">
        <div className="prog-hero__text">
          <h1>{title}</h1>
          <p className="prog-hero__lede">{lede}</p>
          {actions.length > 0 && (
            <div className="prog-actions">
              {actions.map((a, i) => (
                <a key={a.href} href={a.href} className={i === 0 ? 'btn-primary' : 'editorial-link'} download={a.download || undefined}>
                  {a.label}
                  {i === 0 && <Icon name="arrow-right" className="h-4 w-4" />}
                </a>
              ))}
            </div>
          )}
        </div>
        <figure className="prog-hero__figure">
          <img src={image} alt={imageAlt} width="1600" height="1066" fetchPriority="high" />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      </div>
      {facts.length > 0 && (
        <div className="container-page">
          <dl className="prog-facts">
            {facts.map((f) => (
              <div key={f.term}>
                <dt>{f.term}</dt>
                <dd>{f.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </header>
  );
}

/** In-page links. Only worth it on the longer pages. */
export function ProgramJumps({ label, links }: { label: string; links: [string, string][] }) {
  return (
    <nav className="container-page prog-jumps" aria-label={label}>
      {links.map(([href, text]) => (
        <a key={href} href={href}>{text}</a>
      ))}
    </nav>
  );
}

/** A section: heading and short introduction on the left, the substance on the right. */
export function ProgramSection({
  id,
  title,
  intro,
  children,
  wide = false,
}: {
  id?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
  /** Let the body run the full width under the heading, for tables and forms. */
  wide?: boolean;
}) {
  return (
    <section id={id} className={`prog-section${wide ? ' prog-section--wide' : ''}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="container-page prog-section__grid">
        <div className="prog-section__head">
          <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
          {intro && <div className="prog-section__intro">{intro}</div>}
        </div>
        {children && <div className="prog-section__body">{children}</div>}
      </div>
    </section>
  );
}

/** A real sequence, numbered because order matters. */
export function Steps({ items }: { items: Item[] }) {
  return (
    <ol className="prog-steps">
      {items.map((s) => (
        <li key={s.title}>
          <h3>{s.title}</h3>
          <p>{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** Term and explanation, one per row. */
export function Definitions({ items }: { items: Fact[] }) {
  return (
    <dl className="prog-defs">
      {items.map((d) => (
        <div key={d.term}>
          <dt>{d.term}</dt>
          <dd>{d.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Named things of equal weight: scholarships, categories, workshop projects. */
export function ItemGrid({ items, columns = 2 }: { items: (Item & { tag?: string; children?: ReactNode })[]; columns?: 2 | 3 }) {
  return (
    <ul className={`prog-items prog-items--${columns}`}>
      {items.map((it) => (
        <li key={it.title}>
          {it.tag && <p className="prog-items__tag">{it.tag}</p>}
          <h3>{it.title}</h3>
          <p>{it.body}</p>
          {it.children}
        </li>
      ))}
    </ul>
  );
}

export function Figure({ src, alt, caption, tall = false }: { src: string; alt: string; caption?: string; tall?: boolean }) {
  return (
    <figure className={`prog-figure${tall ? ' prog-figure--tall' : ''}`}>
      <img src={src} alt={alt} width="1600" height="1066" loading="lazy" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="prog-faq">
      {items.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Downloads({ items }: { items: { href: string; title: string; detail: string }[] }) {
  return (
    <ul className="prog-downloads">
      {items.map((d) => (
        <li key={d.href}>
          <a href={d.href} download>
            <Icon name="download" className="h-5 w-5" />
            <span>
              <strong>{d.title}</strong>
              <span>{d.detail}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ProgramCta({ title, body, actions }: { title: string; body: string; actions: Action[] }) {
  return (
    <section className="prog-cta surface-dark" aria-labelledby="prog-cta-title">
      <div className="container-page prog-cta__grid">
        <h2 id="prog-cta-title">{title}</h2>
        <div>
          <p>{body}</p>
          <div className="prog-actions">
            {actions.map((a, i) => (
              <Link key={a.href} href={a.href} className={i === 0 ? 'btn-on-brand' : 'btn-outline-on-brand'}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const PROGRAMMES: { href: string; name: string; line: string }[] = [
  { href: '/youth-stem', name: 'Youth STEM', line: 'Hands-on workshops that end in something students build.' },
  { href: '/secondary-research', name: 'Science Fair', line: 'A six-month project, a proposal, and a day in front of judges.' },
  { href: '/mentorship', name: 'Mentorship', line: 'A working professional to ask what comes next.' },
  { href: '/scholarship', name: 'Scholarships', line: 'Fees, materials or travel when they are what stands in the way.' },
  { href: '/community-outreach', name: 'Community Outreach', line: 'Students showing their work to other schools and the public.' },
  { href: '/aerospace-institute', name: 'Aerospace Institute', line: 'Our next build. Planned, not yet open.' },
];

/** The other programmes, in the order a student meets them. */
export function OtherProgrammes({ current }: { current: string }) {
  return (
    <section className="prog-other" aria-labelledby="prog-other-title">
      <div className="container-page">
        <h2 id="prog-other-title">The other programmes</h2>
        <ul>
          {PROGRAMMES.filter((p) => p.href !== current).map((p) => (
            <li key={p.href}>
              <Link href={p.href}>
                <strong>{p.name}</strong>
                <span>{p.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
