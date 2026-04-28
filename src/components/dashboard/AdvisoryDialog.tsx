import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { useState } from "react";
import { toast } from "sonner";

export default function AdvisoryDialog() {
  const [open, setOpen] = useState(false);
  const { supabase } = useSupabase();
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "tourists" as "all" | "tourists" | "officials",
    severity: "medium" as "low" | "medium" | "high" | "critical",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('advisories')
        .insert({
          type: form.audience,
          title: form.title,
          message: form.message,
          severity: form.severity,
        });
      if (error) throw error;
      toast.success("Advisory created");
      setOpen(false);
      setForm({ title: "", message: "", audience: "tourists", severity: "medium" });
    } catch {
      toast.error("Failed to create advisory");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Advisory</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Travel Advisory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Audience</Label>
            <Select value={form.audience} onValueChange={(v: any) => setForm((p) => ({ ...p, audience: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tourists">Tourists</SelectItem>
                <SelectItem value="officials">Officials</SelectItem>
                <SelectItem value="all">All Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Create Advisory</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
