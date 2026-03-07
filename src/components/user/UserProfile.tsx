 import { useState } from "react";
 import { useAuth } from "react-oidc-context";
 import { Card } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { AWS_CONFIG } from "@/config/constants";
 import { User, Mail, Shield, Calendar, Key, LogOut, ExternalLink } from "lucide-react";
 
 export const UserProfile = () => {
   const auth = useAuth();
   const profile = auth.user?.profile;
 
   const handleForgotPassword = () => {
     const cognitoDomain = AWS_CONFIG.COGNITO.DOMAIN;
     const clientId = AWS_CONFIG.COGNITO.CLIENT_ID;
     const redirectUri = window.location.origin + "/callback";
     
     // Redirect to Cognito's forgot password page
     window.location.href = `${cognitoDomain}/forgotPassword?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
   };
 
   const handleChangePassword = () => {
     const cognitoDomain = AWS_CONFIG.COGNITO.DOMAIN;
     const clientId = AWS_CONFIG.COGNITO.CLIENT_ID;
     const redirectUri = window.location.origin + "/callback";
     
     // Redirect to Cognito's change password page (via account settings)
     window.location.href = `${cognitoDomain}/account?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
   };
 
  const handleLogout = () => {
    const logoutUri = window.location.origin + "/";
    const cognitoDomain = AWS_CONFIG.COGNITO.DOMAIN;
    const logoutUrl = `${cognitoDomain}/logout?client_id=${AWS_CONFIG.COGNITO.CLIENT_ID}&logout_uri=${encodeURIComponent(logoutUri)}`;
    auth.removeUser();
    window.location.replace(logoutUrl);
  };
 
   const profileItems = [
     { 
       icon: User, 
       label: "Name", 
       value: profile?.name || profile?.given_name || profile?.preferred_username || "Not set" 
     },
     { 
       icon: Mail, 
       label: "Email", 
       value: profile?.email || "Not set" 
     },
     { 
       icon: Shield, 
       label: "Role", 
       value: (profile?.["cognito:groups"] as string[] | undefined)?.includes("Admins") ? "Administrator" : "User" 
     },
     { 
       icon: Calendar, 
       label: "Account Created", 
       value: profile?.auth_time ? new Date(profile.auth_time * 1000).toLocaleDateString() : "N/A" 
     },
   ];
 
   return (
     <div className="space-y-6">
       {/* Profile Header */}
       <Card className="p-8 glass-card">
         <div className="flex flex-col md:flex-row items-center gap-6">
           <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
             <User className="w-12 h-12 text-primary-foreground" />
           </div>
           <div className="text-center md:text-left">
             <h2 className="text-2xl font-bold">
               {profile?.name || profile?.given_name || profile?.email?.split('@')[0] || "User"}
             </h2>
             <p className="text-muted-foreground">{profile?.email}</p>
             <div className="mt-2">
               <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                 (profile?.["cognito:groups"] as string[] | undefined)?.includes("Admins")
                   ? "bg-destructive/15 text-destructive"
                   : "bg-primary/15 text-primary"
               }`}>
                 {(profile?.["cognito:groups"] as string[] | undefined)?.includes("Admins") ? "Administrator" : "User"}
               </span>
             </div>
           </div>
         </div>
       </Card>
 
       {/* Profile Details */}
       <Card className="p-6 glass-card">
         <h3 className="text-lg font-semibold mb-4">Account Details</h3>
         <div className="space-y-4">
           {profileItems.map((item, index) => {
             const Icon = item.icon;
             return (
               <div 
                 key={item.label} 
                 className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 animate-fade-in-up"
                 style={{ animationDelay: `${index * 80}ms` }}
               >
                 <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                   <Icon className="w-5 h-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">{item.label}</p>
                   <p className="font-medium">{item.value}</p>
                 </div>
               </div>
             );
           })}
         </div>
       </Card>
 
       {/* Security Actions */}
       <Card className="p-6 glass-card">
         <h3 className="text-lg font-semibold mb-4">Security</h3>
         <div className="space-y-3">
           <Button 
             variant="outline" 
             className="w-full justify-start gap-3 h-12"
             onClick={handleForgotPassword}
           >
             <Key className="w-5 h-5" />
             Forgot Password
             <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
           </Button>
           
           <Button 
             variant="outline" 
             className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
             onClick={handleLogout}
           >
             <LogOut className="w-5 h-5" />
             Sign Out
           </Button>
         </div>
       </Card>
     </div>
   );
 };