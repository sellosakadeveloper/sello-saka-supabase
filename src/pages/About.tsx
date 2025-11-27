import { Heart, Target, Award, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ActiveTeams from "@/components/ActiveTeams";
import { FadeIn } from "@/components/animations/FadeIn";
import { HoverCard } from "@/components/animations/HoverCard";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-navy-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <FadeIn direction="down" duration={0.8}>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">About Our Foundation</h1>
          </FadeIn>
          <FadeIn direction="up" delay={0.2} duration={0.8}>
            <div className="w-20 h-1 bg-gold-600 mx-auto mb-6" />
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Dedicated to restoring hope and building brighter futures for childhood cancer survivors
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FadeIn direction="up">
              <h2 className="text-4xl font-bold text-navy-primary mb-8 text-center">Our Story</h2>
            </FadeIn>
            <div className="prose prose-lg max-w-none">
              <FadeIn direction="up" delay={0.2}>
                <p className="text-gray-600 mb-6">
                  Sello Saka Foundation was born from a deeply personal journey — one that transformed pain into purpose.
                </p>
                <p className="text-gray-600 mb-6">
                  Our founder’s younger brother was diagnosed with cancer, and what followed was a two-year battle that would change our family forever. The journey was not only physical but emotional, mental, and deeply human. The struggle resulted in amputation, and the journey continues even today as he adapts to life with a prosthetic leg and ongoing recovery.
                </p>
                <p className="text-gray-600 mb-6">
                  Through this experience, our family witnessed firsthand the reality that many children and their families face — the fear, the uncertainty, the lack of information, and the emotional strain that continues long after treatment ends. We did not only fight cancer; we fought confusion, helplessness, and the silence that surrounds life after diagnosis.
                </p>
                <p className="text-gray-600 mb-6">
                  In searching for answers, we discovered a painful truth: countless children and families are going through the same battles without guidance, emotional preparation, or sustained support. Many do not know what to do next. Many are unprepared for the long journey of survivorship and its lasting effects.
                </p>
                <p className="text-gray-600">
                  It was through these moments of struggle, learning, and reflection that the Sello Saka Foundation was founded. From the memories, the lessons, the pain, and the resilience of our family, a mission was formed — to support, educate, and empower families affected by childhood cancer and its after-effects.
                </p>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist & Our Purpose */}
      <section className="py-20 bg-navy-primary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Why We Exist */}
            <FadeIn direction="right" delay={0.2} className="h-full">
              <HoverCard className="h-full">
                <Card className="bg-navy-600 border-gold-800 p-10 h-full">
                  <div className="w-16 h-16 rounded-full bg-gold-600/20 flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-6">Why We Exist</h3>
                  <div className="text-gray-400 text-lg leading-relaxed space-y-4">
                    <p>
                      We exist because life after cancer is still a journey — one that requires preparation, counselling, and knowledge. Survivors and their families need more than medical treatment; they need understanding, emotional guidance, and practical support as they rebuild their lives.
                    </p>
                    <p>
                      Sello Saka Foundation stands as a voice for those who are often unseen — the children who survive cancer and the families who walk beside them. We are here to ensure that no child or family feels alone in their journey.
                    </p>
                  </div>
                </Card>
              </HoverCard>
            </FadeIn>

            {/* Our Purpose */}
            <FadeIn direction="left" delay={0.4} className="h-full">
              <HoverCard className="h-full">
                <Card className="bg-navy-600 border-gold-800 p-10 h-full">
                  <div className="w-16 h-16 rounded-full bg-gold-600/20 flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-6">Our Purpose</h3>
                  <div className="text-gray-400 text-lg leading-relaxed space-y-4">
                    <p>
                      Our purpose is to turn lived experience into shared strength. To take what we have learned as a family and use it to educate communities, raise awareness, and guide others through this difficult reality.
                    </p>
                    <p className="font-semibold text-white">We aim to:</p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                      <li>Prepare families mentally and emotionally for life after cancer</li>
                      <li>Raise awareness about the long-term effects of childhood cancer</li>
                      <li>Create safe spaces for support, healing, and understanding</li>
                      <li>Empower survivors to live confidently beyond their diagnosis</li>
                    </ul>
                  </div>
                </Card>
              </HoverCard>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* A Story of Pain, Courage & Hope */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <FadeIn direction="up">
            <h2 className="text-4xl font-bold text-navy-primary mb-8">A Story of Pain, Courage & Hope</h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.2}>
            <div className="max-w-4xl mx-auto text-lg text-gray-600 space-y-6">
              <p>
                Our foundation is not just an organisation — it is a reflection of resilience. It is built on the courage of a young boy who fought, on a family that endured, and on a belief that awareness, preparation, and compassion can change lives.
              </p>
              <div className="font-semibold text-navy-primary text-xl italic">
                <p>From loss and struggle came vision.</p>
                <p>From memory came action.</p>
                <p>From pain came purpose.</p>
              </div>
              <p className="font-bold text-gold-600 text-2xl mt-8">
                And that is how Sello Saka Foundation was born.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <h2 className="text-4xl font-bold text-navy-primary mb-4 text-center">Our Core Values</h2>
            <div className="w-20 h-1 bg-gold-600 mx-auto mb-12" />
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FadeIn direction="up" delay={0.2} className="h-full">
              <HoverCard className="h-full">
                <Card className="border-2 border-navy-600 p-8 hover:border-gold-600 transition-colors h-full">
                  <div className="w-16 h-16 rounded-full bg-gold-600/10 flex items-center justify-center mb-6 mx-auto">
                    <Heart className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-primary mb-4 text-center">Compassion</h3>
                  <p className="text-gray-600 text-center">
                    Centering empathy and kindness in every interaction, service, and policy. We lead with our
                    hearts and treat every survivor and family member with the care they deserve.
                  </p>
                </Card>
              </HoverCard>
            </FadeIn>

            <FadeIn direction="up" delay={0.4} className="h-full">
              <HoverCard className="h-full">
                <Card className="border-2 border-navy-600 p-8 hover:border-gold-600 transition-colors h-full">
                  <div className="w-16 h-16 rounded-full bg-gold-600/10 flex items-center justify-center mb-6 mx-auto">
                    <Users className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-primary mb-4 text-center">Dignity</h3>
                  <p className="text-gray-600 text-center">
                    Upholding the inherent worth and self-respect of every survivor and family we serve. We
                    empower individuals to make their own choices and maintain their autonomy.
                  </p>
                </Card>
              </HoverCard>
            </FadeIn>

            <FadeIn direction="up" delay={0.6} className="h-full">
              <HoverCard className="h-full">
                <Card className="border-2 border-navy-600 p-8 hover:border-gold-600 transition-colors h-full">
                  <div className="w-16 h-16 rounded-full bg-gold-600/10 flex items-center justify-center mb-6 mx-auto">
                    <Award className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-primary mb-4 text-center">Integrity</h3>
                  <p className="text-gray-600 text-center">
                    Operating with unwavering honesty, transparency, and accountability in all our endeavors.
                    We are stewards of trust and handle every responsibility with utmost care.
                  </p>
                </Card>
              </HoverCard>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <ActiveTeams />

      {/* Impact Stats */}
      <section className="py-20 bg-navy-primary">
        <div className="container mx-auto px-4">
          <FadeIn direction="up">
            <h2 className="text-4xl font-bold text-white mb-12 text-center">Our Impact</h2>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { value: "350+", label: "Survivors Supported" },
              { value: "1,200+", label: "Therapy Sessions" },
              { value: "85%", label: "Academic Improvement" },
              { value: "4", label: "Core Programs" }
            ].map((stat, index) => (
              <FadeIn key={stat.label} direction="up" delay={0.1 * (index + 1)}>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gold-600 mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Constitution Alignment */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FadeIn direction="up">
              <h2 className="text-4xl font-bold text-navy-primary mb-8 text-center">
                Constitutional Alignment
              </h2>
            </FadeIn>
            <FadeIn direction="up" delay={0.2}>
              <Card className="border-2 border-navy-600 p-8">
                <p className="text-gray-600 mb-6">
                  The Sello Saka Foundation operates in full alignment with the South African Constitution,
                  particularly Section 27, which enshrines the right to healthcare services, and Section 28,
                  which protects children's rights to basic healthcare and social services.
                </p>
                <p className="text-gray-600">
                  Our work embodies the constitutional promise that every child deserves the opportunity to
                  reach their full potential, regardless of the challenges they have faced. We are committed
                  to upholding these rights and ensuring that childhood cancer survivors receive the
                  comprehensive support they need to thrive.
                </p>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
