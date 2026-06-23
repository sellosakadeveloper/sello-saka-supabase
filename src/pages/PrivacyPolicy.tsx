import LegalPageLayout from "@/components/LegalPageLayout";

const effectiveDate = "23 June 2026";

const sections = [
  {
    title: "1. Scope",
    paragraphs: [
      "This Privacy Policy explains how Sello Saka Foundation collects, uses, stores, and shares personal information when you use this website, contact the foundation, apply for assistance, make a donation, enter a competition, receive a ticket, or access the admin authentication flow.",
      "This policy is intended to reflect the foundation's current live website and backend services. It should be read together with any competition-specific terms or notices published on the relevant page.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: [
      "The information we collect depends on how you use the site and which service you interact with.",
    ],
    bullets: [
      "Identity and contact details such as your name, email address, and phone number.",
      "Contact message details such as subject lines and message content when you use the contact form.",
      "Application details submitted when requesting assistance, including survivor, guardian, and support-related information you choose to provide.",
      "Donation details such as donation amount, donation type, payer details, and payment status records.",
      "Competition entry details such as participant name, email address, phone number, payment reference, ticket number, and ticket delivery status.",
      "Admin account details used for authentication and access control, including email address, account role, and account setup lifecycle information.",
      "Uploaded files or images where forms, admin tools, or content workflows require them.",
    ],
  },
  {
    title: "3. How We Use Personal Information",
    paragraphs: [
      "We use personal information only for purposes connected to operating the foundation, responding to requests, processing payments, managing competitions, issuing tickets, delivering administrative access, and maintaining the site.",
    ],
    bullets: [
      "To respond to contact requests and general enquiries.",
      "To review and manage assistance applications.",
      "To process donations and maintain related records.",
      "To process competition entries, confirm payment status, generate ticket details, and deliver tickets by email or download.",
      "To send account setup or authentication-related emails for authorized admin users.",
      "To manage internal records, site administration, and basic service security.",
      "To comply with legal, regulatory, accounting, payment, or fraud-prevention obligations where applicable.",
    ],
  },
  {
    title: "4. How We Process Information",
    paragraphs: [
      "We process information because you choose to provide it, because it is necessary to perform a service you requested, because it is required to maintain records and payment workflows, or because it is necessary to protect legitimate operational, security, or compliance interests.",
      "Where the law requires consent for a specific activity, we rely on your submission or confirmation at the point where you provide the information.",
    ],
  },
  {
    title: "5. Service Providers And Platforms",
    paragraphs: [
      "The current site relies on third-party infrastructure and service providers to operate. Those providers may process information on the foundation's behalf for limited operational purposes.",
    ],
    bullets: [
      "Convex is used for application data, form submissions, admin records, authentication-related records, payment status coordination, and file-backed data workflows.",
      "PayFast is used to process payment transactions for donations and competition entries.",
      "Resend is used to deliver ticket emails and admin account emails.",
      "A Netlify-hosted function is used to render downloadable competition ticket PDFs.",
    ],
  },
  {
    title: "6. Competition And Ticketing Privacy",
    paragraphs: [
      "If you enter a competition, the foundation stores and processes your participant details, payment status, reference details, and ticket metadata so that entries can be validated and tickets can be delivered.",
      "Ticket emails and downloadable ticket PDFs may include participant details such as your name, email address, phone number, ticket number, competition details, and payment reference. You should keep those records secure once received.",
    ],
  },
  {
    title: "7. Retention",
    paragraphs: [
      "We retain records for as long as reasonably necessary for the purpose for which they were collected, for reporting and operational continuity, for resolving disputes, and for legal, accounting, fraud-prevention, or regulatory reasons.",
      "Different record types may be kept for different periods depending on whether they relate to applications, donations, competition entries, support requests, or admin access.",
    ],
  },
  {
    title: "8. Security",
    paragraphs: [
      "We take reasonable technical and organizational measures to protect personal information used through the site and its connected services. This includes restricting admin access, using managed infrastructure, and relying on service providers that support authenticated workflows and controlled storage.",
      "No internet-based system can guarantee absolute security, and you should avoid sending unnecessary sensitive information through open channels.",
    ],
  },
  {
    title: "9. Your Rights",
    paragraphs: [
      "Subject to applicable South African law, you may have rights to request access to your personal information, request correction of inaccurate information, object to certain processing, or ask for deletion where the foundation is no longer entitled or required to keep the information.",
      "Requests may be limited where the information must be retained for legal, payment, security, or recordkeeping reasons.",
    ],
  },
  {
    title: "10. Complaints And Contact",
    paragraphs: [
      "For privacy enquiries, correction requests, or complaints about how personal information is handled, contact the foundation at support@sellosakafoundation.org.",
      "Information Officer contact details are currently available through the foundation support address pending publication of dedicated officer details.",
      "You may also contact the Information Regulator of South Africa if you believe your rights have been infringed.",
    ],
  },
] as const;

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout
      pageTitle="Privacy Policy"
      heroTitle="Privacy Policy"
      heroSubtitle="How the foundation handles personal information across support, donation, competition, and admin access workflows."
      effectiveDate={effectiveDate}
      sections={[...sections]}
    />
  );
};

export default PrivacyPolicy;
