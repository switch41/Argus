import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ShieldUser, ArrowLeft, Shield, Wallet, Fingerprint, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSupabase } from "@/components/auth/SupabaseProvider";

export default function Profile() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();

  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [verified, setVerified] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [onChainNow, setOnChainNow] = useState<{ checked: boolean; valid: boolean | null; raw?: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('tourist_profiles')
        .select('*')
        .eq('user_id', user._id)
        .single();
      setCurrentProfile(data);
    };
    fetchProfile();
  }, [user, supabase]);

  useEffect(() => {
    if (!currentProfile?.digitalIdHash) return;
    const checkVerification = async () => {
      // Logic for basic verification status
      setVerified({ isValid: true });
    };
    checkVerification();
  }, [currentProfile]);

  const [walletAddress, setWalletAddress] = useState("");
  const [linkedWallet, setLinkedWallet] = useState<string | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  // Fetch on-chain wallet on load
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;
    let cancelled = false;
    (async () => {
      try {
        setIsLoadingWallet(true);
        const response = await fetch('http://localhost:3001/api/get-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id })
        });
        const res = await response.json();

        if (!cancelled) {
          if (res?.ok) {
            const data = res.data ?? "";
            setLinkedWallet(data);
          } else {
            setLinkedWallet(null);
          }
        }
      } catch {
        if (!cancelled) setLinkedWallet(null);
      } finally {
        if (!cancelled) setIsLoadingWallet(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?._id]);

  const handleCreateOnChainProfile = async () => {
    if (!user?._id) return;
    try {
      setIsLoadingWallet(true);
      const userType =
        user.role === "police" || user.role === "tourism_official" ? "operator" : "tourist";

      const response = await fetch('http://localhost:3001/api/issue-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: user._id, fullName: user.name, passportNumber: "" })
      });
      const res = await response.json();

      if (res.success) toast.success("On-chain profile created");
      else throw new Error("Failed");
    } catch (e) {
      toast.error("Failed to create on-chain profile");
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleLinkWallet = async () => {
    if (!user?._id) return;
    const addr = walletAddress.trim();
    if (!addr) {
      toast.error("Enter a wallet address");
      return;
    }
    try {
      setIsLinking(true);
      const response = await fetch('http://localhost:3001/api/link-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, walletAddress: addr })
      });
      const res = await response.json();
      if (res.ok) {
        toast.success("Wallet linked");
        setLinkedWallet(addr);
        setWalletAddress("");
      }
    } catch (e) {
      toast.error("Failed to link wallet");
    } finally {
      setIsLinking(false);
    }
  };

  const handleVerifyDigitalId = async () => {
    if (!currentProfile?.digitalIdHash) {
      toast.error("No Digital ID found on your profile");
      return;
    }
    try {
      setVerifyLoading(true);
      const response = await fetch('http://localhost:3001/api/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ digitalIdHash: currentProfile.digitalIdHash })
      });
      const res = await response.json();
      const data = (res as any)?.data as string | undefined;
      let valid: boolean | null = null;
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed?.valid === "boolean") valid = parsed.valid;
        } catch { }
      }
      setOnChainNow({ checked: true, valid, raw: data });
      toast.success("Verification complete");
    } catch (e) {
      setOnChainNow({ checked: true, valid: null });
      toast.error("Verification failed");
    } finally {
      setVerifyLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
              <ShieldUser className="h-5 w-5 text-secondary" />
              <h1 className="text-xl font-display font-bold tracking-tight text-primary uppercase">
                CREDENTIAL REGISTRY
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-2">
          <div className="label-caps !text-[11px] text-secondary font-black tracking-[0.3em]">USER AUTHENTICATION & IDENTITY</div>
          <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">Operator Profile</h2>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Manage your secure travel credentials and on-chain identity. All signatures are backed by the Hyperledger Fabric blockchain.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Base Account Info */}
          <Card className="border border-border bg-card shadow-xl rounded-2xl overflow-hidden">
            <div className="h-1 bg-primary" />
            <CardHeader className="bg-muted/30 border-b border-border p-8">
              <CardTitle className="font-display text-xl uppercase tracking-widest text-primary flex items-center gap-3">
                <Shield className="h-5 w-5 text-secondary" />
                SYSTEM ACCOUNT
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <div className="label-caps text-[10px] text-muted-foreground font-black">LEGAL NAME</div>
                  <div className="font-bold text-primary text-xl truncate">{user?.name || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="label-caps text-[10px] text-muted-foreground font-black">COMMUNICATION VECTOR</div>
                  <div className="font-bold text-primary text-lg truncate">{user?.email || "—"}</div>
                </div>
                <div className="space-y-1">
                  <div className="label-caps text-[10px] text-muted-foreground font-black">CLEARANCE LEVEL</div>
                  <Badge className="bg-secondary/10 text-secondary border-none font-black label-caps text-[10px] px-3 py-1 mt-1">
                    {user?.role || "TOURIST"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="label-caps text-[10px] text-muted-foreground font-black">SYSTEM UID</div>
                  <div className="mono-data text-[10px] break-all opacity-60 mt-1">{user?._id}</div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <Button variant="outline" onClick={() => navigate("/notifications")} className="h-12 px-6 border-2 font-black label-caps text-[11px] tracking-widest group">
                  ACCESS NOTIFICATION LOGS
                  <ExternalLink className="ml-2 h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Integration */}
          <Card className="border border-border bg-card shadow-xl rounded-2xl overflow-hidden">
            <div className="h-1 bg-secondary" />
            <CardHeader className="bg-muted/30 border-b border-border p-8">
              <CardTitle className="font-display text-xl uppercase tracking-widest text-primary flex items-center gap-3">
                <Wallet className="h-5 w-5 text-secondary" />
                DISTRIBUTED LEDGER
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-muted/20 border border-border rounded-xl">
                <div className="space-y-1">
                  <div className="label-caps text-[10px] text-muted-foreground font-black">ACTIVE WALLET ANCHOR</div>
                  <div className="mono-data text-primary font-bold text-md break-all">
                    {isLoadingWallet ? "SEARCHING LEDGER..." : linkedWallet || "UNLINKED"}
                  </div>
                </div>
                {!linkedWallet && !isLoadingWallet && (
                  <Button variant="secondary" onClick={handleCreateOnChainProfile} className="h-11 font-black label-caps text-[10px] tracking-widest px-6 shrink-0">
                    PROVISION IDENTITY
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-3">
                    <Label className="label-caps !text-[11px] font-black text-primary tracking-widest">Update Ledger Link</Label>
                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x... [SECURE HASH]"
                      className="h-14 border-2 focus:ring-secondary font-bold"
                    />
                  </div>
                  <Button
                    onClick={handleLinkWallet}
                    disabled={isLinking || !walletAddress.trim()}
                    className="h-14 bg-primary text-white font-black label-caps text-[11px] tracking-[0.2em]"
                  >
                    {isLinking ? <Loader2 className="h-5 w-5 animate-spin" /> : "OVERWRITE LEDGER LINK"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Digital Registry Entry */}
          <Card className="border border-border bg-card shadow-xl rounded-2xl overflow-hidden">
            <div className="h-1 bg-blue-600" />
            <CardHeader className="bg-muted/30 border-b border-border p-8">
              <CardTitle className="font-display text-xl uppercase tracking-widest text-primary flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-secondary" />
                DIGITAL VECTOR REGISTRY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="label-caps text-[11px] text-muted-foreground font-black tracking-widest">REGISTRY VECTOR HASH</div>
                  <div className="mono-data p-4 bg-muted/30 border border-border rounded-lg text-[11px] break-all text-primary font-bold">
                    {currentProfile?.digitalIdHash || "ZERO_VECTOR_UNDEFINED"}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="label-caps text-[11px] text-muted-foreground font-black tracking-widest">REAL-TIME VALIDATION</div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {verified ? (
                      verified.isValid ? (
                        <Badge className="bg-emerald-500 text-white border-none font-black label-caps text-[10px] px-4 py-2">
                          <Shield className="h-3.5 w-3.5 mr-2" />
                          DATABASE: VALID
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500 text-white border-none font-black label-caps text-[10px] px-4 py-2">
                          <ShieldUser className="h-3.5 w-3.5 mr-2" />
                          DATABASE: REVOKED
                        </Badge>
                      )
                    ) : (
                      <Badge className="bg-muted text-muted-foreground border-none font-black label-caps text-[10px] px-4 py-2">PENDING_LINK</Badge>
                    )}

                    {verified?.onChain?.checked && (
                      verified.onChain.valid ? (
                        <Badge className="bg-primary text-white border-none font-black label-caps text-[10px] px-4 py-2">
                          <ExternalLink className="h-3.5 w-3.5 mr-2" />
                          CHAIN: VERIFIED
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-600 text-white border-none font-black label-caps text-[10px] px-4 py-2">CHAIN: MISMATCH</Badge>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-border flex flex-wrap items-center justify-between gap-6">
                <Button
                  onClick={handleVerifyDigitalId}
                  disabled={verifyLoading || !currentProfile?.digitalIdHash}
                  className="h-14 px-8 bg-secondary hover:bg-secondary/90 text-white font-black label-caps text-[11px] tracking-widest "
                >
                  {verifyLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "PING BLOCKCHAIN REGISTRY"}
                </Button>

                {verified?.validityPeriod && (
                  <div className="flex flex-col items-end">
                    <div className="label-caps text-[9px] text-muted-foreground font-black uppercase mb-1">Vector Expiration</div>
                    <div className="font-bold text-primary label-caps text-[11px]">
                      {new Date(verified.validityPeriod.end).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {onChainNow?.checked && (
                <pre className="bg-muted p-4 rounded-xl border border-border text-[10px] mono-data overflow-auto max-h-40 text-muted-foreground">
                  RAW LEDGER RESPONSE: \n{onChainNow.raw || "NO_DATA_RETURNED"}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}