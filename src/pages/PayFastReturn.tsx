import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import { Loader2, CheckCircle2 } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function PayFastReturn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');

    // PayFast ITN doesn't instantly ping, so we poll for the competition entry
    useEffect(() => {
        let pollInterval: NodeJS.Timeout;
        let pollCount = 0;
        const maxPolls = 30; // 30 polls * 2s = 60s max wait time

        const verifyPayment = async () => {
            // In a real ITN setup, the webhook handles the verification and database insert
            // Here on the return page, we just poll the database waiting for the entry to appear

            const email = searchParams.get('email');
            const compId = searchParams.get('compId');

            if (!email || !compId) {
                setStatus('error');
                setErrorMessage('Missing required parameters.');
                return;
            }

            pollInterval = setInterval(async () => {
                pollCount++;

                try {
                    // Check if entry exists in DB for this email and competition
                    const { data, error } = await supabase
                        .from('competition_entries')
                        .select('*')
                        .eq('email', email)
                        .eq('competition_id', compId)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    if (data && data.status === 'confirmed') {
                        clearInterval(pollInterval);
                        setStatus('success');

                        // Wait a moment then redirect to full success page to match Paystack flow
                        setTimeout(() => {
                            navigate('/ticket-success', {
                                state: {
                                    ticket_number: data.ticket_number,
                                    reference: data.payment_reference,
                                    participant_name: data.name,
                                    email: data.email,
                                    competition_title: "Your Competition", // We'd ideally pass this too
                                    prize: "Your Prize",
                                    draw_date: new Date().toLocaleDateString() // Placeholder
                                }
                            });
                        }, 3000);
                    }
                } catch (err) {
                    console.error("Polling error:", err);
                }

                if (pollCount >= maxPolls) {
                    clearInterval(pollInterval);
                    setStatus('error');
                    setErrorMessage('Timeout waiting for payment confirmation. If your payment went through, your ticket will be emailed to you shortly.');
                }
            }, 2000);
        };

        verifyPayment();

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        {status === 'verifying' ? (
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : status === 'success' ? (
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-500" />
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 text-red-500 text-3xl font-bold">!</div>
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {status === 'verifying' && 'Verifying Payment...'}
                        {status === 'success' && 'Payment Successful!'}
                        {status === 'error' && 'Verification Issue'}
                    </h2>

                    <p className="text-gray-600 mb-8">
                        {status === 'verifying' && 'Please wait while we confirm your payment with PayFast. Do not close this window.'}
                        {status === 'success' && 'Your ticket is being generated. Redirecting you...'}
                        {status === 'error' && errorMessage}
                    </p>

                    {status === 'error' && (
                        <button
                            onClick={() => navigate('/active-competition')}
                            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Return to Competitions
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
