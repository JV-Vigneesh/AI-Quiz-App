import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { 
  Brain, 
  Clock, 
  Award, 
  TrendingUp, 
  ArrowRight, 
  Zap,
  Shield,
  BarChart3
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: "Smart Questions",
      description: "AI-powered question generation with manually curated question banks for optimal learning.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Clock,
      title: "Flexible Timing",
      description: "Timed quizzes with customizable duration and auto-submit functionality.",
      gradient: "from-accent to-primary",
    },
    {
      icon: Award,
      title: "Instant Results",
      description: "Get immediate color-coded feedback showing correct and incorrect answers.",
      gradient: "from-primary to-accent",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Personal analytics dashboard with achievements and score tracking.",
      gradient: "from-accent to-primary",
    },
  ];

  const stats = [
    { value: "10K+", label: "Questions" },
    { value: "500+", label: "Quizzes" },
    { value: "50K+", label: "Users" },
    { value: "99%", label: "Satisfaction" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="gradient-mesh" />
      <div className="noise-overlay" />
      
      <Header />
      
      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="container px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Now with AI-powered insights</span>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={100}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Master Any Topic with
                <span className="block gradient-text">Interactive Quizzes</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Challenge yourself, track your progress, and become an expert. 
                The smartest way to learn and retain knowledge.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button 
                    size="lg" 
                    className="h-12 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/25 group hover-pop"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-12 px-8 border-border/60 hover:bg-secondary/80 hover-pop"
                  >
                    Explore Features
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container px-4 py-12">
          <ScrollReveal className="max-w-4xl mx-auto">
            <Card className="p-8 glass-card border-primary/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </section>

        {/* Features Section */}
        <section className="container px-4 py-20">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Excel</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed with powerful features to make your learning experience engaging and effective.
            </p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <Card className="p-6 glass-card hover-lift group cursor-pointer h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container px-4 py-20">
          <ScrollReveal className="max-w-4xl mx-auto">
            <Card className="p-10 md:p-14 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20 text-center">
              <div className="flex justify-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Start Learning?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of learners who are already improving their skills with our interactive quizzes.
              </p>
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="h-12 px-10 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg hover-pop"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>
          </ScrollReveal>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
