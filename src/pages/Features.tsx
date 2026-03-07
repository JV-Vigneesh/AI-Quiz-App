import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { 
  Brain, 
  Clock, 
  Trophy, 
  Shield, 
  BarChart3, 
  Users,
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "Smart Quiz Generation",
      description: "Gemini AI-powered question generator for admins. Create diverse quiz questions with automatic answer options in seconds.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Clock,
      title: "Real-time Feedback",
      description: "Color-coded answer review after each quiz: green for correct, red for wrong, amber for your selection.",
      gradient: "from-accent to-primary",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock badges as you progress: First Steps, Quiz Master, Perfectionist, High Achiever, and more.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "AWS Cognito authentication with secure token-based API access for both admins and users.",
      gradient: "from-accent to-primary",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Personal and admin analytics with score progression, topic performance, and quiz statistics.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Dedicated dashboards for admins (manage quizzes, questions, users) and users (take quizzes, view scores).",
      gradient: "from-accent to-primary",
    },
  ];

  const benefits = [
    "Unlimited quiz attempts",
    "Progress tracking & analytics",
    "Achievement badges & rewards",
    "Instant score calculation",
    "Color-coded answer review",
    "User profile management",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="gradient-mesh" />
      <div className="noise-overlay" />
      
      <Header />
      
      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="container px-4 py-20">
          <ScrollReveal className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Powerful Features</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Everything You Need for
              <span className="block gradient-text">Better Learning</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover all the tools and features designed to make your quiz experience engaging, efficient, and effective.
            </p>
          </ScrollReveal>
        </section>

        {/* Features Grid */}
        <section className="container px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <Card className="p-6 glass-card hover-lift group cursor-pointer h-full">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container px-4 py-20">
          <ScrollReveal className="max-w-4xl mx-auto">
            <Card className="p-10 md:p-12 glass-card">
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">
                    Why Choose <span className="gradient-text">QuizMaster</span>?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Our platform provides everything you need to excel in your learning journey with a seamless, intuitive experience.
                  </p>
                  <Link to="/login">
                    <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg group hover-pop">
                      Start Learning Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {benefits.map((benefit, index) => (
                    <ScrollReveal key={index} delay={index * 80}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-medium">{benefit}</span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="container px-4 py-12 pb-20">
          <ScrollReveal className="text-center max-w-2xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Learning?</h2>
              <p className="text-muted-foreground mb-6">
                Sign in to access all features and begin your journey to mastery.
              </p>
              <Link to="/login">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg hover-pop"
                >
                  Get Started Free
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

export default Features;
