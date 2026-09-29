import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Coins } from "lucide-react";
import {
  CATEGORIES,
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  QuickReplyCategory,
  QuickReplyTemplate,
  SUPPORTED_VARIABLES,
  loadTemplates,
  saveTemplates,
  validateTemplateVariables,
  getUsageByAgent,
  getUsageByCategory,
  getUsageByTemplate,
  getUsageTrend,
  seedMockUsageIfEmpty,
} from "@/lib/quickReplies";

const emptyForm = (): QuickReplyTemplate => ({
  id: "",
  name: "",
  category: "greeting",
  message: "",
  language: "en",
  shortcut: "",
  createdBy: "Admin One",
  createdAt: "",
  order: 0,
});

export default function AdminQuickReplies() {
  const { role } = useAdminRole();
  const isSuperAdmin = role === "super_admin";

  const [templates, setTemplates] = useState<QuickReplyTemplate[]>([]);
  const [tab, setTab] = useState("templates");
  const [categoryFilter, setCategoryFilter] = useState<"all" | QuickReplyCategory>("all");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuickReplyTemplate>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
    seedMockUsageIfEmpty();
  }, []);

  const persist = (list: QuickReplyTemplate[]) => {
    setTemplates(list);
    saveTemplates(list);
  };

  const rows = useMemo(
    () =>
      templates
        .filter((t) => (categoryFilter === "all" ? true : t.category === categoryFilter))
        .filter((t) =>
          search
            ? t.name.toLowerCase().includes(search.toLowerCase()) ||
              t.message.toLowerCase().includes(search.toLowerCase())
            : true
        )
        .sort((a, b) => a.order - b.order),
    [templates, categoryFilter, search]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (t: QuickReplyTemplate) => {
    setEditingId(t.id);
    setForm({ ...t });
    setErrors({});
    setModalOpen(true);
  };

  const validate = (f: QuickReplyTemplate) => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Template name is required";
    if (f.name.length > 50) e.name = "Max 50 characters";
    if (!f.message.trim()) e.message = "Message text is required";
    if (f.message.length > 500) e.message = "Max 500 characters";
    const invalidVars = validateTemplateVariables(f.message);
    if (invalidVars.length) {
      e.message = `Unknown variable(s): ${invalidVars.map((v) => `{${v}}`).join(", ")}`;
    }
    if (f.shortcut && f.shortcut.trim()) {
      if (f.shortcut.length > 20) e.shortcut = "Max 20 characters";
      const dup = templates.some(
        (t) =>
          t.id !== f.id &&
          t.shortcut &&
          t.shortcut.toLowerCase() === f.shortcut!.trim().toLowerCase()
      );
      if (dup) e.shortcut = "Shortcut already in use";
    }
    return e;
  };

  const submit = () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (editingId) {
      persist(templates.map((t) => (t.id === editingId ? { ...form, id: editingId } : t)));
      toast.success("Template updated");
    } else {
      const rec: QuickReplyTemplate = {
        ...form,
        id: `qr${Date.now()}`,
        createdAt: new Date().toISOString(),
        order: templates.length + 1,
      };
      persist([...templates, rec]);
      toast.success("Template created");
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    persist(templates.filter((t) => t.id !== deleteId));
    setDeleteId(null);
    toast.success("Template deleted");
  };

  const langLabel = (l: QuickReplyTemplate["language"]) =>
    l === "en" ? "EN" : l === "zh" ? "中文" : "Both";

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-heading text-xl font-bold">Quick Reply Templates</h1>
          <p className="text-sm text-muted-foreground">
            Manage canned responses agents can send instantly during chats.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}
                >
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_LABEL[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Search</Label>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or message"
                  className="h-9 w-64"
                />
              </div>
              <div className="ml-auto">
                <Button size="sm" onClick={openAdd}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Template
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:text-left [&>th]:whitespace-nowrap">
                    <th>Name</th>
                    <th>Category</th>
                    <th>Message</th>
                    <th>Shortcut</th>
                    <th>Language</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className="border-t [&>td]:px-3 [&>td]:py-2.5 align-top">
                      <td className="font-medium whitespace-nowrap">{t.name}</td>
                      <td className="whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`border-0 ${CATEGORY_COLOR[t.category]}`}
                        >
                          {CATEGORY_LABEL[t.category]}
                        </Badge>
                      </td>
                      <td className="max-w-[320px]">
                        <p className="line-clamp-2 text-muted-foreground" title={t.message}>
                          {t.message}
                        </p>
                      </td>
                      <td className="whitespace-nowrap">
                        {t.shortcut ? (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                            /{t.shortcut}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap">{langLabel(t.language)}</td>
                      <td className="whitespace-nowrap text-muted-foreground">{t.createdBy}</td>
                      <td className="whitespace-nowrap">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(t.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!rows.length && (
                    <tr>
                      <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                        No templates match the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="analytics" className="mt-4">
              <AnalyticsPanel templates={templates} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Add / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Template" : "Add Template"}</DialogTitle>
            <DialogDescription>
              Use variables like {"{alias}"} or {"{card_type}"} — they'll be filled in
              automatically when sent.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Template Name *</Label>
              <Input
                value={form.name}
                maxLength={50}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as QuickReplyCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Message Text *</Label>
              <Textarea
                value={form.message}
                maxLength={500}
                rows={4}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Variables: {SUPPORTED_VARIABLES.map((v) => `{${v.key}}`).join(", ")}
              </p>
              {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Language *</Label>
              <RadioGroup
                value={form.language}
                onValueChange={(v) =>
                  setForm({ ...form, language: v as QuickReplyTemplate["language"] })
                }
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="en" /> English
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="zh" /> Chinese
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="both" /> Both
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label>Shortcut (optional)</Label>
              <Input
                value={form.shortcut}
                maxLength={20}
                placeholder="e.g. cardimg"
                onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
              />
              {errors.shortcut && <p className="text-xs text-destructive">{errors.shortcut}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>{editingId ? "Save Changes" : "Create Template"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Agents will no longer be able to use this quick
              reply.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}

function Bar({ label, value, max, suffix }: { label: string; value: number; max: number; suffix?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="truncate pr-2">{label}</span>
        <span className="text-muted-foreground whitespace-nowrap">
          {value}
          {suffix || ""}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function AnalyticsPanel({ templates }: { templates: QuickReplyTemplate[] }) {
  const byTemplate = getUsageByTemplate();
  const byAgent = getUsageByAgent();
  const byCategory = getUsageByCategory();
  const trend = getUsageTrend(14);

  const nameById: Record<string, string> = {};
  templates.forEach((t) => (nameById[t.id] = t.name));

  const topTemplates = Object.entries(byTemplate)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const maxTemplateCount = topTemplates[0]?.[1] || 1;

  const agentEntries = Object.entries(byAgent).sort((a, b) => b[1] - a[1]);
  const totalAgentUsage = agentEntries.reduce((s, [, v]) => s + v, 0) || 1;

  const maxCategoryCount = Math.max(1, ...Object.values(byCategory));
  const maxTrendCount = Math.max(1, ...trend.map((t) => t.count));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-heading text-sm font-semibold flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-accent" /> Most Used Templates
        </h2>
        <div className="space-y-2.5">
          {topTemplates.length ? (
            topTemplates.map(([id, count]) => (
              <Bar key={id} label={nameById[id] || id} value={count} max={maxTemplateCount} suffix=" sends" />
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No usage data yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-heading text-sm font-semibold">Usage by Agent</h2>
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="[&>th]:text-left [&>th]:py-1">
              <th>Agent</th>
              <th>Sends</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {agentEntries.map(([agent, count]) => (
              <tr key={agent} className="border-t [&>td]:py-1.5">
                <td>{agent}</td>
                <td>{count}</td>
                <td>{Math.round((count / totalAgentUsage) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-heading text-sm font-semibold">Usage by Category</h2>
        <div className="space-y-2.5">
          {CATEGORIES.map((c) => (
            <Bar key={c} label={CATEGORY_LABEL[c]} value={byCategory[c] || 0} max={maxCategoryCount} />
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h2 className="font-heading text-sm font-semibold">Usage Trend (Last 14 Days)</h2>
        <div className="flex items-end gap-1.5 h-32">
          {trend.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary"
                style={{ height: `${Math.max(4, (d.count / maxTrendCount) * 100)}%` }}
                title={`${d.date}: ${d.count}`}
              />
              <span className="text-[9px] text-muted-foreground rotate-0">
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
