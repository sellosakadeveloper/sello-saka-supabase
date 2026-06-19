import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActiveCompetition from "@/components/ActiveCompetition";
import { Loader2 } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CompetitionData {
  id: string;
  title: string;
  description: string;
  prize_first: string | null;
  prize_second: string | null;
  prize_third: string | null;
  entry_fee: number;
  end_date: string;
  hero_image_url?: string | null;
  badge_text?: string | null;
  subtitle?: string | null;
  footer_text_1?: string | null;
  footer_text_2?: string | null;
}

const Competition = () => {
  const activeCompetition = useQuery(api.public.getActiveCompetition);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {activeCompetition === undefined ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-gold-600" />
        </div>
      ) : activeCompetition ? (
        <FadeIn direction="up" duration={0.8}>
          <ActiveCompetition competition={activeCompetition} />
        </FadeIn>
      ) : (
        <FadeIn direction="up" duration={0.8}>
          <div className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
            <h2 className="text-3xl font-bold text-navy-primary mb-4">No Active Competitions</h2>
            <p className="text-gray-600 max-w-md">
              There are currently no active competitions. Please check back later or follow us on social media for updates.
            </p>
          </div>
        </FadeIn>
      )}

      <Footer />
    </div>
  );
};

export default Competition;
