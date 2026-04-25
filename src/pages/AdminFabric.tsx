import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useMutation, useAction } from "convex/react";
import { useState } from "react";
import { Shield, Settings, History, FileCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminFabric() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // Layer 1: Identity
  const issue = useMutation(api.fabric.issueDigitalId);
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
        passportNumber,
        nationality,
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
    <div className="min-h-screen p-8 bg-background space-y-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Hyperledger Fabric Management</h1>
          <p className="text-muted-foreground">System Governance & Network Layer Controls</p>
        </header>

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="identity" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Identity
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Governance
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FileCheck className="h-5 w-5" /> 
                  Layer 1: User Identity Issuance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">User Reference</label>
                      <Input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Official ID Document</label>
                      <Input placeholder="Passport Number" value={passportNumber} onChange={(e) => setPassportNumber(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nationality</label>
                      <Input placeholder="Nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Expiration (UNIX MS)</label>
                      <Input placeholder="Expiry Date (ms)" value={expiryDateMs} onChange={(e) => setExpiryDateMs(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Emergency Contact Metadata (JSON)</label>
                      <Textarea rows={4} value={emergencyContactsJson} onChange={(e) => setEmergencyContactsJson(e.target.value)} />
                    </div>
                  </div>
                </div>
                <Button onClick={onIssue} disabled={loading} className="w-full md:w-auto">
                  Issue Verified Digital ID
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="governance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Settings className="h-5 w-5" /> 
                  Layer 3: Network Governance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Policy Key</label>
                    <Input placeholder="e.g. MIN_SAFETY_SCORE" value={govKey} onChange={(e) => setGovKey(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Policy Value</label>
                    <Input placeholder="e.g. 75" value={govValue} onChange={(e) => setGovValue(e.target.value)} />
                  </div>
                </div>
                <Button onClick={onUpdateGovernance} variant="secondary" disabled={loading}>
                  Commit Governance Change
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <History className="h-5 w-5" /> 
                  Layer 3: Immutable Network Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Filter by User or Org" value={auditFilter} onChange={(e) => setAuditFilter(e.target.value)} />
                  <Button onClick={onFetchAuditLogs} disabled={loading}>Fetch Logs</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-[#0a0a0a] text-green-500 border-green-900/30">
          <CardHeader className="py-3 border-b border-green-900/20">
            <CardTitle className="text-xs font-mono uppercase tracking-widest opacity-70">Blockchain Response Console</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <pre className="p-4 text-xs font-mono overflow-auto max-h-80 leading-relaxed">
              {result || "> Initializing secure gateway..."}
              {loading && "\n> CALLING FABRIC NETWORK..."}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
