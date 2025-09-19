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
  const allAlerts = useQuery(api.alerts.getAllActiveAlerts, isOfficial ? {} : undefined);
  const alertStats = useQuery(api.alerts.getAlertStats, isOfficial ? {} : undefined);
  const allTourists = useQuery(api.tourists.getAllActiveTourists, isOfficial ? {} : undefined);

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
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
              className="font-medium"
            >
              Profile
            </Button>
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
                        {myAlerts.slice(0, 3).map((alert) => (
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
                    {allAlerts.slice(0, 5).map((alert) => (
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
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => navigate(`/alert/${alert._id}`)}>
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            Assign
                          </Button>
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