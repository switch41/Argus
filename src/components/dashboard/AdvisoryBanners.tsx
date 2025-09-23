import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";

export default function AdvisoryBanners() {
  const advisories = useQuery(api.advisories.listForUser);
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (!advisories?.length) return null;

  const activeBanners = advisories.filter((advisory: any) => !dismissed.includes(advisory._id));
  if (!activeBanners.length) return null;

  return (
    <div className="space-y-2">
      {activeBanners.map((advisory: any) => (
        <div key={advisory._id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-blue-900">{advisory.title}</div>
            <div className="text-sm text-blue-700">{advisory.message}</div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(prev => [...prev, advisory._id])}
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );
}
