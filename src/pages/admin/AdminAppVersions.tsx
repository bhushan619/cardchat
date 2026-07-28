import { useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Upload,
  Copy,
  Trash2,
  ChevronDown,
  AlertTriangle,
  Info,
  Wrench,
  Eye,
  Loader2,
  Smartphone,
  Apple,
  RotateCcw,
  Sparkles,
  Rocket,
  Download,
  ShieldCheck,
  Clock,
  Wifi,
  Battery,
  Signal,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useAdminLang } from "@/contexts/AdminLangContext";
import { makeT } from "@/lib/pageTranslations";

const T = {
  en: {
    title: "App Version Control",
    sub: "Super Admin only · Manage app versions, APK, and maintenance",
    preview: "Preview Update Prompts",
    save: "Save Version Settings",
    confirmTitle: "Apply version settings?",
    confirmDesc: "This will immediately affect all customers opening the app. Are you sure?",
    confirm: "Confirm",
    cancel: "Cancel",
    saved: "Version settings updated",
    versionCfg: "Version Configuration",
    android: "Android",
    ios: "iOS",
    latestVersion: "Latest Version",
    latestBuild: "Latest Build Number",
    minVersion: "Minimum Required Version",
    minBuild: "Minimum Build Number",
    minWarn: "Versions below this will be forced to update",
    storeUrl: "Store URL",
    changelogEn: "Changelog — English",
    changelogZh: "Changelog — Chinese",
    changelogPh: "What changed in this version...",
    changelogZhPh: "Chinese translation...",
    apk: "APK Direct Download",
    dropZone: "Drop APK file here, or click to browse",
    enableApk: "Enable direct APK download",
    enableApkDesc:
      "When enabled, customers who installed via APK (not from Play Store) will see a Download Update option in the update prompt.",
    previous: "Previous Versions",
    downloads: "downloads",
    uploaded: "Uploaded",
    copied: "Link copied",
    deleted: "APK deleted",
    maintenance: "Maintenance Mode",
    enableMaint: "Enable Maintenance Mode",
    maintMsgEn: "Maintenance Message — English",
    maintMsgZh: "Maintenance Message — Chinese",
    maintMsgPh: "We are upgrading our systems. Service will resume shortly.",
    endTime: "Estimated End Time",
    maintInfo:
      "When maintenance mode is ON, all customers will see a maintenance screen and cannot use the app. The screen auto-clears when you turn this off or when the estimated end time passes.",
    history: "Version History",
    date: "Date",
    platform: "Platform",
    version: "Version",
    minReq: "Min Required",
    changedBy: "Changed By",
    action: "Action",
    restore: "Restore",
    restoreTitle: "Restore version?",
    restoreDesc:
      "Restore version settings to this snapshot? This will change Latest Version and Minimum accordingly.",
    restored: "Version restored",
    analytics: "Update Analytics",
    activeVersions: "Active Versions",
    updatePrompts: "Update Prompts",
    apkDownloads: "APK Downloads",
    avgUpdate: "Avg. Time to Update",
    shownThisWeek: "shown this week",
    tapUpdate: "68% tapped Update Now",
    directDownloads: "direct downloads",
    sinceJul15: "since Jul 15",
    fromRelease: "from release to update",
    days: "days",
    mandatory: "Mandatory",
    optional: "Optional",
    maintenanceTab: "Maintenance",
    updateRequired: "Update Required",
    updateRequiredDesc:
      "A new version of CardChat is available with important improvements. Please update to continue.",
    updateNow: "Update Now",
    updateAvailable: "Update Available",
    versionReady: "Version 1.2.0 is ready",
    later: "Later",
    underMaintenance: "Under Maintenance",
    tryAgain: "Try Again",
    estReturn: "Estimated return",
  },
  zh: {
    title: "应用版本控制",
    sub: "仅超级管理员 · 管理应用版本、APK 和维护",
    preview: "预览更新提示",
    save: "保存版本设置",
    confirmTitle: "应用版本设置?",
    confirmDesc: "这将立即影响所有打开应用的客户。您确定吗?",
    confirm: "确认",
    cancel: "取消",
    saved: "版本设置已更新",
    versionCfg: "版本配置",
    android: "Android",
    ios: "iOS",
    latestVersion: "最新版本",
    latestBuild: "最新构建号",
    minVersion: "最低要求版本",
    minBuild: "最低构建号",
    minWarn: "低于此版本将被强制更新",
    storeUrl: "商店链接",
    changelogEn: "更新日志 — 英文",
    changelogZh: "更新日志 — 中文",
    changelogPh: "本版本更改内容...",
    changelogZhPh: "中文翻译...",
    apk: "APK 直接下载",
    dropZone: "拖放 APK 文件到此处,或点击浏览",
    enableApk: "启用 APK 直接下载",
    enableApkDesc:
      "启用后,通过 APK(非 Play 商店)安装的客户将在更新提示中看到下载更新选项。",
    previous: "历史版本",
    downloads: "下载次数",
    uploaded: "已上传",
    copied: "链接已复制",
    deleted: "APK 已删除",
    maintenance: "维护模式",
    enableMaint: "启用维护模式",
    maintMsgEn: "维护消息 — 英文",
    maintMsgZh: "维护消息 — 中文",
    maintMsgPh: "我们正在升级系统。服务将很快恢复。",
    endTime: "预计结束时间",
    maintInfo:
      "维护模式开启时,所有客户将看到维护页面且无法使用应用。关闭此项或到达预计结束时间后,页面将自动关闭。",
    history: "版本历史",
    date: "日期",
    platform: "平台",
    version: "版本",
    minReq: "最低要求",
    changedBy: "修改者",
    action: "操作",
    restore: "恢复",
    restoreTitle: "恢复版本?",
    restoreDesc: "恢复到此快照的版本设置? 这将相应更改最新版本和最低版本。",
    restored: "版本已恢复",
    analytics: "更新分析",
    activeVersions: "活跃版本",
    updatePrompts: "更新提示",
    apkDownloads: "APK 下载",
    avgUpdate: "平均更新时间",
    shownThisWeek: "本周展示",
    tapUpdate: "68% 点击立即更新",
    directDownloads: "直接下载",
    sinceJul15: "自 7 月 15 日以来",
    fromRelease: "从发布到更新",
    days: "天",
    mandatory: "强制更新",
    optional: "可选更新",
    maintenanceTab: "维护",
    updateRequired: "需要更新",
    updateRequiredDesc:
      "CardChat 有新版本可用,包含重要改进。请更新以继续使用。",
    updateNow: "立即更新",
    updateAvailable: "有可用更新",
    versionReady: "版本 1.2.0 已就绪",
    later: "稍后",
    underMaintenance: "维护中",
    tryAgain: "重试",
    estReturn: "预计恢复",
  },
} as const;

