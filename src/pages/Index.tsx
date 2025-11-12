import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Sparkles, GraduationCap } from "lucide-react";

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="mb-6 text-5xl md:text-7xl font-bold tracking-tight">
              Learn. Connect.{" "}
              <span className="bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                Grow.
              </span>
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Your trusted academic ecosystem for notes, mentorship, and AI-powered study tools
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-border">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-16">
              Everything You Need to Excel
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedSection delay={0.1}>
              <div className="p-6 rounded-lg bg-card border border-border hover:border-accent transition-colors">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Notes Marketplace</h3>
                <p className="text-muted-foreground">
                  Access verified notes from top students. Preview before you buy.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="p-6 rounded-lg bg-card border border-border hover:border-accent transition-colors">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Verified Mentors</h3>
                <p className="text-muted-foreground">
                  Connect with grade-verified seniors who've aced their exams.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="p-6 rounded-lg bg-card border border-border hover:border-accent transition-colors">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Study Tools</h3>
                <p className="text-muted-foreground">
                  Generate flashcards, quizzes, and chat with your PDFs using AI.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <div className="p-6 rounded-lg bg-card border border-border hover:border-accent transition-colors">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your academic journey with personalized dashboards.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <AnimatedSection>
            <div className="text-center p-12 rounded-2xl bg-gradient-to-br from-accent/10 to-secondary/10 border-2 border-accent/20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of students already excelling with MentorLink
              </p>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg">
                Start Your Journey
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Index;
