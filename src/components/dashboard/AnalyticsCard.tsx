import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useEffect, useState } from "react";
import { Download, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsCard() {
  const { supabase, user } = useSupabase();
  const [analytics, setAnalytics] = useState<any>({ totalTourists: 0, totalAlerts: 0, topRiskAreas: [] });
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchAnalytics = async () => {
      const { count: touristCount } = await supabase
        .from('tourist_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: alertCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true });

      const { data: recentIncidents } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      setAnalytics({
        totalTourists: touristCount || 0,
        totalAlerts: alertCount || 0,
        topRiskAreas: [] // Logic for top areas would involve spatial grouping
      });
      setIncidents(recentIncidents || []);
    };
    fetchAnalytics();
  }, [user, supabase]);

  const handleExport = () => {
    try {
      if (!incidents?.length) {
        toast.error("No incidents to export");
        return;
      }
      const csvHeader = "ID,Type,Severity,Title,Description,Created,Resolved,ResponseTime,Location\n";
      const csvRows = incidents
        .map((alert: any) => {
          const location =
            alert.location
              ? `"${alert.location.latitude},${alert.location.longitude}"`
              : "";
          return [
            alert.id,
            alert.alert_type,
            alert.severity,
            `"${alert.title}"`,
            `"${alert.description || ""}"`,
            new Date(alert.created_at).toISOString(),
            alert.is_resolved ? new Date(alert.resolved_at || 0).toISOString() : "",
            alert.response_time || "",
            location,
          ].join(",");
        })
        .join("\n");

      const csvData = csvHeader + csvRows;
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `incidents_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics
          </div>
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Total Tourists:</span>
            <span className="font-medium">{analytics?.totalTourists || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Total Alerts:</span>
            <span className="font-medium">{analytics?.totalAlerts || 0}</span>
          </div>
          {analytics?.topRiskAreas?.length ? (
            <div>
              <div className="text-sm font-medium mt-3 mb-1">Top Risk Areas:</div>
              {analytics.topRiskAreas.slice(0, 3).map((area: any, i: number) => (
                <div key={i} className="text-xs text-muted-foreground">
                  {area.coords} ({area.count} incidents)
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
