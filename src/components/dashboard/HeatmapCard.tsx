import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Map } from "lucide-react";

export default function HeatmapCard() {
  const heatmapData = useQuery(api.tourists.listRecentLocationsAggregated, { minutesBack: 60 });

  const mapUrl = heatmapData?.length
    ? `https://maps.google.com/maps?${heatmapData.map((point: any) => `markers=${point.lat},${point.lon}`).join("&")}&z=12&output=embed`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Tourist Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapUrl ? (
          <iframe
            title="heatmap"
            className="w-full h-48 rounded border"
            loading="lazy"
            src={mapUrl}
          />
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No recent location data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