type Platform = "Android" | "iOS";
interface PlatformCfg {
  latest: string;
  latestBuild: string;
  minVersion: string;
  minBuild: string;
  storeUrl: string;
}

interface ApkRow {
  id: string;
  name: string;
  size: string;
  uploaded: string;
  downloads: number;
}

interface HistoryRow {
  date: string;
  platform: Platform;
  version: string;
  minReq: string;
  by: string;
  canRestore: boolean;
}

const initialAndroid: PlatformCfg = {
  latest: "1.2.0",
  latestBuild: "15",
  minVersion: "1.1.0",
  minBuild: "10",
  storeUrl: "https://play.google.com/store/apps/details?id=com.cardchat",
};
const initialIos: PlatformCfg = {
  latest: "1.2.0",
  latestBuild: "12",
  minVersion: "1.1.0",
  minBuild: "10",
  storeUrl: "https://apps.apple.com/app/cardchat",
};

const initialHistory: HistoryRow[] = [
  { date: "Jul 28, 2026", platform: "Android", version: "1.2.0", minReq: "1.1.0", by: "Bhushan", canRestore: true },
  { date: "Jul 20, 2026", platform: "Android", version: "1.1.0", minReq: "1.0.0", by: "Bhushan", canRestore: true },
  { date: "Jul 15, 2026", platform: "iOS", version: "1.2.0", minReq: "1.1.0", by: "Bhushan", canRestore: true },
  { date: "Jul 10, 2026", platform: "Android", version: "1.1.0", minReq: "1.0.0", by: "Bhushan", canRestore: true },
  { date: "Jul 1, 2026", platform: "Android", version: "1.0.0", minReq: "1.0.0", by: "Bhushan", canRestore: false },
];

