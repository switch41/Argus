import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, Shield, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<"en" | "es" | "hi">("en");

  // Add translations and helper
  const translations: Record<string, Record<string, string>> = {
    en: {
      getStarted: "Get Started",
      enterEmail: "Enter your email to log in or sign up",
      or: "Or",
      continueGuest: "Continue as Guest",
      checkEmail: "Check your email",
      sentCodeTo: "We've sent a code to {{email}}",
      tryAgain: "Try again",
      verifyCode: "Verify code",
      verifying: "Verifying...",
      useDifferentEmail: "Use different email",
      securedBySupabase: "Secured by Supabase",
      language: "Language",
      emailPlaceholder: "name@example.com",
    },
    es: {
      getStarted: "Comenzar",
      enterEmail: "Ingresa tu correo para iniciar sesión o registrarte",
      or: "O",
      continueGuest: "Continuar como invitado",
      checkEmail: "Revisa tu correo",
      sentCodeTo: "Hemos enviado un código a {{email}}",
      tryAgain: "Intentar de nuevo",
      verifyCode: "Verificar código",
      verifying: "Verificando...",
      useDifferentEmail: "Usar otro correo",
      securedBySupabase: "Asegurado por Supabase",
      language: "Idioma",
      emailPlaceholder: "nombre@ejemplo.com",
    },
    hi: {
      getStarted: "शुरू करें",
      enterEmail: "लॉगिन या साइन अप करने के लिए अपना ईमेल दर्ज करें",
      or: "या",
      continueGuest: "मेहमान के रूप में जारी रखें",
      checkEmail: "अपना ईमेल जांचें",
      sentCodeTo: "हमने {{email}} पर कोड भेजा है",
      tryAgain: "फिर से प्रयास करें",
      verifyCode: "कोड सत्यापित करें",
      verifying: "सत्यापित हो रहा है...",
      useDifferentEmail: "अलग ईमेल का उपयोग करें",
      securedBySupabase: "Supabase द्वारा सुरक्षित",
      language: "भाषा",
      emailPlaceholder: "name@example.com",
    },
  };
  const t = (key: string, vars?: Record<string, string>) => {
    let s = translations[locale]?.[key] ?? key;
    if (vars) {
      for (const k of Object.keys(vars)) {
        s = s.replace(`{{${k}}}`, vars[k]);
      }
    }
    return s;
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);
  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      console.log("signed in");

      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("The verification code you entered is incorrect.");
      setIsLoading(false);

      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Attempting anonymous sign in...");
      await signIn("anonymous", {});
      console.log("Anonymous sign in successful");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Guest login error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      const rawMessage = error instanceof Error ? error.message : "Unknown error";
      if (rawMessage.toLowerCase().includes("anonymous sign-ins are disabled")) {
        setError(
          "Guest mode is disabled in Supabase. Enable Anonymous provider in Supabase Auth settings, then try again."
        );
      } else {
        setError(`Failed to sign in as guest: ${rawMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--secondary)_0%,transparent_50%)] opacity-20 absolute inset-0 -z-10" />

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div
              className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-lg shadow-lg cursor-pointer mx-auto transition-transform hover:scale-105"
              onClick={() => navigate("/")}
            >
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold tracking-tight text-primary">Argus</h1>
              <p className="text-muted-foreground font-medium">Secure Portal Access</p>
            </div>
          </div>

          <Card className="border border-border bg-card shadow-xl overflow-hidden rounded-xl">
            <div className="p-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-20" />

            {step === "signIn" ? (
              <>
                <CardHeader className="space-y-1">
                  <div className="flex justify-between items-center mb-2">
                    <div className="label-caps !text-[10px] text-secondary">Verified Network</div>
                    <Select value={locale} onValueChange={(v) => setLocale(v as any)}>
                      <SelectTrigger className="h-8 w-24 text-[10px] font-bold uppercase tracking-wider bg-muted/50 border-none">
                        <SelectValue placeholder={t("language")} />
                      </SelectTrigger>
                      <SelectContent className="font-sans">
                        <SelectItem value="en">ENGLISH</SelectItem>
                        <SelectItem value="es">ESPAÑOL</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <CardTitle className="text-2xl font-display">{t("getStarted")}</CardTitle>
                  <CardDescription className="text-muted-foreground font-medium">{t("enterEmail")}</CardDescription>
                </CardHeader>
                <form onSubmit={handleEmailSubmit}>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="label-caps !text-[11px] text-primary">Email Identification</div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder={t("emailPlaceholder")}
                          type="email"
                          className="pl-10 h-12 border-border focus:ring-secondary transition-all"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 glow-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    {error && (
                      <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded border border-destructive/20">{error}</p>
                    )}

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground font-bold tracking-widest">
                          {t("or")}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 font-bold border-2"
                      onClick={handleGuestLogin}
                      disabled={isLoading}
                    >
                      <UserX className="mr-2 h-5 w-5" />
                      {t("continueGuest")}
                    </Button>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center space-y-2">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Mail className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-2xl font-display">{t("checkEmail")}</CardTitle>
                  <CardDescription className="font-medium">
                    {t("sentCodeTo", { email: step.email })}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="space-y-6">
                    <input type="hidden" name="email" value={step.email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center py-4">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5].map((idx) => (
                            <InputOTPSlot
                              key={idx}
                              index={idx}
                              className="w-12 h-14 text-xl font-bold border-2 rounded-lg bg-muted/50 focus:border-secondary transition-all"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {error && (
                      <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded border border-destructive/20">
                        {error}
                      </p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90 glow-primary"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t("verifying")}
                        </>
                      ) : (
                        <>
                          {t("verifyCode")}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm font-bold text-secondary hover:text-secondary/80 p-0 h-auto"
                        onClick={() => setStep("signIn")}
                        disabled={isLoading}
                      >
                        {t("useDifferentEmail")}
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </>
            )}

            <div className="py-4 px-6 bg-muted/30 border-t border-border flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="label-caps !text-[9px] text-muted-foreground tracking-[0.2em]">{t("securedBySupabase")}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}