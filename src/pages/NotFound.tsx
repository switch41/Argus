import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background font-sans flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="space-y-6 max-w-md w-full">
        <div className="flex justify-center">
          <div className="p-6 bg-secondary/10 rounded-full border-2 border-secondary/20">
            <ShieldAlert className="h-12 w-12 text-secondary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-8xl font-display font-black text-primary tracking-tighter italic">404</h1>
          <div className="label-caps !text-[11px] font-black text-secondary tracking-[0.4em] uppercase">ACCESS DENIED // NULL VECTOR</div>
        </div>

        <p className="text-muted-foreground font-medium text-lg leading-relaxed">
          The requested coordinate does not exist in the safe-travel registry. The entry may have been purged or moved to a higher clearance sector.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-14 px-8 border-2 font-black label-caps text-[11px] tracking-widest uppercase"
          >
            <ArrowLeft className="h-4 w-4 mr-3" />
            Return to previous
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black label-caps text-[11px] tracking-widest uppercase shadow-xl"
          >
            <Home className="h-4 w-4 mr-3" />
            Main Terminal
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] label-caps font-black text-muted-foreground/30 tracking-[0.5em]">
        SYSTEM_ID: SAFE-TRAVEL-OS // VERSION: 4.0.1
      </div>
    </motion.div>
  );
}
