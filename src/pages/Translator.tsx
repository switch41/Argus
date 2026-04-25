import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Book, MessageSquare, Volume2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold">Offline Translator</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Back</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Rapid SOS Phrases */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Immediate Safety Phrases</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SAFETY_PHRASES[targetLang as keyof typeof SAFETY_PHRASES]?.map((phrase, i) => (
              <Card key={i} className="hover:border-indigo-400 transition-colors cursor-pointer" onClick={() => setText(phrase.en)}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{phrase.local}</p>
                    <p className="text-xs text-slate-500">{phrase.en}</p>
                  </div>
                  <Volume2 className="h-4 w-4 text-slate-400" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Custom AI Translator */}
        <Card className="shadow-lg border-indigo-100">
          <CardHeader className="bg-indigo-50/50 border-b">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Custom Translation (Edge AI Powered)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-lg">
              <select 
                className="bg-transparent text-sm font-medium focus:outline-none"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
              <Globe className="h-4 w-4 text-slate-400" />
              <select 
                className="bg-transparent text-sm font-medium focus:outline-none"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
              >
                <option>Hindi</option>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>

            <Textarea 
              placeholder="Type or paste text to translate..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] resize-none"
            />

            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12"
              onClick={onTranslate}
              disabled={isTranslating || !text}
            >
              {isTranslating ? "Processing Edge AI..." : "Translate Offline"}
            </Button>

            {text && !isTranslating && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg animate-in fade-in slide-in-from-top-1">
                <p className="text-xs font-semibold text-emerald-700 mb-1 uppercase tracking-wider">Result</p>
                <p className="text-slate-800 font-medium">Translated output will appear here via local model.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Translation History/Glossary */}
        <div className="flex items-center gap-2 justify-center text-slate-400 py-4">
          <Book className="h-4 w-4" />
          <span className="text-xs">Edge models: SafeTravel-v1.0 (Ready)</span>
        </div>
      </main>
    </div>
  );
}
