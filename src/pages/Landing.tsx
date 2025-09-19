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
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router";

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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="Tourist Safety" className="h-8 w-8" />
              <span className="text-xl font-semibold tracking-tight">SafeTravel</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Button onClick={() => navigate("/dashboard")} className="font-medium">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate("/auth")} className="font-medium">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold tracking-tight mb-8 leading-tight">
              Advanced Tourist Safety
              <br />
              <span className="text-muted-foreground">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Blockchain-secured digital IDs, AI-powered risk assessment, and real-time emergency response 
              for comprehensive tourist safety and security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
                className="text-lg px-8 py-6 font-medium"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Registration"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/demo")}
                className="text-lg px-8 py-6 font-medium"
              >
                View Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Comprehensive Safety Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced technology stack designed for maximum tourist safety and efficient emergency response.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <feature.icon className="h-12 w-12 mb-6 text-foreground" />
                    <h3 className="text-xl font-semibold mb-4 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple three-step process for complete tourist safety coverage.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Register & Verify",
                description: "Create your blockchain-secured digital tourist ID with passport verification and emergency contacts.",
                icon: Smartphone
              },
              {
                step: "02", 
                title: "Track & Monitor",
                description: "Real-time location tracking with AI-powered safety scoring and geo-fence monitoring.",
                icon: Globe
              },
              {
                step: "03",
                title: "Respond & Assist",
                description: "Instant emergency response with automated E-FIR generation and multi-agency coordination.",
                icon: CheckCircle
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">
                    STEP {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Ready to Enhance Tourist Safety?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the next generation of tourist safety management with our comprehensive platform.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")}
              className="text-lg px-8 py-6 font-medium"
            >
              {isAuthenticated ? "Access Dashboard" : "Get Started Today"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src="/logo.svg" alt="Tourist Safety" className="h-6 w-6" />
              <span className="font-semibold">SafeTravel</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 SafeTravel. Advanced Tourist Safety Management System.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}