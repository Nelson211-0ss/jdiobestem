/**
 * Partner logo wall.
 *
 * A continuous marquee rather than a grid of boxed tiles: four logos in a
 * four-up grid reads as "we have exactly four partners", where a strip that
 * runs off both edges reads as an ongoing list. Logos render monochrome
 * charcoal so a set of unrelated brand palettes doesn't fight the page, and
 * return to full colour on hover.
 *
 * The track holds two copies of the list and translates by -50%, so the loop is
 * seamless. Pure CSS animation — no JS, and it stops under
 * `prefers-reduced-motion`.
 */

/*
 * `scale` optically balances the set. These files crop very differently — the
 * Laudato wordmark sits in the middle of a square canvas of mostly empty space,
 * while the OSU mark is tight to its bounds — so a single fixed height leaves
 * some logos looking half the size of others.
 */
const PARTNERS = [
  { src: '/images/partners/HCLV-BUDGE-1.png', name: 'Holy Cross Lake View', scale: 1.55 },
  { src: '/images/partners/oklahoma-state-university.svg', name: 'Oklahoma State University', scale: 1.25 },
  { src: '/images/partners/laudato-logo.png', name: 'Laudato Youth Initiative', scale: 2.4 },
  { src: '/images/partners/prograte-logo.svg', name: 'Prograte', scale: 1.2 },
];

export default function PartnerMarquee() {
  return (
    <div className="partner-marquee">
      {/* Two identical runs; the second only exists so the loop can wrap. */}
      <div className="partner-track">
        {[0, 1].map((copy) => (
          <div className="partner-run" key={copy} aria-hidden={copy === 1 || undefined}>
            {PARTNERS.map((p) => (
              <img
                key={`${copy}-${p.src}`}
                src={p.src}
                alt={copy === 0 ? p.name : ''}
                className="partner-logo"
                style={{ '--logo-scale': p.scale } as React.CSSProperties}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
