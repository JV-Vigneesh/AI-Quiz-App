import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Add transition class to html element for smooth color transition
    document.documentElement.classList.add('transitioning');
    
    // Toggle theme
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('transitioning');
      setIsAnimating(false);
    }, 400);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-10 h-10 relative overflow-hidden border-border/50 bg-secondary/50"
        disabled
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      disabled={isAnimating}
      className="rounded-full w-10 h-10 relative overflow-hidden border-border/50 bg-secondary/50 hover:bg-secondary hover:border-primary/30 transition-all duration-300 hover:shadow-[var(--shadow-glow)] group"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Sun icon */}
      <Sun 
        className={`h-5 w-5 text-amber-500 absolute transition-all duration-300 ${
          isDark 
            ? 'opacity-0 rotate-90 scale-0' 
            : 'opacity-100 rotate-0 scale-100 theme-toggle-sun'
        }`}
      />
      
      {/* Moon icon */}
      <Moon 
        className={`h-5 w-5 text-primary absolute transition-all duration-300 ${
          isDark 
            ? 'opacity-100 rotate-0 scale-100 theme-toggle-moon' 
            : 'opacity-0 -rotate-90 scale-0'
        }`}
      />
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};