import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Calendar, MapPin, Route, Trash2, Loader2, Plus, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function Itinerary() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const createItinerary = useMutation(api.tourists.createItinerary);
  const deleteItinerary = useMutation(api.tourists.deleteItinerary);
  const myItineraries = useQuery(api.tourists.listMyItineraries);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    stop: {
      latitude: "",
      longitude: "",
      locationName: "",
      plannedArrival: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth");
  }, [isAuthenticated, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!form.title || !form.startDate || !form.endDate) {
        toast.error("Please fill required fields.");
        return;
      }
      if (!form.stop.latitude || !form.stop.longitude || !form.stop.locationName || !form.stop.plannedArrival) {
        toast.error("Please fill the first stop details.");
        return;
      }
      await createItinerary({
        title: form.title,
        description: form.description || undefined,
        startDate: new Date(form.startDate).getTime(),
        endDate: new Date(form.endDate).getTime(),
        plannedRoute: [
          {
            latitude: parseFloat(form.stop.latitude),
            longitude: parseFloat(form.stop.longitude),
            locationName: form.stop.locationName,
            plannedArrival: new Date(form.stop.plannedArrival).getTime(),
          },
        ],
      });
      toast.success("Itinerary created.");
      setForm({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        stop: { latitude: "", longitude: "", locationName: "", plannedArrival: "" },
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to create itinerary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteItinerary({ itineraryId: id as any });
      toast.success("Itinerary deleted.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete itinerary.");
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="font-bold label-caps text-[10px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terminal
            </Button>
            <div className="h-6 w-[1px] bg-border" />
            <div className="flex items-center gap-3">
              <Route className="h-5 w-5 text-secondary" />
              <h1 className="text-xl font-display font-bold tracking-tight text-primary uppercase">
                Vector Registry
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-2">
          <div className="label-caps !text-[11px] text-secondary font-black tracking-[0.3em]">ITINERARY & ROUTE MANAGEMENT</div>
          <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">Strategic Movement Plan</h2>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Register your planned travel vectors to enable pro-active monitoring and safety corridor allocation. All routes are hashed and stored for emergency triangulation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <Card className="border border-border bg-card shadow-xl overflow-hidden rounded-xl">
              <div className="p-1 bg-secondary" />
              <CardHeader className="bg-muted/30 border-b border-border">
                <CardTitle className="font-display text-xl uppercase tracking-tighter">Initiate Vector</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={submit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="label-caps !text-[10px] text-primary">Operational Title</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Downtown Mission"
                      className="h-12 border-2 focus:ring-secondary font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="label-caps !text-[10px] text-primary">Deployment Brief</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Optional technical details..."
                      className="border-2 focus:ring-secondary font-medium"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="label-caps !text-[10px] text-primary">Activation Date</Label>
                      <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                        className="h-12 border-2 focus:ring-secondary font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="label-caps !text-[10px] text-primary">Termination Date</Label>
                      <Input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                        className="h-12 border-2 focus:ring-secondary font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-6 border-t border-border">
                    <div className="label-caps !text-[11px] text-secondary font-black flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Primary Waypoint
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="label-caps !text-[10px] text-primary">Latitudinal Lock</Label>
                        <Input
                          value={form.stop.latitude}
                          onChange={(e) => setForm((p) => ({ ...p, stop: { ...p.stop, latitude: e.target.value } }))}
                          placeholder="00.0000"
                          className="h-12 border-2 focus:ring-secondary font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="label-caps !text-[10px] text-primary">Longitudinal Lock</Label>
                        <Input
                          value={form.stop.longitude}
                          onChange={(e) => setForm((p) => ({ ...p, stop: { ...p.stop, longitude: e.target.value } }))}
                          placeholder="00.0000"
                          className="h-12 border-2 focus:ring-secondary font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="label-caps !text-[10px] text-primary">Waypoint Denomination</Label>
                      <Input
                        value={form.stop.locationName}
                        onChange={(e) => setForm((p) => ({ ...p, stop: { ...p.stop, locationName: e.target.value } }))}
                        placeholder="Location Name"
                        className="h-12 border-2 focus:ring-secondary font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="label-caps !text-[10px] text-primary">Estimated Intercept Time</Label>
                      <Input
                        type="datetime-local"
                        value={form.stop.plannedArrival}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, stop: { ...p.stop, plannedArrival: e.target.value } }))
                        }
                        className="h-12 border-2 focus:ring-secondary font-bold"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 text-lg font-display font-black tracking-widest bg-primary hover:bg-primary/90 glow-primary transition-all">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        HASHING VECTOR...
                      </>
                    ) : (
                      "REGISTER MISSION"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="label-caps !text-[11px] text-primary font-black tracking-[0.3em]">ACTIVE REGISTRY</div>
            <div className="space-y-4">
              {!myItineraries ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-xl">
                  <Loader2 className="h-10 w-10 animate-spin text-secondary mb-4" />
                  <span className="label-caps text-[10px]">Syncing Data...</span>
                </div>
              ) : myItineraries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/10 border border-dashed border-border rounded-xl italic text-muted-foreground text-sm">
                  No travel vectors registered in current epoch.
                </div>
              ) : (
                myItineraries.map((it: any) => (
                  <Card key={it._id} className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-border bg-muted/30">
                      <div className="space-y-1">
                        <div className="font-display font-bold text-lg uppercase tracking-tight text-primary">{it.title}</div>
                        <div className="flex items-center gap-3 text-[10px] font-black label-caps text-secondary tracking-widest">
                          <Calendar className="h-3 w-3" />
                          {new Date(it.startDate).toLocaleDateString()} // {new Date(it.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => remove(it._id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold label-caps text-[10px]">
                        <Trash2 className="h-4 w-4 mr-2" /> TERMINATE
                      </Button>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      {it.plannedRoute?.[0] && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-secondary/10 rounded-lg">
                                <MapPin className="h-4 w-4 text-secondary" />
                              </div>
                              <span className="font-bold text-sm text-primary uppercase">{it.plannedRoute[0].locationName}</span>
                            </div>
                            <span className="mono-data text-[10px] tracking-widest">[{it.plannedRoute[0].latitude.toFixed(4)}, {it.plannedRoute[0].longitude.toFixed(4)}]</span>
                          </div>

                          <div className="relative group overflow-hidden rounded-lg border-2 border-border h-48 bg-muted">
                            <iframe
                              title={`map-${it._id}`}
                              className="absolute inset-0 w-full h-full grayscale-[0.5] contrast-[1.1] brightness-[0.9] hover:grayscale-0 transition-all duration-500"
                              loading="lazy"
                              src={`https://maps.google.com/maps?q=${it.plannedRoute[0].latitude},${it.plannedRoute[0].longitude}&z=14&output=embed`}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}