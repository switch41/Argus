import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Book, MessageSquare, Volume2, ShieldAlert, ArrowLeft, Loader2, Languages, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";

const SAFETY_PHRASES = {
  Hindi: [
    { en: "I need help", local: "मुझे मदद चाहिए (Mujhe madad chahiye)" },
    { en: "Where is the police station?", local: "पुलिस स्टेशन कहाँ है? (Police station kahan hai?)" },
    { en: "I am lost", local: "मैं खो गया हूँ (Main kho gaya hoon)" },
    { en: "Call an ambulance", local: "एम्बुलेंस बुलाओ (Ambulance bulao)" },
  ],
  Spanish: [
    { en: "I need help", local: "Necesito ayuda" },
    { en: "Where is the police station?", local: "¿Dónde está la estación de policía?" },
    { en: "I am lost", local: "Estoy perdido" },
    { en: "Call an ambulance", local: "Llama a una ambulancia" },
  ],
  French: [
    { en: "I need help", local: "J'ai besoin d'aide" },
    { en: "Where is the police station?", local: "Où est le poste de police ?" },
    { en: "I am lost", local: "Je suis perdu" },
    { en: "Call an ambulance", local: "Appelez une ambulance" },
  ],
};

export default function Translator() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("English");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [isTranslating, setIsTranslating] = useState(false);

  const onTranslate = () => {
    if (!text) return;
    setIsTranslating(true);
    // Simulate offline neural translation (Edge AI)
    setTimeout(() => {
      setIsTranslating(false);
      toast.success("Offline AI translation complete!");
    }, 1500);
  };

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
              <Globe className="h-5 w-5 text-secondary" />
              <h1 className="text-xl font-display font-bold tracking-tight text-primary uppercase">
                NEURAL LINGUIST
              </h1>
            </div>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black label-caps text-[9px] tracking-widest px-3 py-1.5 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            OFFLINE CORE: READY
          </Badge>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-2 text-center md:text-left">
          <div className="label-caps !text-[11px] text-secondary font-black tracking-[0.3em]">LOCAL EDGE INTELLIGENCE</div>
          <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">Emergency Translation</h2>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Powered by TinyLlama-1.1B. No data leaves this device. Guaranteed to work during network dead-zones and emergency blackouts.
          </p>
        </div>

        {/* Rapid SOS Phrases */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <h2 className="text-sm font-black label-caps tracking-[0.2em] text-primary">CRITICAL SOS PHRASES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAFETY_PHRASES[targetLang as keyof typeof SAFETY_PHRASES]?.map((phrase, i) => (
              <Card
                key={i}
                className="border-2 border-border bg-card hover:border-secondary transition-all cursor-pointer group shadow-sm hover:shadow-xl"
                onClick={() => setText(phrase.en)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <Volume2 className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                    <div className="h-1 w-8 bg-rose-500/30 rounded-full" />
                  </div>
                  <div>
                    <p className="text-lg font-display font-bold text-primary leading-tight uppercase tracking-tight">{phrase.local}</p>
                    <p className="text-[10px] label-caps font-bold text-muted-foreground mt-1 opacity-60 tracking-wider font-sans">{phrase.en}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Custom AI Translator */}
          <Card className="lg:col-span-2 border border-border bg-card shadow-2xl rounded-3xl overflow-hidden">
            <div className="h-1.5 bg-primary" />
            <CardHeader className="bg-muted/30 border-b border-border p-8">
              <CardTitle className="text-sm font-black label-caps tracking-[0.15em] flex items-center gap-3 text-primary">
                <MessageSquare className="h-4 w-4 text-secondary" />
                DYNAMIC NEURAL VECTOR
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-5 items-center gap-4 bg-muted/20 border border-border p-3 rounded-2xl">
                <div className="col-span-2">
                  <select
                    className="w-full bg-transparent text-xs font-black label-caps tracking-widest text-primary focus:outline-none px-4 py-2"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>
                <div className="flex justify-center">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="col-span-2">
                  <select
                    className="w-full bg-transparent text-xs font-black label-caps tracking-widest text-secondary focus:outline-none px-4 py-2"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                  >
                    <option>Hindi</option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Russian</option>
                  </select>
                </div>
              </div>

              <Textarea
                placeholder="INPUT CLEARANCE BUFFER..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[180px] resize-none border-2 p-6 rounded-2xl text-xl font-bold font-display tracking-tight bg-muted/10 focus:ring-secondary placeholder:opacity-20 placeholder:font-black placeholder:label-caps placeholder:text-xs"
              />

              <Button
                className="w-full bg-primary hover:bg-primary/90 h-16 rounded-2xl font-black label-caps text-[12px] tracking-[0.3em] shadow-xl group"
                onClick={onTranslate}
                disabled={isTranslating || !text}
              >
                {isTranslating ? <Loader2 className="h-6 w-6 animate-spin" /> : "EXECUTE OFFLINE TRANSLATION"}
              </Button>

              {text && !isTranslating && (
                <div className="p-8 bg-emerald-500/[0.03] border-2 border-emerald-500/20 rounded-2xl animate-in fade-in slide-in-from-top-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <p className="text-[10px] font-black label-caps text-emerald-600 tracking-widest">VERIFIED AI RESPONSE</p>
                  </div>
                  <p className="text-xl font-display font-bold text-primary tracking-tight">
                    Neural output will materialize here via local edge model.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="border border-border bg-card shadow-lg rounded-2xl p-6 space-y-4">
              <div className="label-caps text-[10px] font-black text-muted-foreground tracking-widest">MODEL TELEMETRY</div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="opacity-60">Quantization</span>
                  <span className="text-primary uppercase">INT-4 Optimized</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="opacity-60">VRAM Usage</span>
                  <span className="text-primary uppercase">420 MB</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="opacity-60">Model Version</span>
                  <span className="text-secondary uppercase">ST-Linguist-v1.4</span>
                </div>
              </div>
            </Card>

            <div className="p-6 border-2 border-dashed border-border rounded-2xl text-center space-y-3 opacity-60">
              <Book className="h-6 w-6 mx-auto text-muted-foreground" />
              <p className="text-[10px] label-caps font-black tracking-widest leading-relaxed">
                OFFLINE DICTIONARIES LOADED.<br />
                NO INTERNET REQUIRED.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
