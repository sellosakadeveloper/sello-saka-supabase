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
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ImpactStory {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  image_storage_id?: string | null;
  category: string | null;
  quote: string | null;
  quote_author: string | null;
  impact_summary: string | null;
  is_active: boolean;
  created_at: string | null;
}

const ImpactStoriesTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    image_storage_id: "",
    category: "",
    quote: "",
    quote_author: "",
    impact_summary: "",
    is_active: true,
  });
  const { toast } = useToast();
  const stories = useQuery(api.admin.listImpactStories) as ImpactStory[] | undefined;
  const createStory = useMutation(api.admin.createImpactStory);
  const updateStory = useMutation(api.admin.updateImpactStory);
  const deleteStory = useMutation(api.admin.deleteImpactStory);
  const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
  const getStorageUrl = useMutation(api.uploads.getStorageUrl);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      content: "",
      image_url: "",
      image_storage_id: "",
      category: "",
      quote: "",
      quote_author: "",
      impact_summary: "",
      is_active: true,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const uploaded = await uploadFileToConvex({
        file,
        generateUploadUrl,
        getStorageUrl,
      });
      setFormData((current) => ({
        ...current,
        image_url: uploaded.url,
        image_storage_id: uploaded.storageId,
      }));
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Error uploading image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const storyData = {
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url || undefined,
        image_storage_id: formData.image_storage_id || undefined,
        category: formData.category || undefined,
        quote: formData.quote || undefined,
        quote_author: formData.quote_author || undefined,
        impact_summary: formData.impact_summary || undefined,
        is_active: formData.is_active,
      };

      if (editingId) {
        await updateStory({
          id: editingId as never,
          ...storyData,
        });
        toast({
          title: "Success",
          description: "Story updated successfully",
        });
      } else {
        await createStory(storyData);
        toast({
          title: "Success",
          description: "Story added successfully",
        });
      }

      setShowForm(false);
      resetForm();
    } catch {
      toast({
        title: "Error",
        description: `Failed to ${editingId ? "update" : "add"} story`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (story: ImpactStory) => {
    setEditingId(story.id);
    setFormData({
      title: story.title,
      content: story.content,
      image_url: story.image_url || "",
      image_storage_id: story.image_storage_id || "",
      category: story.category || "",
      quote: story.quote || "",
      quote_author: story.quote_author || "",
      impact_summary: story.impact_summary || "",
      is_active: story.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;

    try {
      await deleteStory({ id: id as never });
      toast({
        title: "Success",
        description: "Story deleted successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete story",
        variant: "destructive",
      });
    }
  };

  if (stories === undefined) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8 text-center text-gray-500">Loading stories...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-navy-primary flex justify-between items-center">
          <span>Impact Stories Management</span>
          <Dialog
            open={showForm}
            onOpenChange={(open) => {
              setShowForm(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-gold-600 hover:bg-gold-400 text-navy-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Story" : "Add Story"}</DialogTitle>
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
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Educational Success"
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    className="h-32"
                  />
                </div>

                <div>
                  <Label>Quote</Label>
                  <Textarea
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="h-20"
                  />
                </div>

                <div>
                  <Label>Quote Author</Label>
                  <Input
                    value={formData.quote_author}
                    onChange={(e) => setFormData({ ...formData, quote_author: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Impact Summary</Label>
                  <Textarea
                    value={formData.impact_summary}
                    onChange={(e) => setFormData({ ...formData, impact_summary: e.target.value })}
                    className="h-20"
                  />
                </div>

                <div>
                  <Label>Image</Label>
                  <div className="flex gap-4 items-center mt-2">
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-16 h-16 rounded object-cover border border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          className="cursor-pointer"
                        />
                        {uploading && <Loader2 className="w-4 h-4 animate-spin text-gold-600" />}
                      </div>
                    </div>
                  </div>
                <Input type="hidden" value={formData.image_url} required />
                <Input type="hidden" value={formData.image_storage_id} />
              </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active</Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gold-600 hover:bg-gold-400 text-navy-primary"
                  disabled={uploading}
                >
                  {uploading ? "Uploading Image..." : editingId ? "Update Story" : "Add Story"}
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
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                    {story.image_url && (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{story.category}</TableCell>
                  <TableCell>
                    <Badge className={story.is_active ? "bg-green-500" : "bg-gray-500"}>
                      {story.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(story)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(story.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {stories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No stories found. Add one to get started.
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

export default ImpactStoriesTab;
