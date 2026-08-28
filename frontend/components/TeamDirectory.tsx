'use client';

import { useEffect, useRef, useState } from 'react';
import SocialIcon from './SocialIcon';

/**
 * Team directory with a segmented filter.
 *
 * Leadership and mentors are two different asks — one tells you who runs the
 * foundation, the other who you would be joining — so they get a tab each
 * rather than one long grid where the second half never gets read.
 *
 * Each card is a cream tile holding a brand-orange arch with the person cut out
 * and standing in it. That means every portrait here has to be a transparent
 * cut-out; an opaque photo hides the orange and the set stops reading as one
 * group. Bios open in a dialog rather than expanding in place, so opening one
 * card does not shove the rest of the grid down the page.
 */

type Person = {
  group: string;
  name: string;
  role: string;
  img: string;
  alt: string;
  /** object-position for the crop; portraits vary in where the subject sits. */
  focus?: string;
  /**
   * Per-person zoom inside the arch, scaled from the floor. The cut-outs were
   * framed differently at source — some are tight headshots, some are half
   * body — so without this one person's head arrives twice the size of the
   * next and the grid stops reading as one set. 1 is the untouched fit.
   */
  scale?: number;
  bio: string;
  /** LinkedIn profile URL. `#` until the real profile is supplied. */
  linkedin: string;
};

/**
 * PLACEHOLDER BIOS — REPLACE BEFORE PUBLISHING.
 *
 * Every card carries a "Read bio" link now, so every person needs bio text. I
 * had no biographical detail for four of the five below, and writing careers
 * for real, named people is not something to ship, so they fall back to a line
 * built only from the role already printed on the card. Swap each `bio` for the
 * person's own text as it comes in.
 */
const pendingBio = (name: string, role: string) =>
  `${name} is ${role} at the Jdiobe STEM Foundation. A fuller profile is on the way.`;

// LEADERSHIP now comes from the CMS — see TeamDirectory({ people }).

// MENTORS now comes from the CMS — see TeamDirectory({ people }).

const TAB_LABEL: Record<string, string> = {
  leadership: 'Leadership',
  mentors: 'Mentors',
};

function LinkedInLink({ person }: { person: Person }) {
  return (
    <a
      href={person.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${person.name} on LinkedIn`}
      className="team-link"
    >
      <SocialIcon name="linkedin" className="h-4 w-4" />
    </a>
  );
}

function Portrait({ person, className }: { person: Person; className: string }) {
  return (
    <div className={className}>
      <img
        src={person.img}
        alt={person.alt}
        style={{
          ...(person.focus ? { objectPosition: person.focus } : null),
          ...(person.scale ? { transform: `scale(${person.scale})` } : null),
        }}
        width={640}
        height={672}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function PersonCard({ person, onReadBio }: { person: Person; onReadBio: () => void }) {
  return (
    <article className="team-card">
      <Portrait person={person} className="team-portrait" />

      <div className="team-card-body">
        <h3 className="team-name">{person.name}</h3>
        <p className="team-role">{person.role}</p>

        <div className="team-links">
          <button type="button" className="team-bio-btn" onClick={onReadBio}>
            Read bio
          </button>
          <LinkedInLink person={person} />
        </div>
      </div>
    </article>
  );
}

/**
 * The bio dialog. `showModal()` is called from an effect rather than rendering
 * `open` so the browser gives us the top layer, the backdrop, and the focus
 * trap; `open` alone gets none of those.
 */
function BioDialog({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (person && !el.open) el.showModal();
    if (!person && el.open) el.close();
  }, [person]);

  return (
    <dialog
      ref={ref}
      className="team-dialog"
      aria-labelledby="team-dialog-name"
      onClose={onClose}
      /* A click landing on the dialog itself is a click on the backdrop — the
         inner wrapper covers every pixel of the box. */
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {person ? (
        <div className="relative">
          <button type="button" className="team-dialog-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="team-dialog-inner">
            <Portrait person={person} className="team-dialog-portrait" />
            <div>
              <h3 id="team-dialog-name" className="team-name">{person.name}</h3>
              <p className="team-role">{person.role}</p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-charcoal-600">{person.bio}</p>
              <div className="mt-4">
                <LinkedInLink person={person} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

export default function TeamDirectory({ people }: { people: Person[] }) {
  // Tabs come from whichever groups actually have somebody in them, so an
  // empty "Mentors" tab never appears.
  const tabs = (['leadership', 'mentors'] as const)
    .map((id) => ({ id, label: TAB_LABEL[id], people: people.filter((p) => p.group === id) }))
    .filter((t) => t.people.length > 0);

  const [active, setActive] = useState<string>(tabs[0]?.id ?? 'leadership');
  const [openBio, setOpenBio] = useState<Person | null>(null);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  if (!current) return null;

  return (
    <section className="section-tight" id="directory">
      <div className="container-page">
        <div className="section-head">
          <h2>Meet the team</h2>
          <p className="lede">
            More than educators — mentors, engineers, and organisers, each bringing a different
            route into STEM and a shared commitment to opening it up.
          </p>
          <p className="text-charcoal-600">
            Want to join them?{' '}
            <a href="/volunteers" className="font-bold text-orange-700 underline underline-offset-4">
              Volunteer with us
            </a>
            .
          </p>
        </div>

        <div className="team-tabs" role="tablist" aria-label="Filter team by group">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`team-tab-${tab.id}`}
              aria-selected={active === tab.id}
              aria-controls={`team-panel-${tab.id}`}
              className={`team-tab${active === tab.id ? ' is-active' : ''}`}
              onClick={() => setActive(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`team-panel-${current.id}`}
          aria-labelledby={`team-tab-${current.id}`}
          className="team-grid"
        >
          {current.people.map((p) => (
            <PersonCard key={p.name} person={p} onReadBio={() => setOpenBio(p)} />
          ))}
        </div>
      </div>

      <BioDialog person={openBio} onClose={() => setOpenBio(null)} />
    </section>
  );
}
