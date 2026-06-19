import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import ApplicationsTab from "@/components/admin/ApplicationsTab";
import DonorsTab from "@/components/admin/DonorsTab";
import CompetitionsTab from "@/components/admin/CompetitionsTab";
import CompetitionEntriesTab from "@/components/admin/CompetitionEntriesTab";
import MetricsTab from "@/components/admin/MetricsTab";
import ContactSubmissionsTab from "@/components/admin/ContactSubmissionsTab";
import TeamsTab from "@/components/admin/TeamsTab";
import ImpactStoriesTab from "@/components/admin/ImpactStoriesTab";
import ResourcesTab from "@/components/admin/ResourcesTab";
import UsersTab from "@/components/admin/UsersTab";
import { api } from "../../convex/_generated/api";

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const adminApi = api as any;
  const ensureViewerRecord = useMutation(adminApi.admin.ensureViewerRecord);
  const adminSession = useQuery(adminApi.admin.getAdminSession) as
    | {
        email: string;
        isAdmin: boolean;
        isBootstrapAdmin: boolean;
        authUserId: string;
        reviewedByUserId: string;
        status: string | null;
        role: string | null;
      }
    | null
    | undefined;

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      void ensureViewerRecord({}).catch((error: Error) => {
        toast({
          title: "Session sync failed",
          description: error.message,
          variant: "destructive",
        });
      });
    }
  }, [authLoading, ensureViewerRecord, isAuthenticated, toast]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (adminSession === undefined) {
      return;
    }

    if (!adminSession || !adminSession.isAdmin) {
      toast({
        title: "Access denied",
        description: "You do not have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setAdminUserId(adminSession.reviewedByUserId);
  }, [adminSession, authLoading, isAuthenticated, navigate, toast]);

  const handleLogout = async () => {
    await signOut();
    setAdminUserId(null);
    setIsAdmin(false);
    navigate("/");
  };

  if (authLoading || (isAuthenticated && adminSession === undefined)) {
    return (
      <div className="min-h-screen bg-navy-primary flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-navy-primary text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-navy-primary"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Tabs defaultValue="applications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-10 bg-white h-auto">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="entries">Entries</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="metrics">Impact Metrics</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <ApplicationsTab reviewedByUserId={adminUserId} />
          </TabsContent>

          <TabsContent value="donors">
            <DonorsTab />
          </TabsContent>

          <TabsContent value="competitions">
            <CompetitionsTab />
          </TabsContent>

          <TabsContent value="entries">
            <CompetitionEntriesTab />
          </TabsContent>

          <TabsContent value="contact">
            <ContactSubmissionsTab />
          </TabsContent>

          <TabsContent value="metrics">
            <MetricsTab />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsTab />
          </TabsContent>

          <TabsContent value="stories">
            <ImpactStoriesTab />
          </TabsContent>

          <TabsContent value="resources">
            <ResourcesTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
