import { useEffect, useMemo, useRef, useState } from "react";
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
import { Lock, Plus, Pencil, Copy, Square, Upload, Search, RotateCcw } from "lucide-react";
import {
  ACTION_LABEL,
  FREQUENCY_LABEL,
  POPUP_SCREENS,
  Popup,
  PopupAction,
  PopupAudience,
  PopupFrequency,
  PopupScreen,
  PopupStatus,
  PopupType,
  STATUS_LABEL,
  TYPE_LABEL,
  compareVersion,
  isValidSemver,
  loadPopups,
  nextCode,
  popupStatus,
  savePopups,
} from "@/lib/popups";

type Mode = "add" | "edit" | "copy";

const emptyForm = (): Popup => ({
  id: "",
  code: "",
  name: "",
  type: "full_screen",
  platforms: ["android"],
  screen: "Home",
  action: "none",
  pathParam: "",
  startVersion: "1.0.0",
  endVersion: "3.0.0",
  order: 1,
  image: "",
  startDate: "",
  endDate: "",
  frequency: "once",
  audience: "everyone",
  recipients: [],
  remark: "",
  addedBy: "Admin One",
  createdAt: "",
});

const statusClass: Record<PopupStatus, string> = {
  not_started: "bg-muted text-muted-foreground",
  live: "bg-emerald-500/15 text-emerald-500",
  ended: "bg-destructive/15 text-destructive",
};

