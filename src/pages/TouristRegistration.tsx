import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useEffect } from "react";

export default function TouristRegistration() {
  const { supabase, user } = useSupabase();
  const { isAuthenticated, isAnonymous } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    passportNumber: "",
    nationality: "",
    fullName: "",
    dateOfBirth: "",
    bloodGroup: "",
    emergencyContact1: {
      name: "",
      phone: "",
      relationship: "",
    },
    emergencyContact2: {
      name: "",
      phone: "",
      relationship: "",
    },
    entryPoint: "",
    plannedDuration: "",
    accommodationAddress: "",
    localGuideContact: "",
    medicalConditions: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (isAnonymous) {
      toast.error("Guest mode cannot create Digital ID. Please sign in with email.");
      navigate("/auth");
    }
  }, [isAuthenticated, isAnonymous, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // 1. Insert into tourist_profiles table
      const { data: profile, error: profileError } = await supabase
        .from('tourist_profiles')
        .insert({
          user_id: user.id,
          full_name: formData.fullName,
          passport_number: formData.passportNumber,
          nationality: formData.nationality,
          date_of_birth: formData.dateOfBirth,
          blood_group: formData.bloodGroup,
          emergency_contact_1: formData.emergencyContact1,
          emergency_contact_2: formData.emergencyContact2.name ? formData.emergencyContact2 : null,
          entry_point: formData.entryPoint,
          planned_duration: parseInt(formData.plannedDuration),
          accommodation_address: formData.accommodationAddress || null,
          local_guide_contact: formData.localGuideContact || null,
          medical_conditions: formData.medicalConditions || null,
          expiry_date: Date.now() + (parseInt(formData.plannedDuration) * 24 * 60 * 60 * 1000),
          is_active: true
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Sync to Fabric Gateway
      console.log("Profile created in Supabase. Syncing to Fabric...");
      try {
        const fabricResponse = await fetch('http://localhost:3001/api/issue-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            fullName: formData.fullName,
            passportNumber: formData.passportNumber,
            nationality: formData.nationality,
            dateOfBirth: formData.dateOfBirth,
            bloodGroup: formData.bloodGroup,
            emergencyContactsJson: JSON.stringify(formData.emergencyContact1),
            expiryDateMs: Date.now() + (parseInt(formData.plannedDuration) * 24 * 60 * 60 * 1000)
          })
        });
        const fabricData = await fabricResponse.json();

        if (fabricData.success) {
          // 3. Update Supabase with Hash
          await supabase
            .from('tourist_profiles')
            .update({ digital_id_hash: fabricData.digitalIdHash })
            .eq('id', profile.id);
          toast.success("Digital Tourist ID issued on ledger!");
        }
      } catch (err) {
        console.warn("Fabric sync failed, but local profile is active:", err);
      }

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(`Registration failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateEmergencyContact = (contactNum: 1 | 2, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [`emergencyContact${contactNum}`]: {
        ...prev[`emergencyContact${contactNum}` as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="font-bold label-caps text-[10px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return
            </Button>
            <div className="h-6 w-[1px] bg-border" />
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-display font-bold tracking-tight text-primary">
                Identity Provisioning
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-2">
          <div className="label-caps !text-[11px] text-secondary font-black tracking-[0.3em]">DIGITAL TOURIST ID PORTAL</div>
          <h2 className="text-4xl font-display font-bold text-primary tracking-tighter">Registration of Movement</h2>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Complete your biometric and itinerary profile to generate a blockchain-secured Argus ID. This data is encrypted and only accessible by authorized safety officials during active emergency signals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border border-border bg-card shadow-xl overflow-hidden rounded-xl">
            <div className="p-1 bg-primary/20" />
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="font-display text-xl">Personal Identification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="label-caps !text-[10px] text-primary">Full Legal Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    placeholder="As per passport"
                    className="h-12 border-2 focus:ring-secondary font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport" className="label-caps !text-[10px] text-primary">Passport Number</Label>
                  <Input
                    id="passport"
                    value={formData.passportNumber}
                    onChange={(e) => updateFormData("passportNumber", e.target.value)}
                    placeholder="Enter official document number"
                    className="h-12 border-2 focus:ring-secondary font-medium"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality" className="label-caps !text-[10px] text-primary">Country of Origin</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => updateFormData("nationality", e.target.value)}
                    placeholder="Enter nationality"
                    className="h-12 border-2 focus:ring-secondary font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="label-caps !text-[10px] text-primary">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                      className="h-12 border-2 focus:ring-secondary font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="label-caps !text-[10px] text-primary">Blood Group</Label>
                    <Select onValueChange={(value) => updateFormData("bloodGroup", value)}>
                      <SelectTrigger className="h-12 border-2 focus:ring-secondary font-bold">
                        <SelectValue placeholder="B+" />
                      </SelectTrigger>
                      <SelectContent>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="entryPoint" className="label-caps !text-[10px] text-primary">Border Entry Point</Label>
                  <Select onValueChange={(value) => updateFormData("entryPoint", value)}>
                    <SelectTrigger className="h-12 border-2 focus:ring-secondary font-bold">
                      <SelectValue placeholder="Select node" />
                    </SelectTrigger>
                    <SelectContent className="font-sans">
                      <SelectItem value="airport">INTERNATIONAL AIRPORT</SelectItem>
                      <SelectItem value="seaport">SEAPORT TERMINAL</SelectItem>
                      <SelectItem value="land_border">LAND BORDER CHECKPOINT</SelectItem>
                      <SelectItem value="railway">CENTRAL RAILWAY STATION</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="label-caps !text-[10px] text-primary">Operational Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.plannedDuration}
                    onChange={(e) => updateFormData("plannedDuration", e.target.value)}
                    placeholder="Stay duration"
                    min="1"
                    className="h-12 border-2 focus:ring-secondary font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accommodation" className="label-caps !text-[10px] text-primary">Primary Lodging Unit</Label>
                <Textarea
                  id="accommodation"
                  value={formData.accommodationAddress}
                  onChange={(e) => updateFormData("accommodationAddress", e.target.value)}
                  placeholder="Hotel/lodging full address"
                  className="min-h-[100px] border-2 focus:ring-secondary font-medium"
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact 1 */}
          <Card className="border border-border bg-card shadow-lg overflow-hidden rounded-xl">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="font-display text-xl text-primary flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Primary Safety Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="label-caps !text-[10px] text-primary">Full Legal Name</Label>
                  <Input
                    value={formData.emergencyContact1.name}
                    onChange={(e) => updateEmergencyContact(1, "name", e.target.value)}
                    placeholder="Contact name"
                    className="h-12 border-2 focus:ring-secondary font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-caps !text-[10px] text-primary">Global Phone Format</Label>
                  <Input
                    value={formData.emergencyContact1.phone}
                    onChange={(e) => updateEmergencyContact(1, "phone", e.target.value)}
                    placeholder="+Country Code ..."
                    className="h-12 border-2 focus:ring-secondary font-medium"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="label-caps !text-[10px] text-primary">Registry Relationship</Label>
                  <Select onValueChange={(value) => updateEmergencyContact(1, "relationship", value)}>
                    <SelectTrigger className="h-12 border-2 focus:ring-secondary font-bold">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="font-sans">
                      <SelectItem value="spouse">SPOUSE</SelectItem>
                      <SelectItem value="parent">PARENT</SelectItem>
                      <SelectItem value="sibling">SIBLING</SelectItem>
                      <SelectItem value="child">CHILD</SelectItem>
                      <SelectItem value="friend">FRIEND</SelectItem>
                      <SelectItem value="other">OTHER</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical & Additional Intelligence */}
          <Card className="border border-border bg-card shadow-lg overflow-hidden rounded-xl">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="font-display text-xl text-primary">Medical & Tactical Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="guide" className="label-caps !text-[10px] text-primary">Local Agent/Guide Contact</Label>
                  <Input
                    id="guide"
                    value={formData.localGuideContact}
                    onChange={(e) => updateFormData("localGuideContact", e.target.value)}
                    placeholder="Agency/Guide phone"
                    className="h-12 border-2 focus:ring-secondary font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical" className="label-caps !text-[10px] text-primary">Biometric Restrictions / Medical Record</Label>
                <Textarea
                  id="medical"
                  value={formData.medicalConditions}
                  onChange={(e) => updateFormData("medicalConditions", e.target.value)}
                  placeholder="Allergies, conditions, or required medication..."
                  className="min-h-[100px] border-2 focus:ring-secondary font-medium"
                />
              </div>
            </CardContent>
          </Card>

          <footer className="flex flex-col md:flex-row gap-4 pt-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="flex-1 h-14 text-lg font-bold border-2"
            >
              Cancel Protocol
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-14 text-lg font-bold bg-primary hover:bg-primary/90 glow-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  PROVISIONING ID...
                </>
              ) : (
                "Issue Digital Tourist ID"
              )}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
