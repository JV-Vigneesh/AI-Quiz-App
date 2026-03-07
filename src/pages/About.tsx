import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import { Target, Users, Zap, CheckCircle2, Sparkles } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Focused on helping you achieve your learning objectives with measurable results.",
      gradient: "from-primary to-accent",
    },
    {
      icon: Users,
      title: "User-Centric",
      description: "Designed with your learning experience in mind at every step.",
      gradient: "from-accent to-primary",
    },
    {
      icon: Zap,
      title: "Fast & Efficient",
      description: "Quick assessments with instant, actionable feedback to maximize learning.",
      gradient: "from-primary to-accent",
    },
  ];

  const whyChooseUs = [
    "AI-powered question generation using Gemini for admins",
    "Color-coded answer review (green/red/amber feedback)",
    "Achievement system with unlockable badges",
    "Personal analytics dashboard with score tracking",
    "AWS Cognito authentication for secure access",
    "Role-based dashboards for admins and users",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="gradient-mesh" />
      <div className="noise-overlay" />
      
      <Header />
      
      <main className="flex-1 relative z-10">
        {/* Hero */}
        <section className="container px-4 py-20">
          <ScrollReveal className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Our Story</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              About <span className="gradient-text">QuizMaster</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering learners worldwide through interactive knowledge assessment and intelligent feedback systems.
            </p>
          </ScrollReveal>
        </section>

        {/* Mission */}
        <section className="container px-4 py-8">
          <ScrollReveal className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-10 glass-card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    QuizMaster is dedicated to making learning engaging and accessible for everyone.
                    We believe that regular knowledge testing is key to retaining information
                    and mastering new skills.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Our platform provides a seamless quiz-taking experience with instant feedback,
                    helping you identify strengths and areas for improvement on your journey to expertise.
                  </p>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </section>

        {/* Values */}
        <section className="container px-4 py-16">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Our Core <span className="gradient-text">Values</span></h2>
            <p className="text-muted-foreground">The principles that guide everything we do.</p>
          </ScrollReveal>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <ScrollReveal key={index} delay={index * 100}>
                  <Card className="p-6 glass-card text-center hover-lift h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </Card>
                </ScrollReveal>
              );
            })}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="container px-4 py-16 pb-20">
          <ScrollReveal className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-10 bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Why Choose <span className="gradient-text">QuizMaster</span>?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {whyChooseUs.map((item, index) => (
                  <ScrollReveal key={index} delay={index * 80}>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
