import { useEffect, useState } from "react";
import { Phone, Plus, Pencil, Trash2, Check, X, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  listWaNumbers, upsertWaNumber, removeWaNumber, onWaNumbersChange,
  type WaBusinessNumber,
} from "@/lib/waBusinessNumbers";

const COLORS = ["emerald", "sky", "violet", "amber", "rose", "cyan"] as const;

const swatch: Record<string, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
};

type FormState = Partial<WaBusinessNumber>;

export default function WhatsAppBusinessNumbersCard() {
  const [numbers, setNumbers] = useState<WaBusinessNumber[]>(listWaNumbers());
  const [editing, setEditing] = useState<FormState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<WaBusinessNumber | null>(null);

  useEffect(() => onWaNumbersChange(() => setNumbers(listWaNumbers())), []);

  const save = () => {
    if (!editing?.label?.trim() || !editing?.phone?.trim()) {
      toast.error("Label and phone number are required");
      return;
    }
    if (!/^\+?[0-9\s-]{7,20}$/.test(editing.phone)) {
      toast.error("Enter a valid phone in E.164 format, e.g. +2348011112222");
      return;
    }
    upsertWaNumber({
      id: editing.id,
      label: editing.label.trim(),
      phone: editing.phone.trim(),
      phoneNumberId: editing.phoneNumberId?.trim() || "",
      wabaId: editing.wabaId?.trim() || "",
      active: editing.active ?? true,
      color: editing.color || "emerald",
    });
    toast.success(editing.id ? "Business number updated" : "Business number added");
    setEditing(null);
  };

  const toggleActive = (n: WaBusinessNumber, next: boolean) => {
    upsertWaNumber({ ...n, active: next });
    toast.success(`${n.label} is now ${next ? "receiving" : "paused"}`);
  };

  return (
    <div className="bg-card border rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-heading font-semibold text-sm">WhatsApp Business Numbers</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Register every phone_number_id from your Meta WhatsApp Business Account.
              Inbound messages from any active line are routed into the unified Messages inbox.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setEditing({ active: true, color: "emerald" })} className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Number
        </Button>
      </div>

      <div className="border rounded-lg divide-y">
        {numbers.length === 0 && (
          <div className="p-4 text-xs text-muted-foreground text-center">No WhatsApp business numbers yet.</div>
        )}
        {numbers.map((n) => (
          <div key={n.id} className="flex items-center gap-3 p-3">
            <span className={`w-2.5 h-2.5 rounded-full ${swatch[n.color] || "bg-emerald-500"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{n.label}</span>
                {!n.active && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Paused</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                <span className="font-mono">{n.phone}</span>
                {n.phoneNumberId && <span>ID: {n.phoneNumberId}</span>}
                {n.wabaId && <span className="inline-flex items-center gap-0.5"><Shield className="w-3 h-3" /> {n.wabaId}</span>}
              </div>
            </div>
            <Switch checked={n.active} onCheckedChange={(v) => toggleActive(n, v)} />
            <Button
              variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10"
              onClick={() => setEditing(n)} title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-destructive"
              onClick={() => setConfirmDelete(n)} title="Remove"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add / edit modal */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit business number" : "Add business number"}</DialogTitle>
            <DialogDescription>
              Match the label and IDs to a phone number registered in Meta's WhatsApp Business platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Label</label>
              <Input
                value={editing?.label ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s, label: e.target.value }))}
                placeholder="e.g. Support Line"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Phone (E.164)</label>
                <Input
                  value={editing?.phone ?? ""}
                  onChange={(e) => setEditing((s) => ({ ...s, phone: e.target.value }))}
                  placeholder="+2348011112222"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Badge color</label>
                <Select
                  value={editing?.color || "emerald"}
                  onValueChange={(v) => setEditing((s) => ({ ...s, color: v }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="inline-flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${swatch[c]}`} />
                          {c[0].toUpperCase() + c.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">phone_number_id</label>
                <Input
                  value={editing?.phoneNumberId ?? ""}
                  onChange={(e) => setEditing((s) => ({ ...s, phoneNumberId: e.target.value }))}
                  placeholder="1055500000001"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">WABA ID</label>
                <Input
                  value={editing?.wabaId ?? ""}
                  onChange={(e) => setEditing((s) => ({ ...s, wabaId: e.target.value }))}
                  placeholder="waba_1001"
                  className="mt-1 font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-between border rounded-lg px-3 py-2">
              <div>
                <p className="text-sm font-medium">Receiving inbound</p>
                <p className="text-[11px] text-muted-foreground">Pause to stop routing new conversations to this line.</p>
              </div>
              <Switch
                checked={editing?.active ?? true}
                onCheckedChange={(v) => setEditing((s) => ({ ...s, active: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} className="gap-1.5">
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
            <Button onClick={save} className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
              <Check className="w-3.5 h-3.5" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {confirmDelete?.label}?</DialogTitle>
            <DialogDescription>
              New inbound messages to {confirmDelete?.phone} will no longer reach the inbox.
              Existing conversations remain visible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmDelete) {
                  removeWaNumber(confirmDelete.id);
                  toast.success("Business number removed");
                  setConfirmDelete(null);
                }
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
