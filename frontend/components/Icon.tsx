import feather from 'feather-icons';

/**
 * Feather icon rendered at build time.
 *
 * The static build shipped `<i data-feather="name">` placeholders and swapped
 * them for SVG in the browser via the feather CDN script. Rendering the same
 * markup on the server removes that flash and the extra request; the stroke
 * width matches the `feather.replace({ 'stroke-width': 2.5 })` the old
 * main.js used everywhere.
 */
export default function Icon({
  name,
  className = '',
  strokeWidth = 2.5,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const icon = feather.icons[name as keyof typeof feather.icons];
  if (!icon) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Icon] unknown feather icon: ${name}`);
    }
    return null;
  }

  // Feather exposes only the inner paths; the wrapper carries the attributes
  // its own .replace() would have set, plus whatever classes the call site had.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`feather feather-${name}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: icon.contents }}
    />
  );
}
