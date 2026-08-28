import type { ReactNode } from 'react';

/**
 * Shell for the site's legal documents (privacy policy, terms of use).
 *
 * These two pages deliberately sit outside the site's palette: monochrome,
 * ruled, and set like a document rather than a page. Brand orange is persuasive
 * colour, and a document that limits liability and describes what happens to a
 * child's data should not be doing any persuading. Everything inside
 * `.legal-doc` is black, white and grey, including links — see the scoped
 * variables in pages.css, which also stop the site-wide orange link rule from
 * reaching in here.
 *
 * The layout is a sticky contents list beside numbered sections, because these
 * are read by people looking for one clause rather than start to finish, and
 * every section carries an id so a clause can be linked to directly.
 *
 * Section numbering is generated from array order rather than typed into each
 * heading: a document that gets a new clause in the middle should not need
 * every heading after it renumbered by hand, and a cross-reference in the body
 * text that disagrees with a heading is the classic way these drift.
 */

export type LegalSection = {
  /** Anchor id — stable, because these get linked to and cited. */
  id: string;
  title: string;
  body: ReactNode;
};

export default function LegalDoc({
  eyebrow,
  title,
  lede,
  updated,
  effective,
  sections,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  updated: string;
  effective: string;
  sections: LegalSection[];
}) {
  return (
    <main className="legal-doc">
      <section className="legal-masthead">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <p className="legal-eyebrow">{eyebrow}</p>
          <h1 className="legal-title">{title}</h1>
          <p className="legal-lede">{lede}</p>
          <dl className="legal-meta">
            <div>
              <dt>Effective</dt>
              <dd>{effective}</dd>
            </div>
            <div>
              <dt>Last updated</dt>
              <dd>{updated}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <nav className="legal-toc lg:col-span-4" aria-labelledby="legal-toc-heading">
            <div className="lg:sticky lg:top-28">
              <h2 id="legal-toc-heading">Contents</h2>
              <ol>
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      <span className="legal-toc-num">{i + 1}</span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="lg:col-span-8">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                /* scroll-mt clears the fixed masthead when a contents link
                   jumps here, otherwise the heading lands under the bar. */
                className="legal-section scroll-mt-28"
              >
                <h2>
                  <span className="legal-section-num">{i + 1}.</span>
                  <span>{s.title}</span>
                </h2>
                <div className="legal-body">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
