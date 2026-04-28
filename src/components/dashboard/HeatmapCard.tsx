import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useEffect, useState } from "react";
import { Map, Loader2 } from "lucide-react";

export default function HeatmapCard() {
  const { supabase, user } = useSupabase();
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [geofences, setGeofences] = useState<any[]>([]);
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      // Recent locations aggregated (Simplified: just get latest for all tourists)
      const { data: locations } = await supabase
        .from('location_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Group by tourist to get only latest
      const latest = locations?.reduce((acc: any, curr: any) => {
        if (!acc[curr.tourist_id]) acc[curr.tourist_id] = curr;
        return acc;
      }, {});
      setHeatmapData(Object.values(latest || {}));

      const { data: fences } = await supabase
        .from('geo_fences')
        .select('*')
        .eq('is_active', true);
      setGeofences(fences || []);

      // SOS/panic alerts for command map visibility.
      const { data: alertRows } = await supabase
        .from("alerts")
        .select("id, alert_type, severity, is_resolved, location, created_at")
        .eq("alert_type", "panic")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(100);
      const normalizedAlerts = (alertRows || []).filter(
        (a: any) => a?.location?.latitude != null && a?.location?.longitude != null
      );
      setSosAlerts(normalizedAlerts);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel('public:telemetry')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'location_history' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const isLoading = loading;

  // Construct Google Maps markers
  // Tourist density markers (default red dots)
  const touristMarkers = heatmapData?.map((point: any) => `markers=color:red|size:tiny|${point.latitude},${point.longitude}`).join("&") || "";

  // Geofence markers (custom colored pins)
  const geofenceMarkers = geofences?.map((fence: any) => {
    const color = fence.zoneType === "safe" ? "green" : fence.zoneType === "restricted" ? "red" : "orange";
    const label = fence.name[0].toUpperCase();
    const lat = fence.coordinates[0].lat;
    const lon = fence.coordinates[0].lng;
    return `markers=color:${color}|label:${label}|${lat},${lon}`;
  }).join("&") || "";

  // SOS markers are highlighted in blue with label "S".
  const sosMarkers = sosAlerts
    ?.map(
      (alert: any) =>
        `markers=color:blue|label:S|${alert.location.latitude},${alert.location.longitude}`
    )
    .join("&") || "";

  const combinedMarkers = [touristMarkers, geofenceMarkers, sosMarkers].filter(Boolean).join("&");

  const mapUrl = combinedMarkers
    ? `https://maps.google.com/maps?${combinedMarkers}&z=12&output=embed`
    : null;

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="label-caps !text-[11px] font-black opacity-60 flex items-center gap-2">
          <Map className="h-4 w-4" />
          Real-Time Strategic Perimeters
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative h-[calc(100%-48px)]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 rounded-xl border-2 border-border border-dashed">
            <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
          </div>
        ) : mapUrl ? (
          <div className="w-full h-full rounded-xl overflow-hidden border-2 border-primary/20 shadow-inner group">
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <div className="bg-background/80 backdrop-blur px-3 py-2 rounded-lg border border-border shadow-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase label-caps">Live Distribution</span>
              </div>
              <div className="bg-background/80 backdrop-blur px-3 py-2 rounded-lg border border-border shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[8px] font-bold uppercase">Safe Hubs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-600" />
                  <span className="text-[8px] font-bold uppercase">Restricted</span>
                </div>
              </div>
            </div>
            <iframe
              title="strategic-heatmap"
              className="w-full h-full grayscale-[50%] contrast-[1.1] brightness-[0.9]"
              loading="lazy"
              src={mapUrl}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 rounded-xl border-2 border-border border-dashed text-muted-foreground opacity-50">
            <Map className="h-8 w-8 mb-2" />
            <p className="label-caps text-[10px]">Insufficient regional telemetry</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
