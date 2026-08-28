/**
 * STEM Bridge Magazine issues.
 *
 * The magazine page renders entirely from this list, so publishing a new issue
 * is a data change: add an entry at the top, drop its artwork and PDF into
 * public/stem-bridge-magazine, and the hero, the contents, the download panel,
 * and the archive all follow.
 *
 * Newest first — the first entry is what the hero features.
 */

export type IssueStatus = 'published' | 'in-production';

export type IssueFile = {
  href: string;
  /** Filename the browser saves it as. */
  filename: string;
  size: string;
  /** What the file actually contains, so the page never overstates it. */
  contains: 'Full issue' | 'Cover';
};

export type Issue = {
  id: string;
  /** Issue line as printed on the cover. */
  label: string;
  /** How the issue is referred to in prose. */
  name: string;
  status: IssueStatus;
  /** Front cover, portrait. */
  cover: string;
  coverAlt: string;
  /** Full wrap — back cover, spine, front — where one exists. */
  wrap?: string;
  wrapAlt?: string;
  summary: string;
  file?: IssueFile;
  stories: { title: string; blurb: string }[];
  epigraph?: { quote: string; attribution: string; source: string };
};

export const ISSUES: Issue[] = [
  {
    id: '2026',
    label: '11/2026',
    name: 'the 2026 issue',
    // Only the cover artwork exists so far; flip to 'published' and swap `file`
    // for the full PDF when the issue itself is ready.
    status: 'in-production',
    cover: '/stem-bridge-magazine/cover-2026.jpg',
    coverAlt:
      "Cover of the 2026 issue of STEM Bridge Magazine: students' model aircraft and rockets on a display table",
    wrap: '/stem-bridge-magazine/wrap-2026.jpg',
    wrapAlt:
      'Full cover wrap of the 2026 issue, showing the back cover, spine, and front cover',
    summary:
      'Student work, the engineering behind it, and the people turning a diagram into something you can hold.',
    file: {
      href: '/stem-bridge-magazine/magazine cover 2026 issue.pdf',
      filename: 'stem-bridge-magazine-2026-cover.pdf',
      size: '431 KB',
      contains: 'Cover',
    },
    stories: [
      {
        title: 'Closer than the diagram',
        blurb:
          'What changes for a student the first time a drawing becomes an object they can pick up, test, and get wrong.',
      },
      {
        title: 'Between models and prototypes',
        blurb:
          'The distance between a model that demonstrates an idea and a prototype that has to survive contact with the real world.',
      },
    ],
    epigraph: {
      quote: 'Nothing is theoretically impossible, until it is done.',
      attribution: 'Robert A. Heinlein',
      source: 'from the back cover',
    },
  },
];

/** The issue the page leads with. */
export const FEATURED = ISSUES[0];

/** Everything behind the featured issue, for the archive. */
export const ARCHIVE = ISSUES.slice(1);

export function isPublished(issue: Issue) {
  return issue.status === 'published';
}
