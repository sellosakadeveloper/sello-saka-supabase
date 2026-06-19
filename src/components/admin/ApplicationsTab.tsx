import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";

interface Application {
  id: string;
  survivor_name: string | null;
  guardian_name: string | null;
  email: string;
  phone: string;
  date_of_birth: string | null;
  address: string | null;
  diagnosis_details: string | null;
  treatment_details: string | null;
  current_challenges: string | null;
  programs_interested: string[];
  status: string;
  created_at: string | null;
}

interface ApplicationsTabProps {
  reviewedByUserId?: string | null;
}

const ApplicationsTab = ({ reviewedByUserId }: ApplicationsTabProps) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { toast } = useToast();
  const applications = useQuery(api.admin.listApplications) as Application[] | undefined;
  const updateApplicationStatus = useMutation(api.admin.updateApplicationStatus);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateApplicationStatus({
        id: id as never,
        status,
        reviewed_by: reviewedByUserId || undefined,
      });

      toast({
        title: "Success",
        description: "Application status updated",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "in_review":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (applications === undefined) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8 text-center text-gray-500">Loading applications...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-navy-primary">Application Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Survivor</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Programs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.survivor_name}</TableCell>
                  <TableCell>{app.guardian_name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {app.programs_interested?.map((prog, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {prog}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.created_at ? new Date(app.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApp(app)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-[60vh] pr-4">
                            {selectedApp && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-navy-primary">Survivor Info</h4>
                                    <p><span className="text-gray-500">Name:</span> {selectedApp.survivor_name}</p>
                                    <p><span className="text-gray-500">DOB:</span> {selectedApp.date_of_birth}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-navy-primary">Guardian Info</h4>
                                    <p><span className="text-gray-500">Name:</span> {selectedApp.guardian_name}</p>
                                    <p><span className="text-gray-500">Email:</span> {selectedApp.email}</p>
                                    <p><span className="text-gray-500">Phone:</span> {selectedApp.phone}</p>
                                    <p><span className="text-gray-500">Address:</span> {selectedApp.address}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-navy-primary mb-2">Medical History</h4>
                                  <div className="space-y-2">
                                    <div className="bg-gray-50 p-3 rounded">
                                      <p className="font-medium text-sm text-gray-500">Diagnosis Details</p>
                                      <p>{selectedApp.diagnosis_details}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                      <p className="font-medium text-sm text-gray-500">Treatment History</p>
                                      <p>{selectedApp.treatment_details}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                      <p className="font-medium text-sm text-gray-500">Current Challenges</p>
                                      <p>{selectedApp.current_challenges}</p>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-navy-primary mb-2">Programs of Interest</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedApp.programs_interested?.map((prog, i) => (
                                      <Badge key={i} className="bg-gold-600">
                                        {prog}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(app.id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(app.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationsTab;
