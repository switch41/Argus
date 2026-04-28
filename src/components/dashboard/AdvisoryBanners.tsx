import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useEffect, useState } from "react";

export default function AdvisoryBanners() {
  const { supabase, user } = useSupabase();
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const fetchAdvisories = async () => {
    const { data } = await supabase
      .from('advisories')
      .select('*')
      .order('created_at', { ascending: false });
    setAdvisories(data || []);
  };

  useEffect(() => {
    fetchAdvisories();

    const channel = supabase
      .channel('advisories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'advisories' }, fetchAdvisories)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (!advisories?.length) return null;

  const activeBanners = advisories.filter((advisory: any) => !dismissed.includes(advisory.id));
  if (!activeBanners.length) return null;

  return (
    <div className="space-y-2">
      {activeBanners.map((advisory: any) => (
        <div key={advisory.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <div className="font-medium text-blue-900">{advisory.title}</div>
            <div className="text-sm text-blue-700">{advisory.message}</div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(prev => [...prev, advisory.id])}
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  );
}
