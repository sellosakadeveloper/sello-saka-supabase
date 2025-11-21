import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  donation_type: string;
  payment_method: string;
  status: string;
  created_at: string;
}

const DonorsTab = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch donations",
        variant: "destructive",
      });
      return;
    }

    setDonations(data || []);
    const total = data?.reduce((sum, donation) => sum + parseFloat(donation.amount.toString()), 0) || 0;
    setTotalAmount(total);
  };

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
                    R{parseFloat(donation.amount.toString()).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-navy-600">
                      {donation.donation_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{donation.payment_method}</TableCell>
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
                    {new Date(donation.created_at).toLocaleDateString()}
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
