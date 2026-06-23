import LegalPageLayout from "@/components/LegalPageLayout";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { AlertTriangle, Loader2, Scale, ScrollText, Trophy } from "lucide-react";

type CompetitionLegalPageProps = {
  pageTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  effectiveDate: string;
  mode: "terms" | "rules";
};

type ActiveCompetitionData = {
  id: string;
  title: string;
  description: string;
  prize_first: string | null;
  prize_second: string | null;
  prize_third: string | null;
  entry_fee: number;
  end_date: string;
};

const NLC_SCHEME_NUMBER = "00539/01";

function formatDate(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getDrawDate(endDate: string): string {
  const date = new Date(endDate);
  date.setDate(date.getDate() + 1);
  return formatDate(date.toISOString());
}

function buildTermsSections(competition: ActiveCompetitionData | null) {
  const title = competition?.title ?? "the active competition";
  const entryPrice = competition ? `R${competition.entry_fee.toFixed(2)}` : "the published entry price";

  return [
    {
      title: "1. Participation",
      paragraphs: [
        `These Competition Terms apply to participation in ${title}. By submitting your details and proceeding to payment, you agree to these competition-specific terms in addition to the general website terms.`,
        "Entries must be submitted through the official site flow. The foundation may reject incomplete, duplicate, misleading, fraudulent, or technically invalid submissions.",
      ],
    },
    {
      title: "2. Payment And Confirmation",
      paragraphs: [
        `Each valid entry is tied to the competition entry price, currently ${entryPrice} where a live campaign is available.`,
        "An entry is confirmed only after successful payment and validation in the competition system.",
      ],
    },
    {
      title: "3. Ticket Issuance",
      paragraphs: [
        "After confirmation, the foundation issues a ticket number and may send a ticket email and downloadable PDF record for the entry.",
        "Ticket delivery timing may depend on payment confirmation, email delivery infrastructure, and the availability of connected services.",
      ],
    },
    {
      title: "4. Corrections, Suspension, And Invalid Entries",
      paragraphs: [
        "The foundation may suspend, correct, or cancel entries affected by obvious technical error, duplicate payment mismatch, suspected fraud, unauthorized manipulation, or compliance concerns.",
        "Where a payment is incomplete, reversed, invalid, or not matched to a valid competition entry, the related confirmation or ticket may be withheld, reversed, or cancelled.",
      ],
    },
    {
      title: "5. Prize And Winner Handling",
      paragraphs: [
        "Prize award and winner verification are subject to the live campaign details, reasonable identity checks, and applicable compliance requirements.",
        "A participant may be required to provide proof of identity, proof of contact details, or any other reasonable information necessary to confirm eligibility before a prize is released.",
      ],
    },
    {
      title: "6. Liability And Compliance",
      paragraphs: [
        "To the maximum extent allowed by applicable law, the foundation is not liable for indirect loss arising from payment platform outages, email delays, download failures, third-party service interruption, or participant-supplied data errors.",
        `This competition is published with NLC reference Scheme No: ${NLC_SCHEME_NUMBER}.`,
      ],
    },
    {
      title: "7. Contact",
      paragraphs: [
        "Questions about competition participation or entry status can be directed to support@sellosakafoundation.org.",
      ],
    },
  ] as const;
}

function buildRulesSections(competition: ActiveCompetitionData | null) {
  const title = competition?.title ?? "No active competition is currently published";
  const period = competition ? `Competition closes on ${formatDate(competition.end_date)}.` : "Competition timing will be published when a live campaign is available.";
  const drawDate = competition ? getDrawDate(competition.end_date) : "To be published with the active competition.";
  const prizes = [competition?.prize_first, competition?.prize_second, competition?.prize_third]
    .filter(Boolean)
    .join("; ");

  return [
    {
      title: "1. Current Competition",
      paragraphs: [
        competition
          ? `${title} is the current active competition displayed on the site. ${period}`
          : "No active competition is currently published. These rules will update automatically when a new competition becomes active on the site.",
        competition
          ? `The current draw date reflected by the live competition workflow is ${drawDate}.`
          : "Draw timing will appear here when a live competition is available.",
      ],
    },
    {
      title: "2. Entry Mechanics",
      paragraphs: [
        competition
          ? `Each paid and validated entry is tied to the current entry fee of R${competition.entry_fee.toFixed(2)}.`
          : "The entry fee for the active competition will appear here when published.",
        "Entries are counted through the official site workflow and are treated as valid only once the related payment has been successfully recorded.",
      ],
    },
    {
      title: "3. Prize Summary",
      paragraphs: [
        competition && prizes
          ? `The current prize summary for this campaign is: ${prizes}.`
          : "Prize details will appear here when an active competition is available.",
      ],
    },
    {
      title: "4. Winner Selection And Contact",
      paragraphs: [
        "Winner selection will be administered according to the published campaign process and the verified competition records held by the foundation.",
        "Potential winners may be contacted using the details supplied with their entry and may be required to complete identity, contact, or eligibility verification before a prize is released.",
      ],
    },
    {
      title: "5. Disqualification",
      paragraphs: [
        "Entries may be disqualified where information is false or misleading, payment is not successfully completed, the entry is duplicated or manipulated, or the participant fails a reasonable eligibility or verification check.",
      ],
    },
    {
      title: "6. Records, Disputes, And Compliance",
      paragraphs: [
        "The foundation's competition, payment, and ticket records are the primary operational record for resolving entry or ticket disputes.",
        `This competition is published with NLC reference Scheme No: ${NLC_SCHEME_NUMBER}.`,
      ],
    },
  ] as const;
}

function CompetitionSummaryCard({ competition, mode }: { competition: ActiveCompetitionData | null; mode: "terms" | "rules" }) {
  if (!competition) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">No Active Competition</p>
            <p className="leading-7">
              No active competition is currently published. These {mode} will update automatically when a live competition becomes active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const drawDate = getDrawDate(competition.end_date);
  const entries = [
    { label: "Competition", value: competition.title },
    { label: "Entry Fee", value: `R${competition.entry_fee.toFixed(2)}` },
    { label: "Competition End Date", value: formatDate(competition.end_date) },
    { label: "Draw Date", value: drawDate },
    { label: "NLC Scheme", value: NLC_SCHEME_NUMBER },
  ];

  return (
    <div className="rounded-2xl border-2 border-gold-300 bg-gold-50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        {mode === "terms" ? (
          <Scale className="w-6 h-6 text-gold-700" />
        ) : (
          <ScrollText className="w-6 h-6 text-gold-700" />
        )}
        <h2 className="text-2xl font-bold text-navy-primary">Active Competition Summary</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <div key={entry.label} className="rounded-xl bg-white border border-gold-200 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-2">
              {entry.label}
            </p>
            <p className="text-navy-primary font-semibold leading-7">{entry.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {[competition.prize_first, competition.prize_second, competition.prize_third]
          .filter(Boolean)
          .map((prize, index) => (
            <div key={`${prize}-${index}`} className="flex gap-3 text-gray-700 leading-7">
              <Trophy className="w-5 h-5 text-gold-700 mt-1 flex-shrink-0" />
              <span>
                Prize {index + 1}: {prize}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

const CompetitionLegalPage = ({
  pageTitle,
  heroTitle,
  heroSubtitle,
  effectiveDate,
  mode,
}: CompetitionLegalPageProps) => {
  const activeCompetition = useQuery(api.public.getActiveCompetition) as ActiveCompetitionData | null | undefined;

  if (activeCompetition === undefined) {
    return (
      <div className="min-h-screen bg-white">
        <LegalPageLayout
          pageTitle={pageTitle}
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          effectiveDate={effectiveDate}
          intro={
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-gold-300 bg-gold-50 p-6 text-navy-primary">
              <Loader2 className="w-5 h-5 animate-spin text-gold-700" />
              <span>Loading active competition details.</span>
            </div>
          }
          sections={[]}
        />
      </div>
    );
  }

  const sections = mode === "terms" ? buildTermsSections(activeCompetition) : buildRulesSections(activeCompetition);

  return (
    <LegalPageLayout
      pageTitle={pageTitle}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      effectiveDate={effectiveDate}
      intro={<CompetitionSummaryCard competition={activeCompetition} mode={mode} />}
      sections={sections}
    />
  );
};

export default CompetitionLegalPage;