export default function AdminPopups() {
  const { role } = useAdminRole();
  const canView = role === "super_admin";

  const [popups, setPopups] = useState<Popup[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [nameQ, setNameQ] = useState("");
  const [statusQ, setStatusQ] = useState<"all" | PopupStatus>("all");
  const [applied, setApplied] = useState({ name: "", status: "all" as "all" | PopupStatus });

  const [modal, setModal] = useState<Mode | null>(null);
  const [form, setForm] = useState<Popup>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [endOpen, setEndOpen] = useState(false);
  const [zoom, setZoom] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPopups(loadPopups());
  }, []);

  const persist = (list: Popup[]) => {
    setPopups(list);
    savePopups(list);
  };

  const rows = useMemo(
    () =>
      popups
        .filter((p) =>
          applied.name ? p.name.toLowerCase().includes(applied.name.toLowerCase()) : true
        )
        .filter((p) => (applied.status === "all" ? true : popupStatus(p) === applied.status))
        .sort((a, b) => a.order - b.order),
    [popups, applied]
  );

  const selectedPopup = popups.find((p) => p.id === selected) || null;

  const openAdd = () => {
    setForm({ ...emptyForm(), code: nextCode(popups) });
    setErrors({});
    setModal("add");
  };

  const openEdit = () => {
    if (!selectedPopup) return toast.error("Select a popup first");
    setForm({ ...selectedPopup });
    setErrors({});
    setModal("edit");
  };

  const openCopy = () => {
    if (!selectedPopup) return toast.error("Select a popup first");
    setForm({
      ...selectedPopup,
      id: "",
      code: nextCode(popups),
      addedBy: "Admin One",
      endedManually: false,
    });
    setErrors({});
    setModal("copy");
  };

  const openEnd = () => {
    if (!selectedPopup) return toast.error("Select a popup first");
    if (popupStatus(selectedPopup) === "ended") return toast.error("Popup already ended");
    setEndOpen(true);
  };

  const confirmEnd = () => {
    if (!selectedPopup) return;
    persist(
      popups.map((p) => (p.id === selectedPopup.id ? { ...p, endedManually: true } : p))
    );
    setEndOpen(false);
    toast.success(`${selectedPopup.code} ended`);
  };

  const onImage = (file?: File | null) => {
    if (!file) return;
    if (!/^image\/(png|jpeg)$/.test(file.type)) {
      toast.error("Only PNG or JPG images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const validate = (f: Popup) => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Popup name is required";
    if (f.name.length > 100) e.name = "Max 100 characters";
    if (!f.platforms.length) e.platforms = "Select at least one platform";
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
    if (!(f.order >= 0)) e.order = "Display order must be 0 or higher";
    if (!f.image) e.image = "An image is required";
    if (!f.startDate) e.startDate = "Start date is required";
    if (!f.endDate) e.endDate = "End date is required";
    if (f.startDate && f.endDate && f.endDate < f.startDate)
      e.endDate = "End date must be after start date";
    if (f.audience === "specified" && !f.recipients.length)
      e.recipients = "Add at least one customer alias";
    if (f.remark.length > 1000) e.remark = "Max 1000 characters";
    return e;
  };

  const submit = () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (modal === "edit") {
      persist(popups.map((p) => (p.id === form.id ? { ...form } : p)));
      toast.success(`${form.code} updated`);
    } else {
      const rec: Popup = {
        ...form,
        id: `p${Date.now()}`,
        code: nextCode(popups),
        createdAt: new Date().toISOString(),
      };
      persist([...popups, rec]);
      setSelected(rec.id);
      toast.success(`${rec.code} created`);
    }
    setModal(null);
  };

  if (!canView) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mx-auto max-w-md rounded-xl border bg-card p-8 text-center">
            <Lock className="w-6 h-6 mx-auto mb-3 text-muted-foreground" />
            <h1 className="font-heading text-lg font-bold mb-1">Restricted</h1>
            <p className="text-sm text-muted-foreground">
              Popup Management is available to Super Admins only.
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
          <h1 className="font-heading text-xl font-bold">Popups</h1>
          <p className="text-sm text-muted-foreground">
            Super Admin only · In-app marketing banners for the customer app
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              value={nameQ}
              onChange={(e) => setNameQ(e.target.value)}
              placeholder="Search popup name"
              className="h-9 w-56"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={statusQ} onValueChange={(v) => setStatusQ(v as typeof statusQ)}>
              <SelectTrigger className="h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => setApplied({ name: nameQ, status: statusQ })}>
            <Search className="w-4 h-4 mr-1.5" /> Search
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNameQ("");
              setStatusQ("all");
              setApplied({ name: "", status: "all" });
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
                <th>Popup Name</th>
                <th>Added By</th>
                <th>Platform</th>
                <th>Version Range</th>
                <th>Order</th>
                <th>Image</th>
                <th>Frequency</th>
                <th>Audience</th>
                <th>Recipients</th>
                <th>Validity Period</th>
                <th>Status</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const st = popupStatus(p);
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    className={`border-t cursor-pointer [&>td]:px-3 [&>td]:py-2.5 [&>td]:whitespace-nowrap ${
                      selected === p.id ? "bg-primary/5" : "hover:bg-muted/40"
                    }`}
                  >
                    <td>
                      <input
                        type="radio"
                        checked={selected === p.id}
                        onChange={() => setSelected(p.id)}
                        aria-label={`Select ${p.code}`}
                      />
                    </td>
                    <td className="font-mono text-xs">{p.code}</td>
                    <td className="font-medium">{p.name}</td>
                    <td className="text-muted-foreground">{p.addedBy}</td>
                    <td className="capitalize">
                      {p.platforms.length === 2 ? "Both" : p.platforms[0]}
                    </td>
                    <td className="font-mono text-xs">
                      {p.startVersion} – {p.endVersion}
                    </td>
                    <td>{p.order}</td>
                    <td>
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoom(p.image);
                          }}
                          className="h-9 w-14 rounded object-cover"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{FREQUENCY_LABEL[p.frequency]}</td>
                    <td>{p.audience === "everyone" ? "Everyone" : "Specified Users"}</td>
                    <td>{p.audience === "everyone" ? "All" : p.recipients.length}</td>
                    <td className="text-xs">
                      {p.startDate} → {p.endDate}
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[st]}`}
                      >
                        {STATUS_LABEL[st]}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate text-muted-foreground">
                      {p.remark || "—"}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={14} className="px-3 py-10 text-center text-muted-foreground">
                    No popups match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit / Copy modal */}
      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal === "edit" ? "Edit Popup" : modal === "copy" ? "Copy Popup" : "Add Popup"}
            </DialogTitle>
            <DialogDescription>
              Activity Code <span className="font-mono">{form.code || "auto"}</span> · Added by{" "}
              {form.addedBy}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Popup Name *</Label>
              <Input
                value={form.name}
                maxLength={100}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Popup Type *</Label>
                <RadioGroup
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as PopupType })}
                  className="flex gap-4"
                >
                  {(["full_screen", "in_between"] as PopupType[]).map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={t} /> {TYPE_LABEL[t]}
                    </label>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  {form.type === "full_screen"
                    ? "Scales responsively to the device screen."
                    : "Fixed dimensions, centered over a dark overlay."}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Display Platform *</Label>
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
                <Label>Display Screen *</Label>
                <Select
                  value={form.screen}
                  onValueChange={(v) => setForm({ ...form, screen: v as PopupScreen })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPUP_SCREENS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Display Order *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
                {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Action After Click *</Label>
              <RadioGroup
                value={form.action}
                onValueChange={(v) => setForm({ ...form, action: v as PopupAction })}
                className="grid grid-cols-2 gap-2"
              >
                {(["native", "h5", "browser", "none"] as PopupAction[]).map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={a} /> {ACTION_LABEL[a]}
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
              <Label>Image * (PNG/JPG, max 5 MB)</Label>
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  onImage(e.dataTransfer.files?.[0]);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 hover:bg-muted/40"
              >
                {form.image ? (
                  <img src={form.image} alt="Popup" className="h-16 w-24 rounded object-cover" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {form.image ? "Click or drop to replace image" : "Drop an image here, or click to browse"}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => onImage(e.target.files?.[0])}
              />
              {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Validity Start * (UTC+4)</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Validity End *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Popup Frequency *</Label>
                <RadioGroup
                  value={form.frequency}
                  onValueChange={(v) => setForm({ ...form, frequency: v as PopupFrequency })}
                  className="space-y-1"
                >
                  {(["once", "daily", "every_launch"] as PopupFrequency[]).map((f) => (
                    <label key={f} className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value={f} /> {FREQUENCY_LABEL[f]}
                    </label>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-1.5">
                <Label>Target Audience *</Label>
                <RadioGroup
                  value={form.audience}
                  onValueChange={(v) => setForm({ ...form, audience: v as PopupAudience })}
                  className="space-y-1"
                >
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="everyone" /> Everyone
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value="specified" /> Specified Users
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
            <DialogTitle>Confirm again to end this popup</DialogTitle>
            <DialogDescription>
              {selectedPopup?.code} will stop showing in the customer app immediately. This cannot
              be undone — use Copy Parameters to relaunch it later.
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

      {/* Image zoom */}
      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Popup Image</DialogTitle>
          </DialogHeader>
          {zoom && <img src={zoom} alt="Popup preview" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
