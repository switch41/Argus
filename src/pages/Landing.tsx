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
  CloudSun,
  Thermometer,
  Wind,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Add: local weather state
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weather, setWeather] = useState<{
    tempC: number;
    windKph: number;
    code: number;
  } | null>(null);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      // Open-Meteo free, no API key
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeather({
        tempC: data?.current?.temperature_2m ?? 0,
        windKph: data?.current?.wind_speed_10m ?? 0,
        code: data?.current?.weather_code ?? 0,
      });
    } catch (e) {
      setWeatherError("Unable to load weather for your area.");
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  const acquireAndFetchWeather = () => {
    if (!("geolocation" in navigator)) {
      setWeatherError("Geolocation not supported by your browser.");
      return;
    }
    setWeatherError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        setWeatherError("Location permission denied. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  useEffect(() => {
    acquireAndFetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to map weather codes to a small label
  const describeWeatherCode = (code: number) => {
    // minimal mapping for common codes
    if ([0].includes(code)) return "Clear";
    if ([1, 2, 3].includes(code)) return "Partly Cloudy";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "Rain";
    if ([71, 73, 75, 77].includes(code)) return "Snow";
    if ([80, 81, 82].includes(code)) return "Showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Weather";
  };

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

      {/* Weather + Quick SOS */}
      <section className="py-8 px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center">
                    <CloudSun className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Local Weather</div>
                    <div className="text-lg font-semibold">
                      {weatherLoading ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                        </span>
                      ) : weather ? (
                        <>
                          {describeWeatherCode(weather.code)} •{" "}
                          <span className="inline-flex items-center gap-1">
                            <Thermometer className="h-4 w-4" />
                            {Math.round(weather.tempC)}°C
                          </span>{" "}
                          <span className="inline-flex items-center gap-1 pl-2 text-muted-foreground">
                            <Wind className="h-4 w-4" />
                            {Math.round(weather.windKph)} km/h
                          </span>
                        </>
                      ) : (
                        <span>{weatherError || "Weather unavailable"}</span>
                      )}
                    </div>
                    {weatherError && (
                      <button
                        type="button"
                        onClick={acquireAndFetchWeather}
                        className="text-sm text-blue-600 underline mt-1"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={acquireAndFetchWeather}
                    disabled={weatherLoading}
                  >
                    Refresh
                  </Button>
                  <Button
                    onClick={() => navigate("/emergency")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    SOS Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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

      {/* Floating SOS Button */}
      <button
        aria-label="Open SOS Emergency"
        onClick={() => navigate("/emergency")}
        className="fixed right-6 bottom-6 z-50 inline-flex items-center gap-2 rounded-full bg-red-600 hover:bg-red-700 text-white px-5 py-3 shadow-lg"
      >
        <AlertTriangle className="h-5 w-5" />
        SOS
      </button>

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