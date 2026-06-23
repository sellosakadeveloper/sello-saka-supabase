import LegalPageLayout from "@/components/LegalPageLayout";

const effectiveDate = "23 June 2026";

const sections = [
  {
    title: "1. Acceptance Of These Terms",
    paragraphs: [
      "By accessing or using this website, you agree to these Terms of Service. If you do not agree, you should not use the site.",
      "These terms apply to general browsing, donations, competition participation, contact requests, assistance applications, and use of any public content or downloadable materials made available through the site.",
    ],
  },
  {
    title: "2. Use Of The Site",
    paragraphs: [
      "You agree to use the site lawfully, respectfully, and only for legitimate purposes connected to learning about the foundation, making a donation, entering a competition, requesting support, or managing authorized admin access.",
    ],
    bullets: [
      "You must not use the site to submit false, misleading, unlawful, abusive, or fraudulent content.",
      "You must not attempt to interfere with the operation, security, or integrity of the site or its supporting services.",
      "You must not attempt to access admin areas or protected records without authorization.",
    ],
  },
  {
    title: "3. Information Accuracy And Availability",
    paragraphs: [
      "The foundation aims to keep site content accurate and current, but does not guarantee that every page, file, notice, or service will always be complete, uninterrupted, or error-free.",
      "The site, ticketing flows, and payment confirmations may be updated, paused, or corrected where operational or compliance needs require it.",
    ],
  },
  {
    title: "4. Donations",
    paragraphs: [
      "When you make a donation, you are responsible for ensuring that the payment and contact details you provide are accurate. Donation processing depends on the availability and successful operation of the payment provider.",
      "The foundation may keep donation records for accounting, reporting, compliance, and supporter communication purposes where permitted.",
    ],
  },
  {
    title: "5. Competitions, Entries, And Tickets",
    paragraphs: [
      "Competition participation is subject to the competition information published on the relevant site page, including the entry price, dates, payment status, and any competition-specific conditions that may be displayed or issued with the campaign.",
      "A competition entry is not treated as completed until the related payment has been successfully processed and the entry record has been confirmed through the site's workflow.",
      "Ticket emails and downloadable tickets are intended as operational records of an entry. Delivery timing may depend on payment confirmation, email delivery, and the availability of connected services.",
    ],
  },
  {
    title: "6. Payments And Third-Party Services",
    paragraphs: [
      "Payments are processed through third-party providers. The foundation relies on those providers and other connected services to support payment confirmation, email delivery, authentication, and downloadable ticket generation.",
      "The foundation is not responsible for outages, delays, or independent policy terms imposed by those third-party providers, although it may use reasonable efforts to assist where issues arise in the normal course of the site workflow.",
    ],
  },
  {
    title: "7. Intellectual Property",
    paragraphs: [
      "Unless otherwise stated, the site's text, branding, visual identity, page design, and published content remain the property of the foundation or its licensors.",
      "You may view and use the site for personal, informational, charitable, or participation-related purposes, but you may not republish, commercially exploit, or misrepresent the content without permission.",
    ],
  },
  {
    title: "8. External Links",
    paragraphs: [
      "The site may link to third-party services or external websites, including payment providers, regulators, and service platforms. Those sites operate under their own terms and privacy practices.",
      "The presence of a link does not by itself mean the foundation controls or guarantees the linked service.",
    ],
  },
  {
    title: "9. Liability",
    paragraphs: [
      "To the maximum extent allowed by applicable law, the foundation is not liable for indirect, incidental, or consequential loss arising from use of the site, failed communications, third-party outages, or user-supplied errors in submitted information.",
      "Nothing in these terms excludes any right or obligation that cannot lawfully be excluded under applicable South African law.",
    ],
  },
  {
    title: "10. Governing Law And Contact",
    paragraphs: [
      "These terms are governed by the laws of South Africa.",
      "For questions about these terms, contact support@sellosakafoundation.org.",
    ],
  },
] as const;

const TermsOfService = () => {
  return (
    <LegalPageLayout
      pageTitle="Terms of Service"
      heroTitle="Terms of Service"
      heroSubtitle="The rules and operating terms that apply when you use the foundation website, donate, enter a competition, or interact with public services."
      effectiveDate={effectiveDate}
      sections={[...sections]}
    />
  );
};

export default TermsOfService;
