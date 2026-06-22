import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Header from "@/components/Header";
import { Loader2, CheckCircle2 } from "lucide-react";

type PaymentViewState = "verifying" | "success" | "cancelled" | "pending" | "error";

interface CompetitionSuccessPayload {
  ticket_number: string;
  reference: string;
  participant_name: string;
  email: string;
  participant_phone: string;
  competition_title: string;
  prize: string;
  entry_price: number;
  competition_period: string;
  draw_date: string;
  entry_date: string;
  ticket_download_url: string | null;
  ticket_emailed?: boolean;
}

type PaymentStatusResult =
  | {
      payment_reference: string;
      status: string;
      purpose: string;
      provider: string;
      provider_status: string | null;
      completed_at: string | null;
      competition_success: CompetitionSuccessPayload | null;
    }
  | null
  | undefined;

export function PayFastReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentViewState>("verifying");
  const [message, setMessage] = useState("Please wait while we confirm your payment.");
  const [sandboxReconcileAttempted, setSandboxReconcileAttempted] = useState(false);
  const confirmSandboxPayfastReturn = useAction(api.paymentsNode.confirmSandboxPayfastReturn);

  const paymentReference = searchParams.get("payment_reference");
  const wasCancelled = searchParams.get("cancelled") === "1";
  const paymentStatus = useQuery(
    api.payments.getPaymentStatus,
    paymentReference ? { paymentReference } : "skip",
  ) as PaymentStatusResult;

  useEffect(() => {
    if (!paymentReference) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    if (wasCancelled) {
      setStatus("cancelled");
      setMessage("Your payment was cancelled before completion.");
      return;
    }

    if (paymentStatus === undefined) {
      setStatus("verifying");
      setMessage("Please wait while we confirm your payment.");
      return;
    }

    if (paymentStatus === null) {
      setStatus("error");
      setMessage("We could not find that payment reference.");
      return;
    }

    if (paymentStatus.status === "completed") {
      if (paymentStatus.purpose === "competition_entry" && paymentStatus.competition_success) {
        navigate(`/competition/success?payment_reference=${encodeURIComponent(paymentStatus.competition_success.reference)}`, {
          state: paymentStatus.competition_success,
        });
        return;
      }

      setStatus("success");
      setMessage("Your donation payment has been confirmed.");
      return;
    }

    if (paymentStatus.status === "cancelled") {
      setStatus("cancelled");
      setMessage("Your payment was cancelled before completion.");
      return;
    }

    if (paymentStatus.status === "failed") {
      setStatus("error");
      setMessage("Your payment could not be completed.");
      return;
    }

    setStatus("pending");
    setMessage("We are still waiting for gateway confirmation. If you completed payment, it should reflect shortly.");
  }, [navigate, paymentReference, paymentStatus, wasCancelled]);

  useEffect(() => {
    if (
      !paymentReference ||
      sandboxReconcileAttempted ||
      paymentStatus === undefined ||
      paymentStatus === null ||
      paymentStatus.status !== "pending" ||
      paymentStatus.provider !== "payfast" ||
      wasCancelled
    ) {
      return;
    }

    setSandboxReconcileAttempted(true);

    void (async () => {
      try {
        const finalized = await confirmSandboxPayfastReturn({
          paymentReference,
        });

        if (finalized?.purpose === "competition_entry" && finalized?.competition_success) {
          navigate(`/competition/success?payment_reference=${encodeURIComponent(finalized.competition_success.reference)}`, {
            state: finalized.competition_success,
          });
          return;
        }

        if (finalized?.success) {
          setStatus("success");
          setMessage("Your donation payment has been confirmed.");
        }
      } catch (error) {
        console.error("Sandbox PayFast reconciliation failed:", error);
      }
    })();
  }, [
    confirmSandboxPayfastReturn,
    navigate,
    paymentReference,
    paymentStatus,
    sandboxReconcileAttempted,
    wasCancelled,
  ]);

  const statusTitle = useMemo(() => {
    switch (status) {
      case "verifying":
        return "Verifying Payment";
      case "success":
        return "Payment Confirmed";
      case "cancelled":
        return "Payment Cancelled";
      case "pending":
        return "Still Processing";
      case "error":
        return "Verification Issue";
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="mb-6 flex justify-center">
            {status === "verifying" ? (
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : status === "success" ? (
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 text-amber-600 text-3xl font-bold">!</div>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {statusTitle}
          </h2>

          <p className="text-gray-600 mb-8">{message}</p>

          {(status === "cancelled" || status === "error" || status === "pending") && (
            <button
              onClick={() => navigate("/donate")}
              className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Site
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
