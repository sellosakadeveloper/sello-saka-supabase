import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

type ManagedUser = {
  id: string;
  email: string;
  authUserId: string | null;
  status: string;
  role: string;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastSetupEmailSentAt: string | null;
  isBootstrapAdmin: boolean;
};

const UsersTab = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const adminApi = api as any;
  const users = useQuery(adminApi.admin.listManagedUsers) as ManagedUser[] | undefined;
  const inviteManagedUser = useAction(adminApi.admin.inviteManagedUser);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await inviteManagedUser({
        email,
        role,
      });
      toast({
        title: "Invite sent",
        description: "The account setup email has been sent.",
      });
      setEmail("");
      setRole("staff");
    } catch (error: any) {
      toast({
        title: "Invite failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (users === undefined) {
    return (
      <Card className="bg-white">
        <CardContent className="py-8 text-center text-gray-500">Loading users...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-navy-primary">Invite User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="grid gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@sellosaka.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="bg-gold-600 hover:bg-gold-400 text-navy-primary"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send Invite"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-navy-primary">Managed Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Email</TableHead>
                  <TableHead>Activated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{user.email}</span>
                        {user.isBootstrapAdmin && <Badge variant="outline">Bootstrap</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="uppercase">{user.role}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.lastSetupEmailSentAt ? new Date(user.lastSetupEmailSentAt).toLocaleString() : "-"}
                    </TableCell>
                    <TableCell>{user.activatedAt ? new Date(user.activatedAt).toLocaleString() : "-"}</TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-gray-500">
                      No managed users yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersTab;
