import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Search, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function DigitalIdVerifier() {
    const [hash, setHash] = useState("");
    const [loading, setLoading] = useState(false);
    const [revealedData, setRevealedData] = useState<any>(null);
    const [showSensitive, setShowSensitive] = useState(false);

    const onVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hash) return;
        setLoading(true);
        setRevealedData(null);
        try {
            const response = await fetch('http://localhost:3001/api/reveal-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ digitalIdHash: hash })
            });
            const res = await response.json();

            if (res.ok) {
                setRevealedData(JSON.parse(res.data));
                toast.success("On-chain record retrieved and decrypted");
            } else {
                toast.error("Failed to retrieve record");
            }
        } catch (err: any) {
            toast.error("Connection to Fabric Gateway failed. Ensure the server is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary text-white py-6">
                <CardTitle className="font-display text-lg flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6" />
                    Hyperledger Fabric: Verifiable Data Reveal
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Authorized officials can query the immutable ledger for sensitive tourist data.
                    All reveal actions are cryptographically signed and logged for audit compliance.
                </p>

                <form onSubmit={onVerify} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Enter Digital ID Hash (DID_...)"
                            value={hash}
                            onChange={(e) => setHash(e.target.value)}
                            className="pl-10 h-12 border-2 font-mono text-xs"
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="h-12 px-6 bg-primary font-black label-caps tracking-widest text-[11px]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "QUERY LEDGER"}
                    </Button>
                </form>

                {revealedData && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="label-caps text-[10px] font-black text-emerald-500">Authenticity Confirmed</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-[10px] label-caps"
                                    onClick={() => setShowSensitive(!showSensitive)}
                                >
                                    {showSensitive ? <EyeOff className="h-3 w-3 mr-2" /> : <Eye className="h-3 w-3 mr-2" />}
                                    {showSensitive ? "Hide Sensitive" : "Reveal Data"}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1">
                                    <div className="text-muted-foreground label-caps !text-[8px]">Full Name</div>
                                    <div className="font-bold">{revealedData.fullName || "John Doe"}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-muted-foreground label-caps !text-[8px]">Nationality</div>
                                    <div className="font-bold">{revealedData.nationality}</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-muted-foreground label-caps !text-[8px]">Passport Number</div>
                                    <div className="font-mono font-bold text-primary">
                                        {showSensitive ? revealedData.passportNumber : "••••••••••••"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-muted-foreground label-caps !text-[8px]">Expiry Date</div>
                                    <div className="font-bold">{new Date(Number(revealedData.expiryDateMs)).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {showSensitive && revealedData.emergencyContactsJson && (
                                <div className="pt-3 border-t border-border mt-3 animate-in fade-in">
                                    <div className="text-muted-foreground label-caps !text-[8px] mb-2">Emergency Protocol</div>
                                    <div className="text-[10px] p-2 bg-background/50 rounded font-mono">
                                        {JSON.stringify(JSON.parse(revealedData.emergencyContactsJson), null, 2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!revealedData && !loading && (
                    <div className="p-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center opacity-40">
                        <AlertTriangle className="h-8 w-8 mb-2" />
                        <p className="label-caps text-[9px]">Awaiting Hash for On-Chain Attestation</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
