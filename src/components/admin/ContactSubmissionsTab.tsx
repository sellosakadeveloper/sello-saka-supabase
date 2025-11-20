import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Mail } from "lucide-react";

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

const ContactSubmissionsTab = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch contact messages",
                variant: "destructive",
            });
            return;
        }

        setMessages(data || []);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from("contact_messages")
            .delete()
            .eq("id", id);

        if (error) {
            toast({
                title: "Error",
                description: "Failed to delete message",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Success",
            description: "Message deleted",
        });
        fetchMessages();
    };

    return (
        <Card className="bg-white">
            <CardHeader>
                <CardTitle className="text-navy-primary flex items-center gap-2">
                    <Mail className="h-6 w-6" />
                    Contact Submissions
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.map((msg) => (
                            <TableRow key={msg.id}>
                                <TableCell className="font-medium">{msg.name}</TableCell>
                                <TableCell>{msg.email}</TableCell>
                                <TableCell>{msg.subject}</TableCell>
                                <TableCell className="max-w-xs truncate" title={msg.message}>
                                    {msg.message}
                                </TableCell>
                                <TableCell>
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleDelete(msg.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {messages.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    No contact messages found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default ContactSubmissionsTab;
