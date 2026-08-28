import DonateActions from '@/components/DonateActions';
import DonateForm from '@/components/DonateForm';

/**
 * Donation page, built as a split hero: the ask and the whole form in the left
 * column, a photograph bleeding to the right edge of the viewport. No goal or
 * progress bar — the foundation does not run time-boxed campaigns with public
 * targets, so a fundraising thermometer would be a number we made up.
 *
 * Every field the previous page collected is still here: name, email, the four
 * presets, a custom amount, the running total, and the Stripe submit.
 */
export default function DonateContent() {
  return (
    <main>
      <section className="donate-hero">
        <div className="donate-hero__grid">
          <div className="donate-hero__panel">
            <h1 className="mt-3 max-w-[14ch]">Give a student the opportunity.</h1>
            <p className="donate-lede">
              Your gift empowers the next generation of STEM leaders. Every contribution helps
              students access education and opportunity.
            </p>

            <DonateForm />
            <DonateActions />
          </div>

          <div className="donate-hero__media">
            <img
              src="/images/donate-students.webp"
              alt="Three secondary school students in uniform building and wiring an electronics project together"
              width={1600}
              height={1323}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