const initialPreviousApks: ApkRow[] = [
  { id: "a2", name: "cardchat-v1.1.0.apk", size: "23.1 MB", uploaded: "Jul 20, 2026", downloads: 512 },
  { id: "a3", name: "cardchat-v1.0.0.apk", size: "22.4 MB", uploaded: "Jul 1, 2026", downloads: 984 },
];

function PlatformCard({
  icon,
  title,
  cfg,
  onChange,
  t,
  storePh,
}: {
  icon: React.ReactNode;
  title: string;
  cfg: PlatformCfg;
  onChange: (patch: Partial<PlatformCfg>) => void;
  t: (k: any) => string;
  storePh: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-heading font-semibold text-sm">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("latestVersion")}</label>
          <Input
            value={cfg.latest}
            onChange={(e) => onChange({ latest: e.target.value })}
            placeholder="1.2.0"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("latestBuild")}</label>
          <Input
            type="number"
            value={cfg.latestBuild}
            onChange={(e) => onChange({ latestBuild: e.target.value })}
            placeholder="15"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("minVersion")}</label>
          <Input
            value={cfg.minVersion}
            onChange={(e) => onChange({ minVersion: e.target.value })}
            placeholder="1.1.0"
            className="mt-1"
          />
          <p className="text-[10px] text-warning mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t("minWarn")}
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("minBuild")}</label>
          <Input
            type="number"
            value={cfg.minBuild}
            onChange={(e) => onChange({ minBuild: e.target.value })}
            placeholder="10"
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-muted-foreground">{t("storeUrl")}</label>
          <Input
            value={cfg.storeUrl}
            onChange={(e) => onChange({ storeUrl: e.target.value })}
            placeholder={storePh}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

