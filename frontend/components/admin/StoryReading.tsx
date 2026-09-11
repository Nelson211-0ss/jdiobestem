/**
 * How a story is being read.
 *
 * Two figures rather than one. "Opened" is how many times the page was opened;
 * "read" is how many of those reached the end of the article. A headline that
 * is opened often and finished rarely is telling you something a single number
 * hides — and it is the only one of the two that says anything about the
 * writing rather than the headline.
 *
 * Counted by day and by nobody: there is no visitor here to look up.
 */

type Day = { day: string; opens: number; reads: number };

export default function StoryReading({ story }: { story: Record<string, unknown> }) {
  const days = (story.reading_days as Day[] | undefined) ?? [];
  const openedTotal = Number(story.opens_total ?? 0);
  const readTotal = Number(story.reads_total ?? 0);
  const opened30 = Number(story.opens_30 ?? 0);
  const read30 = Number(story.reads_30 ?? 0);
  const completion = String(story.completion ?? '');
  const lastRead = String(story.last_read_on ?? '');
  const busiest = Math.max(...days.map((d) => d.opens), 1);

  return (
    <section className="rounded-3xl border bg-card p-5 shadow-sm">
      <h2 className="px-1 text-sm font-semibold tracking-tight">Reading</h2>
      <p className="mb-4 px-1 text-xs text-muted-foreground">
        {openedTotal ? `Since it was published` : 'Nobody has opened this yet'}
      </p>

      {openedTotal ? (
        <>
          <div className="grid grid-cols-2 gap-3 px-1">
            <div>
              <p className="text-2xl font-bold tabular">{openedTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">opened</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular">{readTotal.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">read to the end</p>
            </div>
          </div>

          <dl className="mt-4 space-y-1.5 px-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Finished</dt>
              <dd className="font-semibold tabular">{completion || '—'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Last 30 days</dt>
              <dd className="font-semibold tabular">
                {opened30.toLocaleString()} opened · {read30.toLocaleString()} read
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Last opened</dt>
              <dd className="font-semibold">
                {lastRead
                  ? new Date(lastRead).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </dd>
            </div>
          </dl>

          {/* Thirty days, oldest at the left. The pale bar is every open, the
              solid one the share of them that finished. */}
          <div className="mt-4 px-1">
            <div className="flex h-14 items-end gap-[2px]">
              {days.map((d) => (
                <div
                  key={d.day}
                  title={`${new Date(d.day).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                  })}: ${d.opens} opened, ${d.reads} read`}
                  className="relative flex-1 rounded-sm bg-muted"
                  style={{ height: `${Math.max((d.opens / busiest) * 100, d.opens ? 8 : 2)}%` }}
                >
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-sm bg-primary"
                    style={{ height: d.opens ? `${(d.reads / d.opens) * 100}%` : '0%' }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Last 30 days · solid is read to the end
            </p>
          </div>
        </>
      ) : (
        <p className="px-1 text-sm text-muted-foreground">
          Figures appear once the story has been opened on the website.
        </p>
      )}
    </section>
  );
}
