import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle2, Trophy, ShieldCheck, Users, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/animations/FadeIn";
import { HoverCard } from "@/components/animations/HoverCard";
import { Link, useNavigate } from "react-router-dom";

interface ActiveCompetitionProps {
    competition: {
        id: string;
        title: string;
        description: string;
        prize_first: string | null;
        prize_second: string | null;
        prize_third: string | null;
        entry_fee: number;
        end_date: string;
        badge_text?: string | null;
        subtitle?: string | null;
        hero_image_url?: string | null;
        footer_text_1?: string | null;
        footer_text_2?: string | null;
    };
}

const NLC_COMPLIANCE_URL = "https://www.nlcsa.org.za/regulatory-compliance/";

const ActiveCompetition = ({ competition }: ActiveCompetitionProps) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const createPayment = useAction(api.paymentsNode.createPayment);

    const submitHostedPaymentForm = (processUrl: string, formFields: Record<string, string>) => {
        console.log("Submitting PayFast form", {
            processUrl,
            formFields,
        });

        const form = document.createElement("form");
        form.method = "POST";
        form.action = processUrl;
        form.style.display = "none";

        Object.entries(formFields).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(competition.end_date) - +new Date();
            let timeLeft = {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }

            return timeLeft;
        };

        setCountdown(calculateTimeLeft());

        const timer = setInterval(() => {
            setCountdown(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [competition.end_date]);

    const handlePayFast = async () => {
        setLoading(true);
        try {
            const pfData = await createPayment({
                purpose: "competition_entry",
                provider: "payfast",
                competition_id: competition.id as never,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                site_url: window.location.origin,
            });

            submitHostedPaymentForm(pfData.process_url, pfData.form_fields);
        } catch (error: any) {
            console.error("PayFast Error:", error);
            toast.error("Payment Error", {
                description: error.message || "Failed to initialize PayFast payment. Please try again.",
            });
            setLoading(false);
        }
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone) {
            toast.error("Please fill in all fields");
            return;
        }

        void handlePayFast();
    };

    return (
        <div>
            {/* Hero */}
            <section className="bg-navy-primary py-20 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-left z-10">
                            <FadeIn direction="down">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-navy-800/50 border border-gold-600/30 rounded-full mb-8 backdrop-blur-sm">
                                    <Sparkles className="w-4 h-4 text-gold-400" />
                                    <span className="text-gold-400 text-sm font-medium tracking-wide uppercase">
                                        {competition.badge_text || "Limited Time Offer"}
                                    </span>
                                </div>
                            </FadeIn>

                            <FadeIn direction="up" delay={0.2}>
                                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                    {competition.title}
                                </h1>
                            </FadeIn>

                            <FadeIn direction="up" delay={0.3}>
                                <h2 className="text-2xl md:text-3xl text-gold-100 font-medium mb-6">
                                    {competition.subtitle || "Win Big while making a difference!"}
                                </h2>
                            </FadeIn>

                            <FadeIn direction="up" delay={0.4}>
                                <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
                                    {competition.description}
                                </p>
                            </FadeIn>

                            <FadeIn direction="up" delay={0.5}>
                                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                    <Button
                                        className="bg-gold-600 hover:bg-gold-500 text-navy-950 font-bold text-lg px-8 py-6 h-auto rounded-lg transition-all hover:scale-105"
                                        onClick={() => document.getElementById('entry-form')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        <Trophy className="w-5 h-5 mr-2" />
                                        Enter Now
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-gold-600 text-gold-600 bg-transparent hover:bg-white hover:text-navy-primary hover:border-white font-semibold text-lg px-8 py-6 h-auto rounded-lg transition-all duration-300 hover:scale-105"
                                        onClick={() => window.location.href = '/'}
                                    >
                                        Back to Home
                                    </Button>
                                </div>
                            </FadeIn>

                            <FadeIn direction="up" delay={0.6}>
                                <div className="flex items-center gap-8 text-sm text-gray-400 font-medium">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-gold-600" />
                                        <span>{competition.footer_text_1 || "Secure & Transparent"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-gold-600" />
                                        <span>{competition.footer_text_2 || "Verified Entries"}</span>
                                    </div>
                                </div>
                            </FadeIn>
                        </div>

                        <div className="relative lg:h-[600px] h-[400px] rounded-2xl overflow-hidden group">
                            <FadeIn direction="left" delay={0.4} className="h-full w-full">
                                <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/80 via-transparent to-transparent z-10" />
                                <div className="absolute inset-0 border-2 border-gold-600/20 rounded-2xl z-20 pointer-events-none" />
                                {competition.hero_image_url ? (
                                    <img
                                        src={competition.hero_image_url}
                                        alt={competition.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-navy-800 flex items-center justify-center">
                                        <Trophy className="w-24 h-24 text-gold-600/20" />
                                    </div>
                                )}
                            </FadeIn>
                        </div>
                    </div>
                </div>
            </section>

            {/* Countdown */}
            <section className="py-16 bg-navy-600">
                <div className="container mx-auto px-4">
                    <FadeIn direction="up">
                        <h2 className="text-3xl font-bold text-white text-center mb-12">Time Remaining</h2>
                    </FadeIn>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { value: countdown.days, label: "Days" },
                            { value: countdown.hours, label: "Hours" },
                            { value: countdown.minutes, label: "Minutes" },
                            { value: countdown.seconds, label: "Seconds" }
                        ].map((item, index) => (
                            <FadeIn key={item.label} direction="up" delay={0.1 * (index + 1)}>
                                <div className="bg-navy-primary rounded-lg p-8 text-center border-2 border-gold-800">
                                    <div className="text-5xl md:text-6xl font-bold text-gold-600 mb-2">
                                        {String(item.value).padStart(2, '0')}
                                    </div>
                                    <div className="text-gray-400 text-sm uppercase tracking-wide">{item.label}</div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Prizes */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <FadeIn direction="up">
                        <h2 className="text-4xl font-bold text-navy-primary mb-4 text-center">Amazing Prizes</h2>
                        <div className="w-20 h-1 bg-gold-600 mx-auto mb-12" />
                    </FadeIn>

                    <div className={`flex flex-wrap gap-8 max-w-6xl mx-auto ${(competition.prize_second || competition.prize_third) ? 'justify-start' : 'justify-center'}`}>
                        <FadeIn direction="up" delay={0.2} className="w-full md:w-[calc(33.333%-1.4rem)] h-full flex-shrink-0">
                            <HoverCard className="h-full">
                                <Card className="border-2 border-gold-600 p-8 text-center hover:shadow-xl transition-shadow h-full">
                                    <div className="w-16 h-16 rounded-full bg-gold-600 flex items-center justify-center mx-auto mb-4">
                                        <Trophy className="w-8 h-8 text-navy-primary" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-navy-primary mb-3">1st Prize</h3>
                                    <p className="text-gray-600 text-lg mb-2">{competition.prize_first}</p>
                                </Card>
                            </HoverCard>
                        </FadeIn>

                        {competition.prize_second && (
                            <FadeIn direction="up" delay={0.4} className="w-full md:w-[calc(33.333%-1.4rem)] h-full flex-shrink-0">
                                <HoverCard className="h-full">
                                    <Card className="border-2 border-navy-600 p-8 text-center hover:shadow-xl transition-shadow h-full">
                                        <div className="w-16 h-16 rounded-full bg-navy-600 flex items-center justify-center mx-auto mb-4">
                                            <Trophy className="w-8 h-8 text-gold-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-navy-primary mb-3">2nd Prize</h3>
                                        <p className="text-gray-600 text-lg mb-2">{competition.prize_second}</p>
                                    </Card>
                                </HoverCard>
                            </FadeIn>
                        )}

                        {competition.prize_third && (
                            <FadeIn direction="up" delay={0.6} className="w-full md:w-[calc(33.333%-1.4rem)] h-full flex-shrink-0">
                                <HoverCard className="h-full">
                                    <Card className="border-2 border-navy-600 p-8 text-center hover:shadow-xl transition-shadow h-full">
                                        <div className="w-16 h-16 rounded-full bg-navy-600 flex items-center justify-center mx-auto mb-4">
                                            <Trophy className="w-8 h-8 text-gold-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-navy-primary mb-3">3rd Prize</h3>
                                        <p className="text-gray-600 text-lg mb-2">{competition.prize_third}</p>
                                    </Card>
                                </HoverCard>
                            </FadeIn>
                        )}
                    </div>
                </div>
            </section>

            {/* How to Enter */}
            <section className="py-20 bg-navy-primary">
                <div className="container mx-auto px-4">
                    <FadeIn direction="up">
                        <h2 className="text-4xl font-bold text-white mb-4 text-center">How to Enter</h2>
                        <div className="w-20 h-1 bg-gold-600 mx-auto mb-12" />
                    </FadeIn>

                    <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        {[
                            { step: 1, title: "Fill in Your Details", desc: "Enter your name, email, and phone number in the form below." },
                            { step: 2, title: "Pay Securely", desc: `Entry costs R${competition.entry_fee}. Pay securely via PayFast.` },
                            { step: 3, title: "Receive Your Ticket", desc: "Your unique digital ticket will be emailed to you instantly after payment." },
                            { step: 4, title: "Wait for Results", desc: "Winners announced after the countdown ends via live random draw!" }
                        ].map((item, index) => (
                            <FadeIn key={item.step} direction="up" delay={0.1 * (index + 1)}>
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-gold-600 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-navy-primary">{item.step}</span>
                                    </div>
                                    <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* Entry Form */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <FadeIn direction="up">
                            <h2 className="text-4xl font-bold text-navy-primary mb-4 text-center">Enter Now</h2>
                            <div className="w-20 h-1 bg-gold-600 mx-auto mb-8" />
                        </FadeIn>

                        <FadeIn direction="up" delay={0.2}>
                            <Card className="border-2 border-navy-600 p-8" id="entry-form">
                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Your name"
                                            required
                                            className="mt-2"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="your@email.com"
                                            required
                                            className="mt-2"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+27 12 345 6789"
                                            required
                                            className="mt-2"
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Entry Fee Display */}
                                    <div className="bg-beige-200 border-l-4 border-gold-600 p-4">
                                        <div className="flex gap-3">
                                            <CreditCard className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-gray-700">
                                                <p className="font-semibold mb-1">Entry Fee: R{competition.entry_fee.toFixed(2)}</p>
                                                <p>Secure payment powered by PayFast. Supports card, EFT, bank transfer, and more.</p>
                                                <p className="mt-1 text-xs text-gray-500">Your donation supports our childhood cancer survivor programs.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-gold-300 bg-gold-50 px-4 py-4 text-sm text-navy-primary">
                                        <p className="font-semibold mb-1">Competition Compliance</p>
                                        <p>
                                            NPC fundraising competition under registered scheme
                                            <span className="font-semibold"> NLC: Scheme No: 00539/01</span>.
                                            Regulatory information is available from the{" "}
                                            <a
                                                href={NLC_COMPLIANCE_URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gold-700 underline underline-offset-2 hover:text-gold-600"
                                            >
                                                National Lotteries Commission
                                            </a>
                                            .
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold">
                                            <Link
                                                to="/competition/terms"
                                                className="text-gold-700 underline underline-offset-2 hover:text-gold-600"
                                            >
                                                Competition Terms
                                            </Link>
                                            <Link
                                                to="/competition/rules"
                                                className="text-gold-700 underline underline-offset-2 hover:text-gold-600"
                                            >
                                                Competition Rules
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Payment Method Selection */}
                                    <div>
                                        <Label className="mt-4 block mb-2 font-semibold">Select Payment Method</Label>
                                        <div className="max-w-md mx-auto mb-6">
                                            <div className="w-full h-20 rounded-md border bg-gold-600/10 border-gold-600 text-navy-primary flex flex-col items-center justify-center gap-2">
                                                <CreditCard className="w-6 h-6" />
                                                <span className="text-xs font-semibold">PayFast</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-gold-600 hover:bg-gold-400 text-navy-primary text-lg h-14 font-bold"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating Your Ticket...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                Pay R{competition.entry_fee.toFixed(2)} & Get Your Ticket
                                            </>
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>256-bit SSL encrypted payment</span>
                                    </div>
                                </form>
                            </Card>
                        </FadeIn>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ActiveCompetition;
