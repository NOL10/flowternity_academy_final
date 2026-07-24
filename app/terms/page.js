import SiteNav from '@/components/site-nav';
import Link from 'next/link';

export const metadata = {
  title: 'Terms & Conditions — Flowternity Sports',
  description: 'Membership, coaching and class-booking terms and conditions for Flowternity Sports.',
};

const Section = ({ number, title, children }) => (
  <div className="mb-10">
    <h2 className="font-display font-black text-xl md:text-2xl mb-4 scroll-mt-20" id={`section-${number}`}>
      {number}. {title}
    </h2>
    <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const P = ({ children }) => <p className="text-sm md:text-base">{children}</p>;

const Ul = ({ items }) => (
  <ul className="list-disc list-inside space-y-1 text-sm md:text-base ml-2">
    {items.map((item, i) => <li key={i}>{item}</li>)}
  </ul>
);

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container max-w-3xl py-14 md:py-20">
        <div className="mb-12">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">Legal</p>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight leading-tight">Terms &amp; Conditions</h1>
          <p className="text-muted-foreground mt-4">Effective from: <strong className="text-foreground">1 August 2026</strong></p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            These Terms and Conditions govern the purchase and use of coaching memberships, class bookings, programmes, facilities,
            and related services offered by <strong className="text-foreground">Flowternity Sports</strong>, Horamavu–Kalkere, Bengaluru.
            By purchasing a membership, registering a student, creating an account, booking a class, or entering the facility,
            the member — or the parent or legal guardian where the participant is below 18 years — confirms that they have read,
            understood, and accepted these Terms and Conditions.
          </p>
        </div>

        {/* Definitions */}
        <Section number={1} title="Definitions">
          <Ul items={[
            '"Flowternity Sports," "we," "our," or "us" — Flowternity Sports and its authorised management, coaches, staff, contractors, and representatives.',
            '"Member" or "Student" — the individual registered for a coaching programme or membership.',
            '"Parent" or "Guardian" — the parent or legally authorised guardian of a participant below 18 years of age.',
            '"Membership" or "Plan" — any monthly, half-yearly, annual, or sport-specific access plan purchased from Flowternity Sports.',
            '"Class" or "Session" — a scheduled coaching session made available for advance booking.',
            '"Website" or "Booking Platform" — the official Flowternity Sports website at www.flowternity.com.',
            '"Facility" — the Flowternity Sports premises, courts, skatepark, café, changing areas, washrooms, parking, and other managed spaces.',
          ]} />
        </Section>

        <div className="border-t border-border my-8" />
        <p className="font-display font-black text-2xl mb-8">Membership Terms</p>

        <Section number={2} title="Membership Plans">
          <P>Current plans and fees:</P>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3 font-semibold">Membership</th>
                  <th className="text-right p-3 font-semibold">Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ['Annual Basketball Pass', '₹24,708'],
                  ['Half-Yearly Basketball Pass', '₹16,704'],
                  ['Monthly Basketball Pass', '₹3,102'],
                  ['Monthly Skateboarding Pass', '₹5,000'],
                  ['Monthly Skating Pass', '₹2,000'],
                  ['Monthly Futsal Pass', '₹2,000'],
                ].map(([name, fee]) => (
                  <tr key={name}>
                    <td className="p-3">{name}</td>
                    <td className="p-3 text-right font-mono">{fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>Flowternity Sports may introduce, modify, discontinue, or revise plans, prices, schedules, and booking limits from time to time.</P>
        </Section>

        <Section number={3} title="Effective Monthly and Per-Class Pricing">
          <P>Monthly equivalent or per-class values shown in promotional material are for illustration only. They do not represent monthly instalment options or guaranteed attendance numbers. Actual value depends on eligible classes booked, attendance, category allocation, and class availability.</P>
        </Section>

        <Section number={4} title="Membership Activation and Validity">
          <P>A membership becomes active from the activation date shown on the member's account. Validity runs continuously until the stated expiry date. Failure to attend, book, or use the facility does not automatically pause or extend the membership period.</P>
        </Section>

        <Section number={5} title="Online Registration and Account Responsibility">
          <P>Members and parents must provide accurate, current, and complete information. The member or parent is responsible for maintaining confidentiality of login credentials. Bookings made through the registered account will be treated as authorised by the account holder.</P>
        </Section>

        <Section number={6} title="No Transfer of Membership">
          <P>Memberships are issued exclusively to the registered student and cannot be transferred, shared, resold, gifted after activation, or used by anyone other than the registered participant. Attempted misuse may result in suspension or termination without refund.</P>
        </Section>

        <Section number={7} title="Sport-Specific Membership">
          <P>A membership is valid only for the sport stated in the purchased plan. A Basketball Pass does not include skating, skateboarding, futsal, court rentals, tournaments, camps, or paid events. Separate fees apply to additional programmes.</P>
        </Section>

        <div className="border-t border-border my-8" />
        <p className="font-display font-black text-2xl mb-8">Payment, Cancellation &amp; Refund Terms</p>

        <Section number={8} title="Payment">
          <P>Membership fees must be paid through an approved payment method. A membership is confirmed only after successful payment, verification, registration, acceptance of terms, and activation. Flowternity is not responsible for delays caused by banks, payment gateways, or network issues.</P>
        </Section>

        <Section number={9} title="No Refund Policy">
          <P>All coaching and membership purchases are final. Once purchased, activated, or booked, no cancellation, cash refund, partial refund, or pro-rata refund will be provided except where required under applicable law or where Flowternity expressly agrees otherwise in writing. Refunds will not ordinarily be provided for change of mind, failure to attend, school commitments, holidays, relocation, missed bookings, or misconduct-related removal.</P>
        </Section>

        <Section number={10} title="Duplicate or Incorrect Payments">
          <P>Genuine duplicate transactions or payment processing errors should be reported to Flowternity with proof of payment. Verified errors may be corrected at Flowternity's discretion. This is distinct from cancellation of a correctly purchased membership.</P>
        </Section>

        <Section number={11} title="Membership Pause or Extension">
          <P>Memberships cannot ordinarily be paused or extended for personal absence. Exceptional circumstances such as a medically certified significant injury may be submitted in writing to management. Any pause or extension is not automatic, must be approved in writing, and may require a valid medical certificate.</P>
        </Section>

        <div className="border-t border-border my-8" />
        <p className="font-display font-black text-2xl mb-8">Class Booking Terms</p>

        <Section number={12} title="Advance Booking is Compulsory">
          <P>From 1 August 2026, every student must book each class in advance through the Flowternity Sports website. Students will not be permitted to participate without an active membership, a confirmed advance booking, booking in the correct student category, and available capacity.</P>
        </Section>

        <Section number={13} title="No Walk-In Entry">
          <P>Students who arrive without a confirmed booking may be refused entry, even with an active membership or previous attendance. No refund, credit, extension, or compensation will be provided when entry is refused due to missing a booking.</P>
        </Section>

        <Section number={14} title="Booking Confirmation">
          <P>A class is considered booked only when successfully completed and confirmed in the member's account. Adding to a cart, viewing the schedule, or starting the booking process does not constitute confirmation.</P>
        </Section>

        <Section number={15} title="Class Capacity">
          <P>Each class has a maximum capacity. Once full, additional students may not book or attend. An active membership does not guarantee availability in every preferred session. Members should book early.</P>
        </Section>

        <Section number={16} title="Category-Based Booking">
          <P>Each class is assigned to a particular category or development group. Students may book only classes for which they are eligible. Category placement is determined by the coaching team based on technical ability, physical readiness, experience, behaviour, and coachability — not age alone.</P>
        </Section>

        <Section number={17} title="Incorrect Category Bookings">
          <P>If a student books the wrong category session, Flowternity may cancel the booking, refuse entry, or move the student to an appropriate session. No refund or credit will be provided for incorrect category bookings.</P>
        </Section>

        <Section number={18} title="Number of Classes">
          <P>Basketball members may access multiple eligible sessions per week. However, membership does not guarantee a fixed number of classes, six available classes every week, a particular coach, court, or time. Access remains subject to published schedules, category eligibility, advance booking, and capacity.</P>
        </Section>

        <Section number={19} title="Cancelling a Booked Class">
          <P>Students unable to attend must cancel through the website within the cancellation period. Verbal notification to a coach does not replace cancellation through the booking system.</P>
        </Section>

        <Section number={20} title="Late Cancellations and No-Shows">
          <P>Repeated late cancellations or no-shows may result in warnings, temporary booking restrictions, suspension of class access, or other reasonable penalties communicated by Flowternity Sports.</P>
        </Section>

        <Section number={21} title="Late Arrival">
          <P>Students should arrive at least 10 minutes before class. Late arrivals may miss the warm-up, be required to warm up separately, or be refused entry where joining would be unsafe or disruptive. No refund or extension is provided for late arrival.</P>
        </Section>

        <Section number={22} title="Class Schedule Changes">
          <P>Flowternity may change, reschedule, or cancel classes due to coach availability, weather, facility maintenance, tournaments, holidays, government directions, or emergencies. Reasonable efforts will be made to notify affected members. Cancellation of one class does not ordinarily entitle the member to a refund.</P>
        </Section>

        <Section number={23} title="Outdoor Facility and Weather">
          <P>Flowternity is substantially an open-air facility. Classes may be affected by rain, wet surfaces, lightning, extreme heat, or other unsafe conditions. Safety decisions made by management or the coaching team will be final for the affected session.</P>
        </Section>

        <div className="border-t border-border my-8" />
        <p className="font-display font-black text-2xl mb-8">Health, Safety &amp; Liability</p>

        <Section number={29} title="Fitness to Participate">
          <P>The member, parent, or guardian is responsible for ensuring the participant is medically and physically fit to take part. Relevant medical information including injuries, allergies, asthma, epilepsy, heart concerns, or physical limitations must be disclosed before participation.</P>
        </Section>

        <Section number={31} title="Inherent Risk and Assumption of Risk">
          <P>Participation in basketball, skating, skateboarding, futsal, and fitness training involves inherent risks including falls, collisions, strains, sprains, fractures, and equipment-related injury. Participants voluntarily accept the ordinary risks associated with sporting activity. Nothing in these Terms excludes responsibility that cannot legally be excluded under applicable law.</P>
        </Section>

        <Section number={32} title="Emergency Medical Assistance">
          <P>In an emergency, Flowternity may provide first aid, contact the registered emergency contact, call an ambulance, or arrange transportation to a medical facility. Any medical or transportation expense will be the responsibility of the member or guardian unless required otherwise by law.</P>
        </Section>

        <Section number={33} title="Insurance">
          <P>Members are responsible for arranging personal health, accident, or sports insurance where desired. Membership fees do not automatically include personal accident or medical insurance unless expressly stated.</P>
        </Section>

        <div className="border-t border-border my-8" />
        <p className="font-display font-black text-2xl mb-8">Facility Rules</p>

        <Section number={35} title="Footwear">
          <P>Students must wear clean, suitable sports footwear. Outdoor footwear, metal studs, or damaging soles are not permitted on designated playing surfaces. Playing barefoot is not permitted unless expressly authorised.</P>
        </Section>

        <Section number={38} title="Personal Belongings">
          <P>Members are responsible for their own mobile phones, bags, wallets, jewellery, sports equipment, and valuables. Flowternity Sports is not responsible for loss, theft, or damage to personal belongings except where liability cannot legally be excluded.</P>
        </Section>

        <Section number={40} title="Parent and Guardian Responsibility">
          <P>Parents are responsible for children before the scheduled class begins and immediately after it ends. Children should not be dropped off excessively early or left unsupervised after class. Flowternity is not responsible for children who remain at the premises outside their booked session.</P>
        </Section>

        <div className="border-t border-border my-8" />
        <p className="font-display font-black text-2xl mb-8">Conduct &amp; Discipline</p>

        <Section number={42} title="Code of Conduct">
          <P>All members, students, parents, guardians, and visitors must behave respectfully. Abusive language, bullying, threats, fighting, harassment, discrimination, damage to property, disruption of sessions, and disrespect towards coaches or staff are not permitted.</P>
        </Section>

        <Section number={44} title="Disciplinary Action">
          <P>Breaches may result in a verbal or written warning, removal from a class, cancellation of bookings, temporary suspension, category reassignment, restriction from the facility, or termination of membership.</P>
        </Section>

        <Section number={45} title="Termination of Membership">
          <P>Flowternity may terminate a membership for violations of these terms, misuse of the booking system, abusive behaviour, damage to property, false information, or fraudulent payment. No refund will ordinarily be provided where termination results from a breach of these terms.</P>
        </Section>

        <div className="border-t border-border my-8" />
        <p className="font-display font-black text-2xl mb-8">Operational &amp; Legal Terms</p>

        <Section number={52} title="Force Majeure">
          <P>Flowternity Sports will not be responsible for delay, cancellation, or inability to provide services caused by natural disasters, extreme weather, government restrictions, civil disturbance, utility failure, internet failure, or other events beyond its reasonable control.</P>
        </Section>

        <Section number={53} title="Modification of Terms">
          <P>Flowternity Sports may update these Terms to reflect changes in membership structures, booking systems, operational requirements, or applicable law. The updated version will be published on the website with the effective date.</P>
        </Section>

        <Section number={56} title="Governing Law and Jurisdiction">
          <P>These Terms are governed by the laws applicable in India. Disputes will be subject to the jurisdiction of the competent courts in Bengaluru, Karnataka. Members are encouraged to contact Flowternity Sports and attempt to resolve concerns in good faith before initiating formal proceedings.</P>
        </Section>

        <Section number={57} title="Contact Information">
          <Ul items={[
            'Flowternity Sports, Horamavu–Kalkere, Bengaluru, Karnataka',
            'Phone: 9886696155',
            'Website: www.flowternity.com',
            'Email: admin@flowternity.com',
          ]} />
        </Section>

        {/* Declaration box */}
        <div className="mt-12 p-6 border-2 border-accent rounded-2xl bg-accent/5">
          <h3 className="font-display font-black text-lg mb-3">Member &amp; Parent Declaration</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By completing registration or purchasing a membership, the member — or the parent or guardian of a minor participant — confirms that the information provided is correct, the participant is fit to take part or relevant medical concerns have been disclosed, advance booking is compulsory for every class, entry may be refused without a valid confirmed booking, sports participation involves inherent risks, and these Terms and Conditions have been read, understood, and accepted.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground justify-between">
          <p>Questions? <a href="mailto:admin@flowternity.com" className="underline text-foreground">admin@flowternity.com</a> · <a href="tel:9886696155" className="underline text-foreground">9886696155</a></p>
          <Link href="/" className="underline">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
