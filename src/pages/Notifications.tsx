import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Bell, CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const notifications = useQuery(api.notifications.getMyNotifications);
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  useEffect(() => {
    if (!isAuthenticated) navigate("/auth");
  }, [isAuthenticated, navigate]);

  const markAll = async () => {
    try {
      await markAllRead({});
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6" />
            <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={markAll}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!notifications ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-sm text-muted-foreground">No notifications.</div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n._id}
                  className={`p-4 border rounded-lg flex items-center justify-between ${
                    n.isRead ? "bg-white" : "bg-muted/40"
                  }`}
                >
                  <div>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                  </div>
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await markRead({ notificationId: n._id as any });
                        } catch {
                          toast.error("Failed to mark as read.");
                        }
                      }}
                    >
                      Mark read
                    </Button>
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