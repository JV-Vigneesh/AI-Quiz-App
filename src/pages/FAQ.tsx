import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/hooks/useScrollAnimation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "How does the quiz system work?",
      answer: "Our quiz system loads questions from a secure database, tracks your progress in real-time, and provides instant feedback upon submission. You can take quizzes at your own pace with optional time limits.",
    },
    {
      question: "Can I retake a quiz?",
      answer: "Yes! After completing a quiz and viewing your results, you can retake it anytime. Your previous scores are saved so you can track your improvement over time.",
    },
    {
      question: "What happens to my quiz data?",
      answer: "All your quiz data is stored securely and encrypted. We use industry-standard security practices to protect your information. Your data is never shared with third parties.",
    },
    {
      question: "How is my score calculated?",
      answer: "Your score is calculated based on the number of correct answers divided by the total number of questions, shown as both a numerical score and a percentage.",
    },
    {
      question: "Can I see the correct answers after submitting?",
      answer: "Yes! After submitting your quiz, you'll see a detailed review showing all questions with correct answers highlighted in green and your incorrect answers in red.",
    },
    {
      question: "Is there a time limit for quizzes?",
      answer: "Time limits vary by quiz. Some quizzes have a countdown timer while others allow unlimited time. The time limit is always displayed before you start.",
    },
    {
      question: "Do I need to answer all questions before submitting?",
      answer: "Yes, you must answer all questions before the submit button becomes active. This ensures you've reviewed the entire quiz for the most accurate score.",
    },
    {
      question: "Can I change my answers before submitting?",
      answer: "Absolutely! You can change your answers as many times as you want before clicking the submit button. Your final selection is what gets graded.",
    },
    {
      question: "How do I sign up or log in?",
      answer: "Click the 'Sign In' button in the header to access our secure authentication system. You can create a new account or log in with existing credentials via AWS Cognito.",
    },
    {
      question: "What roles are available?",
      answer: "We have two main roles: Admin (can create quizzes and manage questions) and User (can take quizzes and view scores). Your role is assigned during account setup.",
    },
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
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about QuizMaster. Can't find what you're looking for? Contact us!
            </p>
          </ScrollReveal>
        </section>

        {/* FAQ Accordion */}
        <section className="container px-4 py-8">
          <ScrollReveal className="max-w-3xl mx-auto">
            <Card className="p-8 glass-card">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`} 
                    className="border border-border/50 rounded-lg px-4 data-[state=open]:bg-secondary/30 transition-colors"
                  >
                    <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors py-4 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </ScrollReveal>
        </section>

        {/* CTA */}
        <section className="container px-4 py-16 pb-20">
          <ScrollReveal className="max-w-2xl mx-auto">
            <Card className="p-8 text-center bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our support team is here to help you with any questions or concerns.
              </p>
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg hover-pop">
                  Contact Support
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

export default FAQ;
