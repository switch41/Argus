import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  MapPin,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  Activity,
  Globe,
  Wifi,
  WifiOff,
  ArrowRight,
  CloudSun,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useOfflineSync, OfflineManager } from "@/lib/offline-manager";
/* removed unused select imports */
/* removed unused input import */
/* removed unused textarea import */
/* removed unused label import */
/* removed unused lucide-react imports */
/* removed unused useState import */
import AdvisoryBanners from "@/components/dashboard/AdvisoryBanners";
import HeatmapCard from "@/components/dashboard/HeatmapCard";
import IoTSignalsCard from "@/components/dashboard/IoTSignalsCard";
import IncidentsBoardCard from "@/components/dashboard/IncidentsBoardCard";
import AnalyticsCard from "@/components/dashboard/AnalyticsCard";
import AdvisoryDialog from "@/components/dashboard/AdvisoryDialog";

export default function Dashboard() {
  const { isLoading, isAuthenticated, isAnonymous, user, signOut } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  // Role detection
  const isTourist = user?.role === "tourist" || user?.role === "user" || !user?.role;
  const isOfficer = user?.role === "police" || user?.role === "tourism_official";
  const isAdmin = user?.role === "admin";
  const isOfficial = isOfficer || isAdmin;
  const canManageTacticalAlerts = isAdmin || user?.role === "tourism_official";

  // State for data
  const [touristProfile, setTouristProfile] = useState<any>(null);
  const [safetyScore, setSafetyScore] = useState<any>(null);
  const [myAlerts, setMyAlerts] = useState<any[]>([]);
  const [myItineraries, setMyItineraries] = useState<any[]>([]);
  const [areaRisks, setAreaRisks] = useState<any[]>([]);
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [alertStats, setAlertStats] = useState<any>({ active: 0, resolved: 0, averageResponseTime: 0 });
  const [allTourists, setAllTourists] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ tempC: number; windKph: number; code: number } | null>(null);

  // Real-time Subscriptions & Initial Fetch
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 1. Current Profile (for tourists)
      if (isTourist) {
        const { data, error } = await supabase
          .from('tourist_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Keep existing state if the profile query errors to avoid collapsing the UI.
        if (!error) {
          // Keep previously loaded profile to prevent UI flicker/disappearance
          // during transient empty refetches after real-time updates.
          setTouristProfile((prev: any) => data ?? prev ?? null);
        }

        const profileId = data?.id ?? touristProfile?.id;
        if (profileId) {
          const { data: touristAlerts } = await supabase
            .from("alerts")
            .select("*")
            .eq("tourist_id", profileId)
            .order("created_at", { ascending: false });
          setMyAlerts(touristAlerts || []);
        } else if (!error) {
          setMyAlerts([]);
        }
      }

      // 2. Active Alerts (Official)
      if (isOfficial) {
        const { data: alerts } = await supabase
          .from('alerts')
          .select('*, tourist_profiles(*)')
          .order('created_at', { ascending: false });
        setAllAlerts(alerts || []);

        const { data: tourists } = await supabase
          .from('tourist_profiles')
          .select('*')
          .eq('is_active', true);
        setAllTourists(tourists || []);

        const { data: officials } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['police', 'tourism_official', 'responder']);
        setOfficers(officials || []);
      }
    };

    fetchData();

    // Setup Real-time for Alerts
    const alertsChannel = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(alertsChannel);
    };
  }, [user, isTourist, isOfficial, supabase]);

  const triggerPanic = async (args: any) => {
    if (!user || !touristProfile) return;
    const { error } = await supabase
      .from('alerts')
      .insert({
        tourist_id: touristProfile.id,
        alert_type: 'panic',
        severity: 'critical',
        title: 'Emergency SOS',
        description: args.description || 'User triggered manual emergency signal.',
        location: { latitude: args.latitude, longitude: args.longitude },
        is_resolved: false
      });
    if (error) throw error;
  };

  const assignAlert = async (alertId: string, officerId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ assigned_to: officerId })
      .eq('id', alertId);
    if (error) throw error;
  };

  /*
  // Use offline sync
  const offlineRunner = useCallback(async (name: string, args: any) => {
    if (name === "alerts.triggerPanicAlert") {
      return await triggerPanic(args);
    }
  }, [triggerPanic]);

  const { isOnline } = useOfflineSync(offlineRunner);
  */
  const isOnline = true; // Temporary fix

  const onPanicClick = async () => {
    if (!isOnline) {
      OfflineManager.addToQueue("alerts.triggerPanicAlert", {
        latitude: 0,
        longitude: 0,
        description: "Emergency SOS (Offline)",
      });
      return;
    }
    navigate("/emergency");
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather");
      const data = await res.json();
      setWeather({
        tempC: data?.current?.temperature_2m ?? 0,
        windKph: data?.current?.wind_speed_10m ?? 0,
        code: data?.current?.weather_code ?? 0,
      });
    } catch {
      setWeatherError("Unable to load weather for your area.");
      setWeather(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!("geolocation" in navigator)) {
      setWeatherError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => setWeatherError("Location permission denied."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, [isAuthenticated]);

  const describeWeatherCode = (code: number) => {
    if ([0].includes(code)) return "Clear";
    if ([1, 2, 3].includes(code)) return "Partly Cloudy";
    if ([45, 48].includes(code)) return "Fog";
    if ([51, 53, 55, 61, 63, 65].includes(code)) return "Rain";
    if ([71, 73, 75, 77].includes(code)) return "Snow";
    if ([80, 81, 82].includes(code)) return "Showers";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Weather";
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "safe": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "high_risk": return "text-orange-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getSafetyBg = (level: string) => {
    switch (level) {
      case "safe": return "bg-green-50 border-green-200";
      case "moderate": return "bg-yellow-50 border-yellow-200";
      case "high_risk": return "bg-orange-50 border-orange-200";
      case "critical": return "bg-red-50 border-red-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 bg-primary rounded flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => navigate("/")}
              >
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold tracking-tight text-primary">
                  {isTourist ? "Tourist Portal" : isAdmin ? "System Governance" : "Safety Command"}
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                  <p className="text-[10px] label-caps text-muted-foreground">
                    Active Session: {user.name || user.email}
                  </p>
                  {isAnonymous && (
                    <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border border-amber-300 bg-amber-100 text-amber-800">
                      Guest Mode
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/notifications")}
                className="hidden md:flex font-bold label-caps text-[10px]"
              >
                Signals
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="font-bold label-caps text-[10px] border-2"
              >
                Profile
              </Button>
              {(isAdmin || user?.role === "tourism_official") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/high-authority")}
                  className="hidden md:flex font-bold label-caps text-[10px] border-secondary text-secondary hover:bg-secondary hover:text-white"
                >
                  Strategic View
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={async () => {
                  try {
                    await signOut();
                  } finally {
                    navigate("/auth");
                  }
                }}
                className="font-bold label-caps text-[10px] bg-primary glow-primary"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isTourist ? (
          // Tourist Dashboard
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Advisory Banners */}
            <AdvisoryBanners />

            <Card className="border border-border bg-card shadow-none overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg">Geofencing Spots</CardTitle>
              </CardHeader>
              <CardContent className="h-[340px]">
                <HeatmapCard />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 border border-border bg-card shadow-none overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-secondary flex items-center justify-center">
                        <CloudSun className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="label-caps !text-muted-foreground mb-1">Local Travel Conditions</div>
                        <div className="text-xl font-bold tracking-tight">
                          {weatherLoading ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                            </span>
                          ) : weather ? (
                            <>
                              {describeWeatherCode(weather.code)} •{" "}
                              <span className="mono-data !text-primary">{Math.round(weather.tempC)}°C</span>
                            </>
                          ) : (
                            <span className="text-destructive font-medium">{weatherError || "Service Offline"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-[1px] bg-border hidden sm:block" />
                      <div className="flex flex-col items-end">
                        <div className="label-caps !text-[10px] text-muted-foreground mb-1">Wind Speed</div>
                        <div className="mono-data text-primary">
                          {weather?.windKph ? `${Math.round(weather.windKph)} KM/H` : "--"}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-2 border-accent bg-accent/5 shadow-none overflow-hidden hover:bg-accent/10 transition-colors cursor-pointer group"
                onClick={onPanicClick}
              >
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="label-caps text-accent font-bold">Emergency Signal</div>
                    <AlertTriangle className="h-5 w-5 text-accent animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xl font-bold tracking-tight mb-1 text-accent">Quick SOS Trigger</div>
                    <p className="text-sm text-accent/80">Instant authority dispatch</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!touristProfile ? (
              <Card className="border-2 border-dashed border-border bg-muted/50">
                <CardContent className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-background border-2 border-border rounded-full flex items-center justify-center mx-auto">
                    <Shield className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold">Incomplete Identification</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                      Provision your blockchain-secured digital tourist ID to activate full safety monitoring and emergency services.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      if (isAnonymous) {
                        toast.error("Please sign in with email to create a Digital ID.");
                        navigate("/auth");
                        return;
                      }
                      navigate("/register");
                    }}
                    className="font-bold h-12 px-8 bg-primary hover:bg-primary/90 glow-primary"
                  >
                    Verify Identity Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Safety Score Card */}
                {myItineraries && myItineraries.length > 0 ? (
                  <Card className={`border-2 overflow-hidden shadow-lg ${getSafetyBg(safetyScore?.riskLevel || "safe")}`}>
                    <div className="p-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-30" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="label-caps text-primary">Biometric Safety Index</div>
                        <Shield className={`h-6 w-6 ${getSafetyColor(safetyScore?.riskLevel || "safe")}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-display text-6xl font-bold tracking-tighter">
                              {safetyScore?.currentScore || 85}
                            </span>
                            <span className="text-xl font-bold text-muted-foreground">/ 100</span>
                          </div>
                          <div className={`text-sm font-bold uppercase tracking-widest ${getSafetyColor(safetyScore?.riskLevel || "safe")}`}>
                            STATUS: {safetyScore?.riskLevel?.replace("_", " ") || "SAFE"}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="h-16 w-[1px] bg-border hidden md:block" />
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={onPanicClick}
                            className="h-16 px-10 text-xl font-black tracking-widest bg-accent hover:bg-accent/90 glow-accent"
                          >
                            TRIGGER SOS
                          </Button>
                        </div>
                      </div>

                      {/* Area Risks */}
                      {areaRisks?.length ? (
                        <div className="pt-4 border-t border-border">
                          <div className="label-caps !text-[10px] text-muted-foreground mb-3">Enroute Risk Analysis</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                            {areaRisks.map((ar: any, i: number) => (
                              <div key={i} className="p-3 bg-background/50 rounded-lg border border-border/50 flex flex-col gap-1">
                                <div className="text-xs font-bold truncate text-primary">{ar.locationName}</div>
                                <div className="flex items-center justify-between">
                                  <div className="mono-data !text-[10px] text-muted-foreground">FLX-392</div>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${ar.riskLevel === "critical" ? "bg-red-500 text-white" :
                                    ar.riskLevel === "high_risk" ? "bg-orange-500 text-white" :
                                      ar.riskLevel === "moderate" ? "bg-yellow-500 text-white" :
                                        "bg-emerald-500 text-white"
                                    }`}>
                                    {ar.riskLevel.split("_")[0]}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border border-border bg-muted/20">
                    <CardContent className="py-10 text-center space-y-4">
                      <div className="w-12 h-12 bg-white border border-border rounded-lg flex items-center justify-center mx-auto">
                        <MapPin className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-bold">No Itinerary Detected</h3>
                        <p className="text-muted-foreground text-xs">Register your travel path to enable real-time risk profiling.</p>
                      </div>
                      <Button onClick={() => navigate("/itinerary")} variant="outline" className="font-bold label-caps !text-[10px] border-2">
                        Initialize Route
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: MapPin, title: "Share Location", desc: "Update GPS Broadcast", color: "text-secondary", bg: "bg-secondary/10", path: "/location" },
                    { icon: Clock, title: "My Itinerary", desc: "View Secure Path", color: "text-emerald-600", bg: "bg-emerald-50", path: "/itinerary" },
                    { icon: AlertTriangle, title: "Signal History", desc: `${myAlerts?.length || 0} Incident Reports`, color: "text-orange-600", bg: "bg-orange-50", path: "/notifications" }
                  ].map((action, i) => (
                    <Card key={i} className="group cursor-pointer hover:border-primary transition-all bg-card shadow-none" onClick={() => navigate(action.path)}>
                      <CardContent className="pt-8 pb-6 px-6 relative">
                        <div className={`w-12 h-12 rounded ${action.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                          <action.icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <h3 className="font-display text-lg font-bold mb-1">{action.title}</h3>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{action.desc}</p>
                        <ArrowRight className="absolute right-6 bottom-6 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Specialized Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-border bg-primary/5 group cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate("/translator")}>
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded flex items-center justify-center">
                          <Globe className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="label-caps !text-[10px] text-primary mb-1">On-Device Edge AI</div>
                          <div className="font-display font-bold text-lg">Secure Offline Translator</div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary" />
                    </CardContent>
                  </Card>

                  <Card className="border border-border bg-slate-50">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded flex items-center justify-center ${isOnline ? "bg-emerald-100" : "bg-red-100"}`}>
                          {isOnline ? <Wifi className="h-6 w-6 text-emerald-600" /> : <WifiOff className="h-6 w-6 text-red-600" />}
                        </div>
                        <div>
                          <div className="label-caps !text-[10px] text-muted-foreground mb-1">Network Synchronization</div>
                          <div className="font-display font-bold text-lg">{isOnline ? "Systems Nominal" : "Offline Cache Active"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </motion.div>
        ) : isOfficial ? (
          // Official Dashboard
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Global Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Active Tourists", val: allTourists?.length || "0", color: "text-secondary" },
                { icon: AlertTriangle, label: "Unresolved Signals", val: alertStats?.active || "0", color: "text-accent" },
                { icon: CheckCircle, label: "Daily Clearances", val: alertStats?.resolved || "0", color: "text-emerald-500" },
                { icon: Clock, label: "Avg Response", val: `${alertStats?.averageResponseTime || 2}M`, color: "text-orange-500" }
              ].map((s, i) => (
                <Card key={i} className="border border-border bg-card shadow-none">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="label-caps !text-[10px] text-muted-foreground">{s.label}</div>
                        <s.icon className={`h-4 w-4 ${s.color}`} />
                      </div>
                      <div className="font-display text-4xl font-bold tracking-tight">{s.val}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <HeatmapCard />
                <IncidentsBoardCard />
              </div>
              <div className="space-y-6">
                <IoTSignalsCard />
                <AnalyticsCard />
                <div className="pt-4">
                  <AdvisoryDialog />
                </div>
              </div>
            </div>

            {/* Live Feed Table */}
            <Card className="border border-border bg-card shadow-none overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-display text-xl">
                    <Activity className="h-5 w-5 text-accent" />
                    Tactical Alert Stream
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="label-caps !text-[9px] text-muted-foreground">Live Monitoring Active</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {allAlerts && allAlerts.length > 0 ? (
                  <div className="divide-y divide-border">
                    {allAlerts.slice(0, 10).map((alert: any) => (
                      <div key={alert.id} className="group hover:bg-muted/20 transition-colors p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`label-caps !text-[9px] px-2 py-0.5 rounded text-white ${alert.severity === "critical" ? "bg-accent" :
                              alert.severity === "high" ? "bg-orange-500" : "bg-secondary"
                              }`}>
                              {alert.severity}
                            </span>
                            <span className="font-bold text-primary">{alert.title}</span>
                            <span className="text-[10px] mono-data text-muted-foreground">
                              {new Date(alert.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground max-w-2xl">{alert.description}</p>
                        </div>
                        {canManageTacticalAlerts && (
                          <div className="flex items-center gap-2 self-end md:self-auto">
                            <Button size="sm" variant="ghost" className="font-bold label-caps !text-[9px]" onClick={() => navigate(`/alert/${alert.id}`)}>
                              Tactical View
                            </Button>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="font-bold label-caps !text-[9px] border-2">
                                  Assign Unit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="rounded-xl">
                                <DialogHeader>
                                  <DialogTitle className="font-display">Dispatch Coordination</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="label-caps !text-[11px] text-muted-foreground">Available Personnel</div>
                                  <div className="max-h-64 overflow-auto space-y-2 pr-2">
                                    {officers?.length
                                      ? officers.map((o: any) => (
                                        <Card key={o.id} className="border border-border shadow-none hover:border-secondary transition-colors cursor-pointer">
                                          <div className="p-4 flex items-center justify-between">
                                            <div>
                                              <div className="font-bold text-sm">{o.name || o.email}</div>
                                              <div className="label-caps !text-[9px] text-muted-foreground">{o.role}</div>
                                            </div>
                                            <Button
                                              size="sm"
                                              onClick={async () => {
                                                try {
                                                  await assignAlert(alert.id, o.id);
                                                  toast.success("Unit assigned successfully.");
                                                } catch (e) {
                                                  toast.error("Dispatch failure.");
                                                }
                                              }}
                                              className="bg-secondary hover:bg-secondary/90 font-bold label-caps !text-[9px]"
                                            >
                                              Assign
                                            </Button>
                                          </div>
                                        </Card>
                                      ))
                                      : <p className="text-center py-4 text-xs text-muted-foreground">No units available for dispatch.</p>}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                      <CheckCircle className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-xl">All Channels Clear</h3>
                      <p className="text-muted-foreground text-sm">No active distress signals detected in the network.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}