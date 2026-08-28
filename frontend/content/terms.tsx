import Link from 'next/link';

import LegalDoc, { type LegalSection } from '@/components/LegalDoc';

/*
 * ============================ REVIEW BEFORE PUBLISHING ============================
 *
 * Drafted against what this site actually offers — informational pages, the
 * enquiry/volunteer/newsletter forms, the Science Fair registration, and Stripe
 * donations. It is not legal advice and has not been reviewed by counsel. Have
 * a lawyer admitted in Oklahoma read it before it goes live, and settle in
 * particular:
 *
 *   - the refund position in section 10, which currently states that gifts are
 *     final unless made in error. Confirm the Foundation's actual policy,
 *     including how it handles recurring-gift cancellations and chargebacks;
 *   - the limitation of liability in section 15 and the liability cap, which
 *     need to reflect the Foundation's insurance and are the clauses most often
 *     narrowed by state law;
 *   - whether the Foundation wants arbitration and a class-action waiver in
 *     section 19. This draft deliberately does NOT impose arbitration — it
 *     provides for informal resolution and then the Oklahoma courts. That is a
 *     policy decision for the board, not a drafting default;
 *   - the DMCA agent in section 11(d). A designated agent must be registered
 *     with the U.S. Copyright Office for the safe harbour to be available, and
 *     the name and address of that agent are not in this repo.
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
    id: 'acceptance',
    title: 'Acceptance of these Terms',
    body: (
      <>
        <p>
          These Terms of Use (&ldquo;<strong>Terms</strong>&rdquo;) are a binding agreement between
          you and {ORG}, a non-profit organisation recognised as tax-exempt under section 501(c)(3)
          of the United States Internal Revenue Code (&ldquo;<strong>the Foundation</strong>&rdquo;,
          &ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo; or &ldquo;
          <strong>our</strong>&rdquo;). They govern your access to and use of jdiobestem.org and any
          page, form or service that links to these Terms (together, the &ldquo;
          <strong>Site</strong>&rdquo;).
        </p>
        <p>
          <strong>
            By accessing or using the Site, you agree to these Terms. If you do not agree, do not
            use the Site.
          </strong>
        </p>
        <p>
          Section 15 (Limitation of liability) and section 18 (Governing law and venue) limit our
          liability to you and determine where a dispute must be brought. Please read them.
        </p>
      </>
    ),
  },
  {
    id: 'definitions',
    title: 'Definitions',
    body: (
      <dl>
        <div>
          <dt>&ldquo;Content&rdquo;</dt>
          <dd>
            means all text, images, video, audio, graphics, logos, data, layout, code and other
            material made available on the Site.
          </dd>
        </div>
        <div>
          <dt>&ldquo;Submission&rdquo;</dt>
          <dd>
            means anything you send to us through the Site, including enquiries, volunteer
            applications, project registrations, proposals, feedback and correspondence.
          </dd>
        </div>
        <div>
          <dt>&ldquo;Programme&rdquo;</dt>
          <dd>
            means any activity the Foundation runs, including competitions, scholarships, mentorship
            placements, training and outreach.
          </dd>
        </div>
        <div>
          <dt>&ldquo;you&rdquo;</dt>
          <dd>
            means the person accessing the Site and, where they act for a school, organisation or
            other person, that party as well.
          </dd>
        </div>
      </dl>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility and authority',
    body: (
      <>
        <ol>
          <li>
            The Site is intended for use by adults and by young people acting with the involvement
            of a parent, guardian, teacher or school.
          </li>
          <li>
            If you are under the age of 18, you may use the Site and submit information only with
            the consent and supervision of a parent, guardian or teacher, who accepts these Terms on
            your behalf.
          </li>
          <li>
            If you accept these Terms on behalf of a school, organisation or another individual, you
            represent that you have the authority to bind that party, and &ldquo;you&rdquo; includes
            that party.
          </li>
          <li>
            You may not use the Site if you are barred from doing so under the laws of the United
            States or of your country of residence.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to the Site and to these Terms',
    body: (
      <>
        <ol>
          <li>
            We may modify these Terms at any time. The revised Terms take effect when posted, and we
            will update the &ldquo;Last updated&rdquo; date at the top of this page. Where a change
            is material we will give more prominent notice.
          </li>
          <li>
            Your continued use of the Site after the revised Terms take effect constitutes your
            acceptance of them. If you do not accept a change, stop using the Site.
          </li>
          <li>
            We may add, change, suspend or withdraw any part of the Site, including any Programme
            information published on it, at any time and without notice or liability.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'permitted-use',
    title: 'Permitted use of the Site',
    body: (
      <>
        <p>
          Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable
          licence to access and use the Site for your personal, educational, or internal
          organisational purposes, and to view, download and print Content for those purposes,
          provided you retain all copyright and other proprietary notices.
        </p>
        <p>
          Teachers and schools may reproduce Content for classroom use, without charge, provided the
          Foundation is credited as the source.
        </p>
      </>
    ),
  },
  {
    id: 'prohibited',
    title: 'Prohibited conduct',
    body: (
      <>
        <p>You must not, and must not permit any other person to:</p>
        <ol>
          <li>
            use the Site for any unlawful purpose, or in breach of any applicable law or regulation;
          </li>
          <li>
            submit information that is false, misleading, fraudulent, or that impersonates another
            person or misrepresents your affiliation with any person or organisation;
          </li>
          <li>
            submit or transmit any material that is defamatory, obscene, harassing, abusive, hateful,
            or that exploits or endangers a child;
          </li>
          <li>
            upload or transmit any virus, worm, malicious code, or anything designed to interrupt,
            damage or limit the functioning of any software, hardware or communications equipment;
          </li>
          <li>
            attempt to gain unauthorised access to the Site, to any account, or to any server,
            computer or database connected to the Site, or to circumvent any security or
            authentication measure;
          </li>
          <li>
            probe, scan or test the vulnerability of the Site or breach any security measure without
            our prior written authorisation;
          </li>
          <li>
            use any robot, spider, scraper or other automated means to access the Site, or to
            harvest or collect information about other users;
          </li>
          <li>
            impose an unreasonable or disproportionately large load on our infrastructure, or
            interfere with the proper working of the Site;
          </li>
          <li>
            reproduce, duplicate, copy, sell, resell or exploit any part of the Site or Content for
            a commercial purpose without our prior written consent;
          </li>
          <li>
            remove, obscure or alter any copyright, trademark or other proprietary notice; or
          </li>
          <li>
            solicit donations, funds or personal information from any other person through or in the
            name of the Site.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'submissions',
    title: 'Your Submissions',
    body: (
      <>
        <ol>
          <li>
            <strong>Accuracy.</strong> You are responsible for the accuracy of everything you submit
            and for having the right to submit it, including any right to provide another
            person&rsquo;s information. Where you submit information about a student, you confirm
            you are authorised to do so and, where the student is under 18, that a parent, guardian
            or the student&rsquo;s school has consented.
          </li>
          <li>
            <strong>Licence to us.</strong> You grant the Foundation a non-exclusive, worldwide,
            royalty-free, perpetual, irrevocable licence to use, store, reproduce, adapt and display
            your Submission for the purposes of responding to it, administering the relevant
            Programme, and keeping records of our activities. This licence does not transfer
            ownership: you keep any intellectual property rights you hold in your Submission.
          </li>
          <li>
            <strong>Public use requires separate consent.</strong> We will not publish a Submission,
            a photograph, or a testimonial that identifies you in our promotional material without
            your separate consent (and, for a minor, the consent of a parent, guardian or school).
          </li>
          <li>
            <strong>No confidentiality or obligation.</strong> Unless we have signed a separate
            written confidentiality agreement with you, Submissions are not treated as confidential
            and create no obligation on us. Do not send us information you consider a trade secret
            or otherwise confidential.
          </li>
          <li>
            <strong>Ideas and feedback.</strong> If you send us suggestions or feedback about the
            Site or our Programmes, we may use them without restriction, attribution or
            compensation.
          </li>
          <li>
            <strong>Moderation.</strong> We may decline, edit or remove any Submission at our
            discretion. We are not obliged to review Submissions and do not undertake to do so.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'programmes',
    title: 'Programmes, applications and no guarantee of a place',
    body: (
      <>
        <ol>
          <li>
            Programme information on the Site is published for general information. It does not
            constitute an offer, and it may change.
          </li>
          <li>
            <strong>
              Submitting a form through the Site does not create a place on any Programme, an award
              of any scholarship, an offer of a mentorship, or any other entitlement.
            </strong>{' '}
            Applications are assessed under the criteria published for the relevant Programme, and a
            place or award arises only when we confirm it in writing.
          </li>
          <li>
            Some Programmes require steps that a web form cannot carry. In particular, registering a
            Science Fair project through the Site is an online step only; a formal entry
            additionally requires a signed Proposal Workbook carrying a mentor&rsquo;s evaluation, a
            head teacher&rsquo;s endorsement and a school stamp.
          </li>
          <li>
            Participation in a Programme may be subject to further terms, rules or agreements. Where
            those conflict with these Terms in respect of that Programme, those terms prevail.
          </li>
          <li>
            Facilities, institutes and initiatives described on the Site as planned or in
            development are statements of present intention only. They are not commitments, and they
            depend on funding, partnerships and approvals that may not be obtained.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts and credentials',
    body: (
      <>
        <p>
          The Site does not offer public accounts. Where the Foundation issues credentials to staff,
          volunteers or partners for an administrative area:
        </p>
        <ol>
          <li>
            you must keep your credentials confidential and must not share them or allow anyone else
            to use them;
          </li>
          <li>
            you are responsible for all activity carried out under your credentials, whether or not
            authorised by you;
          </li>
          <li>
            you must notify us immediately at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> of any actual
            or suspected unauthorised use; and
          </li>
          <li>we may suspend or revoke credentials at any time.</li>
        </ol>
      </>
    ),
  },
  {
    id: 'donations',
    title: 'Donations',
    body: (
      <>
        <ol>
          <li>
            <strong>Voluntary gift.</strong> A donation made through the Site is a voluntary,
            unrestricted gift to the Foundation unless we have agreed in writing that it is
            restricted to a particular purpose. We apply unrestricted gifts where the need is
            greatest, in furtherance of our charitable purposes and at the discretion of our board.
          </li>
          <li>
            <strong>Payment processing.</strong> Payments are processed by Stripe, Inc. on its own
            terms. We do not receive or store your card details. You are responsible for ensuring
            the payment details you provide are accurate and that you are authorised to use the
            payment method.
          </li>
          <li>
            <strong>Currency, fees and taxes.</strong> Donations are taken in the currency shown at
            checkout. Your bank or card issuer may apply currency conversion or international
            transaction fees, which we do not control and cannot refund.
          </li>
          <li>
            <strong>Recurring gifts.</strong> If you set up a recurring donation, it continues at the
            interval you selected until you cancel it. You may cancel at any time by contacting us
            at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>; cancellation takes effect for future
            instalments and does not reverse instalments already taken.
          </li>
          <li>
            <strong>Refunds.</strong> Because a donation is a gift rather than a purchase, donations
            are final. Where a gift was made in error, in a mistaken amount, or without
            authorisation, contact us promptly at <a href={`mailto:${EMAIL}`}>{EMAIL}</a> and we
            will review the circumstances in good faith.
          </li>
          <li>
            <strong>Acknowledgement and tax treatment.</strong> We will acknowledge your gift by
            email. Whether a donation is deductible, and to what extent, depends on the tax law of
            your jurisdiction and on your own circumstances. Nothing on the Site is tax advice;
            consult your own adviser.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <>
        <ol>
          <li>
            The Site and its Content are owned by the Foundation or its licensors and are protected
            by copyright, trademark and other laws. Except for the limited licence in section 5, no
            right in the Site or Content is granted to you.
          </li>
          <li>
            &ldquo;{ORG}&rdquo;, the Foundation&rsquo;s logo and other marks displayed on the Site
            are our trademarks or trade dress. You may not use them without our prior written
            consent, except to refer accurately to the Foundation.
          </li>
          <li>
            Photographs of participants, mentors and staff are used with permission and may not be
            reproduced separately from the page on which they appear.
          </li>
          <li>
            <strong>Copyright complaints.</strong> If you believe material on the Site infringes your
            copyright, send us a written notice at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            identifying the work, identifying the material and its location on the Site, and
            providing your contact details, a statement that you have a good-faith belief the use is
            not authorised, and a statement that the information in your notice is accurate. We will
            investigate and remove or disable material where appropriate.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'third-party',
    title: 'Third-party links and services',
    body: (
      <p>
        The Site links to websites and services operated by others, including partner organisations,
        social media platforms and our payment processor. We provide those links for convenience.
        We do not control, endorse, or accept responsibility for third-party sites, their content,
        or their practices, and your use of them is governed by their terms and at your own risk.
      </p>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: (
      <p>
        Our <Link href="/privacy">Privacy Policy</Link> explains what personal information we
        collect through the Site, how we use it, and the rights available to you. It is incorporated
        into these Terms by reference. By using the Site you acknowledge that you have read it.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    body: (
      <>
        <ol>
          <li>
            <strong>
              THE SITE AND ALL CONTENT ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
              AVAILABLE&rdquo;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
            </strong>{' '}
            To the fullest extent permitted by law, we disclaim all warranties, including any
            implied warranty of merchantability, fitness for a particular purpose, title, and
            non-infringement.
          </li>
          <li>
            We do not warrant that the Site will be uninterrupted, timely, secure or error-free,
            that defects will be corrected, or that the Site is free of viruses or other harmful
            components.
          </li>
          <li>
            <strong>Educational content is general information.</strong> Content published on the
            Site is provided for general educational and informational purposes. It is not
            professional, engineering, medical, financial, legal or tax advice, and must not be
            relied on as a substitute for advice from a qualified professional.
          </li>
          <li>
            <strong>Practical activities carry risk.</strong> Any experiment, build, project or
            activity described on the Site must be carried out under appropriate adult supervision
            and in accordance with applicable safety rules. You are responsible for assessing the
            suitability and safety of any activity before undertaking it.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <>
        <ol>
          <li>
            <strong>
              TO THE FULLEST EXTENT PERMITTED BY LAW, THE FOUNDATION AND ITS TRUSTEES, DIRECTORS,
              OFFICERS, EMPLOYEES, VOLUNTEERS AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES,
            </strong>{' '}
            or for any loss of profits, revenue, data, goodwill or opportunity, arising out of or in
            connection with your use of, or inability to use, the Site — whether based in contract,
            tort (including negligence), strict liability or otherwise, and whether or not we have
            been advised of the possibility of such damages.
          </li>
          <li>
            <strong>
              OUR TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THE SITE OR THESE TERMS
              WILL NOT EXCEED ONE HUNDRED UNITED STATES DOLLARS (US$100).
            </strong>
          </li>
          <li>
            Nothing in these Terms excludes or limits any liability that cannot lawfully be excluded
            or limited, including liability for death or personal injury caused by negligence or for
            fraud or fraudulent misrepresentation.
          </li>
          <li>
            Some jurisdictions do not allow the exclusion of certain warranties or the limitation of
            certain damages. Where that is the case, the exclusions and limitations above apply to
            the maximum extent permitted, and some may not apply to you.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'indemnity',
    title: 'Indemnification',
    body: (
      <p>
        You agree to indemnify, defend and hold harmless the Foundation and its trustees, directors,
        officers, employees, volunteers and agents from and against any claim, demand, loss,
        liability, damage, cost or expense (including reasonable legal fees) arising out of or
        related to your use of the Site, your Submissions, your breach of these Terms, or your
        violation of any law or of the rights of any third party. We reserve the right to assume the
        exclusive defence and control of any matter subject to indemnification by you, in which case
        you agree to cooperate with us.
      </p>
    ),
  },
  {
    id: 'suspension',
    title: 'Suspension and termination',
    body: (
      <p>
        We may suspend or terminate your access to the Site, in whole or in part, at any time and
        without notice, where we reasonably believe you have breached these Terms or where necessary
        to protect the Site, our participants or a third party. You may stop using the Site at any
        time. Sections 7 (Your Submissions), 11 (Intellectual property), 14 (Disclaimers), 15
        (Limitation of liability), 16 (Indemnification), 18 (Governing law and venue) and 20
        (General) survive termination.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law and venue',
    body: (
      <>
        <ol>
          <li>
            These Terms and any dispute arising out of or relating to them or to the Site are
            governed by the laws of the State of Oklahoma, United States of America, without regard
            to its conflict-of-laws principles.
          </li>
          <li>
            You agree that the state and federal courts located in Oklahoma County, Oklahoma, have
            exclusive jurisdiction over any such dispute, and you submit to the personal
            jurisdiction of those courts and waive any objection to venue there.
          </li>
          <li>
            We make no representation that the Site is appropriate or available for use in any
            particular location. If you access the Site from outside the United States, you do so on
            your own initiative and are responsible for compliance with local law.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'disputes',
    title: 'Resolving a dispute',
    body: (
      <>
        <p>
          <strong>Talk to us first.</strong> If you have a complaint or a dispute, contact us at{' '}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with a description of the issue and the outcome you
          are seeking. We will acknowledge your notice and try in good faith to resolve the matter
          informally.
        </p>
        <p>
          Neither party may commence proceedings until 30 days after that notice is given, unless
          the claim is for injunctive relief or for infringement of intellectual property rights.
          This section does not limit either party&rsquo;s right to bring a claim in a small claims
          court.
        </p>
      </>
    ),
  },
  {
    id: 'general',
    title: 'General',
    body: (
      <ol>
        <li>
          <strong>Entire agreement.</strong> These Terms, together with the Privacy Policy and any
          terms applying to a specific Programme, are the entire agreement between you and us about
          the Site and supersede any prior understanding on that subject.
        </li>
        <li>
          <strong>Severability.</strong> If any provision is held unenforceable, it will be modified
          to the minimum extent necessary to make it enforceable, and the remaining provisions
          continue in full force.
        </li>
        <li>
          <strong>No waiver.</strong> Our failure to enforce a provision is not a waiver of it, and
          no waiver is effective unless made in writing.
        </li>
        <li>
          <strong>Assignment.</strong> You may not assign or transfer these Terms without our prior
          written consent. We may assign them in connection with a merger, affiliation or
          reorganisation of the Foundation.
        </li>
        <li>
          <strong>No third-party beneficiaries.</strong> These Terms confer no rights on any person
          other than you and us.
        </li>
        <li>
          <strong>Force majeure.</strong> We are not liable for any failure or delay caused by events
          beyond our reasonable control.
        </li>
        <li>
          <strong>Headings.</strong> Headings are for convenience only and do not affect
          interpretation.
        </li>
      </ol>
    ),
  },
  {
    id: 'contact',
    title: 'How to contact us',
    body: (
      <>
        <p>Questions about these Terms should be addressed to:</p>
        <ContactBlock />
        <p>
          See also our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
];

export default function TermsContent() {
  return (
    <LegalDoc
      eyebrow="Legal"
      title="Terms of Use"
      lede="The terms on which the Jdiobe STEM Foundation makes this website available — what you may do with it, what you are responsible for when you submit information or make a donation, and the limits of our liability."
      effective="28 August 2026"
      updated="28 August 2026"
      sections={SECTIONS}
    />
  );
}
