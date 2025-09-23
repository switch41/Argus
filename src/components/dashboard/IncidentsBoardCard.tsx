import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Activity } from "lucide-react";
import CaseDetailDialog from "./CaseDetailDialog";

export default function IncidentsBoardCard() {
  const openCases = useQuery(api.cases.getByStatus, { status: "open" });
  const assignedCases = useQuery(api.cases.getByStatus, { status: "assigned" });
  const updateStatus = useMutation(api.cases.updateStatus);

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
          <div key={case_._id} className="flex items-center justify-between p-2 border rounded mb-2">
            <div>
              <div className="text-sm font-medium">Case #{case_._id.slice(-6)}</div>
              <div className="text-xs text-muted-foreground">{case_.priority} priority</div>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus({ caseId: case_._id as any, status: "assigned" })}
              >
                Assign
              </Button>
              <CaseDetailDialog caseId={case_._id} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