function PhoneFrame({ children, tint }: { children: React.ReactNode; tint?: "green" | "amber" | "none" }) {
  const grad =
    tint === "green"
      ? "bg-gradient-to-br from-emerald-500/20 via-background to-emerald-500/5"
      : tint === "amber"
      ? "bg-gradient-to-br from-amber-500/25 via-background to-amber-500/5"
      : "bg-gradient-to-b from-muted/40 to-background";
  return (
    <div className="mx-auto" style={{ width: 375 }}>
      <div
        className="relative rounded-[42px] border-[10px] border-foreground/85 shadow-2xl overflow-hidden bg-background"
        style={{ height: 667 }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-foreground/85 rounded-b-2xl z-20" />
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-6 pt-1 text-[10px] font-semibold text-foreground/80 z-10">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </span>
        </div>
        <div className={`w-full h-full ${grad} flex flex-col`}>{children}</div>
      </div>
    </div>
  );
}

export default function AdminAppVersions() {
  const lang = useAdminLang();
  const t = makeT(T, lang);

  const [android, setAndroid] = useState<PlatformCfg>(initialAndroid);
  const [ios, setIos] = useState<PlatformCfg>(initialIos);
  const [changelogEn, setChangelogEn] = useState(
    "• Improved chat performance\n• Fixed transfer confirmation bugs\n• Added Chinese translations",
  );
  const [changelogZh, setChangelogZh] = useState(
    "• 提升聊天性能\n• 修复转账确认问题\n• 增加中文翻译",
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // APK
  const [currentApk, setCurrentApk] = useState<ApkRow | null>({
    id: "a1",
    name: "cardchat-v1.2.0.apk",
    size: "24.3 MB",
    uploaded: "Jul 28, 2026",
    downloads: 142,
  });
  const [apkEnabled, setApkEnabled] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previousApks, setPreviousApks] = useState<ApkRow[]>(initialPreviousApks);
  const fileRef = useRef<HTMLInputElement>(null);

  // Maintenance
  const [maintOn, setMaintOn] = useState(false);
  const [maintMsgEn, setMaintMsgEn] = useState("Scheduled maintenance in progress. We'll be back shortly.");
  const [maintMsgZh, setMaintMsgZh] = useState("正在进行计划维护。我们很快就会恢复。");
  const [maintEnd, setMaintEnd] = useState("");

  // History
  const [history] = useState<HistoryRow[]>(initialHistory);
  const [restoreTarget, setRestoreTarget] = useState<HistoryRow | null>(null);

  const analytics = useMemo(
    () => [
      { name: "v1.2.0", value: 62, color: "hsl(var(--success))" },
      { name: "v1.1.0", value: 28, color: "hsl(var(--warning))" },
      { name: "v1.0.0", value: 10, color: "hsl(var(--destructive))" },
    ],
    [],
  );

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setCurrentApk({
        id: `a-${Date.now()}`,
        name: "cardchat-v1.2.0.apk",
        size: "24.3 MB",
        uploaded: "Jul 28, 2026",
        downloads: 0,
      });
      setUploading(false);
      toast.success(t("uploaded"));
    }, 900);
  };

  const copyLink = (name: string) => {
    navigator.clipboard?.writeText(`https://cdn.cardchat.com/apk/${name}`);
    toast.success(t("copied"));
  };

  const doRestore = () => {
    if (!restoreTarget) return;
    setAndroid((a) =>
      restoreTarget.platform === "Android"
        ? { ...a, latest: restoreTarget.version, minVersion: restoreTarget.minReq }
        : a,
    );
    setIos((i) =>
      restoreTarget.platform === "iOS"
        ? { ...i, latest: restoreTarget.version, minVersion: restoreTarget.minReq }
        : i,
    );
    toast.success(t("restored"));
    setRestoreTarget(null);
  };

  const estReturnLabel = maintEnd
    ? new Date(maintEnd).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })
    : "3:00 PM";

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold mb-1">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("sub")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setPreviewOpen(true)}>
              <Eye className="w-4 h-4" />
              {t("preview")}
            </Button>
            <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setSaveOpen(true)}>
              {t("save")}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-card border rounded-xl p-5 space-y-5">
            <h2 className="font-heading font-semibold text-sm">{t("versionCfg")}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <PlatformCard
                icon={<Smartphone className="w-4 h-4 text-accent" />}
                title={t("android")}
                cfg={android}
                onChange={(p) => setAndroid((c) => ({ ...c, ...p }))}
                t={t}
                storePh="https://play.google.com/store/apps/..."
              />
              <PlatformCard
                icon={<Apple className="w-4 h-4 text-accent" />}
                title={t("ios")}
                cfg={ios}
                onChange={(p) => setIos((c) => ({ ...c, ...p }))}
                t={t}
                storePh="https://apps.apple.com/app/..."
              />
            </div>
            <div className="pt-2 border-t">
              <label className="text-xs font-medium text-muted-foreground">{t("changelogEn")}</label>
              <Textarea
                rows={3}
                value={changelogEn}
                onChange={(e) => setChangelogEn(e.target.value)}
                placeholder={t("changelogPh")}
                className="mt-1 text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setSaveOpen(true)}>
                {t("save")}
              </Button>
            </div>
          </div>

          {/* Section 2 - APK */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-sm">{t("apk")}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Android only</span>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".apk"
              className="hidden"
              onChange={() => handleUpload()}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl py-8 flex flex-col items-center justify-center text-sm text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-2" />
                  {t("dropZone")}
                </>
              )}
            </button>

            {currentApk && !uploading && (
              <div className="flex items-center gap-4 border rounded-lg p-3 bg-muted/30">
                <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentApk.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentApk.size} · {t("uploaded")} {currentApk.uploaded} · {currentApk.downloads} {t("downloads")}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyLink(currentApk.name)} className="gap-1">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <div className="flex items-start justify-between gap-4 border-t pt-4">
              <div>
                <p className="text-sm font-medium">{t("enableApk")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("enableApkDesc")}</p>
              </div>
              <Switch checked={apkEnabled} onCheckedChange={setApkEnabled} />
            </div>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground">
                <ChevronDown className="w-3.5 h-3.5" />
                {t("previous")} ({previousApks.length})
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {previousApks.map((apk) => (
                  <div key={apk.id} className="flex items-center gap-3 border rounded-lg p-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{apk.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {apk.size} · {apk.uploaded} · {apk.downloads} {t("downloads")}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyLink(apk.name)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviousApks((p) => p.filter((x) => x.id !== apk.id));
                        toast.success(t("deleted"));
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Section 3 - Maintenance */}
          <div
            className={`border rounded-xl p-5 space-y-4 transition-colors ${
              maintOn ? "bg-warning/10 border-warning/40" : "bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    maintOn ? "bg-warning/25" : "bg-muted"
                  }`}
                >
                  <Wrench className={`w-5 h-5 ${maintOn ? "text-warning" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-sm">{t("maintenance")}</h2>
                  <p className="text-xs text-muted-foreground">{t("enableMaint")}</p>
                </div>
              </div>
              <Switch
                checked={maintOn}
                onCheckedChange={setMaintOn}
                className="scale-125"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("maintMsgEn")}</label>
                <Textarea
                  rows={3}
                  value={maintMsgEn}
                  onChange={(e) => setMaintMsgEn(e.target.value)}
                  placeholder={t("maintMsgPh")}
                  className="mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("endTime")}</label>
                <Input
                  type="datetime-local"
                  value={maintEnd}
                  onChange={(e) => setMaintEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2 text-xs text-primary bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{t("maintInfo")}</span>
            </div>
          </div>

          {/* Section 4 - History */}
          <div className="bg-card border rounded-xl p-5">
            <h2 className="font-heading font-semibold text-sm mb-4">{t("history")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b">
                    <th className="py-2 font-medium">{t("date")}</th>
                    <th className="py-2 font-medium">{t("platform")}</th>
                    <th className="py-2 font-medium">{t("version")}</th>
                    <th className="py-2 font-medium">{t("minReq")}</th>
                    <th className="py-2 font-medium">{t("changedBy")}</th>
                    <th className="py-2 font-medium text-right">{t("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2.5">{h.date}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1">
                          {h.platform === "Android" ? (
                            <Smartphone className="w-3 h-3" />
                          ) : (
                            <Apple className="w-3 h-3" />
                          )}
                          {h.platform}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-xs">{h.version}</td>
                      <td className="py-2.5 font-mono text-xs">{h.minReq}</td>
                      <td className="py-2.5">{h.by}</td>
                      <td className="py-2.5 text-right">
                        {h.canRestore ? (
                          <button
                            onClick={() => setRestoreTarget(h)}
                            className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {t("restore")}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5 - Analytics */}
          <div className="bg-card border rounded-xl p-5">
            <h2 className="font-heading font-semibold text-sm mb-4">{t("analytics")}</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">{t("activeVersions")}</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                      >
                        {analytics.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(v: number) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 mt-2">
                  {analytics.map((a) => (
                    <div key={a.name} className="flex items-center gap-2 text-[11px]">
                      <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                      <span className="text-muted-foreground">{a.name}</span>
                      <span className="ml-auto font-medium">{a.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">{t("updatePrompts")}</p>
                <p className="text-2xl font-bold font-heading">1,247</p>
                <p className="text-xs text-muted-foreground mt-1">{t("shownThisWeek")}</p>
                <p className="text-xs text-success mt-2">{t("tapUpdate")}</p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">{t("apkDownloads")}</p>
                <p className="text-2xl font-bold font-heading">142</p>
                <p className="text-xs text-muted-foreground mt-1">{t("directDownloads")}</p>
                <p className="text-xs text-muted-foreground mt-2">{t("sinceJul15")}</p>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-xs text-muted-foreground mb-2">{t("avgUpdate")}</p>
                <p className="text-2xl font-bold font-heading">
                  2.3 <span className="text-sm font-normal text-muted-foreground">{t("days")}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">{t("fromRelease")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save confirm */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmTitle")}</DialogTitle>
            <DialogDescription>{t("confirmDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              className="bg-success text-success-foreground hover:bg-success/90"
              onClick={() => {
                setSaveOpen(false);
                toast.success(t("saved"));
              }}
            >
              {t("confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirm */}
      <Dialog open={!!restoreTarget} onOpenChange={(o) => !o && setRestoreTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("restoreTitle")}</DialogTitle>
            <DialogDescription>
              {t("restoreDesc")} ({restoreTarget?.date} · {restoreTarget?.platform} v{restoreTarget?.version})
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreTarget(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={doRestore}>{t("confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("preview")}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="mandatory">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="mandatory">{t("mandatory")}</TabsTrigger>
              <TabsTrigger value="optional">{t("optional")}</TabsTrigger>
              <TabsTrigger value="maintenance">{t("maintenanceTab")}</TabsTrigger>
            </TabsList>

            <TabsContent value="mandatory" className="pt-4">
              <PhoneFrame tint="green">
                <div className="pt-12 px-6 flex flex-col h-full">
                  {/* Decorative sparkles */}
                  <div className="absolute top-16 left-8 text-emerald-400/60 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="absolute top-24 right-10 text-emerald-400/50 animate-pulse" style={{ animationDelay: "0.3s" }}>
                    <Sparkles className="w-3 h-3" />
                  </div>

                  <div className="mx-auto relative mt-2 mb-5">
                    <div className="absolute inset-0 bg-emerald-500/40 blur-2xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                      <Rocket className="w-10 h-10 text-white" strokeWidth={2.2} />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground line-through">
                      v{android.minVersion}
                    </span>
                    <ArrowRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">
                      v{android.latest}
                    </span>
                  </div>

                  <h3 className="text-[22px] leading-tight font-heading font-bold text-center">
                    {t("updateRequired")}
                  </h3>
                  <p className="text-[13px] text-muted-foreground text-center mt-2 px-2">
                    {t("updateRequiredDesc")}
                  </p>

                  <div className="mt-4 flex-1 bg-card/80 backdrop-blur border border-emerald-500/20 rounded-2xl p-3.5 overflow-y-auto">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-600 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> What's new
                    </p>
                    <ul className="space-y-1.5">
                      {changelogEn.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{line.replace(/^[•\-*]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="w-full mt-4 mb-4 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/40 flex items-center justify-center gap-2 hover:shadow-emerald-500/50 transition-shadow">
                    <Download className="w-4 h-4" />
                    {t("updateNow")}
                  </button>
                </div>
              </PhoneFrame>
            </TabsContent>

            <TabsContent value="optional" className="pt-4">
              <PhoneFrame tint="none">
                <div className="pt-10 flex flex-col h-full relative">
                  {/* App chrome */}
                  <div className="px-4 py-3 border-b flex items-center justify-between bg-background/80 backdrop-blur">
                    <p className="text-sm font-heading font-bold">CardChat</p>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
                  </div>
                  <div className="p-3 space-y-2 flex-1 opacity-40">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 w-24 rounded bg-muted" />
                          <div className="h-2 w-40 rounded bg-muted/70" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom sheet */}
                  <div className="absolute bottom-0 left-0 right-0 bg-card border-t rounded-t-3xl p-5 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)]">
                    <div className="mx-auto w-10 h-1 rounded-full bg-muted-foreground/30 mb-4" />

                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/30 blur-lg rounded-2xl" />
                        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-bold text-sm">{t("updateAvailable")}</p>
                        <p className="text-[11px] text-muted-foreground">{t("versionReady")}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">
                        v{android.latest}
                      </span>
                    </div>

                    <div className="bg-muted/40 rounded-xl p-3 max-h-24 overflow-y-auto mb-3">
                      <ul className="space-y-1">
                        {changelogEn.split("\n").filter(Boolean).slice(0, 3).map((line, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px]">
                            <span className="mt-1 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{line.replace(/^[•\-*]\s*/, "")}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                        {t("later")}
                      </button>
                      <button className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-500/30 flex items-center justify-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        {t("updateNow")}
                      </button>
                    </div>
                  </div>
                </div>
              </PhoneFrame>
            </TabsContent>

            <TabsContent value="maintenance" className="pt-4">
              <PhoneFrame tint="amber">
                <div className="pt-14 px-6 flex flex-col h-full items-center text-center">
                  <div className="relative mt-4 mb-6">
                    <div className="absolute inset-0 bg-amber-500/40 blur-3xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/40">
                      <Wrench className="w-11 h-11 text-white animate-[spin_6s_linear_infinite]" strokeWidth={2.2} />
                    </div>
                    {/* Orbit dot */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 shadow-md flex items-center justify-center">
                      <ShieldCheck className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  <span className="text-[10px] uppercase tracking-widest font-semibold text-amber-600 mb-1">
                    System notice
                  </span>
                  <h3 className="text-2xl font-heading font-bold">{t("underMaintenance")}</h3>
                  <p className="text-[13px] text-muted-foreground mt-3 px-2 leading-relaxed">
                    {maintMsgEn}
                  </p>

                  <div className="mt-6 w-full bg-card/80 backdrop-blur border border-amber-500/30 rounded-2xl p-4">
                    <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-amber-600 mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      {t("estReturn")}
                    </div>
                    <p className="text-2xl font-heading font-bold tabular-nums">{estReturnLabel}</p>
                  </div>

                  <div className="flex-1" />
                  <button className="w-full mb-4 h-12 rounded-2xl bg-foreground text-background font-semibold text-sm shadow-lg flex items-center justify-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    {t("tryAgain")}
                  </button>
                </div>
              </PhoneFrame>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
