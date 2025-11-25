import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Linkedin, Mail } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { HoverCard } from "@/components/animations/HoverCard";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    image_url: string | null;
    linkedin_url: string | null;
    email: string | null;
    status?: string;
    created_at?: string;
}

const ActiveTeams = () => {
    const [teams, setTeams] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<TeamMember | null>(null);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const { data, error } = await supabase
                    .from("teams")
                    .select("id,name,role,bio,image_url,linkedin_url,email,status,created_at")
                    .eq("status", "active")
                    .order("created_at", { ascending: true });

                if (error) {
                    console.error("Error fetching teams:", error);
                } else {
                    setTeams(data || []);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, []);

    if (loading) {
        return <div className="text-center text-white">Loading team...</div>;
    }

    if (teams.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-navy-primary">
            <div className="container mx-auto px-4">
                <FadeIn direction="up">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Our Leadership Team
                            <div className="w-20 h-1 bg-gold-600 mx-auto mt-4" />
                        </h2>
                        <p className="text-gray-400 text-lg">Dedicated professionals committed to transforming lives</p>
                    </div>
                </FadeIn>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {teams.map((member, index) => (
                        <FadeIn key={member.id} direction="up" delay={0.1 * (index + 1)}>
                            <HoverCard>
                                <Card
                                    className="bg-navy-600 border-gold-800 overflow-hidden h-[520px] flex flex-col cursor-pointer"
                                    onClick={() => { setSelected(member); setOpen(true); }}
                                >
                                    <div className="flex justify-center items-center p-8 bg-navy-700">
                                        <div
                                            className="relative overflow-hidden"
                                            style={{
                                                width: '240px',
                                                height: '240px',
                                                borderRadius: '50%',
                                                border: '3px solid #D4AF37'
                                            }}
                                        >
                                            <img
                                                src={member.image_url}
                                                alt={member.name}
                                                className="w-full h-full"
                                                style={{
                                                    objectFit: 'cover',
                                                    objectPosition: 'center'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 min-h-0 flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                                        <p className="text-gold-600 text-sm mb-3">{member.role}</p>
                                        <div className="relative">
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-4">
                                                {member.bio}
                                            </p>
                                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-navy-600 to-transparent" />
                                        </div>
                                        <div className="flex gap-3">
                                            {member.linkedin_url && (
                                                <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gold-600 hover:text-gold-400" onClick={(e) => e.stopPropagation()}>
                                                    <Linkedin className="w-5 h-5" />
                                                </a>
                                            )}
                                            {member.email && (
                                                <a href={`mailto:${member.email}`} className="text-gold-600 hover:text-gold-400" onClick={(e) => e.stopPropagation()}>
                                                    <Mail className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </HoverCard>
                        </FadeIn>
                    ))}
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSelected(null); }}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selected?.name}</DialogTitle>
                        </DialogHeader>
                        {selected && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {selected.image_url && (
                                        <img
                                            src={selected.image_url}
                                            alt={selected.name}
                                            className="w-20 h-20 rounded-full object-cover border border-gold-600"
                                        />
                                    )}
                                    <div>
                                        <div className="text-gold-600 font-medium">{selected.role}</div>
                                        {selected.linkedin_url && (
                                            <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gold-600 text-sm">LinkedIn</a>
                                        )}
                                        {selected.email && (
                                            <div className="text-gold-600 text-sm">{selected.email}</div>
                                        )}
                                    </div>
                                </div>
                                <ScrollArea className="h-[60vh] pr-4">
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {selected.bio}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
};

export default ActiveTeams;
