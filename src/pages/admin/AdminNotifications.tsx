import { useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminRole } from "@/contexts/AdminRoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { toast } from "sonner";
import {
  Lock,
  Plus,
  Pencil,
  Copy,
  Square,
  Search,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  NOTIF_ACTION_LABEL,
  NOTIF_MSG_TYPE_LABEL,
  NOTIF_STATUS_LABEL,
  NOTIF_TRIGGER_LABEL,
  AppNotification,
  NotificationAction,
  NotificationAudience,
  NotificationMessageType,
  NotificationSendType,
  NotificationStatus,
  NotificationTrigger,
  clickRate,
  formatSendTime,
  loadNotifications,
  nextNotificationCode,
  notificationStatus,
  saveNotifications,
} from "@/lib/notifications";
import { compareVersion, isValidSemver } from "@/lib/popups";

type Mode = "add" | "edit" | "copy";

const PAGE_SIZE = 10;

const emptyForm = (): AppNotification => ({
  id: "",
  code: "",
  title: "",
  body: "",
  site: "cardchat",
  notificationType: "automatic",
  trigger: "manual",
  messageType: "in_app",
  platforms: ["android"],
  action: "none",
  pathParam: "",
  startVersion: "1.0.0",
  endVersion: "3.0.0",
  sendType: "immediate",
  sendAt: "",
  audience: "everyone",
  recipients: [],
  recipientCount: 0,
  deliveredCount: 0,
  clickCount: 0,
  remark: "",
  addedBy: "Admin One",
  createdAt: "",
});

const statusClass: Record<NotificationStatus, string> = {
  scheduled: "bg-amber-500/15 text-amber-500",
  sent: "bg-emerald-500/15 text-emerald-500",
  ended: "bg-destructive/15 text-destructive",
};

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, 2, current - 1, current, current + 1, total - 1, total]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

