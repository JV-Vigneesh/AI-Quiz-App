import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "user";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const auth = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!auth.isLoading) {
      setAuthReady(true);
    }
  }, [auth.isLoading]);

  if (auth.isLoading || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const groups = (auth.user?.profile["cognito:groups"] as string[]) || [];
    const isAdmin = groups.includes("Admins");

    if (requiredRole === "admin" && !isAdmin) {
      return <Navigate to="/user" replace />;
    }

    if (requiredRole === "user" && isAdmin) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};
