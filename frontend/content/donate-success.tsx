import Link from 'next/link';
import DonateSuccessMessage from '@/components/DonateSuccessMessage';
import FeatureIcon from '@/components/FeatureIcon';
import Icon from '@/components/Icon';

export default function DonateSuccessContent() {
  return (
    <>
      <section className="page-hero">
          <div className="page-hero__overlay" aria-hidden="true"></div>
          <div className="page-hero__inner mx-auto max-w-2xl text-center">
            <FeatureIcon name="done" className="feature-ico mb-4" />
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
