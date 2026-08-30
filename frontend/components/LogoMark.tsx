/**
 * The Jdiobe mark on its own, inlined from public/icons/icon logo.svg.
 *
 * The wordmark needs about seven times the width of the mark, so a collapsed
 * rail can only carry the mark. Inlined rather than loaded as an `<img>` for
 * the same reason as the full lockup: the colour then follows `--logo-mark`,
 * and one asset serves the light and dark dashboards.
 */
export default function LogoMark({
  className = '',
  title = 'Jdiobe STEM Foundation',
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 315.56 328.58"
      role="img"
      aria-label={title}
      className={className}
      focusable="false"
    >
      <path
        fill="var(--logo-mark, #FE5C00)"
        d="M51.34,328.58c-18.7,0-46.39-13.76-51.34-37.22C0,268.25.21,0,.21,0c6.27,5.3,114.52,96.25,114.52,96.25L226.98,1.63c.16,11.87.66,240.33.66,240.33h-50.93V111.41l-60.99,51.1-63.13-50.11-1.25,216.17Z"
      />
      <path
        fill="var(--logo-mark, #FE5C00)"
        d="M87.32,182.62s1.07,79.1,1.64,85.76c1.42,16.78,18.2,36.36,32.16,47.3,5.93,4.65,23.67,12.9,38.66,12.9,9.87,0,92.63-1.61,101.32-1.61,3.16,0,28.97-10.2,39.4-28.29,7.41-12.84,12.89-26.26,12.95-36.86.04-7.89,2.21-219.3,2.12-225.14-.26-16.38-17.37-36.34-52.11-36.34-.26,13.49-1.25,244-.09,253.09.53,4.12-13.4,22.29-21.64,22.29s-76.48.36-83.19-.86-15.88-12.82-19.54-23.82c.31-11.3,0-65.34,0-65.34l-23.51,18.32-28.16-21.4Z"
      />
    </svg>
  );
}
