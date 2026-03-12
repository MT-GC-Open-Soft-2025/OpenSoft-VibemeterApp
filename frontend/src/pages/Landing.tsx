import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, BarChart3, Brain, ChevronRight, Send, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

const features = [
  {
    icon: MessageCircle,
    title: "Meet Vibey",
    description: "Chat with our AI wellness counselors who understand you. Get personalized support anytime, anywhere.",
    color: "text-primary",
    bg: "bg-accent",
  },
  {
    icon: Brain,
    title: "Mental Fitness",
    description: "Track your emotional wellness journey with science-backed assessments and actionable insights.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: BarChart3,
    title: "Wellness Dashboard",
    description: "Visualize your progress, earn rewards, and celebrate your wellness milestones.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
];

const faqs = [
  { q: "What is WellBee?", a: "WellBee is an enterprise employee wellbeing platform that provides AI-powered mental wellness support, personalized counseling, and comprehensive wellness tracking for organizations." },
  { q: "How does the AI counseling work?", a: "Our AI counselors (Vibey, Sage, and Nova) use advanced language models to provide empathetic, supportive conversations. They're available 24/7 and are trained in evidence-based wellness techniques." },
  { q: "Is my data private?", a: "Absolutely. All conversations are encrypted end-to-end. Your personal data is never shared with your employer. Only anonymized, aggregate insights are available to administrators." },
  { q: "How is the Vibe Score calculated?", a: "Your Vibe Score (0-5) is calculated based on your chat interactions, survey responses, and engagement patterns. It gives you a holistic view of your emotional wellness over time." },
  { q: "Can I earn rewards?", a: "Yes! You earn points for regular check-ins, completing surveys, and maintaining chat streaks. Progress through Bronze, Silver, Gold, and Platinum tiers to unlock exclusive badges." },
  { q: "How do organizations get started?", a: "Simply book a demo through our form below, and our team will walk you through setup, customization, and onboarding for your organization." },
];

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: "", email: "", company: "", message: "" });

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Demo request submitted! We'll be in touch soon.");
    setDemoForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-heading font-bold text-primary">WellBee</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              <a href="#demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Book a Demo</a>
              <Link to="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border">
              <a href="#features" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#faq" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <a href="#demo" className="block text-sm font-medium text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Book a Demo</a>
              <Link to="/login"><Button size="sm" className="w-full">Sign In</Button></Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                🌟 Enterprise Wellbeing Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
                Welcome to{" "}
                <span className="text-primary">WellBee</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Empower your workforce with AI-driven wellness support. Personalized counseling, real-time mood tracking, and actionable insights — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="text-base px-8">
                    Get Started <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#demo">
                  <Button variant="outline" size="lg" className="text-base px-8">Book a Demo</Button>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Why WellBee?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete ecosystem designed to nurture your team's mental wellness.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${f.bg} mb-5`}>
                      <f.icon className={`h-7 w-7 ${f.color}`} />
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-3">{f.title}</h3>
                    <p className="text-muted-foreground">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Book a Demo */}
      <section id="demo" className="py-20 bg-card">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold mb-4">Book a Demo</h2>
            <p className="text-muted-foreground">See how WellBee can transform your organization's wellness culture.</p>
          </div>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleDemoSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Name</label>
                    <Input value={demoForm.name} onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })} required placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <Input type="email" value={demoForm.email} onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })} required placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Company</label>
                  <Input value={demoForm.company} onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })} required placeholder="Your organization" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Message</label>
                  <Textarea value={demoForm.message} onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })} placeholder="Tell us about your needs..." rows={4} />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Send className="mr-2 h-4 w-4" /> Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2026 WellBee. All rights reserved. | Empowering employee wellness through AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
