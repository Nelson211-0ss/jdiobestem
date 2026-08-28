import 'server-only';

/**
 * Published content, read from the backend at request time.
 *
 * The site used to import these from `content/*-data.tsx`, which meant editing
 * a story in the dashboard changed a database the website never looked at.
 * These fetchers close that gap: the CMS is now what the public pages render.
 *
 * Every call carries the service key, so this is server-side only — hence the
 * `server-only` import, which turns an accidental client import into a build
 * error rather than a leaked key.
 */

const BASE = (process.env.BACKEND_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const API_KEY = process.env.BACKEND_API_KEY || '';

/** Long enough that the site is not hammering the API; short enough that
 *  publishing shows up without a deploy. Revalidated on demand as well. */
const REVALIDATE_SECONDS = 60;

export type SiteStory = {
  slug: string;
  title: string;
  category: string;
  date: string;
  dateLabel: string;
  readingTime: string;
  excerpt: string;
  body: string;
  image: string | null;
  imageAlt: string | null;
  caption: string | null;
  gallery: { src: string; alt: string; caption: string | null }[];
  links: { href: string; label: string; icon: string }[];
};

export type SiteProgramme = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  href: string;
  image: string;
  image_alt: string;
  icon: string;
  pathway_stage: string;
  pathway_label: string;
};

export type SiteTeamMember = {
  name: string;
  role: string;
  group: string;
  img: string | null;
  alt: string;
  focus: string | null;
  bio: string | null;
  links: { kind: string; href: string }[];
};

export type SiteIssue = {
  id: string;
  label: string;
  name: string;
  status: 'published' | 'in-production';
  cover: string;
  coverAlt: string;
  wrap: string | null;
  wrapAlt: string | null;
  summary: string;
  file: { href: string; filename: string; size: string; contains: string } | null;
  stories: { title: string; blurb: string }[];
  epigraph: { quote: string; attribution: string; source: string } | null;
};

async function fetchContent<T>(path: string, fallback: T): Promise<T> {
  if (!API_KEY) {
    console.warn(`[site-content] BACKEND_API_KEY is not set — ${path} returned nothing`);
    return fallback;
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'X-API-Key': API_KEY },
      next: { revalidate: REVALIDATE_SECONDS, tags: ['site-content'] },
    });
    if (!res.ok) {
      console.error(`[site-content] ${path} responded ${res.status}`);
      return fallback;
    }
    return (await res.json()) as T;
  } catch (err) {
    // A page rendering with no stories is better than a page that 500s.
    console.error(`[site-content] ${path} failed`, err);
    return fallback;
  }
}

export type SiteStat = { label: string; value: number; suffix: string };

export const getSiteStats = () => fetchContent<SiteStat[]>('/content/stats/', []);
export const getStories = () => fetchContent<SiteStory[]>('/content/news/', []);
export const getTeam = () => fetchContent<SiteTeamMember[]>('/content/team/', []);
export const getIssues = () => fetchContent<SiteIssue[]>('/content/magazine/', []);

export const getProgrammes = () => fetchContent<SiteProgramme[]>('/content/programmes/', []);

/**
 * The editable copy for one hand-built page, as a {key: value} map.
 *
 * Pair it with `text()` below. A page keeps its own wording in the component
 * and asks the database only for an override, so an unreachable API or a block
 * nobody has filled in leaves the page exactly as it was written rather than
 * blank.
 */
export const getPageBlocks = (page: string) =>
  fetchContent<Record<string, string>>(`/content/page-blocks/?page=${encodeURIComponent(page)}`, {});

/** Read one block, falling back to the text compiled into the page. */
export function text(blocks: Record<string, string>, key: string, fallback: string): string {
  const value = blocks[key];
  return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

export async function getStory(slug: string): Promise<SiteStory | null> {
  const stories = await getStories();
  return stories.find((s) => s.slug === slug) ?? null;
}
