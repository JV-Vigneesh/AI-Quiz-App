// AWS Configuration - Centralized sensitive information
export const AWS_CONFIG = {
  // API Gateway Base URL
  API_BASE_URL: "", // https://link/prod
  
   // Gemini API Key for AI Question Generation (Add your key here)
   GEMINI_API_KEY: "", // Add your Gemini API key here
 
  // Cognito Configuration
  COGNITO: {
    REGION: "", // AWS Region
    USER_POOL_ID: "", // Cognito User Pool ID
    AUTHORITY: "", // Cognito Link
    CLIENT_ID: "", // Cognito App Client ID
    DOMAIN: "", // Cognito Domain  
    REDIRECT_URI: window.location.origin + "/callback",
    POST_LOGOUT_REDIRECT_URI: window.location.origin + "/",
    SCOPES: "email openid profile",
  }
};
