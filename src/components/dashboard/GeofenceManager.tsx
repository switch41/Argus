import { useState } from "react";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Trash2, Plus, MapPin, Loader2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

export default function GeofenceManager() {
    const { supabase, user } = useSupabase();
    const [geofences, setGeofences] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchFences = async () => {
            const { data } = await supabase
                .from('geo_fences')
                .select('*')
                .eq('is_active', true);
            setGeofences(data || []);
        };
        fetchFences();

        const channel = supabase
            .channel('public:geo_fences')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'geo_fences' }, () => {
                fetchFences();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase]);

    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");
    const [radius, setRadius] = useState("500");
    const [type, setType] = useState<"safe" | "restricted" | "high_risk" | "emergency_services">("restricted");

    const onCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase
                .from('geo_fences')
                .insert({
                    name,
                    description: desc,
                    zone_type: type,
                    radius: Number(radius),
                    coordinates: [{ lat: Number(lat), lng: Number(lon) }],
                    is_active: true
                });
            if (error) throw error;

            // Broadcast geo-fence creation to all tourists.
            const { data: tourists, error: touristFetchError } = await supabase
                .from("profiles")
                .select("id")
                .eq("role", "tourist");
            if (touristFetchError) throw touristFetchError;

            if (tourists?.length) {
                const notificationRows = tourists.map((tourist: any) => ({
                    user_id: tourist.id,
                    title: "New Geo-Fence Zone",
                    message: `${name} has been added as a ${type.replace("_", " ")} zone. Plan your route accordingly.`,
                    type: "geo_fence",
                    is_read: false,
                }));
                const { error: notifyError } = await supabase
                    .from("notifications")
                    .insert(notificationRows);
                if (notifyError) {
                    // Do not rollback fence creation; just surface partial failure.
                    toast.warning("Geo-fence created, but tourist notifications could not be sent.");
                }
            }

            toast.success("Geo-fence created successfully");
            setName("");
            setDesc("");
            setLat("");
            setLon("");
            setRadius("500");
        } catch (e: any) {
            toast.error(e.message || "Failed to create geo-fence");
        } finally {
            setLoading(false);
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case "safe": return "bg-emerald-500";
            case "restricted": return "bg-red-500";
            case "high_risk": return "bg-orange-500";
            case "emergency_services": return "bg-blue-500";
            default: return "bg-slate-500";
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-2 border-primary/20">
                <CardHeader className="bg-muted/30 border-b border-border">
                    <CardTitle className="font-display text-lg flex items-center gap-3">
                        <Plus className="h-5 w-5 text-primary" />
                        Provision New Geo-Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="label-caps !text-[10px]">Zone Identifier</Label>
                                <Input placeholder="e.g. Red Fort Perimeter" value={name} onChange={(e) => setName(e.target.value)} required className="h-10 border-2" />
                            </div>
                            <div className="space-y-2">
                                <Label className="label-caps !text-[10px]">Operational Context</Label>
                                <Input placeholder="Reason for restriction..." value={desc} onChange={(e) => setDesc(e.target.value)} required className="h-10 border-2" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="label-caps !text-[10px]">Center Lat</Label>
                                    <Input placeholder="28.6139" value={lat} onChange={(e) => setLat(e.target.value)} required className="h-10 border-2 font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="label-caps !text-[10px]">Center Lon</Label>
                                    <Input placeholder="77.2090" value={lon} onChange={(e) => setLon(e.target.value)} required className="h-10 border-2 font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="label-caps !text-[10px]">Radius (m)</Label>
                                    <Input type="number" placeholder="500" value={radius} onChange={(e) => setRadius(e.target.value)} required className="h-10 border-2 font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="label-caps !text-[10px]">Zone Classification</Label>
                                    <select
                                        className="w-full h-10 rounded-md border-2 border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        value={type}
                                        onChange={(e: any) => setType(e.target.value)}
                                    >
                                        <option value="safe">Safe Hub (Green)</option>
                                        <option value="restricted">Restricted Area (Red)</option>
                                        <option value="high_risk">High Risk Zone (Orange)</option>
                                        <option value="emergency_services">Emergency Services (Blue)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-2">
                            <Button type="submit" disabled={loading} className="w-full h-12 bg-primary hover:bg-primary/90 font-black label-caps tracking-widest text-[11px] glow-primary">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "DEPLOY GEO-FENCE ATTESATION"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="label-caps !text-[12px] text-muted-foreground font-black px-1">Active Network Perimeters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {geofences?.map((fence: any) => (
                        <Card key={fence.id} className="border border-border bg-card hover:border-primary transition-all group overflow-hidden">
                            <div className={`h-1.5 w-full ${getBadgeColor(fence.zone_type)} opacity-80`} />
                            <CardContent className="p-5 flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-display font-black text-sm uppercase tracking-tight">{fence.name}</span>
                                        {!fence.isActive && <Badge variant="secondary" className="text-[8px] uppercase">Inactive</Badge>}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[200px]">{fence.description}</p>
                                    <div className="pt-2 flex items-center gap-3 text-[10px] mono-data text-primary font-bold">
                                        <MapPin className="h-3 w-3" />
                                        {fence.coordinates[0].lat.toFixed(4)}, {fence.coordinates[0].lng.toFixed(4)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={`h-8 w-8 hover:bg-muted transition-colors ${fence.is_active ? 'text-emerald-500' : 'text-slate-400'}`}
                                        onClick={async () => {
                                            const { error } = await supabase
                                                .from('geo_fences')
                                                .update({ is_active: !fence.is_active })
                                                .eq('id', fence.id);
                                            if (error) toast.error("Failed to toggle fence");
                                        }}
                                    >
                                        {fence.is_active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive opacity-40 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                        onClick={async () => {
                                            const { error } = await supabase
                                                .from('geo_fences')
                                                .delete()
                                                .eq('id', fence.id);
                                            if (error) toast.error("Failed to remove fence");
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {geofences?.length === 0 && (
                        <div className="md:col-span-2 py-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <Shield className="h-10 w-10 mb-3" />
                            <p className="label-caps text-[10px]">No infrastructure perimeters deployed</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