export default function AdminNotifications() {
  const { role } = useAdminRole();
  const canView = role === "super_admin";

  const [items, setItems] = useState<AppNotification[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [nameQ, setNameQ] = useState("");
  const [statusQ, setStatusQ] = useState<"all" | NotificationStatus>("all");
  const [typeQ, setTypeQ] = useState<"all" | NotificationMessageType>("all");
  const [applied, setApplied] = useState({
    name: "",
    status: "all" as "all" | NotificationStatus,
    msgType: "all" as "all" | NotificationMessageType,
  });
  const [page, setPage] = useState(1);
  const [goTo, setGoTo] = useState("");

  const [modal, setModal] = useState<Mode | null>(null);
  const [form, setForm] = useState<AppNotification>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [endOpen, setEndOpen] = useState(false);
  const [preview, setPreview] = useState<AppNotification | null>(null);

  useEffect(() => {
    setItems(loadNotifications());
  }, []);

  const persist = (list: AppNotification[]) => {
    setItems(list);
    saveNotifications(list);
  };

  const rows = useMemo(
    () =>
      items
        .filter((n) =>
          applied.name ? n.title.toLowerCase().includes(applied.name.toLowerCase()) : true
        )
        .filter((n) =>
          applied.status === "all" ? true : notificationStatus(n) === applied.status
        )
        .filter((n) => (applied.msgType === "all" ? true : n.messageType === applied.msgType))
        .sort((a, b) => b.code.localeCompare(a.code)),
    [items, applied]
  );

  useEffect(() => {
    setPage(1);
  }, [applied]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selectedItem = items.find((n) => n.id === selected) || null;

  const openAdd = () => {
    setForm({ ...emptyForm(), code: nextNotificationCode(items) });
    setErrors({});
    setModal("add");
  };

  const openEdit = () => {
    if (!selectedItem) return toast.error("Select a notification first");
    setForm({ ...selectedItem });
    setErrors({});
    setModal("edit");
  };

  const openCopy = () => {
    if (!selectedItem) return toast.error("Select a notification first");
    setForm({
      ...selectedItem,
      id: "",
      code: nextNotificationCode(items),
      addedBy: "Admin One",
      endedManually: false,
      deliveredCount: 0,
      clickCount: 0,
    });
    setErrors({});
    setModal("copy");
  };

  const openEnd = () => {
    if (!selectedItem) return toast.error("Select a notification first");
    if (notificationStatus(selectedItem) === "ended")
      return toast.error("Notification already closed");
    setEndOpen(true);
  };

  const confirmEnd = () => {
    if (!selectedItem) return;
    persist(
      items.map((n) => (n.id === selectedItem.id ? { ...n, endedManually: true } : n))
    );
    setEndOpen(false);
    toast.success(`${selectedItem.code} closed`);
  };

  const validate = (f: AppNotification) => {
    const e: Record<string, string> = {};
    if (!f.title.trim()) e.title = "Message name is required";
    if (f.title.length > 100) e.title = "Max 100 characters";
    if (!f.body.trim()) e.body = "Message content is required";
    if (f.body.length > 500) e.body = "Max 500 characters";
    if (!f.platforms.length) e.platforms = "Select at least one terminal";
    if (!isValidSemver(f.startVersion)) e.startVersion = "Use a version like 1.0.0";
    if (!isValidSemver(f.endVersion)) e.endVersion = "Use a version like 3.0.0";
    if (
      isValidSemver(f.startVersion) &&
      isValidSemver(f.endVersion) &&
      compareVersion(f.endVersion, f.startVersion) < 0
    )
      e.endVersion = "End version must be ≥ start version";
    if (f.action !== "none" && !f.pathParam.trim())
      e.pathParam = "Path parameters are required for this action";
    if (f.sendType === "scheduled" && !f.sendAt) e.sendAt = "Pick a send date & time";
    if (f.audience === "specified" && !f.recipients.length)
      e.recipients = "Add at least one customer alias";
    if (f.remark.length > 1000) e.remark = "Max 1000 characters";
    return e;
  };

  const submit = () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    const normalized: AppNotification = {
      ...form,
      recipientCount:
        form.audience === "specified" ? form.recipients.length : form.recipientCount,
    };
    if (modal === "edit") {
      persist(items.map((n) => (n.id === normalized.id ? { ...normalized } : n)));
      toast.success(`${normalized.code} updated`);
    } else {
      const rec: AppNotification = {
        ...normalized,
        id: `n${Date.now()}`,
        code: nextNotificationCode(items),
        createdAt: new Date().toISOString(),
      };
      persist([...items, rec]);
      setSelected(rec.id);
      toast.success(`${rec.code} created`);
    }
    setModal(null);
  };

  const jumpToPage = () => {
    const n = Number(goTo);
    if (!Number.isFinite(n) || n < 1) return;
    setPage(Math.min(Math.floor(n), pageCount));
    setGoTo("");
  };

  if (!canView) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center">
            <Lock className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-heading text-lg font-bold mb-1">Restricted</h1>
            <p className="text-sm text-muted-foreground">
              Notification Management is available to Super Admins only.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div>
          <h1 className="font-heading text-xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Super Admin only · Push & in-app notification campaigns for the customer app
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Message Name</Label>
            <Input
              value={nameQ}
              onChange={(e) => setNameQ(e.target.value)}
              placeholder="Search message name"
              className="h-9 w-56"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={statusQ} onValueChange={(v) => setStatusQ(v as typeof statusQ)}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sent">Sending</SelectItem>
                <SelectItem value="ended">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Message Type</Label>
            <Select value={typeQ} onValueChange={(v) => setTypeQ(v as typeof typeQ)}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            onClick={() => setApplied({ name: nameQ, status: statusQ, msgType: typeQ })}
          >
            <Search className="w-4 h-4 mr-1.5" /> Search
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNameQ("");
              setStatusQ("all");
              setTypeQ("all");
              setApplied({ name: "", status: "all", msgType: "all" });
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Reset
          </Button>

          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={openAdd}>
              <Plus className="w-4 h-4 mr-1.5" /> Add
            </Button>
            <Button size="sm" variant="outline" onClick={openEdit}>
              <Pencil className="w-4 h-4 mr-1.5" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={openCopy}>
              <Copy className="w-4 h-4 mr-1.5" /> Copy Parameters
            </Button>
            <Button size="sm" variant="destructive" onClick={openEnd}>
              <Square className="w-4 h-4 mr-1.5" /> End
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr className="[&>th]:px-3 [&>th]:py-2.5 [&>th]:text-left [&>th]:whitespace-nowrap">
                <th />
                <th>Activity Code</th>
                <th>Site</th>
                <th>Message Name</th>
                <th>Notification Type</th>
                <th>Trigger Scenario</th>
                <th>Sending Terminal</th>
                <th>Version Range</th>
                <th>Message Content</th>
                <th>Sending Time</th>
                <th>Status</th>
                <th>Message Type</th>
                <th>Target Audience</th>
                <th>Recipients</th>
                <th>Delivered</th>
                <th>Click Rate</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((n) => {
                const st = notificationStatus(n);
                return (
                  <tr
                    key={n.id}
                    onClick={() => setSelected(n.id)}
                    className={`border-t cursor-pointer [&>td]:px-3 [&>td]:py-2.5 [&>td]:whitespace-nowrap ${
                      selected === n.id ? "bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <td>
                      <input
                        type="radio"
                        checked={selected === n.id}
                        onChange={() => setSelected(n.id)}
                        aria-label={`Select ${n.code}`}
                      />
                    </td>
                    <td className="font-mono text-xs">{n.code}</td>
                    <td>{n.site}</td>
                    <td className="font-medium max-w-[180px] truncate">{n.title}</td>
                    <td className="capitalize">{n.notificationType}</td>
                    <td>{NOTIF_TRIGGER_LABEL[n.trigger]}</td>
                    <td>
                      {n.platforms.length === 2
                        ? "Android, iOS"
                        : n.platforms[0] === "ios"
                          ? "iOS"
                          : "Android"}
                    </td>
                    <td className="font-mono text-xs">
                      {n.startVersion} ~ {n.endVersion}
                    </td>
                    <td className="max-w-[220px] truncate text-muted-foreground">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreview(n);
                        }}
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <Eye className="w-3.5 h-3.5" /> {n.body}
                      </button>
                    </td>
                    <td className="text-xs font-mono">{formatSendTime(n)}</td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[st]}`}
                      >
                        {NOTIF_STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td>{NOTIF_MSG_TYPE_LABEL[n.messageType]}</td>
                    <td>{n.audience === "everyone" ? "Everyone" : "Audience User Label"}</td>
                    <td>{n.recipientCount.toLocaleString()}</td>
                    <td>{n.deliveredCount.toLocaleString()}</td>
                    <td>{clickRate(n)}</td>
                    <td className="max-w-[200px] truncate text-muted-foreground">
                      {n.remark || "—"}
                    </td>
                  </tr>
                );
              })}
              {!pageRows.length && (
                <tr>
                  <td colSpan={17} className="px-3 py-10 text-center text-muted-foreground">
                    No notifications match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3 text-sm text-muted-foreground">
            <span>Total {rows.length} Items</span>
            <div className="flex items-center gap-1 ml-auto">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {pageNumbers(safePage, pageCount).map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-1">
                    …
                  </span>
                ) : (
                  <Button
                    key={p}
                    size="icon"
                    variant={p === safePage ? "default" : "outline"}
                    className="h-8 w-8"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={safePage >= pageCount}
                onClick={() => setPage(safePage + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <span className="ml-2">{PAGE_SIZE} / page</span>
            <span className="flex items-center gap-1.5">
              Go to
              <Input
                value={goTo}
                onChange={(e) => setGoTo(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && jumpToPage()}
                className="h-8 w-16 text-center"
              />
              <Button size="sm" variant="outline" className="h-8" onClick={jumpToPage}>
                Page
              </Button>
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit / Copy modal */}
      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal === "edit"
                ? "Edit Notification"
                : modal === "copy"
                  ? "Copy Notification"
                  : "Add Notification"}
            </DialogTitle>
            <DialogDescription>
              Activity code <span className="font-mono">{form.code || "auto"}</span> · Added
              by {form.addedBy}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Message Name *</Label>
              <Input
                value={form.title}
                maxLength={100}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Message Content *</Label>
              <Textarea
                rows={3}
                maxLength={500}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Notification text shown to the customer"
              />
              <p className="text-xs text-muted-foreground">{form.body.length}/500</p>
              {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Notification Type</Label>
                <Input value="Automatic" disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Trigger Scenario *</Label>
                <Select
                  value={form.trigger}
                  onValueChange={(v) =>
                    setForm({ ...form, trigger: v as NotificationTrigger })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(NOTIF_TRIGGER_LABEL) as NotificationTrigger[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {NOTIF_TRIGGER_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Message Type *</Label>
                <RadioGroup
                  value={form.messageType}
                  onValueChange={(v) =>
                    setForm({ ...form, messageType: v as NotificationMessageType })
                  }
                  className="flex gap-4 pt-1"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="in_app" /> In-App
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="external" /> External
                  </label>
                </RadioGroup>
              </div>
              <div className="space-y-1.5">
                <Label>Sending Terminal *</Label>
                <div className="flex gap-4 pt-1">
                  {(["android", "ios"] as const).map((pf) => (
                    <label key={pf} className="flex items-center gap-2 text-sm capitalize">
                      <Checkbox
                        checked={form.platforms.includes(pf)}
                        onCheckedChange={(c) =>
                          setForm({
                            ...form,
                            platforms: c
                              ? [...form.platforms, pf]
                              : form.platforms.filter((x) => x !== pf),
                          })
                        }
                      />
                      {pf === "ios" ? "iOS" : "Android"}
                    </label>
                  ))}
                </div>
                {errors.platforms && (
                  <p className="text-xs text-destructive">{errors.platforms}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Send Type *</Label>
                <RadioGroup
                  value={form.sendType}
                  onValueChange={(v) =>
                    setForm({ ...form, sendType: v as NotificationSendType })
                  }
                  className="flex gap-4 pt-1"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="immediate" /> Immediate
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="scheduled" /> Scheduled
                  </label>
                </RadioGroup>
              </div>
              {form.sendType === "scheduled" && (
                <div className="space-y-1.5">
                  <Label>Sending Time * (UTC+4)</Label>
                  <Input
                    type="datetime-local"
                    value={form.sendAt}
                    onChange={(e) => setForm({ ...form, sendAt: e.target.value })}
                  />
                  {errors.sendAt && (
                    <p className="text-xs text-destructive">{errors.sendAt}</p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Action After Click *</Label>
              <RadioGroup
                value={form.action}
                onValueChange={(v) => setForm({ ...form, action: v as NotificationAction })}
                className="grid grid-cols-2 gap-2"
              >
                {(["native", "h5", "browser", "none"] as NotificationAction[]).map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={a} /> {NOTIF_ACTION_LABEL[a]}
                  </label>
                ))}
              </RadioGroup>
            </div>

            {form.action !== "none" && (
              <div className="space-y-1.5">
                <Label>Path Parameters *</Label>
                <Input
                  value={form.pathParam}
                  maxLength={500}
                  placeholder={
                    form.action === "native" ? "/customer/rewards" : "https://example.com/page"
                  }
                  onChange={(e) => setForm({ ...form, pathParam: e.target.value })}
                />
                {errors.pathParam && (
                  <p className="text-xs text-destructive">{errors.pathParam}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Version *</Label>
                <Input
                  value={form.startVersion}
                  onChange={(e) => setForm({ ...form, startVersion: e.target.value })}
                />
                {errors.startVersion && (
                  <p className="text-xs text-destructive">{errors.startVersion}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>End Version *</Label>
                <Input
                  value={form.endVersion}
                  onChange={(e) => setForm({ ...form, endVersion: e.target.value })}
                />
                {errors.endVersion && (
                  <p className="text-xs text-destructive">{errors.endVersion}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Target Audience *</Label>
              <RadioGroup
                value={form.audience}
                onValueChange={(v) =>
                  setForm({ ...form, audience: v as NotificationAudience })
                }
                className="flex gap-4"
              >
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="everyone" /> Everyone
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="specified" /> Audience User Label
                </label>
              </RadioGroup>
              {form.audience === "specified" && (
                <>
                  <Textarea
                    rows={3}
                    placeholder="Customer aliases, comma or newline separated"
                    value={form.recipients.join(", ")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recipients: e.target.value
                          .split(/[\s,]+/)
                          .map((s) => s.trim().toUpperCase())
                          .filter(Boolean),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.recipients.length} recipient(s)
                  </p>
                </>
              )}
              {errors.recipients && (
                <p className="text-xs text-destructive">{errors.recipients}</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Checkbox checked disabled /> Site: CardChat
            </div>

            <div className="space-y-1.5">
              <Label>Remark</Label>
              <Textarea
                rows={2}
                maxLength={1000}
                value={form.remark}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                placeholder="Internal notes (not shown to customers)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End confirmation */}
      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm again to close this notification</DialogTitle>
            <DialogDescription>
              {selectedItem?.code} will be stopped immediately. Scheduled sends are cancelled.
              This cannot be undone — use Copy Parameters to relaunch it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEnd}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message preview */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Notification Preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="rounded-xl border bg-muted/40 p-4 space-y-1.5">
              <p className="text-sm font-semibold">{preview.title}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {preview.body}
              </p>
              <p className="text-[11px] text-muted-foreground/70 pt-1">
                {preview.code} · {NOTIF_MSG_TYPE_LABEL[preview.messageType]} ·{" "}
                {NOTIF_ACTION_LABEL[preview.action]}
                {preview.action !== "none" && ` · ${preview.pathParam}`}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
