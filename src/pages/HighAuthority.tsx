import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
    Shield,
    BarChart3,
    Map,
    Activity,
    Bell,
    Users,
    FileText,
    Settings,
    ArrowLeft,
    Briefcase,
    TrendingUp,
    AlertOctagon
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import AnalyticsCard from "@/components/dashboard/AnalyticsCard";
import HeatmapCard from "@/components/dashboard/HeatmapCard";
import GeofenceManager from "@/components/dashboard/GeofenceManager";
import DigitalIdVerifier from "@/components/dashboard/DigitalIdVerifier";

export default function HighAuthority() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const metrics = [
        { label: "National Safety Index", value: "94.2", trend: "+1.2%", icon: Shield, color: "text-emerald-500" },
        { label: "Active Regional Alerts", value: "12", trend: "-5", icon: AlertOctagon, color: "text-accent" },
        { label: "Tourist Saturation", value: "85%", trend: "Stable", icon: Users, color: "text-secondary" },
        { label: "System Health", value: "99.9%", trend: "Optimal", icon: Activity, color: "text-primary" },
    ];

    return (
        <div className="min-h-screen bg-background font-sans">
            {/* Header */}
            <header className="border-b border-border bg-primary text-white sticky top-0 z-50 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/dashboard")}
                            className="text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-display font-black tracking-tight uppercase">High Authority Strategic Console</h1>
                            <div className="label-caps !text-[9px] text-white/60 tracking-[0.2em] font-black">National Security & Tourism Oversight</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end px-4 border-r border-white/10">
                            <span className="label-caps text-[9px] text-white/50 text-right">Authenticated Authority</span>
                            <span className="text-[10px] font-black text-secondary uppercase">{user?.name || user?.email} // {user?.role}</span>
                        </div>
                        <div className="p-2 bg-secondary rounded-lg shadow-lg">
                            <Briefcase className="h-5 w-5 text-white" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                {/* Strategic Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 bg-muted rounded-lg ${m.color}`}>
                                            <m.icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            {m.trend}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-3xl font-display font-black tracking-tighter">{m.value}</div>
                                        <div className="label-caps !text-[10px] text-muted-foreground">{m.label}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Visualizations */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
                            <CardHeader className="bg-muted/30 border-b border-border py-6 flex flex-row items-center justify-between">
                                <CardTitle className="font-display text-xl flex items-center gap-3">
                                    <Map className="h-6 w-6 text-primary" />
                                    National Risk Distribution Heatmap
                                </CardTitle>
                                <Button variant="outline" size="sm" className="font-bold label-caps text-[10px] border-2">
                                    Update Ledger
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0 h-[400px]">
                                <HeatmapCard />
                            </CardContent>
                        </Card>

                        <Card className="border border-border">
                            <CardHeader className="py-4 border-b border-border bg-muted/20">
                                <CardTitle className="label-caps !text-[11px] font-black opacity-60">System-Wide Analytics</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <AnalyticsCard />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Strategic Actions & Geo-fencing */}
                    <div className="space-y-8">
                        <DigitalIdVerifier />
                        <GeofenceManager />

                        <Card className="border-2 border-secondary/20 shadow-xl">
                            <CardHeader className="bg-secondary text-white py-6">
                                <CardTitle className="font-display text-lg flex items-center gap-3">
                                    <Bell className="h-6 w-6" />
                                    Issue Travel Advisory
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Broadcast strategic safety directives to all tourists and officials within the jurisdiction.
                                </p>
                                <Button className="w-full bg-secondary hover:bg-secondary/90 font-black label-caps tracking-widest text-[11px] h-12 shadow-lg">
                                    Initialize Advisory Broadcast
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border border-border">
                            <CardHeader className="py-4 border-b border-border bg-muted/20">
                                <CardTitle className="label-caps !text-[11px] font-black opacity-60">Policy Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <Button variant="outline" className="w-full justify-between h-12 font-bold text-sm border-2" onClick={() => navigate("/admin/fabric")}>
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-4 w-4 text-primary" />
                                        Network Governance
                                    </div>
                                    <Settings className="h-4 w-4 opacity-40" />
                                </Button>
                                <Button variant="outline" className="w-full justify-between h-12 font-bold text-sm border-2">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-primary" />
                                        Audit Logs (Global)
                                    </div>
                                    <Settings className="h-4 w-4 opacity-40" />
                                </Button>
                                <Button variant="outline" className="w-full justify-between h-12 font-bold text-sm border-2">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-4 w-4 text-primary" />
                                        Export Compliance Report
                                    </div>
                                    <Settings className="h-4 w-4 opacity-40" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
