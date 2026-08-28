import Link from 'next/link';

import LegalDoc, { type LegalSection } from '@/components/LegalDoc';

/*
 * ============================ REVIEW BEFORE PUBLISHING ============================
 *
 * This document was drafted against what the site actually does — the fields in
 * ContactForm, VolunteerForm, NewsletterForm and ProposalForm, the Stripe
 * checkout in DonateForm, and the Django/Postgres backend the API routes proxy
 * to — rather than copied from a template. It is not legal advice and has not
 * been reviewed by counsel. Have a lawyer admitted in Oklahoma read it before
 * it goes live, and confirm in particular:
 *
 *   - the retention periods in section 10 against the foundation's actual
 *     records-retention practice and its 501(c)(3) recordkeeping obligations;
 *   - whether the foundation is subject to the GDPR/UK GDPR (sections 6 and 12) given
 *     its EU/UK donor base, and to Uganda's Data Protection and Privacy Act,
 *     2019 for its Ugandan operations;
 *   - the children's-data handling in section 7, which is the highest-risk part
 *     of this site: the Science Fair form collects a named minor's school,
 *     district, email, phone and guardian contact;
 *   - the foundation's EIN, which donors ask for and which is not in this repo.
 *
 * Anything not verifiable from the codebase or the site's own contact details
 * has been left out rather than guessed.
 * =================================================================================
 */

const ORG = 'Jdiobe STEM Foundation';
const EMAIL = 'info@jdiobestem.org';

function ContactBlock() {
  return (
    <address>
      {ORG}
      <br />
      9905 S Pennsylvania Ave, Ste A
      <br />
      Oklahoma City, OK 73159, USA
      <br />
      Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      <br />
      Telephone: <a href="tel:+14054374755">+1 405-437-4755</a>
    </address>
  );
}

