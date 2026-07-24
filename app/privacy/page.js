import SiteNav from '@/components/site-nav';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Flowternity Sports',
  description: 'How Flowternity Sports collects, uses, stores, shares and protects your personal information.',
};

const Section = ({ number, title, children }) => (
  <div className="mb-10">
    <h2 className="font-display font-black text-xl md:text-2xl mb-4">{number}. {title}</h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const Sub = ({ title, children }) => (
  <div className="mt-5">
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const P = ({ children }) => <p className="text-sm md:text-base">{children}</p>;

const Ul = ({ items }) => (
  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-2">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container max-w-3xl py-14 md:py-20">

        {/* Header */}
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-tight">Privacy Policy</h1>
          <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
            <p>Effective from: <strong className="text-foreground">1 August 2026</strong></p>
            <p>Last updated: <strong className="text-foreground">24 July 2026</strong></p>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            Flowternity Sports respects the privacy of its students, members, parents, guardians, visitors, customers and website users. This Privacy Policy explains how Flowternity Sports collects, uses, stores, shares and protects personal information when individuals interact with our services, website, facility, or programmes.
          </p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            By using our website, registering for a programme, purchasing a membership, making a booking or otherwise providing personal information to us, you acknowledge that your information will be handled in accordance with this Privacy Policy. Where a participant is below 18 years of age, the parent or legal guardian providing the participant's information confirms that they are authorised to do so.
          </p>
        </div>

        <Section number={1} title="About Flowternity Sports">
          <P><strong className="text-foreground">"Flowternity Sports," "Flowternity," "we," "us" or "our"</strong> refers to Flowternity Sports and its authorised management, employees, coaches, contractors and representatives.</P>
          <P>Flowternity Sports operates sports coaching, memberships, classes, court bookings, camps, competitions, events and other sports-related services from its facility in Horamavu–Kalkere, Bengaluru, Karnataka.</P>
          <div className="mt-4 p-5 bg-secondary/50 rounded-xl border border-border text-sm space-y-1">
            <p className="font-semibold text-foreground">Contact Information</p>
            <p>Flowternity Sports, Horamavu–Kalkere, Bengaluru, Karnataka, India</p>
            <p>Website: <a href="https://www.flowternity.com" className="underline text-foreground">www.flowternity.com</a></p>
            <p>Telephone / WhatsApp: <a href="tel:9886696155" className="underline text-foreground">9886696155</a></p>
            <p>Privacy email: <a href="mailto:admin@flowternity.com" className="underline text-foreground">admin@flowternity.com</a></p>
          </div>
        </Section>

        <Section number={2} title="Scope of This Privacy Policy">
          <P>This Privacy Policy applies to personal information collected through our website, booking platform, registration forms, payment systems, coaching and attendance systems, WhatsApp, telephone, email, social media, events, CCTV, photographs and videos taken during authorised activities, and direct interaction with staff and coaches.</P>
          <P>It does not govern independent third-party websites or applications linked through our website. Those services have their own privacy policies.</P>
        </Section>

        <Section number={3} title="Personal Information We May Collect">
          <Sub title="3.1 Student and Member Information">
            <Ul items={['Full name, date of birth, age, gender', 'Photograph or profile image', 'Selected sport, membership plan, skill level or category', 'Coaching batch or class history', 'Membership number, registration date, activation and expiry dates']} />
          </Sub>
          <Sub title="3.2 Parent or Guardian Information">
            <Ul items={['Parent or guardian name and relationship to student', 'Mobile and WhatsApp number, email address', 'Emergency contact information', 'Account login details and billing information', 'Consent and declarations provided on behalf of the child']} />
          </Sub>
          <Sub title="3.3 Contact and Account Information">
            <Ul items={['Telephone, WhatsApp, and email', 'Username and account identifier', 'Booking history and communication preferences', 'Customer-support correspondence']} />
          </Sub>
          <Sub title="3.4 Membership and Booking Information">
            <Ul items={['Membership plan, sport, amount paid, payment date, validity', 'Classes booked, cancellations, attendance and no-show records', 'Assigned player category and booking restrictions']} />
          </Sub>
          <Sub title="3.5 Payment and Transaction Information">
            <Ul items={['Transaction reference, payment status, amount, date and time', 'Invoice and tax details where applicable', 'Refund or payment-error information']} />
            <P className="text-xs mt-1">Flowternity does not directly store complete card numbers, banking passwords, UPI PINs, CVV or OTP information. Such data is processed by the authorised payment provider.</P>
          </Sub>
          <Sub title="3.6 Health and Safety Information">
            <Ul items={['Injuries, allergies, asthma, epilepsy, physical limitations', 'Medication requirements, emergency instructions, fitness-to-participate information', 'Medical clearance or doctor\'s certificate where required']} />
          </Sub>
          <Sub title="3.7 Coaching and Performance Information">
            <Ul items={['Player assessments, skill level, tactical understanding', 'Attendance, behaviour, coachability, progression level', 'Coach comments, competition performance, individual development plans']} />
          </Sub>
          <Sub title="3.8–3.9 Events, Competitions and Facility Bookings">
            <Ul items={['Team name, player roster, age category, event date and time', 'Company or organisation, event requirements, billing information']} />
          </Sub>
          <Sub title="3.10 Communications">
            <P>We may retain communications sent through WhatsApp, email, SMS, website forms, social media and customer support.</P>
          </Sub>
          <Sub title="3.11 Photographs, Audio and Video">
            <P>From coaching sessions, tournaments, camps, events, skill assessments and facility promotions. Separate consent may be obtained for promotional use involving children.</P>
          </Sub>
          <Sub title="3.12 CCTV">
            <P>CCTV operates in selected areas for security, safety, incident investigation and access control. It will not knowingly be installed in areas where individuals reasonably expect complete privacy.</P>
          </Sub>
          <Sub title="3.13 Website and Device Information">
            <Ul items={['IP address, browser type, device type, operating system', 'Pages visited, date and time of access, session and login activity', 'Cookie identifiers and technical error logs']} />
          </Sub>
        </Section>

        <Section number={4} title="Information Concerning Children">
          <P>Where a child's information is collected, it should be provided or authorised by a parent or legal guardian. We use a child's information primarily for registration, coaching, class placement, attendance, safety, emergency contact, player development, and communication with parents.</P>
          <P>Parents may contact us to request access to, correction of or deletion of their child's information, subject to applicable law and legitimate retention requirements.</P>
        </Section>

        <Section number={5} title="How We Collect Personal Information">
          <Ul items={[
            'Directly from the student, parent or customer when registering, booking, paying, or contacting us',
            'From a parent or guardian providing information for a minor',
            'From schools, companies, event organisers or programme coordinators',
            'Automatically through website cookies, logs and similar technologies',
            'From coaches and staff creating attendance, performance and safety records',
            'From service providers such as payment confirmations and booking details',
          ]} />
        </Section>

        <Section number={6} title="Purposes for Which We Use Personal Information">
          <Ul items={[
            '6.1 Membership administration — registration, activation, validity, renewals',
            '6.2 Class booking and attendance — bookings, confirmations, capacity, no-shows',
            '6.3 Coaching and player development — category placement, assessments, progression',
            '6.4 Payment and accounting — processing payments, invoices, tax records, fraud prevention',
            '6.5 Health and safety — safe participation, injury response, emergency contact',
            '6.6 Customer support — answering queries, complaints, schedule notifications',
            '6.7 Events and competitions — registrations, fixtures, results, awards',
            '6.8 Marketing and programme updates — new programmes, camps, offers (with consent)',
            '6.9 Photography and promotion — website, social media, posters, event highlights (with consent)',
            '6.10 Security and fraud prevention — protecting accounts, detecting misuse',
            '6.11 Legal and regulatory purposes — compliance with law, defending claims',
          ]} />
        </Section>

        <Section number={7} title="Basis for Processing Personal Information">
          <P>Processing may be based on consent, performance of a requested service, compliance with legal obligations, responding to a safety emergency, or protecting against fraud and security threats. Where consent is the basis, it may be withdrawn by contacting us — but withdrawal will not affect processing already completed.</P>
        </Section>

        <Section number={8} title="Consent for Children">
          <P>Where required, Flowternity Sports may seek verifiable consent from a parent or lawful guardian before processing a child's personal information. We do not intend to use children's information for behavioural advertising or systematic tracking unrelated to the services requested.</P>
        </Section>

        <Section number={9} title="Marketing Communications">
          <P>Promotional messages may be sent where consent has been provided or communication is otherwise permitted under applicable law. Individuals may opt out by replying "STOP," using an unsubscribe link, or contacting us. Essential service communications regarding memberships, bookings, safety, payments, and schedule changes may still be sent.</P>
        </Section>

        <Section number={10} title="Cookies and Similar Technologies">
          <P>Our website may use essential cookies (required for login, booking, and payments), preference cookies (remembering settings), analytics cookies (understanding website usage), and marketing cookies (measuring promotions, where consent is obtained). Users may control cookies through browser settings or a cookie consent tool where available.</P>
        </Section>

        <Section number={11} title="How We Share Personal Information">
          <P>Flowternity Sports does not sell personal information. We may share limited information with:</P>
          <Ul items={[
            'Coaches and authorised staff — for attendance, coaching, safety and emergency response',
            'Technology and booking providers — for website hosting, membership management, cloud storage',
            'Payment providers — payment gateways, banks, UPI providers, fraud-prevention services',
            'Communication providers — email, SMS, WhatsApp and notification platforms',
            'Event and sports partners — tournament organisers, schools, referees, medical personnel',
            'Professional advisers — accountants, auditors, lawyers, insurers',
            'Government and law-enforcement authorities — where required by law or court order',
            'Business reorganisation — authorised advisers or a successor organisation',
          ]} />
        </Section>

        <Section number={12} title="Public Information">
          <P>Tournament fixtures, team names, player names, scores, results, award winners, event photographs and match videos may be published. Personal contact details, residential addresses, health information and payment details will not ordinarily be published.</P>
        </Section>

        <Section number={13} title="Data Security">
          <P>We take reasonable technical, organisational and operational measures to protect personal information against unauthorised access, loss, misuse, alteration or destruction — including account authentication, access controls, secure hosting, encryption where appropriate, and secure payment providers. No electronic transmission or storage system can be guaranteed completely secure.</P>
        </Section>

        <Section number={14} title="Personal Data Breaches">
          <P>Where Flowternity becomes aware of a breach, we may investigate, contain the incident, secure affected systems, notify affected individuals where required, and notify the relevant authority where required. Users should promptly report suspected unauthorised access to their account.</P>
        </Section>

        <Section number={15} title="Data Retention">
          <P>Personal information is retained only as long as reasonably necessary for the purpose collected or as required by law — including membership and booking records, payment records, coaching assessments, incident reports, consent records and legal documents. When no longer required, information may be securely deleted, anonymised or archived.</P>
        </Section>

        <Section number={16} title="CCTV Retention">
          <P>CCTV footage is retained for a limited period determined by storage capacity, security needs and applicable law. Footage connected with an accident, complaint or legal matter may be retained longer. Access is restricted to authorised persons.</P>
        </Section>

        <Section number={17} title="Photograph and Video Retention">
          <P>Promotional photographs and videos may remain in social media archives, website archives and historical records. Where consent is withdrawn, Flowternity will take reasonable steps regarding future use. Withdrawal may not result in deletion from already-printed material, third-party reposts, or content required for legal purposes.</P>
        </Section>

        <Section number={18} title="Cross-Border Processing">
          <P>Some technology providers, cloud systems or payment providers may store or process information outside India. Flowternity will take reasonable steps to use reputable providers and comply with applicable legal requirements.</P>
        </Section>

        <Section number={19} title="Links to Third-Party Services">
          <P>Our website may link to payment gateways, maps, social media, WhatsApp, registration platforms and partner websites. Flowternity does not control the privacy practices of independent third parties. Users should review each service's privacy policy before providing information.</P>
        </Section>

        <Section number={20} title="Social Media and WhatsApp Communication">
          <P>Communications through social media or WhatsApp are processed by those independent platforms under their own policies. Users should avoid publishing sensitive medical, identity or payment information in public comments or WhatsApp messages where a more appropriate channel is available.</P>
        </Section>

        <Section number={22} title="Individual Rights and Requests">
          <P>Subject to applicable law, an individual — or an authorised parent or guardian acting for a child — may request to access, correct, complete, update or erase personal information, withdraw consent, opt out of promotional communication, or raise a grievance.</P>
          <P>Requests should be sent to <a href="mailto:admin@flowternity.com" className="underline text-foreground">admin@flowternity.com</a>. The requester may be asked to verify their identity, account and authority to make the request.</P>
        </Section>

        <Section number={23} title="Limitations on Deletion Requests">
          <P>Flowternity may not be able to immediately delete all information where retention is necessary for accounting, tax, legal claims, safety, fraud prevention, or enforcement of membership terms. Deleting essential account information may result in closure of the account and loss of access to historical records.</P>
        </Section>

        <Section number={25} title="Correction of Information">
          <P>Members should keep information accurate and current — especially telephone number, email, emergency contact, medical information, and injury status. Flowternity is not responsible for missed communication resulting from outdated information.</P>
        </Section>

        <Section number={26} title="Grievance Redressal">
          <div className="mt-2 p-5 bg-secondary/50 rounded-xl border border-border text-sm space-y-1">
            <p className="font-semibold text-foreground">Grievance and Privacy Officer</p>
            <p>Email: <a href="mailto:admin@flowternity.com" className="underline text-foreground">admin@flowternity.com</a></p>
            <p>Telephone: <a href="tel:9886696155" className="underline text-foreground">9886696155</a></p>
            <p>Address: Flowternity Sports, Horamavu–Kalkere, Bengaluru, Karnataka</p>
          </div>
          <P className="mt-3">A grievance should include your name, registered contact, student name where applicable, description of the concern, relevant date, and requested resolution. Flowternity will respond within a reasonable period, subject to verification and applicable legal timelines.</P>
        </Section>

        <Section number={29} title="Automated Decisions">
          <P>Flowternity does not presently make decisions producing significant legal effects solely through automated processing. The booking platform may automatically confirm eligibility, reject full classes, prevent duplicate bookings, apply category restrictions, or mark memberships as expired. Coaching-category and player-progression decisions involve authorised coaching judgement.</P>
        </Section>

        <Section number={30} title="Changes to This Privacy Policy">
          <P>Flowternity Sports may update this Privacy Policy to reflect changes in law, membership systems, website functions, technology or security practices. The revised policy will be published on the website with an updated effective date. Where a material change significantly affects how existing personal information is used, reasonable notice will be provided.</P>
        </Section>

        <Section number={31} title="Governing Law">
          <P>This Privacy Policy is governed by the laws applicable in India, including relevant data-protection and information-technology requirements. Disputes will be subject to the jurisdiction of the competent courts in Bengaluru, Karnataka.</P>
        </Section>

        {/* Cookie notice */}
        <div className="mt-10 p-5 bg-secondary/50 border border-border rounded-2xl">
          <h3 className="font-display font-bold text-base mb-2">Cookie Notice</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Flowternity Sports uses essential cookies to operate account login, memberships, bookings and payments. With your permission, we may also use analytics or marketing cookies to understand website usage and improve our services.</p>
        </div>

        {/* Short registration notice */}
        <div className="mt-6 p-5 bg-accent/10 border border-accent/30 rounded-2xl">
          <h3 className="font-display font-bold text-base mb-2">Short Notice for Registration</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Flowternity Sports will use the information provided in this form to administer registration, memberships, bookings, coaching, attendance, payments, communication, safety and emergency support. Where the participant is a minor, the form must be completed or authorised by a parent or legal guardian.</p>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground justify-between">
          <div className="flex gap-4">
            <Link href="/terms" className="underline">Terms &amp; Conditions</Link>
            <Link href="/#faq" className="underline">FAQs</Link>
          </div>
          <Link href="/" className="underline">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
