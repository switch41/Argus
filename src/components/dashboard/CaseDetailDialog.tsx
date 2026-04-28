import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/components/auth/SupabaseProvider";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CaseDetailDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const { user, supabase } = useSupabase();
  const [case_, setCase] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [note, setNote] = useState("");

  const fetchData = async () => {
    if (!caseId) return;
    const { data: c } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();
    setCase(c);

    const { data: m } = await supabase
      .from('case_messages')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
    setMessages(m || []);
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, caseId, supabase]);

  const handleAddNote = async () => {
    if (!note.trim() || !case_) return;
    try {
      const newTimeline = [...(case_.timeline || []), { note, t: Date.now() }];
      const { error } = await supabase
        .from('cases')
        .update({ timeline: newTimeline })
        .eq('id', caseId);
      if (error) throw error;
      setNote("");
      toast.success("Note added");
      fetchData();
    } catch {
      toast.error("Failed to add note");
    }
  };

  const handlePostMessage = async () => {
    if (!note.trim() || !user) return;
    try {
      const { error } = await supabase
        .from('case_messages')
        .insert({
          case_id: caseId,
          user_id: user.id,
          body: note
        });
      if (error) throw error;
      setNote("");
      toast.success("Message sent");
      fetchData();
    } catch {
      toast.error("Failed to send message");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquare className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Case #{caseId.slice(-6)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-auto">
          {case_?.timeline?.map((entry: any, i: number) => (
            <div key={i} className="p-2 bg-muted rounded">
              <div className="text-sm">{entry.note}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(entry.t).toLocaleString()}
              </div>
            </div>
          ))}

          {messages?.map((msg: any) => (
            <div key={msg.id} className="p-2 border rounded">
              <div className="text-sm">{msg.body}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add note or message..."
          />
          <Button onClick={handleAddNote}>Note</Button>
          <Button onClick={handlePostMessage}>Message</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
