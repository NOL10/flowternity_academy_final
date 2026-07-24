import SiteNav from '@/components/site-nav';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Flowternity Sports',
  description: 'How Flowternity Sports collects, uses, and protects your personal information.',
};

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="font-display font-black text-xl md:text-2xl mb-4">{title}</h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const P = ({ children }) => <p className="text-sm md:text-base">{children}</p>;

const Ul = ({ items }) => (
  <ul className="list-disc list-inside space-y-1.5 text-sm md:text-base ml-2">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container max-w-3xl py-14 md:py-20">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-4">Last updated: <strong className="text-foreground">1 August 2026</strong></p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Flowternity Sports ("we," "our," or "us") is committed to protecting the privacy and personal information of our members, students, parents, and website visitors. This Privacy Policy explains what information we collect, how we use it, who we share it with, and your rights regarding your personal data.
          </p>
        </div>

        <Section title="Information We Collect">
          <P>We collect and process personal information that you provide to us when you:</P>
          <Ul items={[
            'Register for a membership or create an account',
            'Book a class through our website',
            'Make a payment',
            'Contact us via email, phone, or in person',
            'Visit our facility',
            'Participate in our programmes',
            'Subscribe to newsletters or updates',
          ]} />
          <P className="mt-4">The types of information we may collect include:</P>
          <Ul items={[
            'Name (student and parent/guardian)',
            'Date of birth',
            'Email address',
            'Phone number',
            'Postal address',
            'Emergency contact details',
            'Medical information relevant to safe participation',
            'Payment and billing information',
            'Membership type and status',
            'Class bookings and attendance records',
            'Performance and progress tracking data',
            'Category placement and coaching notes',
            'Photos and videos from classes, events, and tournaments',
            'Account login credentials',
            'Device and browser information when you use our website',
          ]} />
        </Section>

        <Section title="How We Use Your Information">
          <P>We use the information we collect for legitimate business purposes, including:</P>
          <Ul items={[
            'Processing membership registrations and renewals',
            'Managing class bookings and attendance',
            'Processing payments and issuing invoices',
            'Communicating with you about your membership, bookings, and schedule changes',
            'Providing coaching services and tracking student progress',
            'Ensuring health and safety during activities',
            'Emergency contact in case of injury or incident',
            'Managing facility access and security (including CCTV)',
            'Improving our programmes, website, and customer service',
            'Sending important updates, newsletters, and promotional offers (where you have consented)',
            'Fulfilling legal and regulatory requirements',
            'Protecting our legal rights and preventing misuse of our services',
          ]} />
        </Section>

        <Section title="Legal Basis for Processing">
          <P>We process your personal information on the following legal grounds:</P>
          <Ul items={[
            'Contractual necessity — to provide the services you have signed up for',
            'Legitimate interests — to operate and improve our business, facility, and programmes',
            'Legal obligation — to comply with applicable laws, regulations, and safety requirements',
            'Consent — where you have explicitly agreed (e.g., for marketing communications or photography)',
            'Vital interests — to protect your health and safety or that of others',
          ]} />
        </Section>

        <Section title="Sharing Your Information">
          <P>We do not sell or rent your personal information to third parties. We may share your information with:</P>
          <Ul items={[
            'Payment processors (e.g., Razorpay) to process transactions',
            'Coaching staff and authorized personnel for programme delivery and safety',
            'Third-party service providers who assist with website hosting, booking systems, communication tools, and IT support',
            'Medical professionals in case of emergency',
            'Law enforcement, regulatory authorities, or legal advisors where required by law',
            'Insurance providers where relevant to a claim or policy requirement',
          ]} />
          <P className="mt-3">All third parties are required to keep your information secure and use it only for the purposes we specify.</P>
        </Section>

        <Section title="Photography and Video">
          <P>Flowternity Sports may photograph or record coaching sessions, matches, tournaments, camps, and events for training analysis, progress review, security, website content, social media, advertising, and promotional purposes.</P>
          <P>Where required by law, we will obtain appropriate consent from the participant or parent/guardian. If you do not wish your child to appear in promotional content, please notify us in writing at <a href="mailto:admin@flowternity.com" className="underline text-foreground">admin@flowternity.com</a>. We will make reasonable efforts to honour such requests, though participants may incidentally appear in wide-angle event or crowd footage.</P>
        </Section>

        <Section title="Data Security">
          <P>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, misuse, alteration, or disclosure. These measures include:</P>
          <Ul items={[
            'Secure servers and encrypted payment processing',
            'Access controls and password protection',
            'Regular security assessments',
            'Staff training on data protection',
            'Secure backup systems',
          ]} />
          <P className="mt-3">However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.</P>
        </Section>

        <Section title="Data Retention">
          <P>We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. This typically means:</P>
          <Ul items={[
            'Membership and booking records — duration of membership plus 7 years for legal and tax purposes',
            'Payment records — 7 years as required by law',
            'Coaching and progress records — duration of enrolment plus 3 years',
            'Emergency contact information — duration of active membership',
            'Marketing consent records — until consent is withdrawn',
            'CCTV footage — typically 30-90 days unless required for an investigation',
          ]} />
        </Section>

        <Section title="Your Rights">
          <P>Under applicable data protection laws, you have the right to:</P>
          <Ul items={[
            'Access — request a copy of the personal information we hold about you',
            'Correction — request correction of inaccurate or incomplete information',
            'Deletion — request deletion of your personal information (subject to legal obligations)',
            'Restriction — request that we limit how we use your information',
            'Portability — receive your information in a structured, commonly used format',
            'Object — object to processing based on legitimate interests',
            'Withdraw consent — withdraw consent for marketing communications or photography (does not affect processing already done)',
          ]} />
          <P className="mt-3">To exercise any of these rights, please contact us at <a href="mailto:admin@flowternity.com" className="underline text-foreground">admin@flowternity.com</a> or call 9886696155. We will respond within 30 days.</P>
        </Section>

        <Section title="Children's Privacy">
          <P>Most of our participants are under 18 years of age. We collect and process information about children only with the knowledge and consent of a parent or legal guardian. Parents have the right to review, correct, or request deletion of their child's information at any time.</P>
        </Section>

        <Section title="Cookies and Website Analytics">
          <P>Our website may use cookies and similar technologies to improve user experience, analyze website traffic, and remember your preferences. Cookies are small text files stored on your device.</P>
          <P>You can control or disable cookies through your browser settings. However, disabling cookies may affect the functionality of our website, including the booking system.</P>
        </Section>

        <Section title="Third-Party Links">
          <P>Our website may contain links to third-party websites (e.g., payment processors, social media platforms). This Privacy Policy does not apply to those external sites. We encourage you to review the privacy policies of any third-party sites you visit.</P>
        </Section>

        <Section title="Changes to This Privacy Policy">
          <P>We may update this Privacy Policy from time to time to reflect changes in our practices, legal requirements, or business operations. The updated version will be posted on our website with the "Last updated" date. Material changes will be communicated through email or website notifications.</P>
        </Section>

        <Section title="Contact Us">
          <P>If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your personal information, please contact us:</P>
          <div className="mt-4 p-5 bg-secondary/50 rounded-xl border border-border">
            <p className="font-semibold mb-2">Flowternity Sports</p>
            <p className="text-sm space-y-1">
              <span className="block">Horamavu–Kalkere, Bengaluru, Karnataka</span>
              <span className="block">Phone: <a href="tel:9886696155" className="underline">9886696155</a> / <a href="tel:7795310645" className="underline">7795310645</a></span>
              <span className="block">Email: <a href="mailto:admin@flowternity.com" className="underline">admin@flowternity.com</a></span>
              <span className="block">Website: <a href="https://www.flowternity.com" className="underline">www.flowternity.com</a></span>
            </p>
          </div>
        </Section>

        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground justify-between">
          <div className="flex gap-4">
            <Link href="/terms" className="underline">Terms &amp; Conditions</Link>
            <Link href="/faq" className="underline">FAQs</Link>
          </div>
          <Link href="/" className="underline">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
