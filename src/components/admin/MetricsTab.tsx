import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Metric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string | null;
  year: number;
  updated_at: string | null;
}

const MetricsTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    metric_name: "",
    metric_value: "",
    metric_type: "",
    year: new Date().getFullYear().toString(),
  });
  const { toast } = useToast();
  const metrics = useQuery(api.admin.listImpactMetrics) as Metric[] | undefined;
  const createMetric = useMutation(api.admin.createImpactMetric);
  const deleteMetricMutation = useMutation(api.admin.deleteImpactMetric);

  const resetForm = () => {
    setFormData({
      metric_name: "",
      metric_value: "",
      metric_type: "",
      year: new Date().getFullYear().toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMetric({
        metric_name: formData.metric_name,
        metric_value: parseInt(formData.metric_value, 10),
        metric_type: formData.metric_type,
        year: parseInt(formData.year, 10),
      });

      toast({
        title: "Success",
        description: "Metric created successfully",
      });
      setShowForm(false);
      resetForm();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create metric",
        variant: "destructive",
      });
    }
  };

  const deleteMetric = async (id: string) => {
    try {
      await deleteMetricMutation({ id: id as never });
      toast({
        title: "Success",
        description: "Metric deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete metric",
        variant: "destructive",
      });
    }
  };

  if (metrics === undefined) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8 text-center text-gray-500">Loading metrics...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-navy-primary flex justify-between items-center">
          <span>Impact Metrics Management</span>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-gold-600 hover:bg-gold-400 text-navy-primary">
                Add Metric
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Metric</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Metric Name</Label>
                  <Input
                    value={formData.metric_name}
                    onChange={(e) => setFormData({ ...formData, metric_name: e.target.value })}
                    placeholder="e.g., Children Helped"
                    required
                  />
                </div>
                <div>
                  <Label>Metric Value</Label>
                  <Input
                    type="number"
                    value={formData.metric_value}
                    onChange={(e) => setFormData({ ...formData, metric_value: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Metric Type</Label>
                  <Select
                    value={formData.metric_type}
                    onValueChange={(value) => setFormData({ ...formData, metric_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="children_helped">Children Helped</SelectItem>
                      <SelectItem value="programs_run">Programs Run</SelectItem>
                      <SelectItem value="funds_raised">Funds Raised</SelectItem>
                      <SelectItem value="volunteers">Volunteers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-gold-600 hover:bg-gold-400 text-navy-primary">
                  Add Metric
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
                <TableHead>Metric Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell>{metric.metric_name}</TableCell>
                  <TableCell className="text-gold-600 font-semibold">
                    {metric.metric_value.toLocaleString()}
                  </TableCell>
                  <TableCell>{metric.metric_type}</TableCell>
                  <TableCell>{metric.year}</TableCell>
                  <TableCell>
                    {metric.updated_at ? new Date(metric.updated_at).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMetric(metric.id)}
                    >
                      Delete
                    </Button>
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

export default MetricsTab;
