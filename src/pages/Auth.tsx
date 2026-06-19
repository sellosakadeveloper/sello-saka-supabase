import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAction, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api } from "../../convex/_generated/api";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requestLinkMode, setRequestLinkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [awaitingAuth, setAwaitingAuth] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const { signIn } = useAuthActions();
  const adminApi = api as any;
  const bootstrapStatus = useQuery(adminApi.admin.getBootstrapStatus) as
    | { requiresBootstrap: boolean; bootstrapEmail: string }
    | undefined;
  const bootstrapAdminAccount = useAction(adminApi.admin.bootstrapAdminAccount);
  const requestPasswordSetup = useAction(adminApi.admin.requestPasswordSetup);
  const completeUserSetup = useAction(adminApi.admin.completeUserSetup);
  const setupToken = searchParams.get("token");
  const setupEmail = searchParams.get("email");
  const isSetupFlow = Boolean(setupToken);

  useEffect(() => {
    if (setupEmail) {
      setEmail(setupEmail);
    }
  }, [setupEmail]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      setAwaitingAuth(false);
      navigate("/admin");
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!awaitingAuth) {
      return;
    }

    if (authLoading || isAuthenticated) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setAwaitingAuth(false);
      setLoading(false);
      toast({
        title: "Sign-in incomplete",
        description: "Your session did not finish loading. Try signing in again.",
        variant: "destructive",
      });
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [authLoading, awaitingAuth, isAuthenticated, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (bootstrapStatus?.requiresBootstrap && normalizedEmail === bootstrapStatus.bootstrapEmail) {
        await bootstrapAdminAccount({
          email: normalizedEmail,
          password,
        });
      }

      await signIn("password", {
        email: normalizedEmail,
        password,
        flow: "signIn",
      });

      setAwaitingAuth(true);
      toast({
        title: "Welcome back",
        description: "You have successfully signed in. Finishing your session...",
      });
    } catch (error: any) {
      setAwaitingAuth(false);
      toast({
        title: "Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordSetup({ email: email.trim().toLowerCase() });
      toast({
        title: "Setup link sent",
        description: "If the account exists, an email has been sent with the next step.",
      });
    } catch (error: any) {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const normalizedEmail = email.trim().toLowerCase();
      await completeUserSetup({
        email: normalizedEmail,
        token: setupToken ?? "",
        password,
      });
      await signIn("password", {
        email: normalizedEmail,
        password,
        flow: "signIn",
      });

      setAwaitingAuth(true);
      toast({
        title: "Password set",
        description: "Your account is now active. Finishing your session...",
      });
    } catch (error: any) {
      setAwaitingAuth(false);
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-primary">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader>
            <CardTitle className="text-navy-primary">{isSetupFlow ? "Set Your Password" : "Admin Login"}</CardTitle>
            <CardDescription>
              {isSetupFlow
                ? "Create or reset the password for your invited admin account."
                : requestLinkMode
                  ? "Request an account setup or password reset link by email."
                  : "Sign in to access the admin dashboard."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bootstrapStatus?.requiresBootstrap && !isSetupFlow && (
              <div className="mb-4 rounded-md border border-gold-400 bg-gold-50 px-4 py-3 text-sm text-navy-primary">
                The first sign-in must use the configured bootstrap admin email.
              </div>
            )}
            <form
              onSubmit={isSetupFlow ? handleCompleteSetup : requestLinkMode ? handleRequestLink : handleSignIn}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sellosaka.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || awaitingAuth || (isSetupFlow && Boolean(setupEmail))}
                />
              </div>
              {!requestLinkMode && (
                <div className="space-y-2">
                  <Label htmlFor="password">{isSetupFlow ? "New Password" : "Password"}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading || awaitingAuth}
                  />
                </div>
              )}
              {isSetupFlow && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading || awaitingAuth}
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gold-600 hover:bg-gold-400 text-navy-primary"
                disabled={loading || awaitingAuth}
              >
                {loading || awaitingAuth
                  ? "Working..."
                  : isSetupFlow
                    ? "Save Password"
                    : requestLinkMode
                      ? "Email Me a Setup Link"
                      : "Sign In"}
              </Button>
              {!isSetupFlow && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-navy-600"
                  onClick={() => setRequestLinkMode((current) => !current)}
                  disabled={loading || awaitingAuth}
                >
                  {requestLinkMode ? "Back to sign in" : "Need a setup or reset link?"}
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
