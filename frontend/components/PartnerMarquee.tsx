/** A static, optically balanced list of the Foundation's partners. */
const PARTNERS = [
  { src: '/images/partners/HCLV-BUDGE-1.png', name: 'Holy Cross Lake View' },
  { src: '/images/partners/oklahoma-state-university.svg', name: 'Oklahoma State University' },
  { src: '/images/partners/laudato-logo.png', name: 'Laudato Youth Initiative' },
  { src: '/images/partners/prograte-logo.svg', name: 'Prograte' },
];
export default function PartnerMarquee() {
  return <ul className="editorial-partners" aria-label="Our partners">{PARTNERS.map(partner => <li key={partner.name}><img src={partner.src} alt={partner.name} width="180" height="80" loading="lazy" decoding="async" /></li>)}</ul>;
}
