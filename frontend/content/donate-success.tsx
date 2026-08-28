import Link from 'next/link';
import DonateSuccessMessage from '@/components/DonateSuccessMessage';
import Icon from '@/components/Icon';

export default function DonateSuccessContent() {
  return (
    <>
      <section className="page-hero">
          <div className="page-hero__overlay" aria-hidden="true"></div>
          <div className="page-hero__inner mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-white/20 ring-1 ring-white/40">
              <Icon name="check-circle" className="h-7 w-7"/>
            </div>
            <p className="page-hero__eyebrow">Donation received</p>
            <h1>Thank you</h1>
            <DonateSuccessMessage />
            <Link href="/" className="mt-6 btn-on-brand">
              <Icon name="home" className="h-4 w-4"/>
              {' '}Back to home
            </Link>
          </div>
        </section>
    </>
  );
}
