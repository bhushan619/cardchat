import { useEffect, useRef, useState } from "react";
import { AppNotification, conversionRate } from "@/lib/notifications";
import { CustomerTagDef, getCustomerTags, tagPillStyle } from "@/lib/customerTags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronDown, Upload, Trash2, Expand } from "lucide-react";
import { toast } from "sonner";

export function NotificationAudienceTags({ form, onChange }: { form: AppNotification; onChange: (n: AppNotification) => void }) {
  const [tags, setTags] = useState<CustomerTagDef[]>(getCustomerTags);
  const [search, setSearch] = useState("");
  useEffect(() => { const refresh = () => setTags(getCustomerTags()); window.addEventListener("customer-tags-updated", refresh); return () => window.removeEventListener("customer-tags-updated", refresh); }, []);
  const ids = form.tagIds ?? [];
  const toggle = (id: string) => onChange({ ...form, audienceMode: "tags", tagIds: ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id] });
  return <div className="space-y-2">
    {form.audienceMode !== "tags" && form.recipients.length > 0 && <p className="text-xs text-warning">Legacy alias audience: {form.recipients.join(", ")}. Selecting tags replaces this audience.</p>}
    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full justify-between">Select customer tags <ChevronDown className="h-4 w-4" /></Button></PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-2"><Input aria-label="Search customer tags" placeholder="Search tags" value={search} onChange={e => setSearch(e.target.value)} /><div className="max-h-56 overflow-y-auto space-y-2">
        {tags.filter(t => t.label.toLowerCase().includes(search.toLowerCase())).map(t => <label key={t.id} className="flex items-center gap-2 cursor-pointer"><Checkbox checked={ids.includes(t.id)} onCheckedChange={() => toggle(t.id)} /><span className="rounded-full px-2 py-0.5 text-xs border" style={tagPillStyle(t.color)}>{t.label}</span></label>)}
        {!tags.length && <p className="text-xs text-muted-foreground">No customer tags available</p>}
      </div></PopoverContent>
    </Popover>
    <div className="flex flex-wrap gap-1">{ids.map(id => { const t = tags.find(x => x.id === id); return <span key={id} className="rounded-full px-2 py-0.5 text-xs border" style={t ? tagPillStyle(t.color) : undefined}>{t?.label ?? `Removed tag (${id})`}</span>; })}</div>
  </div>;
}

export function NotificationImageUpload({ form, onChange }: { form: AppNotification; onChange: (n: AppNotification) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [zoom, setZoom] = useState(false);
  return <div className="space-y-2">
    <Label>Campaign Image</Label>
    <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Upload campaign image" onChange={e => {
      const file = e.target.files?.[0]; e.target.value = "";
      if (!file) return;
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 1024 * 1024) { toast.error("Choose a PNG, JPG or WebP image up to 1 MB"); return; }
      const reader = new FileReader(); reader.onerror = () => toast.error("Image could not be read"); reader.onload = () => { if (typeof reader.result === "string") onChange({ ...form, imageUrl: reader.result, imageName: file.name }); }; reader.readAsDataURL(file);
    }} />
    <div className="flex items-center gap-2 flex-wrap"><Button variant="outline" size="sm" onClick={() => input.current?.click()}><Upload className="h-4 w-4 mr-2" />{form.imageUrl ? "Replace image" : "Upload image"}</Button><span className="text-xs text-muted-foreground">PNG, JPG, WebP · max 1 MB</span></div>
    {form.imageUrl && <div className="flex gap-3 items-center"><Button variant="ghost" className="p-0 h-24 w-32 overflow-hidden" onClick={() => setZoom(true)} aria-label="Enlarge uploaded image"><img src={form.imageUrl} alt="Uploaded campaign" className="h-full w-full object-contain" /></Button><div className="min-w-0"><p className="text-xs break-all">{form.imageName}</p><div className="flex gap-2 mt-2"><Button variant="outline" size="icon" aria-label="Enlarge image" onClick={() => setZoom(true)}><Expand className="h-4 w-4" /></Button><Button variant="outline" size="icon" aria-label="Remove image" onClick={() => onChange({ ...form, imageUrl: undefined, imageName: undefined })}><Trash2 className="h-4 w-4" /></Button></div></div></div>}
    <Dialog open={zoom} onOpenChange={setZoom}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Campaign image preview</DialogTitle></DialogHeader><img src={form.imageUrl} alt="Campaign enlarged" className="max-h-[65dvh] w-full object-contain" /></DialogContent></Dialog>
  </div>;
}

export function NotificationAnalytics({ campaign, onClose }: { campaign: AppNotification | null; onClose: () => void }) {
  return <Dialog open={!!campaign} onOpenChange={o => !o && onClose()}><DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Campaign Analytics</DialogTitle><DialogDescription>{campaign?.code} · {campaign?.title} · Prototype metrics</DialogDescription></DialogHeader>{campaign && <div className="space-y-5">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{[["Recipients", campaign.recipientCount], ["Delivered", campaign.deliveredCount], ["Clicks", campaign.clickCount], ["Conversions", campaign.conversionCount ?? 0]].map(([label, value]) => <div key={label} className="border rounded-lg p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-heading font-semibold">{Number(value).toLocaleString()}</p></div>)}</div>
    <p className="text-sm">Conversion goal: <strong>{(campaign.conversionGoal ?? "none").replace(/_/g, " ")}</strong> · Conversion rate: <strong>{conversionRate(campaign)}%</strong></p>
    <h3 className="font-semibold">Journey funnel</h3><div className="space-y-3">{[["Targeted", campaign.recipientCount], ["Delivered", campaign.deliveredCount], ["Tapped", campaign.clickCount], ["Converted", campaign.conversionCount ?? 0]].map(([label, value]) => { const percent = campaign.recipientCount ? Number(value) / campaign.recipientCount * 100 : 0; return <div key={label}><div className="flex justify-between text-xs mb-1"><span>{label}</span><span>{Number(value).toLocaleString()} · {percent.toFixed(1)}%</span></div><progress className="campaign-progress w-full h-2" max={100} value={percent} /></div>; })}</div>
    <p className="text-xs text-muted-foreground">Audience: {campaign.audience === "everyone" ? "Everyone" : campaign.audienceMode === "tags" ? (campaign.tagIds ?? []).map(id => getCustomerTags().find(t => t.id === id)?.label ?? id).join(", ") : campaign.recipients.join(", ")}</p>
    <p className="text-xs text-muted-foreground">Delivery and conversion figures are sample data; live attribution is not connected.</p>
  </div>}</DialogContent></Dialog>;
}