import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AWS_CONFIG } from "@/config/constants";
import { LogIn, Shield, User, Sparkles, ArrowRight } from "lucide-react";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      const groups = (auth.user?.profile["cognito:groups"] as string[]) || [];
      const isAdmin = groups.includes("Admins");
      navigate(isAdmin ? "/admin" : "/user");
    }
  }, [auth.isAuthenticated, auth.user, navigate]);

  const signOutRedirect = () => {
    const logoutUri = window.location.origin;
    const logoutUrl = `${AWS_CONFIG.COGNITO.DOMAIN}/logout?client_id=${AWS_CONFIG.COGNITO.CLIENT_ID}&logout_uri=${encodeURIComponent(logoutUri)}`;
    auth.removeUser();
    window.location.replace(logoutUrl);
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="gradient-mesh" />
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Authenticating...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="gradient-mesh" />
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md glass-card text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Authentication Error</h2>
            <p className="text-muted-foreground mb-6">{auth.error.message}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (auth.isAuthenticated) {
    const userGroups = (auth.user?.profile["cognito:groups"] as string[]) || [];
    const isAdmin = userGroups.includes("admin") || userGroups.includes("Admins");
    const isUser = userGroups.includes("users");

    return (
      <div className="min-h-screen flex flex-col">
        <div className="gradient-mesh" />
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="p-8 md:p-10 max-w-lg w-full glass-card animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center shadow-lg shadow-primary/25">
                {isAdmin ? (
                  <Shield className="w-10 h-10 text-primary-foreground" />
                ) : (
                  <User className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-muted-foreground">You're successfully authenticated</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Name</p>
                <p className="font-semibold">{auth.user?.profile.name || auth.user?.profile.email}</p>
              </div>

              <div className="p-4 bg-secondary/50 rounded-xl">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Role</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 text-primary rounded-full text-sm font-medium">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  )}
                  {isUser && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/15 text-accent rounded-full text-sm font-medium">
                      <User className="w-3.5 h-3.5" />
                      User
                    </span>
                  )}
                  {!isAdmin && !isUser && (
                    <span className="text-muted-foreground text-sm">No groups assigned</span>
                  )}
                </div>
              </div>

              {auth.user?.id_token && (
                <details className="p-4 bg-secondary/50 rounded-xl group">
                  <summary className="text-xs text-muted-foreground cursor-pointer uppercase tracking-wide">
                    ID Token (Click to expand)
                  </summary>
                  <pre className="mt-3 text-xs overflow-auto max-h-32 text-foreground/80 bg-background/50 p-3 rounded-lg">
                    {auth.user.id_token}
                  </pre>
                </details>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
              >
                Go Home
              </Button>
              <Button
                onClick={signOutRedirect}
                variant="outline"
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="gradient-mesh" />
      <div className="noise-overlay" />
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="p-8 md:p-12 max-w-md w-full glass-card text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Welcome to QuizMaster</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your personalized quiz experience
          </p>

          <Button
            onClick={() => auth.signinRedirect()}
            size="lg"
            className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 group hover-pop"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In with Cognito
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="mt-6 text-xs text-muted-foreground">
            Secure authentication powered by AWS Cognito
          </p>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
