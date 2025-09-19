import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export default function TouristRegistration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createProfile = useMutation(api.tourists.createProfile);
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    passportNumber: "",
    nationality: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await createProfile({
        passportNumber: formData.passportNumber,
        nationality: formData.nationality,
        emergencyContact1: formData.emergencyContact1,
        emergencyContact2: formData.emergencyContact2.name ? formData.emergencyContact2 : undefined,
        entryPoint: formData.entryPoint,
        plannedDuration: parseInt(formData.plannedDuration),
        accommodationAddress: formData.accommodationAddress || undefined,
        localGuideContact: formData.localGuideContact || undefined,
        medicalConditions: formData.medicalConditions || undefined,
      });

      toast.success("Digital Tourist ID created successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to create profile. Please try again.");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <h1 className="text-xl font-semibold tracking-tight">
                Create Digital Tourist ID
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passport">Passport Number *</Label>
                    <Input
                      id="passport"
                      value={formData.passportNumber}
                      onChange={(e) => updateFormData("passportNumber", e.target.value)}
                      placeholder="Enter passport number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => updateFormData("nationality", e.target.value)}
                      placeholder="Enter nationality"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="entryPoint">Entry Point *</Label>
                    <Select onValueChange={(value) => updateFormData("entryPoint", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entry point" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="airport">International Airport</SelectItem>
                        <SelectItem value="seaport">Seaport</SelectItem>
                        <SelectItem value="land_border">Land Border</SelectItem>
                        <SelectItem value="railway">Railway Station</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Planned Duration (Days) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={formData.plannedDuration}
                      onChange={(e) => updateFormData("plannedDuration", e.target.value)}
                      placeholder="Number of days"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accommodation">Accommodation Address</Label>
                  <Textarea
                    id="accommodation"
                    value={formData.accommodationAddress}
                    onChange={(e) => updateFormData("accommodationAddress", e.target.value)}
                    placeholder="Hotel/accommodation address"
                    rows={2}
                  />
                </div>

                {/* Emergency Contact 1 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact 1 *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={formData.emergencyContact1.name}
                        onChange={(e) => updateEmergencyContact(1, "name", e.target.value)}
                        placeholder="Contact name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        value={formData.emergencyContact1.phone}
                        onChange={(e) => updateEmergencyContact(1, "phone", e.target.value)}
                        placeholder="+1234567890"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship *</Label>
                      <Select onValueChange={(value) => updateEmergencyContact(1, "relationship", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact 2 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact 2 (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={formData.emergencyContact2.name}
                        onChange={(e) => updateEmergencyContact(2, "name", e.target.value)}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={formData.emergencyContact2.phone}
                        onChange={(e) => updateEmergencyContact(2, "phone", e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship</Label>
                      <Select onValueChange={(value) => updateEmergencyContact(2, "relationship", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="friend">Friend</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="guide">Local Guide Contact</Label>
                    <Input
                      id="guide"
                      value={formData.localGuideContact}
                      onChange={(e) => updateFormData("localGuideContact", e.target.value)}
                      placeholder="Guide phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medical">Medical Conditions</Label>
                  <Textarea
                    id="medical"
                    value={formData.medicalConditions}
                    onChange={(e) => updateFormData("medicalConditions", e.target.value)}
                    placeholder="Any medical conditions, allergies, or medications"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating ID...
                      </>
                    ) : (
                      "Create Digital ID"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
