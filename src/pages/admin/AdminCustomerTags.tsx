import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Plus, Pencil, Trash2 } from "lucide-react";
import {
  CustomerTagDef,
  getCustomerTags,
  saveCustomerTags,
  tagPillStyle,
} from "@/lib/customerTags";

type Mode = "add" | "edit";

const isHexColor = (v: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim());

export default function AdminCustomerTags() {
  const { role } = useAdminRole();
  const [tags, setTags] = useState<CustomerTagDef[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("#faad14");
  const [order, setOrder] = useState("10");
  const [deleteTarget, setDeleteTarget] = useState<CustomerTagDef | null>(null);

  useEffect(() => {
    setTags(getCustomerTags().sort((a, b) => a.order - b.order));
  }, []);

  if (role !== "super_admin" && role !== "team_lead") {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-3">
          <Lock className="w-10 h-10 text-muted-foreground" />
          <p className="font-medium">Super Admin or Team Lead access required</p>
          <p className="text-sm text-muted-foreground">Customer tag management is restricted.</p>
        </div>
      </AdminLayout>
    );
  }

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setLabel("");
    setColor("#1677ff");
    setOrder(String((Math.max(0, ...tags.map((t) => t.order)) || 0) + 10));
    setDialogOpen(true);
  };

  const openEdit = (tag: CustomerTagDef) => {
    setMode("edit");
    setEditingId(tag.id);
    setLabel(tag.label);
    setColor(tag.color);
    setOrder(String(tag.order));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Tag name is required");
      return;
    }
    if (!isHexColor(color)) {
      toast.error("Colour must be a hex value like #faad14");
      return;
    }
    const orderNum = Number(order);
    if (!Number.isFinite(orderNum)) {
      toast.error("Order must be a number");
      return;
    }
    const duplicate = tags.some(
      (t) => t.label.toLowerCase() === trimmed.toLowerCase() && t.id !== editingId
    );
    if (duplicate) {
      toast.error("A tag with this name already exists");
      return;
    }

    let next: CustomerTagDef[];
    if (mode === "add") {
      next = [
        ...tags,
        {
          id: `tag-${Date.now()}`,
          label: trimmed,
          color: color.trim().toLowerCase(),
          order: orderNum,
          active: true,
        },
      ];
    } else {
      next = tags.map((t) =>
        t.id === editingId
          ? { ...t, label: trimmed, color: color.trim().toLowerCase(), order: orderNum }
          : t
      );
    }
    next = next.sort((a, b) => a.order - b.order);
    saveCustomerTags(next);
    setTags(next);
    setDialogOpen(false);
    toast.success(mode === "add" ? `Tag "${trimmed}" added` : `Tag "${trimmed}" updated`);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const next = tags.filter((t) => t.id !== deleteTarget.id);
    saveCustomerTags(next);
    setTags(next);
    toast.success(`Tag "${deleteTarget.label}" deleted`);
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-4 max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold">Customer Tags</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Agents pick from this list when tagging a customer.
            </p>
          </div>
          <Button onClick={openAdd} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Add tag
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Tag</th>
                <th className="px-4 py-3 font-medium">Colour</th>
                <th className="px-4 py-3 font-medium text-right">Order</th>
                <th className="px-4 py-3 font-medium">Active</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                      style={tagPillStyle(tag.color)}
                    >
                      {tag.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{tag.color}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{tag.order}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={tag.active}
                      onCheckedChange={(v) => toggleActive(tag, v)}
                      aria-label={`Toggle ${tag.label} active`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(tag)}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(tag)}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No tags yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add tag" : "Edit tag"}</DialogTitle>
            <DialogDescription>
              Active tags appear in the right-click tagging menu on customer conversations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tag-label">Tag name</Label>
              <Input
                id="tag-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. VIP"
                maxLength={24}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tag-color">Colour</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={isHexColor(color) ? color : "#1677ff"}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-9 w-11 cursor-pointer rounded-md border border-border bg-transparent p-1"
                    aria-label="Pick colour"
                  />
                  <Input
                    id="tag-color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#faad14"
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tag-order">Order</Label>
                <Input
                  id="tag-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={tagPillStyle(isHexColor(color) ? color.trim().toLowerCase() : "#1677ff")}
              >
                {label.trim() || "Preview"}
              </span>
              <span className="text-xs text-muted-foreground">Preview</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{mode === "add" ? "Add tag" : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete tag?</DialogTitle>
            <DialogDescription>
              "{deleteTarget?.label}" will be removed from the tagging list. Customers already tagged keep their
              existing tags.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
