import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useMutation, useAction } from "convex/react";
import { useState } from "react";
import { Shield, Settings, History, FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminFabric() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // Layer 1: Identity
  const issue = useAction(api.fabric.issueDigitalId);
  const [userId, setUserId] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [emergencyContactsJson, setEmergencyContactsJson] = useState('{"emergencyContact1":{"name":"Test","phone":"000","relationship":"self"}}');
  const [expiryDateMs, setExpiryDateMs] = useState(String(Date.now() + 7 * 24 * 60 * 60 * 1000));

  // Layer 3: Governance
  const updateGovernance = useAction(api.fabric.updateSystemGovernance);
  const [govKey, setGovKey] = useState("SAFETY_THRESHOLD");
  const [govValue, setGovValue] = useState("70");

  // Layer 3: Audit Logs
  const getAuditLogs = useAction(api.fabric.getGlobalAuditLogs);
  const [auditFilter, setAuditFilter] = useState("");

  const onIssue = async () => {
    setLoading(true);
    try {
      const res = await issue({
        userId,
        fullName: "System Restricted",
        passportNumber,
        nationality,
        dateOfBirth: "1970-01-01",
        bloodGroup: "U",
        medicalConditionsJson: "{}",
        emergencyContactsJson,
        itineraryJson: "{}",
        expiryDateMs: Number(expiryDateMs),
      });
      setResult(JSON.stringify(res, null, 2));
      toast.success("Identity Issued");
    } catch (e: any) {
      setResult(String(e?.message || e));
      toast.error("Failed to issue");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateGovernance = async () => {
    setLoading(true);
    try {
      const res = await updateGovernance({
        settingKey: govKey,
        settingValue: govValue,
      });
      setResult(JSON.stringify(res, null, 2));
      toast.success("Governance Updated");
    } catch (e: any) {
      setResult(String(e?.message || e));
      toast.error("Failed to update governance");
    } finally {
      setLoading(false);
    }
  };

  const onFetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({ filter: auditFilter });
      setResult(JSON.stringify(res, null, 2));
      toast.success("Logs Fetched");
    } catch (e: any) {
      setResult(String(e?.message || e));
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Header Segment */}
      <header className="border-b border-border bg-primary text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight uppercase">Hyperledger Fabric Kernel</h1>
              <div className="label-caps !text-[9px] text-white/60 tracking-[0.2em] font-black">Multi-Org Network Governance</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="label-caps text-[9px] text-white/50">Network Status</span>
              <span className="text-[10px] font-black text-secondary uppercase animate-pulse">Connected // Channel_Main</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/dashboard"}
              className="text-white hover:bg-white/10 label-caps text-[10px] font-bold"
            >
              Exit Console
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-2">
            <div className="label-caps !text-[11px] text-secondary font-black tracking-[0.3em]">ADMINISTRATIVE INTERFACE</div>
            <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">System Orchestration</h2>
          </div>
          <Tabs defaultValue="identity" className="w-full md:w-auto">
            <TabsList className="bg-muted p-1 border border-border h-12">
              <TabsTrigger value="identity" className="h-10 px-6 font-display font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary">
                Identity
              </TabsTrigger>
              <TabsTrigger value="governance" className="h-10 px-6 font-display font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary">
                Governance
              </TabsTrigger>
              <TabsTrigger value="audit" className="h-10 px-6 font-display font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary">
                Audit
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="identity" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 border border-border bg-card shadow-xl overflow-hidden rounded-xl">
                    <div className="p-1 bg-secondary" />
                    <CardHeader className="bg-muted/30 border-b border-border py-6">
                      <CardTitle className="font-display text-xl flex items-center gap-3">
                        <FileCheck className="h-6 w-6 text-secondary" />
                        Layer 1: Identity Provisioning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="label-caps !text-[10px] text-primary font-black">User Reference Hash</Label>
                            <Input placeholder="UID-HEX-8822" value={userId} onChange={(e) => setUserId(e.target.value)} className="h-12 border-2 focus:ring-secondary font-mono" />
                          </div>
                          <div className="space-y-2">
                            <Label className="label-caps !text-[10px] text-primary font-black">Official Document ID</Label>
                            <Input placeholder="PASSPORT_NUM" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} className="h-12 border-2 focus:ring-secondary font-mono" />
                          </div>
                          <div className="space-y-2">
                            <Label className="label-caps !text-[10px] text-primary font-black">Registry Nationality</Label>
                            <Input placeholder="COUNTRY_CODE" value={nationality} onChange={(e) => setNationality(e.target.value)} className="h-12 border-2 focus:ring-secondary font-medium uppercase" />
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <Label className="label-caps !text-[10px] text-primary font-black">Expiration Vector (UNIX MS)</Label>
                            <Input placeholder="EXPIRY_TIMESTAMP" value={expiryDateMs} onChange={(e) => setExpiryDateMs(e.target.value)} className="h-12 border-2 focus:ring-secondary font-mono" />
                          </div>
                          <div className="space-y-2">
                            <Label className="label-caps !text-[10px] text-primary font-black">Biometric Metadata Payload (JSON)</Label>
                            <Textarea rows={4} value={emergencyContactsJson} onChange={(e) => setEmergencyContactsJson(e.target.value)} className="border-2 focus:ring-secondary font-mono text-xs p-4" />
                          </div>
                        </div>
                      </div>
                      <div className="pt-6 border-t border-border">
                        <Button onClick={onIssue} disabled={loading} className="w-full h-14 text-lg font-display font-black tracking-widest bg-primary hover:bg-primary/90 glow-primary transition-all">
                          {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "EXECUTE PROVISIONING"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-border bg-muted/20 rounded-xl flex flex-col">
                    <CardHeader className="py-4 border-b border-border bg-white/50">
                      <CardTitle className="label-caps !text-[10px] font-black opacity-60">System Security Logs</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 flex flex-col">
                      <div className="flex-1 overflow-auto bg-[#0a0f1d] text-[#0066FF] font-mono text-[11px] p-6 leading-relaxed selection:bg-secondary selection:text-white">
                        <div className="opacity-50 mb-2">SAFE-TRAVEL-ID HYPERLEDGER CLI V1.0.4</div>
                        <div className="text-secondary mb-4">AUTHENTICATED AS SYSTEM_ADMIN_ROOT</div>
                        <pre className="whitespace-pre-wrap">
                          {result || "> Initializing secure gateway..."}
                          {loading && "\n\n> [PROCESS] INVOKING CHAINCODE: issueIdentity\n> [INFO] TRANSACTING WITH PEER0.ORG1\n> [INFO] WAITING FOR ENDORSEMENT..."}
                        </pre>
                        {loading && <div className="h-2 w-20 bg-secondary/20 rounded-full mt-4 overflow-hidden relative"><div className="absolute inset-0 bg-secondary animate-shimmer" /></div>}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="governance" className="mt-0">
                <Card className="border border-border bg-card shadow-xl overflow-hidden rounded-xl max-w-4xl">
                  <div className="p-1 bg-accent" />
                  <CardHeader className="bg-muted/30 border-b border-border py-6">
                    <CardTitle className="font-display text-xl flex items-center gap-3">
                      <Settings className="h-6 w-6 text-accent" />
                      Layer 3: Network Governance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="label-caps !text-[10px] text-primary font-black">Policy Setting Key</Label>
                        <Input placeholder="MIN_SAFETY_THRESHOLD" value={govKey} onChange={(e) => setGovKey(e.target.value)} className="h-12 border-2 focus:ring-accent font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label className="label-caps !text-[10px] text-primary font-black">Variable Configuration Value</Label>
                        <Input placeholder="0.85" value={govValue} onChange={(e) => setGovValue(e.target.value)} className="h-12 border-2 focus:ring-accent font-mono" />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-border">
                      <Button onClick={onUpdateGovernance} disabled={loading} className="w-full h-14 text-lg font-display font-black tracking-widest bg-accent hover:bg-accent/90 transition-all">
                        {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "PATCH SYSTEM GOVERNANCE"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="mt-0">
                <Card className="border border-border bg-card shadow-xl overflow-hidden rounded-xl max-w-4xl">
                  <div className="p-1 bg-primary" />
                  <CardHeader className="bg-muted/30 border-b border-border py-6">
                    <CardTitle className="font-display text-xl flex items-center gap-3 text-primary">
                      <History className="h-6 w-6" />
                      Layer 3: Immutable Event Ledger
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 space-y-2">
                        <Label className="label-caps !text-[10px] text-primary font-black">Audit Sequence Filter</Label>
                        <Input placeholder="Filter by Participant OR Transaction ID" value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} className="h-12 border-2 focus:ring-primary font-medium" />
                      </div>
                      <Button onClick={onFetchAuditLogs} disabled={loading} className="h-12 px-8 font-display font-black tracking-widest uppercase text-[12px] bg-primary group transition-all">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><History className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-500" /> SYNC LEDGER</>}
                      </Button>
                    </div>
                    <div className="p-4 bg-muted border border-border rounded-lg">
                      <p className="text-[10px] label-caps text-muted-foreground italic">Note: All ledger queries are cryptographically signed and logged for compliance auditing.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
