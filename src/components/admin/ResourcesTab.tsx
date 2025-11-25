import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Plus, Loader2, FileText, ExternalLink } from "lucide-react";

interface Resource {
    id: string;
    title: string;
    summary: string | null;
    type: "Article" | "Guide" | "Screening Info" | "FAQ";
    category: string | null;
    file_url: string | null;
    created_at: string;
}

const CATEGORIES = [
    "Cervical Cancer Awareness Month",
    "National Cancer Prevention Month",
    "Oesophageal Cancer Awareness Month",
    "Brain Tumour Awareness Month",
    "Colorectal Cancer Awareness Month",
    "Kidney Cancer Awareness Month",
    "Ovarian Cancer Awareness Month",
    "Bowel Cancer Awareness Month",
    "Testicular Cancer Prevention Month",
    "Bladder Cancer Awareness Month",
    "Melanoma and Skin Cancer Awareness Month",
    "Cervical Screening Awareness Week",
    "Myeloma Awareness Week",
    "Sarcoma Awareness Month",
    "Gastrointestinal Stromal Tumor (GIST) Awareness Day",
    "Blood Cancer Awareness Month",
    "Childhood Cancer Awareness Month",
    "Gynaecological Cancer Awareness Month",
    "Thyroid Cancer Awareness Month",
    "Breast Cancer Awareness Month",
    "Liver Cancer Awareness Month",
    "Gastric Cancer Awareness Month",
    "Lung Cancer Awareness Month",
    "Pancreatic Cancer Awareness Month",
    "General / Other"
];

const RESOURCE_TYPES = ["Article", "Guide", "Screening Info", "FAQ"];

const ResourcesTab = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        summary: string;
        type: "Article" | "Guide" | "Screening Info" | "FAQ";
        category: string;
        file_url: string;
    }>({
        title: "",
        summary: "",
        type: "Article",
        category: "",
        file_url: "",
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        const { data, error } = await supabase
            .from("resources")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch resources",
                variant: "destructive",
            });
            return;
        }

        setResources(data as Resource[] || []);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                return;
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('resource-files')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('resource-files')
                .getPublicUrl(filePath);

            setFormData({ ...formData, file_url: data.publicUrl });
            toast({
                title: "Success",
                description: "File uploaded successfully",
            });
        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Error",
                description: "Error uploading file",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const resourceData = {
            title: formData.title,
            summary: formData.summary,
            type: formData.type,
            category: formData.category,
            file_url: formData.file_url,
        };

        if (editingId) {
            const { error } = await supabase
                .from("resources")
                .update(resourceData)
                .eq("id", editingId);

            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to update resource",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Resource updated successfully",
            });
        } else {
            const { error } = await supabase.from("resources").insert(resourceData);

            if (error) {
                toast({
                    title: "Error",
                    description: "Failed to add resource",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Resource added successfully",
            });
        }

        setShowForm(false);
        resetForm();
        fetchResources();
    };

    const handleEdit = (resource: Resource) => {
        setEditingId(resource.id);
        setFormData({
            title: resource.title,
            summary: resource.summary || "",
            type: resource.type,
            category: resource.category || "",
            file_url: resource.file_url || "",
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;

        const { error } = await supabase.from("resources").delete().eq("id", id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete resource",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Success",
            description: "Resource deleted successfully",
        });
        fetchResources();
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: "",
            summary: "",
            type: "Article",
            category: "",
            file_url: "",
        });
    };

    return (
        <Card className="bg-white">
            <CardHeader>
                <CardTitle className="text-navy-primary flex justify-between items-center">
                    <span>Resources Management</span>
                    <Dialog open={showForm} onOpenChange={(open) => {
                        setShowForm(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-gold-600 hover:bg-gold-400 text-navy-primary">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Resource
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingId ? "Edit Resource" : "Add Resource"}</DialogTitle>
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
                                    <Label>Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RESOURCE_TYPES.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Category (Awareness Month)</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Summary</Label>
                                    <Textarea
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        required
                                        className="h-32"
                                    />
                                </div>

                                <div>
                                    <Label>File (PDF/Image)</Label>
                                    <div className="flex gap-4 items-center mt-2">
                                        {formData.file_url && (
                                            <a
                                                href={formData.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-blue-600 hover:underline"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View Current File
                                            </a>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={handleFileUpload}
                                                    disabled={uploading}
                                                    className="cursor-pointer"
                                                />
                                                {uploading && <Loader2 className="w-4 h-4 animate-spin text-gold-600" />}
                                            </div>
                                        </div>
                                    </div>
                                    <Input
                                        type="hidden"
                                        value={formData.file_url}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gold-600 hover:bg-gold-400 text-navy-primary"
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading File..." : (editingId ? "Update Resource" : "Add Resource")}
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
                                <TableHead>Type</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>File</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resources.map((resource) => (
                                <TableRow key={resource.id}>
                                    <TableCell className="font-medium">{resource.title}</TableCell>
                                    <TableCell>{resource.type}</TableCell>
                                    <TableCell>{resource.category}</TableCell>
                                    <TableCell>
                                        {resource.file_url ? (
                                            <a
                                                href={resource.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(resource)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(resource.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {resources.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        No resources found. Add one to get started.
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

export default ResourcesTab;
