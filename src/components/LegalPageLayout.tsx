import { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type LegalSection = {
  title: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
};

type LegalPageLayoutProps = {
  pageTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  effectiveDate: string;
  intro?: ReactNode;
  sections: readonly LegalSection[];
};

const LegalPageLayout = ({
  pageTitle,
  heroTitle,
  heroSubtitle,
  effectiveDate,
  intro,
  sections,
}: LegalPageLayoutProps) => {
  useEffect(() => {
    document.title = `${pageTitle} | Sello Saka Foundation`;
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-navy-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{heroTitle}</h1>
          <div className="w-20 h-1 bg-gold-600 mx-auto mb-6" />
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">{heroSubtitle}</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl border-2 border-navy-600 bg-white p-8 md:p-12 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-700 mb-10">
                Effective Date: {effectiveDate}
              </p>

              {intro ? <div className="mb-10">{intro}</div> : null}

              <div className="space-y-10">
                {sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="text-2xl md:text-3xl font-bold text-navy-primary mb-4">
                      {section.title}
                    </h2>

                    {section.paragraphs?.map((paragraph) => (
                      <p key={paragraph} className="text-gray-700 leading-8 mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets && section.bullets.length > 0 ? (
                      <ul className="mt-4 space-y-3">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3 text-gray-700 leading-7">
                            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-gold-600 flex-shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LegalPageLayout;
