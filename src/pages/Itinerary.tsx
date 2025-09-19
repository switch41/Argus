import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Calendar, MapPin, Route, Trash2, Loader2, Plus } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Route className="h-6 w-6" />
            <h1 className="text-xl font-semibold tracking-tight">Itinerary</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pt-2">
                <div className="font-medium mb-2 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  First Stop
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude *</Label>
                    <Input
                      value={form.stop.latitude}
                      onChange={(e) => setForm((p) => ({ ...p, stop: { ...p.stop, latitude: e.target.value } }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude *</Label>
                    <Input
                      value={form.stop.longitude}
                      onChange={(e) => setForm((p) => ({ ...p, stop: { ...p.stop, longitude: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Location Name *</Label>
                  <Input
                    value={form.stop.locationName}
                    onChange={(e) => setForm((p) => ({ ...p, stop: { ...p.stop, locationName: e.target.value } }))}
                  />
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Planned Arrival *</Label>
                  <Input
                    type="datetime-local"
                    value={form.stop.plannedArrival}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, stop: { ...p.stop, plannedArrival: e.target.value } }))
                    }
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Itinerary"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Itineraries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!myItineraries ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : myItineraries.length === 0 ? (
              <div className="text-sm text-muted-foreground">No itineraries yet.</div>
            ) : (
              myItineraries.map((it) => (
                <div key={it._id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{it.title}</div>
                    <Button variant="outline" size="sm" onClick={() => remove(it._id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 inline mr-1" />
                    {new Date(it.startDate).toLocaleDateString()} →{" "}
                    {new Date(it.endDate).toLocaleDateString()}
                  </div>
                  {it.plannedRoute?.[0] && (
                    <div className="text-sm">
                      <MapPin className="h-3.5 w-3.5 inline mr-1" />
                      {it.plannedRoute[0].locationName} (
                      {it.plannedRoute[0].latitude.toFixed(4)}, {it.plannedRoute[0].longitude.toFixed(4)})
                      <div className="mt-2">
                        <iframe
                          title={`map-${it._id}`}
                          className="w-full h-40 rounded border"
                          loading="lazy"
                          src={`https://maps.google.com/maps?q=${it.plannedRoute[0].latitude},${it.plannedRoute[0].longitude}&z=14&output=embed`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
