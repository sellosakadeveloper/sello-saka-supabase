import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ResourceCard from "@/components/ResourceCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Resource {
    id: string;
    title: string;
    summary: string | null;
    type: string;
    category: string | null;
    file_url: string | null;
    created_at: string;
}

const CATEGORIES = [
    "Cervical Cancer Awareness Month",
    "National Cancer Prevention Month",
    "Oesophageal Cancer Awareness Month",
    "Brain Tumour Awareness Month",
    "Colorectal Cancer Awareness Month",
    "Kidney Cancer Awareness Month",
    "Ovarian Cancer Awareness Month",
    "Bowel Cancer Awareness Month",
    "Testicular Cancer Prevention Month",
    "Bladder Cancer Awareness Month",
    "Melanoma and Skin Cancer Awareness Month",
    "Cervical Screening Awareness Week",
    "Myeloma Awareness Week",
    "Sarcoma Awareness Month",
    "Gastrointestinal Stromal Tumor (GIST) Awareness Day",
    "Blood Cancer Awareness Month",
    "Childhood Cancer Awareness Month",
    "Gynaecological Cancer Awareness Month",
    "Thyroid Cancer Awareness Month",
    "Breast Cancer Awareness Month",
    "Liver Cancer Awareness Month",
    "Gastric Cancer Awareness Month",
    "Lung Cancer Awareness Month",
    "Pancreatic Cancer Awareness Month",
    "General / Other"
];

const ResourceHub = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Resource Hub | Sello Saka Foundation";
        fetchResources();
    }, []);

    useEffect(() => {
        filterResources();
    }, [searchQuery, selectedCategory, resources]);

    const fetchResources = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("resources")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching resources:", error);
        } else {
            setResources(data as Resource[] || []);
        }
        setLoading(false);
    };

    const filterResources = () => {
        let filtered = resources;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(resource =>
                resource.title.toLowerCase().includes(query) ||
                (resource.summary && resource.summary.toLowerCase().includes(query))
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(resource => resource.category === selectedCategory);
        }

        setFilteredResources(filtered);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-navy-primary text-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <FadeIn direction="up">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Resource Hub</h1>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Access our collection of articles, guides, and screening information to stay informed about cancer awareness and prevention.
                            </p>
                        </FadeIn>
                    </div>
                </section>

                {/* Search and Filter Section */}
                <section className="py-8 sticky top-20 z-40 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search resources..."
                                    className="pl-10 bg-white border-gray-300 focus:border-gold-500 focus:ring-gold-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                Showing {filteredResources.length} resources
                            </div>
                        </div>

                        {/* Category Chips */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <Button
                                variant={selectedCategory === null ? "default" : "outline"}
                                className={`whitespace-nowrap rounded-full ${selectedCategory === null ? 'bg-navy-primary text-white' : 'border-gray-300 text-gray-600 hover:text-navy-primary hover:border-navy-primary'}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                All Resources
                            </Button>
                            {CATEGORIES.map((category) => (
                                <Button
                                    key={category}
                                    variant={selectedCategory === category ? "default" : "outline"}
                                    className={`whitespace-nowrap rounded-full ${selectedCategory === category ? 'bg-gold-600 text-navy-primary hover:bg-gold-500' : 'border-gray-300 text-gray-600 hover:text-gold-600 hover:border-gold-600'}`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Resources Grid */}
                <section className="py-12 container mx-auto px-4">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredResources.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredResources.map((resource, index) => (
                                <FadeIn key={resource.id} delay={index * 0.05} direction="up">
                                    <ResourceCard
                                        title={resource.title}
                                        summary={resource.summary}
                                        type={resource.type}
                                        category={resource.category}
                                        fileUrl={resource.file_url}
                                    />
                                </FadeIn>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="bg-white p-8 rounded-full inline-block mb-4 shadow-sm">
                                <Search className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No resources found</h3>
                            <p className="text-gray-500">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                            <Button
                                variant="link"
                                className="text-gold-600 mt-2"
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCategory(null);
                                }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default ResourceHub;
