import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Competition {
  id: string;
  title: string;
}

interface CompetitionEntry {
  id: string;
  competition_id: string | null;
  name: string;
  full_name: string | null;
  email: string;
  phone: string;
  ticket_number: string | null;
  proof_of_payment_url: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_status?: string | null;
  payment_record_status?: string | null;
  provider_status?: string | null;
  provider_payment_id?: string | null;
  payment_verified_at?: string | null;
  ticket_emailed?: boolean | null;
  status: string;
  created_at: string | null;
}

interface ReconciliationEvent {
  id: string;
  channel: string;
  event_type: string;
  payment_reference: string;
  provider_payment_id: string | null;
  status_before: string | null;
  status_after: string | null;
  parsed_provider_status: string | null;
  signature_valid: boolean | null;
  merchant_match: boolean | null;
  amount_match: boolean | null;
  duplicate_detected: boolean | null;
  processing_result: string | null;
  error_message: string | null;
  raw_response_status: number | null;
  occurred_at: string;
}

const CompetitionEntriesTab = () => {
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<CompetitionEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [retryingPaymentReference, setRetryingPaymentReference] = useState<string | null>(null);
  const { toast } = useToast();

  const competitions = useQuery(api.admin.listCompetitions) as Competition[] | undefined;
  const entries = useQuery(
    api.admin.listCompetitionEntriesByCompetition,
    selectedCompetition ? { competitionId: selectedCompetition as never } : "skip",
  ) as CompetitionEntry[] | undefined;
  const reconciliationTimeline = useQuery(
    api.admin.getPaymentReconciliationTimeline,
    selectedEntry?.payment_reference ? { paymentReference: selectedEntry.payment_reference } : "skip",
  ) as ReconciliationEvent[] | undefined;
  const updateEntryStatus = useMutation(api.admin.updateCompetitionEntryStatus);
  const retryPayfastPaymentReconciliation = useAction(api.admin.retryPayfastPaymentReconciliation);

  useEffect(() => {
    if (!selectedEntry || !entries) {
      return;
    }
    const refreshedEntry = entries.find((entry) => entry.id === selectedEntry.id);
    if (refreshedEntry) {
      setSelectedEntry(refreshedEntry);
    }
  }, [entries, selectedEntry]);

  const handleUpdateStatus = async (entryId: string, status: string) => {
    try {
      await updateEntryStatus({ id: entryId as never, status });
      toast({
        title: "Success",
        description: "Entry status updated",
      });

      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry({ ...selectedEntry, status });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update entry status",
        variant: "destructive",
      });
    }
  };

  const openDetails = (entry: CompetitionEntry) => {
    setSelectedEntry(entry);
    setShowDetails(true);
  };

  const handleRetryPayment = async (paymentReference: string) => {
    try {
      setRetryingPaymentReference(paymentReference);
      const result = await retryPayfastPaymentReconciliation({ paymentReference });
      toast({
        title: result?.success ? "Reconciliation complete" : "Retry recorded",
        description:
          result?.success
            ? "The stored PayFast evidence was replayed successfully."
            : "The retry was recorded, but the payment still needs more evidence or another webhook.",
      });
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Payment reconciliation retry failed",
        variant: "destructive",
      });
    } finally {
      setRetryingPaymentReference(null);
    }
  };

  if (competitions === undefined) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8 text-center text-gray-500">Loading competitions...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-navy-primary flex justify-between items-center">
          <span>Competition Entries</span>
          <div className="w-[300px]">
            <Select value={selectedCompetition} onValueChange={setSelectedCompetition}>
              <SelectTrigger>
                <SelectValue placeholder="Select a competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ticket #</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(entries || []).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.email}</TableCell>
                  <TableCell>{entry.ticket_number || "Pending"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        entry.status === "approved"
                          ? "bg-green-500"
                          : entry.status === "rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }
                    >
                      {entry.status || "pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetails(entry)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(entries || []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    {selectedCompetition
                      ? "No entries found for this competition."
                      : "Please select a competition to view entries."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entry Details</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Name</Label>
                  <div className="font-medium">{selectedEntry.name}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <div className="font-medium">{selectedEntry.email}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <div className="font-medium">{selectedEntry.phone}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Ticket Number</Label>
                  <div className="font-medium">{selectedEntry.ticket_number || "Pending"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Reference</Label>
                  <div className="font-medium break-all">{selectedEntry.payment_reference || "-"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <div>
                    <Badge
                      className={
                        selectedEntry.status === "approved"
                          ? "bg-green-500"
                          : selectedEntry.status === "rejected"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                      }
                    >
                      {selectedEntry.status || "pending"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Payment Status</Label>
                  <div className="font-medium">{selectedEntry.payment_record_status || selectedEntry.payment_status || "-"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Provider Status</Label>
                  <div className="font-medium">{selectedEntry.provider_status || "-"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Provider Payment ID</Label>
                  <div className="font-medium break-all">{selectedEntry.provider_payment_id || "-"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Verified At</Label>
                  <div className="font-medium">
                    {selectedEntry.payment_verified_at ? new Date(selectedEntry.payment_verified_at).toLocaleString() : "-"}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Ticket Emailed</Label>
                  <div className="font-medium">{selectedEntry.ticket_emailed ? "Yes" : "No"}</div>
                </div>
                <div>
                  <Label className="text-gray-500">Submission Date</Label>
                  <div className="font-medium">
                    {selectedEntry.created_at ? new Date(selectedEntry.created_at).toLocaleString() : "-"}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-500 mb-2 block">Proof of Payment</Label>
                {selectedEntry.proof_of_payment_url ? (
                  <div className="border rounded-lg p-2 bg-gray-50">
                    <img
                      src={selectedEntry.proof_of_payment_url}
                      alt="Proof of Payment"
                      className="max-w-full h-auto rounded mx-auto"
                      style={{ maxHeight: "500px" }}
                    />
                    <div className="mt-2 text-center">
                      <a
                        href={selectedEntry.proof_of_payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Open original image
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed rounded text-gray-400 text-center">
                    No proof of payment uploaded
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-500 block">Payment Reconciliation Timeline</Label>
                  {selectedEntry.payment_reference &&
                    selectedEntry.payment_method === "payfast" &&
                    selectedEntry.payment_record_status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetryPayment(selectedEntry.payment_reference!)}
                      disabled={retryingPaymentReference === selectedEntry.payment_reference}
                    >
                      {retryingPaymentReference === selectedEntry.payment_reference
                        ? "Retrying..."
                        : "Retry PayFast Reconciliation"}
                    </Button>
                  )}
                </div>
                <div className="border rounded-lg bg-gray-50 p-3 space-y-3 max-h-64 overflow-y-auto">
                  {reconciliationTimeline === undefined && (
                    <div className="text-sm text-gray-500">Loading payment timeline...</div>
                  )}
                  {reconciliationTimeline && reconciliationTimeline.length === 0 && (
                    <div className="text-sm text-gray-500">No reconciliation events recorded yet.</div>
                  )}
                  {reconciliationTimeline?.map((event) => (
                    <div key={event.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-sm">{event.event_type}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(event.occurred_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {event.channel} | {event.processing_result || "no-result"}
                      </div>
                      {(event.status_before || event.status_after || event.parsed_provider_status) && (
                        <div className="text-xs text-gray-600 mt-1">
                          {event.status_before || "-"} → {event.status_after || event.status_before || "-"} | provider: {event.parsed_provider_status || "-"}
                        </div>
                      )}
                      {event.error_message && (
                        <div className="text-xs text-red-600 mt-1">{event.error_message}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus(selectedEntry.id, "rejected")}
                  disabled={selectedEntry.status === "rejected"}
                >
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleUpdateStatus(selectedEntry.id, "approved")}
                  disabled={selectedEntry.status === "approved"}
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CompetitionEntriesTab;
