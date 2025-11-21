import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import impact1 from "@/assets/impact-1.jpg";
import impact2 from "@/assets/impact-2.jpg";
import impact3 from "@/assets/impact-3.jpg";
import ActiveImpactStories from "@/components/ActiveImpactStories";

const Impact = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-navy-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Impact Stories</h1>
          <div className="w-20 h-1 bg-gold-600 mx-auto mb-6" />
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real stories of resilience, recovery, and hope
          </p>
        </div>
      </section>

      {/* Stories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            <ActiveImpactStories variant="list" />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-navy-primary">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">By the Numbers</h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="bg-navy-600 border-gold-800 p-8 text-center">
              <div className="text-5xl font-bold text-gold-600 mb-2">350+</div>
              <div className="text-gray-400">Survivors Supported</div>
            </Card>
            <Card className="bg-navy-600 border-gold-800 p-8 text-center">
              <div className="text-5xl font-bold text-gold-600 mb-2">95%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </Card>
            <Card className="bg-navy-600 border-gold-800 p-8 text-center">
              <div className="text-5xl font-bold text-gold-600 mb-2">1,200+</div>
              <div className="text-gray-400">Therapy Sessions</div>
            </Card>
            <Card className="bg-navy-600 border-gold-800 p-8 text-center">
              <div className="text-5xl font-bold text-gold-600 mb-2">85%</div>
              <div className="text-gray-400">Academic Improvement</div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Impact;
