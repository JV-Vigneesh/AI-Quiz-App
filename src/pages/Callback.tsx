import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

const Callback = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && auth.user) {
      // Check user groups to determine role
      const groups = (auth.user.profile["cognito:groups"] as string[]) || [];
      
      if (groups.includes("Admins")) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default Callback;
