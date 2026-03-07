import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import App from "./App.tsx";
import "./index.css";

// Configure AWS Cognito OIDC settings
const cognitoAuthConfig = {
  authority: "", // Cognito Link
  client_id: "", // Cognito App Client ID
  redirect_uri: window.location.origin + "/callback",
  response_type: "code",
  scope: "email openid profile",
};

createRoot(document.getElementById("root")!).render(
  <AuthProvider {...cognitoAuthConfig}>
    <App />
  </AuthProvider>
);
