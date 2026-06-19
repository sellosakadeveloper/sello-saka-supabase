import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Donation {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  amount: number;
  donation_type: string;
  payment_method: string | null;
  status: string;
  created_at: string | null;
}

const DonorsTab = () => {
  const donations = useQuery(api.admin.listDonations) as Donation[] | undefined;

  if (donations === undefined) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8 text-center text-gray-500">Loading donations...</CardContent>
      </Card>
    );
  }

  const totalAmount = donations.reduce((sum, donation) => sum + Number(donation.amount || 0), 0);

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-navy-primary flex justify-between items-center">
          <span>Donation Management</span>
          <div className="text-gold-600 text-2xl">
            Total Raised: R{totalAmount.toLocaleString()}
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
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>{donation.name}</TableCell>
                  <TableCell>{donation.email}</TableCell>
                  <TableCell className="text-gold-600 font-semibold">
                    R{Number(donation.amount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-navy-600">
                      {donation.donation_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{donation.payment_method || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        donation.status === "completed"
                          ? "bg-green-500"
                          : donation.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    >
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {donations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                    No donations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorsTab;
