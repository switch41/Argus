import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { AlertTriangle, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Emergency() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const triggerPanic = useMutation(api.alerts.triggerPanicAlert);

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
      const res = await triggerPanic({
        latitude: coords.lat,
        longitude: coords.lon,
        description: desc || undefined,
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h1 className="text-xl font-semibold tracking-tight">Emergency</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>PANIC Button</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Share your current location and notify authorities immediately.
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional details (optional)</label>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe the emergency briefly..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>
                  {coords
                    ? `Location acquired: ${coords.lat.toFixed(5)}, ${coords.lon.toFixed(5)}`
                    : "Acquiring location..."}
                </span>
              </div>
              {coords && (
                <iframe
                  title="map"
                  className="w-full h-64 rounded border"
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=15&output=embed`}
                />
              )}
            </div>

            <Button
              size="lg"
              variant="destructive"
              onClick={onPanic}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Send PANIC Alert
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
