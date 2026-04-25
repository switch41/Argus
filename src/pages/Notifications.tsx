import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Bell, CheckCheck, ArrowLeft, Shield, Clock, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="font-bold label-caps text-[10px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              TERMINAL
            </Button>
            <div className="h-6 w-[1px] bg-border" />
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-secondary" />
              <h1 className="text-xl font-display font-bold tracking-tight text-primary uppercase">
                SIGNAL ARCHIVE
              </h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={markAll} className="font-black label-caps text-[10px] tracking-widest bg-secondary/10 text-secondary hover:bg-secondary/20 h-10 px-4">
            <CheckCheck className="h-4 w-4 mr-2" />
            FLUSH BUFFER
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-2">
          <div className="label-caps !text-[11px] text-secondary font-black tracking-[0.3em]">COMMUNICATION LOGS</div>
          <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">System Broadcasts</h2>
          <p className="text-muted-foreground font-medium max-w-lg">
            Review critical updates, security alerts, and system telemetry. All messages are synchronized with the primary safety grid in real-time.
          </p>
        </div>

        <Card className="border border-border bg-card shadow-2xl rounded-2xl overflow-hidden mb-12">
          <div className="p-1 bg-secondary" />
          <CardHeader className="bg-muted/30 border-b border-border p-6 px-8">
            <CardTitle className="font-display text-sm uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              RECENT SIGNALS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!notifications ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-secondary" />
                <span className="label-caps font-black text-[10px]">Syncing Archive...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-20 text-center italic text-muted-foreground text-sm font-medium">
                No active signals found in the current epoch.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n: any) => (
                  <div
                    key={n._id}
                    className={`p-6 md:p-8 flex items-start justify-between gap-6 transition-colors hover:bg-muted/10 ${n.isRead ? "opacity-60" : "bg-secondary/[0.03]"
                      }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`mt-1 p-2.5 rounded-lg ${n.isRead ? "bg-muted text-muted-foreground" : "bg-secondary text-white shadow-lg"}`}>
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display font-bold text-lg tracking-tight text-primary uppercase">{n.title}</h3>
                          {!n.isRead && <Badge className="bg-secondary text-white border-none label-caps text-[8px] font-black h-4 px-2">UNREAD</Badge>}
                        </div>
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed max-w-xl">{n.message}</p>
                        <div className="flex items-center gap-2 text-[9px] font-black label-caps text-muted-foreground/60 pt-2">
                          <Clock className="h-3 w-3" />
                          EPOCH: {new Date(n._creationTime).toLocaleTimeString()} // {new Date(n._creationTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {!n.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await markRead({ notificationId: n._id as any });
                          } catch {
                            toast.error("Failed to mark as read.");
                          }
                        }}
                        className="font-black label-caps text-[9px] tracking-widest text-secondary hover:bg-secondary/10"
                      >
                        ACKNOWLEDGE
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}