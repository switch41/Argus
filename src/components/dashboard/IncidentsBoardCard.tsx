import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useEffect, useState } from "react";
import { Activity, ShieldCheck } from "lucide-react";
import CaseDetailDialog from "./CaseDetailDialog";
import { toast } from "sonner";

export default function IncidentsBoardCard() {
  const { supabase, user } = useSupabase();
  const [openCases, setOpenCases] = useState<any[]>([]);
  const [assignedCases, setAssignedCases] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchCases = async () => {
      const { data: open } = await supabase
        .from('cases')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      setOpenCases(open || []);

      const { data: assigned } = await supabase
        .from('cases')
        .select('*')
        .eq('status', 'assigned')
        .order('created_at', { ascending: false });
      setAssignedCases(assigned || []);
    };

    fetchCases();

    const channel = supabase
      .channel('public:cases')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const updateStatus = async (caseId: string, status: string) => {
    const { error } = await supabase
      .from('cases')
      .update({ status })
      .eq('id', caseId);
    if (error) toast.error("Failed to update status");
  };

  const fileEFir = async (caseId: string, touristId: string, priority: string, status: string) => {
    // This will eventually call the Node.js Fabric gateway
    toast.info("Hyperledger Sync: Initializing E-FIR protocol...");
    console.log("Mock Fabric Call: fileEFirOnChain", { caseId, touristId, priority, status });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Incidents Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{openCases?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Open</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{assignedCases?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Assigned</div>
          </div>
        </div>

        {openCases?.slice(0, 3).map((case_: any) => (
          <div key={case_.id} className="flex items-center justify-between p-2 border rounded mb-2">
            <div>
              <div className="text-sm font-medium">Case #{case_.id.slice(-6)}</div>
              <div className="text-xs text-muted-foreground">{case_.priority} priority</div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus(case_.id, "assigned")}
              >
                Assign
              </Button>
              <Button
                size="sm"
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={async () => {
                  try {
                    await fileEFir(case_.id, case_.alert_id, case_.priority, case_.status);
                    toast.success(`E-FIR Protocol Initialized`);
                  } catch (e: any) {
                    toast.error(e.message);
                  }
                }}
              >
                <ShieldCheck className="h-3 w-3 mr-1" /> E-FIR
              </Button>
              <CaseDetailDialog caseId={case_.id} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
