import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Trophy, Mail, ArrowLeft, TicketIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/animations/FadeIn";

interface TicketSuccessState {
    ticket_number: string;
    reference: string;
    participant_name: string;
    email: string;
    competition_title: string;
    prize: string;
    draw_date: string;
    ticket_emailed?: boolean;
}

const TicketSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as TicketSuccessState | null;

    if (!state) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
                    <h2 className="text-3xl font-bold text-navy-primary mb-4">No Ticket Found</h2>
                    <p className="text-gray-600 max-w-md mb-8">
                        It looks like you haven't purchased a ticket yet, or the page was refreshed.
                    </p>
                    <Button
                        onClick={() => navigate("/competition")}
                        className="bg-gold-600 hover:bg-gold-500 text-navy-primary font-bold"
                    >
                        Go to Competition
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <section className="py-20 bg-navy-primary">
                <div className="container mx-auto px-4">
                    <FadeIn direction="up">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Payment Successful! 🎉
                            </h1>
                            <p className="text-xl text-gray-300">
                                Your competition entry has been confirmed
                            </p>
                        </div>
                    </FadeIn>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto">
                        <FadeIn direction="up" delay={0.2}>
                            <Card className="border-2 border-gold-600 p-8 mb-8">
                                <div className="text-center mb-8">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-600/10 rounded-full mb-4">
                                        <TicketIcon className="w-5 h-5 text-gold-600" />
                                        <span className="text-gold-600 font-semibold">Your Ticket</span>
                                    </div>
                                    <div className="bg-navy-primary rounded-xl p-6 inline-block">
                                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Ticket Number</p>
                                        <p className="text-3xl md:text-4xl font-mono font-bold text-gold-400">
                                            {state.ticket_number}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Name</span>
                                        <span className="font-semibold text-navy-primary">{state.participant_name}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Competition</span>
                                        <span className="font-semibold text-navy-primary">{state.competition_title}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Prize</span>
                                        <span className="font-semibold text-navy-primary">{state.prize}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-500 text-sm">Draw Date</span>
                                        <span className="font-semibold text-navy-primary">{state.draw_date}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3">
                                        <span className="text-gray-500 text-sm">Reference</span>
                                        <span className="font-mono font-semibold text-navy-primary">{state.reference}</span>
                                    </div>
                                </div>
                            </Card>
                        </FadeIn>

                        <FadeIn direction="up" delay={0.4}>
                            <div className={`${state.ticket_emailed ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"} border rounded-xl p-6 mb-8`}>
                                <div className="flex gap-4">
                                    <Mail className={`w-6 h-6 flex-shrink-0 mt-0.5 ${state.ticket_emailed ? "text-green-600" : "text-amber-600"}`} />
                                    <div>
                                        {state.ticket_emailed ? (
                                            <>
                                                <p className="font-semibold text-green-800 mb-1">Ticket Emailed!</p>
                                                <p className="text-green-700 text-sm">
                                                    A copy of your digital ticket has been sent to <strong>{state.email}</strong>.
                                                    Please check your inbox and spam folder for the ticket.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="font-semibold text-amber-800 mb-1">Email Not Confirmed</p>
                                                <p className="text-amber-700 text-sm">
                                                    Your ticket is confirmed, but email delivery was not confirmed for <strong>{state.email}</strong>.
                                                    Use the ticket number on this page and verify the Resend sender setup before relying on email delivery.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        <FadeIn direction="up" delay={0.6}>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate("/competition")}
                                    className="bg-gold-600 hover:bg-gold-500 text-navy-primary font-bold px-8 py-6 h-auto text-lg"
                                >
                                    <Trophy className="w-5 h-5 mr-2" />
                                    Enter Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/")}
                                    className="border-navy-600 text-navy-primary font-semibold px-8 py-6 h-auto text-lg hover:bg-navy-primary hover:text-white"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Back to Home
                                </Button>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default TicketSuccess;
