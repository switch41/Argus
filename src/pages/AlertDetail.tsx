import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const canAccess = user?.role === "admin" || user?.role === "tourism_official";

  useEffect(() => {
    if (!canAccess) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (!id) {
      setLoading(false);
      return;
    }
    const fetchAlert = async () => {
      const { data } = await supabase
        .from("alerts")
        .select("*, tourist_profiles(*)")
        .eq("id", id)
        .maybeSingle();
      setAlert(data ?? null);
      setLoading(false);
    };
    fetchAlert();
  }, [id, supabase, navigate, canAccess]);

  if (!canAccess) return null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Tactical Alert View
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading alert details...</p>
            ) : !alert ? (
              <p className="text-sm text-muted-foreground">Alert not found.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p><strong>Severity:</strong> {alert.severity}</p>
                <p><strong>Title:</strong> {alert.title}</p>
                <p><strong>Description:</strong> {alert.description || "N/A"}</p>
                <p><strong>Time:</strong> {new Date(alert.created_at).toLocaleString()}</p>
                <p>
                  <strong>Location:</strong>{" "}
                  {alert.location?.latitude && alert.location?.longitude
                    ? `${alert.location.latitude}, ${alert.location.longitude}`
                    : "N/A"}
                </p>
                <p><strong>Tourist:</strong> {alert.tourist_profiles?.full_name || "Unknown"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
