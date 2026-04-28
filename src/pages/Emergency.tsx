import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { AlertTriangle, MapPin, Loader2, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Emergency() {
  const { isAuthenticated, user, supabase } = useSupabase();
  const navigate = useNavigate();

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [desc, setDesc] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        toast.error("Unable to retrieve your location.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isAuthenticated, navigate]);

  const onPanic = async () => {
    if (!coords) {
      toast.error("Location not available yet. Please allow location access.");
      return;
    }
    setIsSending(true);
    try {
      // 1. Get Tourist Profile ID
      const { data: profile } = await supabase
        .from('tourist_profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) throw new Error("Tourist profile not found");

      // 2. Insert Alert
      const { data: alertRecord, error: alertError } = await supabase
        .from('alerts')
        .insert({
          tourist_id: profile.id,
          alert_type: 'panic',
          severity: 'critical',
          title: 'SOS: PANIC SIGNAL TRIGGERED',
          description: desc || 'Emergency button pressed',
          location: { latitude: coords.lat, longitude: coords.lon },
          is_resolved: false
        })
        .select("id")
        .single();

      if (alertError) throw alertError;

      // 3. Insert Signal
      await supabase
        .from('device_signals')
        .insert({
          tourist_id: profile.id,
          type: 'sos',
          payload: { latitude: coords.lat, longitude: coords.lon, description: desc }
        });

      // 4. Create user notification so SOS appears in Notification center.
      await supabase
        .from("notifications")
        .insert({
          user_id: user?.id,
          title: "SOS Sent",
          message: "Your panic signal has been broadcast to safety authorities.",
          type: "alert",
          related_alert_id: alertRecord?.id ?? null,
          is_read: false,
        });

      toast.success("Emergency alert sent!");
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send emergency alert.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="border-b border-border bg-accent text-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded">
              <AlertTriangle className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-widest uppercase">Emergency System</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/10 font-bold label-caps text-[10px]"
          >
            Cancel Signal
          </Button>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-2">
          <div className="label-caps !text-[11px] text-accent font-black tracking-[0.3em]">SOS BROADCAST SECTION</div>
          <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">Request Immediate Assistance</h2>
          <p className="text-muted-foreground font-medium max-w-2xl">
            This signal will broadcast your biometric profile, real-time GPS coordinates, and travel history to the nearest Safety Command Center and local emergency services.
          </p>
        </div>

        <Card className="border border-border bg-card shadow-2xl overflow-hidden rounded-xl">
          <div className="p-1 bg-accent" />
          <CardHeader className="bg-accent/5 pb-6">
            <CardTitle className="font-display text-2xl flex items-center gap-2">
              <MapPin className="h-6 w-6 text-accent" />
              Geolocation Lock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="label-caps !text-[10px] text-primary">Incident Intelligence</div>
                  <Textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Briefly describe the situation (e.g., medical, theft, lost)..."
                    className="h-32 border-2 focus:ring-accent bg-muted/50 font-medium"
                  />
                </div>

                <div className="p-4 bg-muted border border-border rounded-lg space-y-3">
                  <div className="label-caps !text-[9px] text-muted-foreground">Broadcast Status</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-display uppercase tracking-widest text-primary">GPS COORDINATES</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${coords ? "bg-emerald-500 text-white" : "bg-red-500 text-white animate-pulse"}`}>
                      {coords ? "LOCKED" : "ACQUIRING..."}
                    </span>
                  </div>
                  <div className="mono-data text-xl font-bold text-primary">
                    {coords ? `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}` : "---.------, ---.------"}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="label-caps !text-[10px] text-primary">Tactical View</div>
                <div className="relative group overflow-hidden rounded-lg border-2 border-border h-full min-h-[250px] bg-muted flex items-center justify-center">
                  {coords ? (
                    <iframe
                      title="map"
                      className="absolute inset-0 w-full h-full grayscale-[0.2] contrast-[1.1]"
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=16&output=embed`}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="label-caps text-[10px]">Triangulating...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <Button
                size="lg"
                variant="destructive"
                onClick={onPanic}
                className="w-full h-20 text-2xl font-black tracking-[.25em] bg-accent hover:bg-accent/90 glow-accent transition-all hover:scale-[1.01]"
                disabled={isSending || !coords}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                    BROADCASTING...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-8 w-8 mr-3" />
                    TRIGGER PANIC SIGNAL
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] label-caps text-muted-foreground mt-4 tracking-widest italic">
                WARNING: UNAUTHORIZED USE IS A SYSTEM VIOLATION
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-border bg-muted/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="font-bold text-sm">Command Center</div>
                <div className="text-[10px] text-muted-foreground label-caps">Automatic Dispatch</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-border bg-muted/20">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold text-sm">Geofence Registry</div>
                <div className="text-[10px] text-muted-foreground label-caps">Local Police Alerted</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
