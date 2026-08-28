import Link from 'next/link';
import Logo from './Logo';
import NewsletterForm from './NewsletterForm';
import SocialIcon from './SocialIcon';

/**
 * Site footer.
 *
 * Brand column carries the newsletter signup; explore and contact sit beside it;
 * the 501(c)(3) line closes the page at the very bottom. The `#footer` wrapper id
 * is kept because typography.css targets it to shrink footer text a step below
 * body copy.
 */
export default function Footer() {
  return (
    <div id="footer">
      <div className="pattern-band" aria-hidden="true" />
      <footer className="surface-dark bg-charcoal-700 text-white/80">
        <div className="container-page pt-14 pb-12">
          <div className="grid grid-cols-1 gap-9 lg:grid-cols-12 lg:gap-10 xl:gap-12">
            {/* Brand */}
            <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left">
              <Logo className="mb-6 h-8 w-auto text-white sm:h-9" />
              <h2 className="mb-1 text-xl font-extrabold tracking-tight text-white">Stay in the loop</h2>
              <NewsletterForm />
            </div>

            {/* Explore */}
            <nav className="lg:col-span-4" aria-label="Footer explore">
              <div className="grid grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.14em] text-orange-400">
                    Explore
                  </h3>
                  <ul className="space-y-0.5 text-sm">
                    <li>
                      <Link href="/" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Home</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/about" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>About Us</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/team" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Our Team</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/programs" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Programs</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/impact" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Impact</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/news" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>News</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/magazine" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Magazine</span>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.14em] text-orange-400">
                    Get involved
                  </h3>
                  <ul className="space-y-0.5 text-sm">
                    <li>
                      <Link href="/volunteers" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Volunteers</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/donate" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Donate</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" className="block py-2 text-white/75 transition hover:text-orange-400">
                        <span>Contact</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>

            {/* Contact */}
            <div className="lg:col-span-4">
              <h3 className="mb-5 text-sm font-extrabold uppercase tracking-[0.14em] text-orange-400">
                Contact
              </h3>
              <ul className="space-y-5 text-sm">
                <li>
                  <span className="font-semibold text-white">Address</span>
                  <p className="mt-1 leading-relaxed text-white/70">
                    9905 S Pennsylvania Ave, Ste A<br/>
                    Oklahoma City, OK 73159<br/>
                    USA
                  </p>
                </li>
                <li>
                  <span className="font-semibold text-white">Email</span>
                  <p className="mt-1">
                    <a href="mailto:info@jdiobestem.org" className="text-white/70 transition hover:text-orange-400">info@jdiobestem.org</a>
                  </p>
                </li>
                <li>
                  <span className="font-semibold text-white">Phone</span>
                  <p className="mt-1">
                    <a href="tel:+14054374755" className="text-white/70 transition hover:text-orange-400">+1405-437-4755</a>
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="mr-2 text-xs font-extrabold uppercase tracking-[0.14em] text-white/60">Follow</span>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-orange-500 hover:text-charcoal-900" aria-label="Facebook">
                <SocialIcon name="facebook" className="w-[18px] h-[18px]"/>
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-orange-500 hover:text-charcoal-900" aria-label="X">
                <SocialIcon name="x" className="w-[18px] h-[18px]"/>
              </a>
              <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-orange-500 hover:text-charcoal-900" aria-label="YouTube">
                <SocialIcon name="youtube" className="w-[18px] h-[18px]"/>
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/75 transition hover:bg-orange-500 hover:text-charcoal-900" aria-label="LinkedIn">
                <SocialIcon name="linkedin" className="w-[18px] h-[18px]"/>
              </a>
            </div>
            {/* Copyright sits above the legal links on narrow screens and beside
                them from sm up, so the bar stays one line on a phone. */}
            <div className="flex flex-col items-center gap-2 sm:items-end">
              <p className="text-center text-xs text-white/55 sm:text-right">
                &copy; 2026 Jdiobe STEM Foundation. a 501(c)(3) organization. All rights reserved.
              </p>
              <nav className="flex items-center gap-3 text-xs" aria-label="Legal">
                <Link href="/privacy" className="text-white/60 transition hover:text-orange-400">
                  Privacy Policy
                </Link>
                <span className="text-white/25" aria-hidden="true">|</span>
                <Link href="/terms" className="text-white/60 transition hover:text-orange-400">
                  Terms of Use
                </Link>
              </nav>
            </div>
          </div>

          
        </div>
      </footer>
    </div>
  );
}