const SECTIONS: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction and scope',
    body: (
      <>
        <p>
          {ORG} (&ldquo;<strong>the Foundation</strong>&rdquo;, &ldquo;<strong>we</strong>&rdquo;,
          &ldquo;<strong>us</strong>&rdquo; or &ldquo;<strong>our</strong>&rdquo;) is a non-profit
          organisation recognised as tax-exempt under section 501(c)(3) of the United States
          Internal Revenue Code. We provide STEM education, scholarships, mentorship and related
          programmes to students, principally in Uganda and South Sudan.
        </p>
        <p>
          This Privacy Policy (&ldquo;<strong>Policy</strong>&rdquo;) explains what personal
          information we collect through jdiobestem.org and any page, form or service that links to
          this Policy (together, the &ldquo;<strong>Site</strong>&rdquo;), why we collect it, who we
          share it with, how long we keep it, and the rights available to you.
        </p>
        <p>
          This Policy applies to information collected through the Site. It does not apply to
          information collected offline, to information collected by third parties whose services we
          link to, or to the internal records the Foundation keeps about programme participants
          under separate programme agreements.
        </p>
        <p>
          <strong>
            If you do not agree with this Policy, please do not use the Site or submit information
            through it.
          </strong>
        </p>
      </>
    ),
  },
  {
    id: 'controller',
    title: 'Who is responsible for your information',
    body: (
      <>
        <p>
          The Foundation is the party responsible for the personal information described in this
          Policy (the &ldquo;data controller&rdquo;, where that term applies). You may contact us
          about this Policy or about your information at:
        </p>
        <ContactBlock />
        <p>
          Please mark any privacy request &ldquo;Privacy Request&rdquo; in the subject line so that
          it reaches the right person promptly.
        </p>
      </>
    ),
  },
  {
    id: 'definitions',
    title: 'Definitions',
    body: (
      <>
        <p>In this Policy:</p>
        <dl>
          <div>
            <dt>&ldquo;Personal information&rdquo;</dt>
            <dd>
              means information that identifies, relates to, describes, or can reasonably be linked
              to an identified or identifiable individual. It does not include aggregated or
              de-identified information that cannot reasonably be used to identify you.
            </dd>
          </div>
          <div>
            <dt>&ldquo;Processing&rdquo;</dt>
            <dd>
              means any operation performed on personal information, including collection, storage,
              use, disclosure, transfer and deletion.
            </dd>
          </div>
          <div>
            <dt>&ldquo;Service provider&rdquo;</dt>
            <dd>
              means a third party that processes personal information on our behalf and on our
              instructions, such as our payment processor or hosting provider.
            </dd>
          </div>
          <div>
            <dt>&ldquo;Student information&rdquo;</dt>
            <dd>
              means personal information about a student submitted to us in connection with a
              programme, competition or registration, including information about a student who is
              under the age of 18.
            </dd>
          </div>
        </dl>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <h3>4.1 Information you provide to us</h3>
        <p>
          We collect the information you enter into forms on the Site. We collect only the fields
          listed below; we do not ask for government identification numbers, financial account
          details or health information through the Site.
        </p>
        <ol>
          <li>
            <strong>Contact enquiries.</strong> When you use our contact form we collect your name,
            email address, the subject you select, and the content of your message.
          </li>
          <li>
            <strong>Volunteer and mentor enquiries.</strong> When you apply to volunteer we collect
            your name, email address, telephone number, the area of interest you select, and the
            content of your message.
          </li>
          <li>
            <strong>Newsletter subscriptions.</strong> When you subscribe to updates we collect your
            email address.
          </li>
          <li>
            <strong>Science Fair project registration.</strong> When a project is registered we
            collect the student&rsquo;s name, gender, age, class or stream, school, district and
            region; the student&rsquo;s email address and telephone number; a parent or
            guardian&rsquo;s contact details; the names of the supervising teacher or mentor and the
            head teacher; and details of the project itself, including its title, category, type,
            keywords, duration, team size and summary. Section 7 explains how we treat this
            information.
          </li>
          <li>
            <strong>Donations.</strong> When you make a donation we collect your name and email
            address, together with the amount, currency and frequency of the gift. Payment card
            details are collected and processed by our payment processor and are never received or
            stored by us — see section 8.
          </li>
          <li>
            <strong>Other correspondence.</strong> If you email, telephone or write to us, we keep a
            record of that correspondence and of our response.
          </li>
        </ol>

        <h3>4.2 Information collected automatically</h3>
        <p>
          Our web servers and hosting provider automatically record technical information when the
          Site is accessed. This ordinarily includes your Internet Protocol (IP) address, the date
          and time of the request, the page or file requested, the referring page, and your browser
          and operating system type. These records are generated as part of operating and securing
          any website and are used for the purposes described in section 5(f).
        </p>
        <p>
          <strong>
            The Site does not use third-party advertising networks, behavioural advertising
            trackers, or third-party web analytics services.
          </strong>{' '}
          Section 15 describes the limited use of cookies and similar storage.
        </p>

        <h3>4.3 Information from third parties</h3>
        <p>
          Our payment processor confirms to us the outcome of a donation and returns the donor name,
          email address and gift details necessary to acknowledge and receipt the gift. Where you
          reach us through a social media platform, we receive the information that platform makes
          available to us in accordance with its own terms and your settings on it.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use personal information',
    body: (
      <>
        <p>We use personal information for the following purposes:</p>
        <ol>
          <li>
            <strong>To respond to you.</strong> To answer enquiries, volunteer applications,
            partnership proposals and other correspondence.
          </li>
          <li>
            <strong>To administer our programmes.</strong> To register, assess, organise and run
            competitions, scholarships, mentorship placements and other programmes, and to
            communicate with participants, schools, teachers, mentors and guardians about them.
          </li>
          <li>
            <strong>To process and acknowledge donations.</strong> To take payment, issue receipts
            and acknowledgements, keep the records required of a tax-exempt organisation, and
            administer recurring gifts.
          </li>
          <li>
            <strong>To send updates you have asked for.</strong> To send newsletters and programme
            updates where you have subscribed, until you unsubscribe.
          </li>
          <li>
            <strong>To report on our work.</strong> To prepare aggregated and de-identified
            statistics for donors, partners, funders and the public. We do not identify individuals
            in these reports without their consent (and, for a minor, the consent of a parent,
            guardian or school as described in section 7).
          </li>
          <li>
            <strong>To operate, secure and improve the Site.</strong> To keep the Site available,
            diagnose faults, detect and prevent fraud, abuse and unauthorised access, and improve
            how the Site works.
          </li>
          <li>
            <strong>To comply with law.</strong> To meet our legal, regulatory, tax, audit and
            reporting obligations, and to establish, exercise or defend legal claims.
          </li>
        </ol>
        <p>
          We do not sell personal information, and we do not share personal information with third
          parties for their own direct marketing or for cross-context behavioural advertising.
        </p>
      </>
    ),
  },
  {
    id: 'legal-bases',
    title: 'Legal bases for processing',
    body: (
      <>
        <p>
          Where data protection law requires us to identify a legal basis for processing (including
          under the EU and UK General Data Protection Regulation, and Uganda&rsquo;s Data Protection
          and Privacy Act, 2019, to the extent either applies to us), we rely on the following:
        </p>
        <ol>
          <li>
            <strong>Consent</strong> — for newsletter subscriptions, for optional information you
            choose to give us, and for any use of a photograph or testimonial identifying you. You
            may withdraw consent at any time, without affecting processing already carried out.
          </li>
          <li>
            <strong>Performance of a contract or steps taken at your request</strong> — for
            processing a donation, administering a scholarship or programme place, and responding to
            an enquiry you have initiated.
          </li>
          <li>
            <strong>Legitimate interests</strong> — for operating and securing the Site, keeping
            records of our activities, preventing fraud and abuse, and reporting on our charitable
            work. We balance these interests against your rights and freedoms.
          </li>
          <li>
            <strong>Legal obligation</strong> — for tax, accounting, audit and regulatory
            recordkeeping.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Students, children and guardians',
    body: (
      <>
        <p>
          <strong>
            Parts of our work necessarily involve information about children. We treat that
            information as the most sensitive information we hold.
          </strong>
        </p>
        <h3>7.1 Registrations are made through a school</h3>
        <p>
          The Science Fair project registration form is designed to be completed by, or under the
          supervision of, a supervising teacher, mentor, head teacher, parent or guardian. The
          online form is one step only; a formal entry additionally requires a signed Proposal
          Workbook carrying a mentor&rsquo;s evaluation, a head teacher&rsquo;s endorsement and a
          school stamp. By submitting a registration, the person submitting it confirms that they
          are authorised to provide the student&rsquo;s information and, where the student is under
          18, that a parent, guardian or the student&rsquo;s school has consented.
        </p>
        <h3>7.2 What we do with student information</h3>
        <p>
          We use student information only to administer the programme it was submitted for, to
          contact the student through the school, teacher or guardian contact provided, to judge and
          record entries, and to report on the programme in aggregate. We do not send marketing to a
          child and we do not condition participation on giving us more information than the
          programme requires.
        </p>
        <h3>7.3 No accounts for children</h3>
        <p>
          The Site does not offer accounts, profiles, messaging or public posting to children. No
          part of the Site invites a child to make personal information publicly available.
        </p>
        <h3>7.4 Guardian rights</h3>
        <p>
          A parent or guardian may ask us to confirm what information we hold about their child, to
          correct it, to stop further use of it, or to delete it. Deleting information may mean a
          registration can no longer be processed. Requests should be sent to{' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we may ask for proof of the relationship
          before acting.
        </p>
        <h3>7.5 Photography</h3>
        <p>
          Where we photograph or film at an event and a child is identifiable, we seek consent
          through the child&rsquo;s school, parent or guardian before publishing the image. If an
          image of your child has been published and you want it removed, contact us and we will
          remove it from material we control.
        </p>
      </>
    ),
  },
  {
    id: 'payments',
    title: 'Donations and payment processing',
    body: (
      <>
        <p>
          Donations made through the Site are processed by <strong>Stripe, Inc.</strong>{' '}
          (&ldquo;Stripe&rdquo;), an independent payment processor. When you proceed to give, you
          are taken to a checkout page hosted by Stripe.
        </p>
        <ol>
          <li>
            <strong>We never receive your card details.</strong> Card numbers, expiry dates and
            security codes are submitted directly to Stripe. They do not pass through, and are not
            stored on, our servers.
          </li>
          <li>
            <strong>What we receive.</strong> Stripe confirms the result of the transaction and
            returns the donor name, email address, amount, currency and frequency, so that we can
            record and acknowledge the gift.
          </li>
          <li>
            <strong>Stripe&rsquo;s own role.</strong> Stripe processes your payment information as
            an independent controller under its own privacy policy, which we do not control. Please
            read it at{' '}
            <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
              stripe.com/privacy
            </a>
            .
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'When we share personal information',
    body: (
      <>
        <p>We disclose personal information only as set out below.</p>
        <ol>
          <li>
            <strong>Service providers.</strong> To providers who process information on our behalf
            and on our instructions — our payment processor, hosting and database providers, and
            email delivery providers. They are permitted to use the information only to provide
            those services to us.
          </li>
          <li>
            <strong>Programme partners.</strong> To schools, universities, partner organisations,
            mentors and judges, where necessary to run a programme a person has entered, and limited
            to the information that programme requires.
          </li>
          <li>
            <strong>Professional advisers.</strong> To our auditors, accountants, insurers and
            lawyers, where required for them to advise us.
          </li>
          <li>
            <strong>Legal and safety disclosures.</strong> Where we are required to do so by law,
            court order, or a lawful request by a public authority; or where disclosure is
            reasonably necessary to enforce our terms, to protect the rights, property or safety of
            the Foundation, our participants (including a child at risk of harm) or the public, or
            to investigate fraud or a security incident.
          </li>
          <li>
            <strong>Organisational changes.</strong> In connection with a merger, affiliation,
            reorganisation or transfer of the Foundation&rsquo;s assets or programmes, subject to the
            recipient continuing to honour this Policy.
          </li>
          <li>
            <strong>With your consent.</strong> For any other disclosure, on your instruction or
            with your consent.
          </li>
        </ol>
        <p>
          <strong>We do not sell or rent personal information.</strong>
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep information',
    body: (
      <>
        <p>
          We keep personal information only for as long as it is needed for the purpose it was
          collected for, and then for any further period required by law. In practice:
        </p>
        <ol>
          <li>
            <strong>Enquiries and volunteer applications</strong> — for the duration of the
            correspondence and for a reasonable period afterwards, so that we can pick up a
            conversation where it left off.
          </li>
          <li>
            <strong>Newsletter subscriptions</strong> — until you unsubscribe, after which we retain
            a suppression record so that we do not contact you again in error.
          </li>
          <li>
            <strong>Programme and competition records</strong> — for the programme cycle and for as
            long as needed to administer alumni relationships, verify awards, and report to funders.
          </li>
          <li>
            <strong>Donation records</strong> — for the period required by tax and charity
            recordkeeping obligations applicable to a 501(c)(3) organisation.
          </li>
          <li>
            <strong>Server and security logs</strong> — for a short operational period, unless
            retained longer for the investigation of a specific incident.
          </li>
        </ol>
        <p>
          When information is no longer needed we delete it or de-identify it so that it can no
          longer be linked to you.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How we protect information',
    body: (
      <>
        <p>
          We maintain administrative, technical and physical safeguards designed to protect personal
          information against loss, misuse, and unauthorised access, disclosure, alteration or
          destruction. These include transmission of the Site over encrypted connections (HTTPS),
          access controls limiting staff access to what their role requires, authentication tokens
          held in cookies that scripts on the page cannot read, and keeping payment card data
          entirely outside our systems.
        </p>
        <p>
          <strong>
            No method of transmission over the internet and no method of electronic storage is
            completely secure.
          </strong>{' '}
          While we work to protect your information, we cannot guarantee its absolute security.
          Please do not send us sensitive information by email. If we become aware of a breach of
          security affecting your personal information, we will notify you and any regulator to the
          extent required by applicable law.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights and choices',
    body: (
      <>
        <p>
          Depending on where you live, you may have some or all of the following rights in respect
          of your personal information:
        </p>
        <ol>
          <li>
            <strong>Access</strong> — to be told whether we hold personal information about you and
            to receive a copy of it.
          </li>
          <li>
            <strong>Correction</strong> — to have inaccurate or incomplete information corrected.
          </li>
          <li>
            <strong>Deletion</strong> — to have your information deleted, where we have no
            overriding obligation or legitimate ground to keep it.
          </li>
          <li>
            <strong>Restriction and objection</strong> — to ask us to limit how we use your
            information, or to object to processing carried out on the basis of legitimate
            interests.
          </li>
          <li>
            <strong>Portability</strong> — to receive information you gave us in a structured,
            commonly used, machine-readable format.
          </li>
          <li>
            <strong>Withdrawal of consent</strong> — to withdraw consent at any time where we rely
            on it.
          </li>
          <li>
            <strong>Non-discrimination</strong> — not to receive discriminatory treatment for
            exercising any of these rights.
          </li>
        </ol>
        <h3>12.1 How to exercise a right</h3>
        <p>
          Send your request to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We will acknowledge it and
          respond within the period required by the law that applies to you. We may need to verify
          your identity before acting, and we may decline a request where an exemption applies — in
          which case we will explain why. An authorised agent may make a request on your behalf with
          proof of authorisation.
        </p>
        <h3>12.2 Complaints</h3>
        <p>
          If you are unhappy with our response you may complain to your local data protection or
          privacy regulator. We would appreciate the chance to address your concern first.
        </p>
      </>
    ),
  },
  {
    id: 'communications',
    title: 'Marketing and communications choices',
    body: (
      <>
        <p>
          Every newsletter and bulk update we send carries an unsubscribe link, and unsubscribing
          takes effect promptly. You may also unsubscribe by emailing{' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </p>
        <p>
          Unsubscribing does not stop administrative messages we must send you — for example, a
          donation receipt, a reply to your enquiry, a notice about a programme you have entered, or
          a change to this Policy.
        </p>
      </>
    ),
  },
  {
    id: 'international',
    title: 'International transfers of information',
    body: (
      <>
        <p>
          The Foundation is based in the United States and delivers programmes in Uganda and South
          Sudan. Personal information you give us may therefore be transferred to, stored in, and
          processed in the United States, Uganda, South Sudan, or any other country in which we or
          our service providers operate.
        </p>
        <p>
          The data protection laws of these countries may differ from those of your own country and
          may offer a different level of protection. Where we transfer personal information out of a
          jurisdiction that restricts such transfers, we take steps required by that law to protect
          it, which may include standard contractual clauses or obtaining your consent.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and similar technologies',
    body: (
      <>
        <p>
          A cookie is a small text file stored on your device by your browser. The Site uses cookies
          and similar browser storage only where they are necessary for it to function:
        </p>
        <ol>
          <li>
            <strong>Authentication.</strong> Staff signing in to the Foundation&rsquo;s
            administrative area receive a session cookie. It is marked <code>httpOnly</code>, so no
            script running on the page can read it. It is not set for ordinary visitors.
          </li>
          <li>
            <strong>Local browser storage.</strong> A small amount of data may be stored in your
            browser to remember a setting between visits. It stays on your device and is not
            transmitted to us.
          </li>
          <li>
            <strong>Payment.</strong> Our payment processor sets cookies on its own checkout pages
            for fraud prevention and to operate the checkout, governed by its privacy policy.
          </li>
        </ol>
        <p>
          <strong>
            We do not use advertising cookies, cross-site tracking pixels, or third-party analytics
            cookies.
          </strong>{' '}
          You can block or delete cookies in your browser settings, though blocking necessary
          cookies may prevent parts of the Site from working.
        </p>
        <p>
          Because we do not track visitors across third-party websites, we do not respond
          differently to a &ldquo;Do Not Track&rdquo; browser signal.
        </p>
      </>
    ),
  },
  {
    id: 'third-party-links',
    title: 'Third-party links and services',
    body: (
      <p>
        The Site links to websites and services operated by others, including partner organisations,
        social media platforms and our payment processor. We do not control those sites and are not
        responsible for their content or their privacy practices. This Policy does not apply to
        them. Please read the privacy policy of any site you visit from ours.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this Policy',
    body: (
      <p>
        We may update this Policy from time to time to reflect changes to our practices, our
        services, or the law. When we do, we will revise the &ldquo;Last updated&rdquo; date at the
        top of this page. Where a change is material, we will provide a more prominent notice, which
        may include emailing subscribers. Your continued use of the Site after a change takes effect
        means you accept the revised Policy.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'How to contact us',
    body: (
      <>
        <p>
          Questions, requests and complaints about this Policy or about your personal information
          should be addressed to:
        </p>
        <ContactBlock />
        <p>
          See also our <Link href="/terms">Terms of Use</Link>, which govern your use of the Site.
        </p>
      </>
    ),
  },
];

export default function PrivacyContent() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Privacy Policy"
      lede="How the Jdiobe STEM Foundation collects, uses, shares and protects personal information submitted through this website — including information about the students who take part in our programmes."
      effective="28 August 2026"
      updated="28 August 2026"
      sections={SECTIONS}
    />
  );
}
