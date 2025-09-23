import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Radio } from "lucide-react";

export default function IoTSignalsCard() {
  const signals = useQuery(api.devices.listRecentSignals, { limit: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          IoT Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {signals?.length ? (
          <div className="space-y-2">
            {signals.map((signal: any) => (
              <div key={signal._id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div>
                  <div className="text-sm font-medium">{signal.type.toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(signal.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  signal.type === "sos" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {signal.type}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No recent signals</div>
        )}
      </CardContent>
    </Card>
  );
}
