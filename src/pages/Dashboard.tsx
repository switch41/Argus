import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useAction } from "convex/react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Download, Map, MessageSquare, Radio, TrendingUp } from "lucide-react";
import { useState } from "react";

function AdvisoryBanners() {
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

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Move role flags before queries so we can conditionally call them
  const isTourist = user?.role === "tourist" || !user?.role;
  const isOfficial = user?.role === "police" || user?.role === "tourism_official" || user?.role === "admin";

  // Queries (conditionally run official-only queries)
  const touristProfile = useQuery(api.tourists.getCurrentProfile);
  const safetyScore = useQuery(api.tourists.getSafetyScore);
  const myAlerts = useQuery(api.alerts.getMyAlerts);
  const allAlerts = useQuery(api.alerts.getAllActiveAlerts, isOfficial ? {} : "skip");
  const alertStats = useQuery(api.alerts.getAlertStats, isOfficial ? {} : "skip");
  const allTourists = useQuery(api.tourists.getAllActiveTourists, isOfficial ? {} : "skip");
  const assignAlert = useMutation(api.alerts.assignAlert);
  const officers = useQuery(api.users.listOfficials, isOfficial ? {} : "skip");
  const heatmapData = useQuery(api.tourists.listRecentLocationsAggregated, isOfficial ? { minutesBack: 60 } : "skip");
  const iotSignals = useQuery(api.devices.listRecentSignals, isOfficial ? { limit: 5 } : "skip");
  const openCases = useQuery(api.cases.getByStatus, isOfficial ? { status: "open" } : "skip");
  const assignedCases = useQuery(api.cases.getByStatus, isOfficial ? { status: "assigned" } : "skip");
  const analytics = useQuery(api.analytics.getOverview, isOfficial ? {} : "skip");
  const advisories = useQuery(api.advisories.listForUser);
  const updateCaseStatus = useMutation(api.cases.updateStatus);
  const createAdvisory = useMutation(api.advisories.create);
  const exportCsv = useAction(api.analytics.exportIncidentsCsv);
  const addCaseNote = useMutation(api.cases.addNote);
  const postCaseMessage = useMutation(api.messages.postToCase);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getSafetyColor = (level: string) => {
    switch (level) {
      case "safe": return "text-green-600";
      case "moderate": return "text-yellow-600";
      case "high_risk": return "text-orange-600";
      case "critical": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getSafetyBg = (level: string) => {
    switch (level) {
      case "safe": return "bg-green-50 border-green-200";
      case "moderate": return "bg-yellow-50 border-yellow-200";
      case "high_risk": return "bg-orange-50 border-orange-200";
      case "critical": return "bg-red-50 border-red-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.svg"
                alt="Tourist Safety"
                className="h-8 w-8 cursor-pointer"
                onClick={() => navigate("/")}
              />
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  {isTourist ? "Tourist Dashboard" : "Safety Control Center"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.name || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate("/notifications")}
                className="font-medium"
              >
                Notifications
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/profile")}
                className="font-medium"
              >
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {isTourist ? (
          // Tourist Dashboard
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Advisory Banners */}
            <AdvisoryBanners />

            {!touristProfile ? (
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Complete Your Registration</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up your digital tourist ID to access safety features
                  </p>
                  <Button onClick={() => navigate("/register")}>
                    Create Digital ID
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Safety Score Card */}
                <Card className={`${getSafetyBg(safetyScore?.riskLevel || "safe")}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className={`h-5 w-5 ${getSafetyColor(safetyScore?.riskLevel || "safe")}`} />
                      Safety Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          {safetyScore?.currentScore || 85}/100
                        </div>
                        <div className={`text-sm font-medium ${getSafetyColor(safetyScore?.riskLevel || "safe")}`}>
                          {safetyScore?.riskLevel?.toUpperCase().replace("_", " ") || "SAFE"}
                        </div>
                      </div>
                      <Button 
                        size="lg"
                        variant="destructive"
                        onClick={() => navigate("/emergency")}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        PANIC
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/location")}>
                    <CardContent className="pt-6 text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold">Share Location</h3>
                      <p className="text-sm text-muted-foreground">Update your current location</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/itinerary")}>
                    <CardContent className="pt-6 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold">My Itinerary</h3>
                      <p className="text-sm text-muted-foreground">View planned routes</p>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/alerts")}>
                    <CardContent className="pt-6 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <h3 className="font-semibold">My Alerts</h3>
                      <p className="text-sm text-muted-foreground">{myAlerts?.length || 0} active</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Alerts */}
                {myAlerts && myAlerts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {myAlerts.slice(0, 3).map((alert: any) => (
                          <div key={alert._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <div className="font-medium">{alert.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(alert._creationTime).toLocaleDateString()}
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              alert.isResolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                              {alert.isResolved ? "Resolved" : "Active"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </motion.div>
        ) : isOfficial ? (
          // Official Dashboard
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Tourists</p>
                      <p className="text-2xl font-bold">{allTourists?.length || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Alerts</p>
                      <p className="text-2xl font-bold">{alertStats?.active || 0}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved Today</p>
                      <p className="text-2xl font-bold">{alertStats?.resolved || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response</p>
                      <p className="text-2xl font-bold">{alertStats?.averageResponseTime || 0}m</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New compact sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Heatmap */}
              <HeatmapCard />
              
              {/* IoT Signals */}
              <IoTSignalsCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Incidents Board */}
              <IncidentsBoardCard />
              
              {/* Analytics */}
              <AnalyticsCard />
            </div>

            {/* Advisory Creation */}
            <div className="flex justify-end">
              <AdvisoryDialog />
            </div>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Alert Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allAlerts && allAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {allAlerts.slice(0, 5).map((alert: any) => (
                      <div key={alert._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              alert.severity === "critical" ? "bg-red-500" :
                              alert.severity === "high" ? "bg-orange-500" :
                              alert.severity === "medium" ? "bg-yellow-500" : "bg-blue-500"
                            }`} />
                            <span className="font-medium">{alert.title}</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              {alert.alertType.replace("_", " ").toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert._creationTime).toLocaleString()}
                          </p>
                          {"location" in alert && alert.location?.latitude && alert.location?.longitude ? (
                            <a
                              href={`https://maps.google.com/?q=${alert.location.latitude},${alert.location.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 underline mt-1 inline-block"
                            >
                              Open map
                            </a>
                          ) : null}
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button size="sm" onClick={() => navigate(`/alert/${alert._id}`)}>
                            View
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Assign
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Assign Alert</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                  Select an officer to assign this alert.
                                </div>
                                <div className="max-h-64 overflow-auto space-y-2">
                                  {officers?.length
                                    ? officers.map((o: any) => (
                                        <div
                                          key={o._id}
                                          className="p-2 border rounded flex items-center justify-between"
                                        >
                                          <div>
                                            <div className="font-medium">{o.name || o.email || "Officer"}</div>
                                            <div className="text-xs text-muted-foreground">{o.role}</div>
                                          </div>
                                          <Button
                                            size="sm"
                                            onClick={async () => {
                                              try {
                                                await assignAlert({ alertId: alert._id as any, officerId: o._id as any });
                                                toast.success("Assigned.");
                                              } catch (e) {
                                                console.error(e);
                                                toast.error("Failed to assign.");
                                              }
                                            }}
                                          >
                                            Assign
                                          </Button>
                                        </div>
                                      ))
                                    : <div className="text-sm text-muted-foreground">No officers found.</div>}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <p>No active alerts. All tourists are safe.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

// New compact components
function HeatmapCard() {
  const heatmapData = useQuery(api.tourists.listRecentLocationsAggregated, { minutesBack: 60 });
  
  const mapUrl = heatmapData?.length 
    ? `https://maps.google.com/maps?${heatmapData.map((point: any, i: number) => `markers=${point.lat},${point.lon}`).join('&')}&z=12&output=embed`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Tourist Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mapUrl ? (
          <iframe
            title="heatmap"
            className="w-full h-48 rounded border"
            loading="lazy"
            src={mapUrl}
          />
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            No recent location data
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IoTSignalsCard() {
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

function IncidentsBoardCard() {
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

function AnalyticsCard() {
  const analytics = useQuery(api.analytics.getOverview);
  const exportCsv = useAction(api.analytics.exportIncidentsCsv);

  const handleExport = async () => {
    try {
      const csvData = await exportCsv({});
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidents_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch (e) {
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

function AdvisoryDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "tourists" as "all" | "tourists" | "officials",
  });
  const createAdvisory = useMutation(api.advisories.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdvisory(form);
      toast.success("Advisory created");
      setOpen(false);
      setForm({ title: "", message: "", audience: "tourists" });
    } catch (e) {
      toast.error("Failed to create advisory");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Advisory</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Travel Advisory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input 
              value={form.title} 
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea 
              value={form.message} 
              onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Audience</Label>
            <Select value={form.audience} onValueChange={(v: any) => setForm(p => ({ ...p, audience: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tourists">Tourists</SelectItem>
                <SelectItem value="officials">Officials</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Create Advisory</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CaseDetailDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const case_ = useQuery(api.cases.get, { caseId: caseId as any });
  const messages = useQuery(api.messages.listByCase, { caseId: caseId as any });
  const [note, setNote] = useState("");
  const addNote = useMutation(api.cases.addNote);
  const postMessage = useMutation(api.messages.postToCase);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await addNote({ caseId: caseId as any, note });
      setNote("");
      toast.success("Note added");
    } catch (e) {
      toast.error("Failed to add note");
    }
  };

  const handlePostMessage = async () => {
    if (!note.trim()) return;
    try {
      await postMessage({ caseId: caseId as any, body: note });
      setNote("");
      toast.success("Message sent");
    } catch (e) {
      toast.error("Failed to send message");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquare className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Case #{caseId.slice(-6)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-auto">
          {case_?.timeline?.map((entry: any, i: number) => (
            <div key={i} className="p-2 bg-muted rounded">
              <div className="text-sm">{entry.note}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.t).toLocaleString()}
              </div>
            </div>
          ))}
          
          {messages?.map((msg: any) => (
            <div key={msg._id} className="p-2 border rounded">
              <div className="text-sm">{msg.body}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(msg.t).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input 
            value={note} 
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note or message..."
          />
          <Button onClick={handleAddNote}>Note</Button>
          <Button onClick={handlePostMessage}>Message</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}