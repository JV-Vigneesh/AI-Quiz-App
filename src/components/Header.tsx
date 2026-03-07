import { Link, useLocation } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { LogOut, User, Menu, X, Sparkles } from "lucide-react";
import { AWS_CONFIG } from "@/config/constants";
import { useState } from "react";

export const Header = () => {
  const location = useLocation();
  const auth = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/features", label: "Features" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-shadow duration-300">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Quiz<span className="gradient-text">Master</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant="ghost"
                size="sm"
                className={`font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {auth.isAuthenticated ? (
            <>
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-secondary/80 rounded-full">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {auth.user?.profile.name || auth.user?.profile.email}
                </span>
              </div>
              <Link to={(auth.user?.profile["cognito:groups"] as string[] | undefined)?.includes("Admins") ? "/admin" : "/user"}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const logoutUri = window.location.origin + "/";
                  const cognitoDomain = AWS_CONFIG.COGNITO.DOMAIN;
                  const logoutUrl = `${cognitoDomain}/logout?client_id=${AWS_CONFIG.COGNITO.CLIENT_ID}&logout_uri=${encodeURIComponent(logoutUri)}`;
                  auth.removeUser();
                  window.location.replace(logoutUrl);
                }}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
          
          <ThemeToggle />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
          <nav className="container px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start font-medium ${
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
