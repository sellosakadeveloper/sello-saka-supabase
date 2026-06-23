import LegalPageLayout from "@/components/LegalPageLayout";

const effectiveDate = "23 June 2026";

const sections = [
  {
    title: "1. What This Policy Covers",
    paragraphs: [
      "This Cookie Policy explains how the website currently uses cookies or similar browser storage technologies.",
      "The site aims to keep this policy narrow and factual to the current implementation. It does not describe analytics, advertising, or tracking categories unless those technologies are actually in use.",
    ],
  },
  {
    title: "2. Functional Cookies And Similar Storage",
    paragraphs: [
      "The current codebase shows limited first-party cookie use for functional interface behavior. In particular, the admin sidebar component stores sidebar state using a cookie so the interface can remember whether it is open or collapsed.",
      "The site may also use browser-side storage or session state as part of normal application behavior where required for navigation, temporary UI state, or protected flows.",
    ],
  },
  {
    title: "3. Third-Party Services",
    paragraphs: [
      "Some parts of the site rely on third-party services, including payment processing, authentication-related workflows, and email or ticket delivery support. When you move through those flows, those providers may use their own cookies or similar technologies according to their own systems and policies.",
      "Examples of connected services currently used by the site include PayFast, Convex Auth-related flows, Resend-backed email delivery, and Netlify-based ticket PDF delivery support.",
    ],
  },
  {
    title: "4. How Cookies Are Used",
    bullets: [
      "To support core site functionality and interface preferences.",
      "To help protected or transactional flows operate correctly where session-related behavior is required.",
      "To support payment, authentication, or ticket delivery processes handled through connected services.",
    ],
  },
  {
    title: "5. Cookie Choices",
    paragraphs: [
      "You can usually control or delete cookies through your browser settings. Blocking cookies may affect the behavior of login, admin, payment, or other transactional site features.",
      "If you clear cookies or browser storage, some preferences or in-progress flows may need to be restarted.",
    ],
  },
  {
    title: "6. Changes To This Policy",
    paragraphs: [
      "If the site's use of cookies or similar technologies changes materially, this policy should be updated to reflect those changes.",
      "The effective date at the top of the page shows when this version was last updated.",
    ],
  },
  {
    title: "7. Contact",
    paragraphs: [
      "If you have questions about this Cookie Policy, contact support@sellosakafoundation.org.",
    ],
  },
] as const;

const CookiePolicy = () => {
  return (
    <LegalPageLayout
      pageTitle="Cookie Policy"
      heroTitle="Cookie Policy"
      heroSubtitle="A plain-language summary of the limited cookie and browser-storage behavior currently used on the site."
      effectiveDate={effectiveDate}
      sections={[...sections]}
    />
  );
};

export default CookiePolicy;
