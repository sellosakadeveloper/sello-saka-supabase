import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { uploadFileToConvex } from "@/integrations/convex/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";

interface Competition {
  id: string;
  title: string;
  description: string;
  prize: string;
  second_prize?: string | null;
  third_prize?: string | null;
  ticket_price: number;
  max_tickets?: number | null;
  start_date: string;
  status: string;
  end_date: string;
  image_url?: string | null;
  hero_image_storage_id?: string | null;
}

interface CompetitionEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  ticket_number: string | null;
  proof_of_payment_url: string | null;
  status: string;
  created_at: string | null;
}

const CompetitionsTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    second_prize: "",
    third_prize: "",
    ticket_price: "",
    max_tickets: "",
    start_date: "",
    end_date: "",
  });
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImageStorageId, setHeroImageStorageId] = useState<string>("");
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(null);
  const [showEntries, setShowEntries] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const competitions = useQuery(api.admin.listCompetitions) as Competition[] | undefined;
  const entries = useQuery(
    api.admin.listCompetitionEntriesByCompetition,
    selectedCompetition ? { competitionId: selectedCompetition as never } : "skip",
  ) as CompetitionEntry[] | undefined;

  const createCompetition = useMutation(api.admin.createCompetition);
  const updateCompetition = useMutation(api.admin.updateCompetition);
  const deleteCompetition = useMutation(api.admin.deleteCompetition);
  const setCompetitionStatus = useMutation(api.admin.setCompetitionStatus);
  const updateEntryStatus = useMutation(api.admin.updateCompetitionEntryStatus);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const getStorageUrl = useMutation(api.uploads.getStorageUrl);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      prize: "",
      second_prize: "",
      third_prize: "",
      ticket_price: "",
      max_tickets: "",
      start_date: "",
      end_date: "",
    });
    setHeroImageFile(null);
    setHeroImageStorageId("");
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroImageFile(e.target.files[0]);
    }
  };

  const handleEdit = (competition: Competition) => {
    setEditingId(competition.id);
    setFormData({
      title: competition.title,
      description: competition.description || "",
      prize: competition.prize || "",
      second_prize: competition.second_prize || "",
      third_prize: competition.third_prize || "",
      ticket_price: competition.ticket_price.toString(),
      max_tickets: competition.max_tickets ? competition.max_tickets.toString() : "",
      start_date: competition.start_date ? new Date(competition.start_date).toISOString().slice(0, 16) : "",
      end_date: competition.end_date ? new Date(competition.end_date).toISOString().slice(0, 16) : "",
    });
    setHeroImageStorageId(competition.hero_image_storage_id || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this competition?")) return;

    try {
      await deleteCompetition({ id: id as never });
      toast({
        title: "Success",
        description: "Competition deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete competition",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl: string | undefined;
    let uploadedStorageId = heroImageStorageId;

    if (heroImageFile) {
      try {
        const uploaded = await uploadFileToConvex({
          file: heroImageFile,
          generateUploadUrl,
          getStorageUrl,
        });
        imageUrl = uploaded.url;
        uploadedStorageId = uploaded.storageId;
        setHeroImageStorageId(uploaded.storageId);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload hero image",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        prize: formData.prize,
        second_prize: formData.second_prize || undefined,
        third_prize: formData.third_prize || undefined,
        ticket_price: parseFloat(formData.ticket_price) || 0,
        max_tickets: formData.max_tickets ? parseInt(formData.max_tickets, 10) : undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        image_url: imageUrl,
        hero_image_storage_id: uploadedStorageId || undefined,
        image_storage_id: uploadedStorageId || undefined,
      };

      if (editingId) {
        await updateCompetition({
          id: editingId as never,
          ...payload,
          status: "active",
        });
      } else {
        await createCompetition({
          ...payload,
          status: "active",
        });
      }

      toast({
        title: "Success",
        description: `Competition ${editingId ? "updated" : "created"} successfully`,
      });
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${editingId ? "update" : "create"} competition`,
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await setCompetitionStatus({ id: id as never, status });
      toast({
        title: "Success",
        description: "Competition status updated",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update competition",
        variant: "destructive",
      });
    }
  };

  const viewEntries = (competitionId: string) => {
    setSelectedCompetition(competitionId);
    setShowEntries(true);
  };

  const handleEntryStatus = async (entryId: string, status: string) => {
    try {
      await updateEntryStatus({ id: entryId as never, status });
      toast({
        title: "Success",
        description: "Entry status updated",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update entry status",
        variant: "destructive",
      });
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
          <span>Competition Management</span>
          <Dialog
            open={showForm}
            onOpenChange={(open) => {
              setShowForm(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-gold-600 hover:bg-gold-400 text-navy-primary"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
              >
                Create Competition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Competition" : "Create New Competition"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Hero Image {editingId && "(Optional - Leave empty to keep existing)"}</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageChange}
                      className="cursor-pointer"
                    />
                    {heroImageFile && (
                      <span className="text-sm text-green-600 flex items-center gap-1">
                        <Upload className="w-4 h-4" /> {heroImageFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>1st Prize</Label>
                    <Input
                      value={formData.prize}
                      onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>2nd Prize</Label>
                    <Input
                      value={formData.second_prize}
                      onChange={(e) => setFormData({ ...formData, second_prize: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>3rd Prize</Label>
                    <Input
                      value={formData.third_prize}
                      onChange={(e) => setFormData({ ...formData, third_prize: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ticket Price (R)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.ticket_price}
                      onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Max Tickets</Label>
                    <Input
                      type="number"
                      value={formData.max_tickets}
                      onChange={(e) => setFormData({ ...formData, max_tickets: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gold-600 hover:bg-gold-400 text-navy-primary">
                  {editingId ? "Update Competition" : "Create Competition"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>1st Prize</TableHead>
                <TableHead>2nd Prize</TableHead>
                <TableHead>3rd Prize</TableHead>
                <TableHead>Ticket Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell>{comp.title}</TableCell>
                  <TableCell>{comp.prize}</TableCell>
                  <TableCell>{comp.second_prize || "-"}</TableCell>
                  <TableCell>{comp.third_prize || "-"}</TableCell>
                  <TableCell>R{Number(comp.ticket_price).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        comp.status === "active"
                          ? "bg-green-500"
                          : comp.status === "ended"
                            ? "bg-red-500"
                            : "bg-gray-500"
                      }
                    >
                      {comp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(comp.end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(comp)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(comp.id, "active")}
                      >
                        Activate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(comp.id, "ended")}
                      >
                        End
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewEntries(comp.id)}
                      >
                        Entries
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(comp.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={showEntries} onOpenChange={setShowEntries}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Competition Entries</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Proof</TableHead>
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
                      {entry.proof_of_payment_url ? (
                        <a
                          href={entry.proof_of_payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Proof
                        </a>
                      ) : (
                        <span className="text-gray-400">No proof</span>
                      )}
                    </TableCell>
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleEntryStatus(entry.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleEntryStatus(entry.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(entries || []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      No entries found for this competition.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CompetitionsTab;
