import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { MapPin, Loader2, ArrowLeft, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function LocationShare() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const updateLocation = useMutation(api.tourists.updateLocation);

  const [coords, setCoords] = useState<{ lat: number; lon: number; acc: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported by your browser.");
      toast.error("Geolocation not supported.");
      return;
    }
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy ?? 0,
        });
      },
      (err) => {
        let message = "Failed to get location.";
        if (err.code === 1) message = "Permission denied. Please allow location access.";
        else if (err.code === 2) message = "Position unavailable. Try moving to an open area or check GPS.";
        else if (err.code === 3) message = "Location request timed out. Please try again.";
        setGeoError(message);
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setGeoError("Location requires HTTPS. Please access the app over a secure connection.");
    }
    acquireLocation();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (coords && !hasShared && isAuthenticated && !isSharing) {
      setHasShared(true);
      void share();
    }
  }, [coords, hasShared, isAuthenticated, isSharing]);

  const share = async () => {
    if (!coords) {
      toast.error("Location not available");
      return;
    }
    setIsSharing(true);
    try {
      await updateLocation({
        latitude: coords.lat,
        longitude: coords.lon,
        accuracy: coords.acc || 0,
        isManual: true,
        locationName: locationName || undefined,
      });
      toast.success("Location shared!");
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      toast.error("Failed to share location.");
      setHasShared(false);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="font-bold label-caps text-[10px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              TERMINAL
            </Button>
            <div className="h-6 w-[1px] bg-border" />
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-secondary" />
              <h1 className="text-xl font-display font-bold tracking-tight text-primary uppercase">
                VECTOR BROADCAST
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-2">
          <div className="label-caps !text-[11px] text-secondary font-black tracking-[0.3em]">GEOLOCATION TELEMETRY</div>
          <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">Broadcast Coordinates</h2>
          <p className="text-muted-foreground font-medium max-w-md">
            Publish your real-time coordinates to the safety grid. This data is encrypted and only visible to authorized responders during an active incident.
          </p>
        </div>

        <Card className="border border-border bg-card shadow-2xl overflow-hidden rounded-2xl">
          <div className="h-1.5 bg-gradient-to-r from-secondary to-primary/50" />
          <CardHeader className="bg-muted/30 border-b border-border p-8">
            <CardTitle className="font-display text-2xl uppercase tracking-tighter flex items-center gap-3">
              <Shield className="h-6 w-6 text-secondary" />
              SECURE TRANSMISSION
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {geoError && (
              <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-red-900 text-sm uppercase tracking-wider mb-1">Signal Distorted</div>
                  <p className="text-red-700 text-sm font-medium">{geoError}</p>
                  <Button size="sm" variant="outline" onClick={acquireLocation} className="mt-3 border-red-200 text-red-800 hover:bg-red-100 font-bold label-caps text-[10px]">
                    Re-establish Link
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-1">
                <div className="label-caps text-[9px] text-muted-foreground font-black">LATITUDE</div>
                <div className="font-mono text-lg font-bold text-primary">
                  {coords ? coords.lat.toFixed(6) : "---.------"}
                </div>
              </div>
              <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-1">
                <div className="label-caps text-[9px] text-muted-foreground font-black">LONGITUDE</div>
                <div className="font-mono text-lg font-bold text-primary">
                  {coords ? coords.lon.toFixed(6) : "---.------"}
                </div>
              </div>
            </div>

            {!coords && !geoError && (
              <div className="p-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-border rounded-2xl bg-muted/5">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <span className="label-caps font-black text-[10px] tracking-widest text-muted-foreground">Synchronizing with Satellites...</span>
              </div>
            )}

            {coords && (
              <div className="relative group overflow-hidden rounded-2xl border-4 border-muted shadow-inner h-72">
                <iframe
                  title="map"
                  className="absolute inset-0 w-full h-full grayscale-[0.8] contrast-[1.2] brightness-[0.8] hover:grayscale-0 transition-all duration-700"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=16&output=embed`}
                />
                <div className="absolute inset-0 pointer-events-none border border-white/10" />
              </div>
            )}

            <div className="space-y-3">
              <Label className="label-caps !text-[11px] font-black text-primary tracking-widest">Waypoint Tag [Optional]</Label>
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. ALPHA_POINT_HOTEL"
                className="h-14 border-2 focus:ring-secondary font-bold tracking-tight text-lg"
              />
            </div>

            <Button
              onClick={share}
              className="w-full h-16 text-xl font-display font-black tracking-[0.2em] uppercase bg-primary hover:bg-primary/90 glow-primary transition-all disabled:opacity-50"
              disabled={isSharing || !coords}
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  INITIATING BROADCAST...
                </>
              ) : (
                "PUBLISH VECTOR"
              )}
            </Button>

            <p className="text-center text-[10px] font-black label-caps text-muted-foreground tracking-[0.25em]">
              <Shield className="h-3.5 w-3.5 inline mr-2 text-secondary" />
              END-TO-END ENCRYPTED TELEMETRY
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}