import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { ShieldUser } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Profile() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Add Fabric actions and local state
  const getUserWalletAction = useAction(api.fabric.getUserWallet);
  const linkWalletAction = useAction(api.fabric.linkWallet);
  const createUserProfileAction = useAction(api.fabric.createUserProfile);

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
        const res = await getUserWalletAction({ userId: (user._id as any) as string });
        if (!cancelled) {
          if (res?.ok) {
            const data = res.data ?? "";
            try {
              const parsed = JSON.parse(data);
              const val =
                typeof parsed === "string"
                  ? parsed
                  : parsed.wallet || parsed.address || data;
              setLinkedWallet(val || null);
            } catch {
              setLinkedWallet(data || null);
            }
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
  }, [isAuthenticated, user?._id, getUserWalletAction]);

  // Handlers
  const handleCreateOnChainProfile = async () => {
    if (!user?._id) return;
    try {
      setIsLoadingWallet(true);
      const userType =
        user.role === "police" || user.role === "tourism_official" ? "operator" : "tourist";
      await createUserProfileAction({
        userId: (user._id as any) as string,
        userType,
      });
      toast.success("On-chain profile created");
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
      await linkWalletAction({
        userId: (user._id as any) as string,
        walletAddress: addr,
      });
      toast.success("Wallet linked");
      setLinkedWallet(addr);
      setWalletAddress("");
    } catch (e) {
      toast.error("Failed to link wallet");
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background"
    >
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldUser className="h-6 w-6" />
            <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{user?.name || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{user?.email || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Role</div>
                <div className="font-medium capitalize">{user?.role || "tourist"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">User ID</div>
                <div className="font-mono text-xs break-all">{user?._id}</div>
              </div>
            </div>

            <div className="pt-4">
              <Button variant="outline" onClick={() => navigate("/notifications")}>
                View Notifications
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Wallet */}
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Linked Wallet:{" "}
              <span className="font-mono">
                {isLoadingWallet ? "Loading..." : linkedWallet || "Not linked"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium mb-1">Wallet Address</div>
                <Input
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>
              <Button onClick={handleLinkWallet} disabled={isLinking || !walletAddress.trim()}>
                {isLinking ? "Linking..." : "Link Wallet"}
              </Button>
              <Button variant="outline" onClick={handleCreateOnChainProfile} disabled={isLoadingWallet}>
                Create On-Chain Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}