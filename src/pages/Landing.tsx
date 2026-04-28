import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import {
  Shield,
  MapPin,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  Smartphone,
  Globe,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Digital Tourist ID",
      description: "Blockchain-secured digital identity with real-time verification and emergency contact integration."
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "GPS location monitoring with geo-fence alerts and route deviation detection for enhanced safety."
    },
    {
      icon: AlertTriangle,
      title: "Emergency Response",
      description: "One-tap panic button with instant alert dispatch to local authorities and emergency contacts."
    },
    {
      icon: Eye,
      title: "AI Safety Scoring",
      description: "Machine learning algorithms assess risk factors and provide dynamic safety recommendations."
    },
    {
      icon: Users,
      title: "Multi-stakeholder Platform",
      description: "Unified dashboard for tourists, police, and tourism officials with role-based access control."
    },
    {
      icon: Clock,
      title: "Instant E-FIR Generation",
      description: "Automated electronic First Information Reports with evidence collection and case tracking."
    }
  ];

  const stats = [
    { number: "99.9%", label: "System Uptime" },
    { number: "<2min", label: "Average Response Time" },
    { number: "24/7", label: "Monitoring Coverage" },
    { number: "256-bit", label: "Encryption Security" }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-primary">Argus</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} variant="default" className="font-semibold px-6">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")} className="font-medium">
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/auth")} variant="default" className="font-semibold px-6">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              <span className="label-caps !text-[10px]">Blockchain Verified Security</span>
            </div>

            <h1 className="text-6xl md:text-7xl">
              Advanced Tourist Safety<br />
              <span className="text-secondary">Management System</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience the next generation of travel security. Blockchain-secured digital IDs,
              AI-powered risk assessment, and 24/7 real-time emergency response.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="h-14 px-10 text-lg font-bold bg-primary hover:bg-primary/90 glow-primary transition-all duration-300"
              >
                {isAuthenticated ? "Go to Dashboard" : "Protect Your Journey"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="h-14 px-10 text-lg font-bold border-2 hover:bg-muted"
              >
                Explore Safety Network
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="font-display text-4xl font-bold tracking-tight">{stat.number}</div>
                <div className="label-caps text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="label-caps text-secondary">Advanced Infrastructure</div>
            <h2 className="text-4xl md:text-5xl">Comprehensive Safety Suite</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our safety ecosystem leverages cutting-edge technology to provide
              unparalleled security for international travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border border-border bg-card shadow-none hover:border-secondary transition-all group p-8">
                  <div className="w-12 h-12 rounded bg-muted flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 bg-muted/50 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <div className="label-caps text-secondary">Security Protocol</div>
            <h2 className="text-4xl">System Workflow</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                step: "01",
                title: "Register & Verify",
                description: "Onboard your identity through our encrypted verification funnel to receive your unique Digital ID.",
                icon: Smartphone
              },
              {
                step: "02",
                title: "Track & Monitor",
                description: "Passive GPS geofencing and behavioral AI analysis run silently to detect risk in real-time.",
                icon: Globe
              },
              {
                step: "03",
                title: "Respond & Resolve",
                description: "Multi-agency coordination begins instantly upon trigger, ensuring record-shattering response times.",
                icon: CheckCircle
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center space-y-6"
              >
                <div className="relative mx-auto w-24 h-24">
                  <div className="w-full h-full rounded-full border-2 border-border flex items-center justify-center bg-background">
                    <item.icon className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-secondary text-white font-display font-bold flex items-center justify-center text-sm">
                    {item.step}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--secondary)_0%,transparent_50%)] opacity-20" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-6xl text-white">Secure Your Next Journey</h2>
          <p className="text-xl text-primary-foreground/70 max-w-2xl mx-auto">
            Join the global safety network trusted by tourists and officials worldwide.
            Encryption-standard security as your personal companion.
          </p>
          <Button
            size="lg"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
            className="h-16 px-12 text-xl font-bold bg-white text-primary hover:bg-white/90"
          >
            {isAuthenticated ? "Enter Command Center" : "Get Your Secure ID"}
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-background">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg">Argus</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            © 2026 ARGUS INFRASTRUCTURE. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <span className="label-caps text-[10px] text-muted-foreground hover:text-primary cursor-pointer transition-colors">Privacy</span>
            <span className="label-caps text-[10px] text-muted-foreground hover:text-primary cursor-pointer transition-colors">Terms</span>
            <span className="label-caps text-[10px] text-muted-foreground hover:text-primary cursor-pointer transition-colors">FourLeaf</span>
          </div>
        </div>
      </footer>
    </div>
  );
}