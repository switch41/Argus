import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CaseDetailDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const case_ = useQuery(api.cases.get, { caseId: caseId as any });
  const messages = useQuery(api.messages.listByCase, { caseId: caseId as any });
  const [note, setNote] = useState("");
  const addNote = useMutation(api.cases.addNote);
  const postMessage = useMutation(api.messages.postToCase);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    try {
      await addNote({ caseId: caseId as any, note });
      setNote("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };

  const handlePostMessage = async () => {
    if (!note.trim()) return;
    try {
      await postMessage({ caseId: caseId as any, body: note });
      setNote("");
      toast.success("Message sent");
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
            <div key={msg._id} className="p-2 border rounded">
              <div className="text-sm">{msg.body}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(msg.t).toLocaleString()}
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
