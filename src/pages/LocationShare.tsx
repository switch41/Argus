import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { MapPin, Loader2 } from "lucide-react";
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy ?? 0,
        });
      },
      () => toast.error("Failed to get location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [isAuthenticated, navigate]);

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
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold tracking-tight">Share Location</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              {coords
                ? `Latitude: ${coords.lat.toFixed(5)}, Longitude: ${coords.lon.toFixed(5)}`
                : "Acquiring location..."}
            </div>

            {coords && (
              <iframe
                title="map"
                className="w-full h-64 rounded border"
                loading="lazy"
                src={`https://maps.google.com/maps?q=${coords.lat},${coords.lon}&z=15&output=embed`}
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Location Name (optional)</label>
              <Input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Hotel Grand Entrance"
              />
            </div>

            <Button onClick={share} className="w-full" disabled={isSharing}>
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share Location"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
