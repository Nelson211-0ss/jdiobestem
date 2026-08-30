import Link from 'next/link';
import { text } from '@/lib/blocks';
import ContactForm from '@/components/ContactForm';
import FeatureIcon from '@/components/FeatureIcon';
import Icon from '@/components/Icon';

export default function ContactContent({ blocks }: { blocks: Record<string, string> }) {
  return (
    <>
        <main className="py-12 md:py-16">
          <h1 className="sr-only">Contact us</h1>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-5 lg:gap-12 lg:items-start">

              {/* Contact details */}
              <aside className="lg:col-span-2 space-y-6">
                <div className="sr-fade-up rounded-2xl bg-white p-6 shadow-card md:p-7">
                  <h2 className="sr-fade-up text-lg font-bold text-stone-900">{text(blocks, "h2.reach-us-directly", "Reach us directly")}</h2>
                  <p className="mt-1 text-sm text-stone-500">{text(blocks, "p.we-typically-reply-within-23", "We typically reply within 2–3 business days.")}</p>

                  <div className="mt-5">
                    <a href="mailto:info@jdiobestem.org" className="contact-info-row group">
                      <FeatureIcon name="mail" className="feature-ico shrink-0" />
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Email</span>
                        <span className="mt-0.5 block text-sm font-medium text-orange-700 group-hover:underline">info@jdiobestem.org</span>
                      </span>
                    </a>
                    <a href="tel:+14054374755" className="contact-info-row group">
                      <FeatureIcon name="phone" className="feature-ico shrink-0" />
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500">Phone</span>
                        <span className="mt-0.5 block text-sm font-medium text-orange-700 group-hover:underline">+1 (405) 437-4755</span>
                      </span>
                    </a>
                    <div className="contact-info-row">
                      <FeatureIcon name="place" className="feature-ico shrink-0" />
                      <span>
                        <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500">U.S. office</span>
                        <span className="mt-0.5 block text-sm leading-relaxed text-stone-600">
                          9905 S Pennsylvania Ave, Ste A<br/>
                          {' '}Oklahoma City, OK 73159, USA
                        </span>
                      </span>
                    </div>
                  </div>

                  <a href="https://www.google.com/maps/dir/?api=1&destination=9905+S+Pennsylvania+Ave+Ste+A+Oklahoma+City+OK+73159" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800">
                    <Icon name="navigation" className="h-4 w-4"/>
                    {' '}Get directions
                  </a>
                </div>

                <div className="sr-fade-up rounded-2xl surface-brand p-6 md:p-7">
                  <div className="flex items-start gap-3">
                    <Icon name="globe" className="mt-0.5 h-5 w-5 shrink-0 text-orange-200"/>
                    <div>
                      <h3 className="sr-fade-up font-bold">{text(blocks, "h3.program-operations", "Program operations")}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-orange-50">
                        Scholarships, mentorship, and outreach primarily serve students in <strong className="text-white">Uganda</strong>. Our Oklahoma City office handles U.S. administration and partnerships.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="sr-fade-up flex flex-wrap gap-3">
                  <Link href="/volunteers" className="flex-1 min-w-[10rem] btn-ghost">
                    <Icon name="user-plus" className="h-4 w-4"/>
                    {' '}Volunteer
                  </Link>
                  <Link href="/donate" className="flex-1 min-w-[10rem] btn-primary">
                    <Icon name="heart" className="h-4 w-4"/>
                    {' '}Donate
                  </Link>
                </div>
              </aside>

              {/* Form */}
              <div className="lg:col-span-3">
                <div className="sr-fade-up rounded-2xl bg-white p-6 shadow-card md:p-8">
                  <h2 className="sr-fade-up text-xl font-bold text-stone-900">{text(blocks, "h2.send-a-message", "Send a message")}</h2>
                  <p className="mt-1 text-sm text-stone-500">{text(blocks, "p.fill-out-the-form-and", "Fill out the form and your email app will open with the message ready to send.")}</p>

                  <ContactForm />
                </div>
              </div>
            </div>

            {/* Map */}
            <section className="sr-fade-up mt-10 md:mt-16" aria-labelledby="map-heading">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-orange-700">Location</p>
                  <h2 id="map-heading" className="sr-fade-up mt-1 text-xl font-bold text-stone-900">{text(blocks, "h2.oklahoma-city-office", "Oklahoma City office")}</h2>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=9905+S+Pennsylvania+Ave+Ste+A+Oklahoma+City+OK+73159" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:text-orange-800">
                  <Icon name="external-link" className="h-4 w-4"/>
                  {' '}Open in Google Maps
                </a>
              </div>
              <div className="overflow-hidden rounded-2xl bg-white shadow-card">
                <iframe title="Map showing Jdiobe STEM Foundation office at 9905 S Pennsylvania Ave, Oklahoma City, OK" className="block h-[280px] w-full border-0 sm:h-[360px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade"  allowFullScreen src="https://maps.google.com/maps?q=9905+S+Pennsylvania+Ave,+Ste+A,+Oklahoma+City,+OK+73159&amp;hl=en&amp;z=16&amp;output=embed"></iframe>
              </div>
            </section>

            {/* FAQs — moved here from the standalone /faqs page. Most questions
                 people arrive with are answered below, so they sit ahead of the
                 form rather than on a page of their own. */}
            <section id="faqs" className="mt-14 md:mt-20" aria-labelledby="faqs-heading">
              <div className="mx-auto max-w-3xl">
                <div className="sr-fade-up text-center">
                  <p className="eyebrow">Help Center</p>
                  <h2 id="faqs-heading" className="mt-3">{text(blocks, "h2.frequently-asked-questions", "Frequently asked questions")}</h2>
                  <p className="lede mx-auto mt-4">{text(blocks, "p.answers-to-common-questions-about", "Answers to common questions about our foundation, programs, and how to get involved.")}</p>
                </div>

                <div id="faq-list" className="mt-10 space-y-4">
                  <div className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                    <button className="faq-toggle flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold text-charcoal-900">
                      <span>What is the Jdiobe STEM Foundation?</span>
                      <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/>
                    </button>
                    <div className="faq-content hidden px-6 pb-5 text-charcoal-600">
                      The Jdiobe STEM Foundation is a non-profit organization dedicated to empowering students in STEM through scholarships, mentorship, and career development.
                    </div>
                  </div>

                  <div className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                    <button className="faq-toggle flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold text-charcoal-900">
                      <span>How can I apply for a scholarship?</span>
                      <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/>
                    </button>
                    <div className="faq-content hidden px-6 pb-5 text-charcoal-600">
                      Visit our <Link href="/scholarship" className="font-bold text-orange-700 underline underline-offset-4">Scholarships page</Link> to learn more about available scholarships and the application process.
                    </div>
                  </div>

                  <div className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                    <button className="faq-toggle flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold text-charcoal-900">
                      <span>How do I become a volunteer?</span>
                      <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/>
                    </button>
                    <div className="faq-content hidden px-6 pb-5 text-charcoal-600">
                      Check out our <Link href="/volunteers" className="font-bold text-orange-700 underline underline-offset-4">Volunteers page</Link> for current opportunities and application details.
                    </div>
                  </div>

                  <div className="sr-fade-up overflow-hidden rounded-2xl bg-white shadow-card">
                    <button className="faq-toggle flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-bold text-charcoal-900">
                      <span>Who can participate in your programs?</span>
                      <Icon name="chevron-down" className="h-5 w-5 shrink-0 text-orange-700 transition-transform"/>
                    </button>
                    <div className="faq-content hidden px-6 pb-5 text-charcoal-600">
                      Our programs are open to students of all backgrounds who are passionate about STEM and innovation.
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
    </>
  );
}
