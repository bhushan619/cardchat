import AdminLayout from "@/components/admin/AdminLayout";
import { Globe, Eye, EyeOff, RefreshCw, CheckCircle, AlertTriangle, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import WhatsAppGatewayCard from "@/components/admin/WhatsAppGatewayCard";
import WarmupAntiBanCard from "@/components/admin/WarmupAntiBanCard";
import LangToggle from "@/components/admin/LangToggle";
import { usePageLang, makeT } from "@/lib/pageTranslations";

const T = {
  en: {
    title: "3rd-Party Merchant API Config",
    sub: "Super Admin only · Configure endpoints, credentials, and webhooks",
    apiStatus: "API Status: Connected", lastCheck: "Last health check: 2 min ago",
    test: "Test Connection",
    disableTitle: "Disable User Withdrawals",
    disableDesc: "Globally block all customer withdrawal requests. Existing balances stay intact; users will see your message when attempting to withdraw.",
    disabledBanner: "Withdrawals are currently DISABLED for all users.",
    msgLabel: "Message shown to users", msgPlaceholder: "e.g. Withdrawals are temporarily paused for maintenance.",
    saveMsg: "Save Message",
    base: "Base Configuration", baseUrl: "API Base URL", version: "API Version",
    env: "Environment", sandbox: "Sandbox", production: "Production", rate: "Rate Limit (req/min)",
    creds: "API Credentials", apiKey: "API Key", apiSecret: "API Secret", rotate: "Rotate Credentials",
    hooks: "Webhooks", cbUrl: "Callback URL", signSecret: "Signing Secret",
    bank: "Bank Verification API", verifyEp: "Verification Endpoint", bankOk: "Bank verification API is operational",
    health: "Health Monitoring", healthEp: "Health Check Endpoint",
    save: "Save Configuration",
    enabled: "User withdrawals have been re-enabled",
    disabled: "All user withdrawals have been disabled",
    saved: "Message saved",
    payApi: "Payment API", bankVerify: "Bank Verify", cardRates: "Card Rates", operational: "operational",
  },
  zh: {
    title: "第三方商户 API 配置",
    sub: "仅超级管理员 · 配置接口、凭证与 Webhook",
    apiStatus: "API 状态:已连接", lastCheck: "上次健康检查:2 分钟前",
    test: "测试连接",
    disableTitle: "禁用用户提现",
    disableDesc: "全局阻止所有客户提现请求。余额保持不变;用户尝试提现时将看到您的提示。",
    disabledBanner: "所有用户提现当前已禁用。",
    msgLabel: "向用户展示的提示", msgPlaceholder: "例如:提现因系统维护暂停。",
    saveMsg: "保存提示",
    base: "基础配置", baseUrl: "API 基础地址", version: "API 版本",
    env: "环境", sandbox: "沙盒", production: "生产", rate: "限流 (次/分钟)",
    creds: "API 凭证", apiKey: "API 密钥", apiSecret: "API 私钥", rotate: "更换凭证",
    hooks: "Webhook", cbUrl: "回调地址", signSecret: "签名密钥",
    bank: "银行核验 API", verifyEp: "核验接口", bankOk: "银行核验 API 运行正常",
    health: "健康监测", healthEp: "健康检查接口",
    save: "保存配置",
    enabled: "已重新开启用户提现",
    disabled: "已禁用所有用户提现",
    saved: "提示已保存",
    payApi: "支付 API", bankVerify: "银行核验", cardRates: "卡片汇率", operational: "运行中",
  },
} as const;

export default function AdminApiConfig() {
  const [showSecret, setShowSecret] = useState(false);
  const [withdrawalsDisabled, setWithdrawalsDisabled] = useState(
    sessionStorage.getItem("cc_withdrawals_disabled") === "1"
  );
  const [disableReason, setDisableReason] = useState(
    sessionStorage.getItem("cc_withdrawals_reason") || "Withdrawals are temporarily paused for system maintenance. Please try again later."
  );
  const [lang, setLang] = usePageLang("lang_api_config");
  const t = makeT(T, lang);

  const toggleWithdrawals = (next: boolean) => {
    setWithdrawalsDisabled(next);
    sessionStorage.setItem("cc_withdrawals_disabled", next ? "1" : "0");
    sessionStorage.setItem("cc_withdrawals_reason", disableReason);
    toast.success(next ? t("disabled") : t("enabled"));
  };

  const saveReason = () => {
    sessionStorage.setItem("cc_withdrawals_reason", disableReason);
    toast.success(t("saved"));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-xl font-bold mb-1">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("sub")}</p>
          </div>
          <LangToggle lang={lang} onChange={setLang} />
        </div>

        {/* API Status */}
        <div className="bg-card border rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="text-sm font-medium">{t("apiStatus")}</p>
              <p className="text-xs text-muted-foreground">{t("lastCheck")}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> {t("test")}
          </Button>
        </div>

        <div className="space-y-6">
          <WhatsAppGatewayCard />
          <WarmupAntiBanCard />

          {/* Withdrawal Kill Switch */}
          <div className={`border rounded-xl p-5 space-y-4 ${withdrawalsDisabled ? "bg-destructive/5 border-destructive/40" : "bg-card"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${withdrawalsDisabled ? "bg-destructive/15" : "bg-muted"}`}>
                  <Ban className={`w-4 h-4 ${withdrawalsDisabled ? "text-destructive" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <h2 className="font-heading font-semibold text-sm">{t("disableTitle")}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("disableDesc")}</p>
                </div>
              </div>
              <Switch checked={withdrawalsDisabled} onCheckedChange={toggleWithdrawals} />
            </div>

            {withdrawalsDisabled && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("disabledBanner")}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("msgLabel")}</label>
              <Textarea
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                rows={2}
                className="mt-1 text-sm"
                placeholder={t("msgPlaceholder")}
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" variant="outline" onClick={saveReason}>{t("saveMsg")}</Button>
              </div>
            </div>
          </div>

          {/* Base Config */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">{t("base")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("baseUrl")}</label>
                <Input defaultValue="https://api.merchant.com/v2" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("version")}</label>
                <Input defaultValue="v2" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("env")}</label>
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="outline" className="flex-1 text-xs h-9">{t("sandbox")}</Button>
                  <Button size="sm" className="flex-1 text-xs h-9 bg-accent text-accent-foreground">{t("production")}</Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("rate")}</label>
                <Input defaultValue="100" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Credentials */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">{t("creds")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("apiKey")}</label>
                <Input defaultValue="pk_live_****************************" className="mt-1" readOnly />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("apiSecret")}</label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    defaultValue="sk_live_abcdef1234567890"
                    className="mt-1 pr-16"
                    readOnly
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 mt-0.5">
                    <button onClick={() => setShowSecret(!showSecret)}>
                      {showSecret ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> {t("rotate")}
            </Button>
          </div>

          {/* Webhooks */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">{t("hooks")}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("cbUrl")}</label>
                <Input defaultValue="https://api.cardchat.com/webhooks/merchant" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("signSecret")}</label>
                <Input type="password" defaultValue="whsec_****" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Bank Verification */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">{t("bank")}</h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("verifyEp")}</label>
              <Input defaultValue="https://api.merchant.com/v2/bank/verify" className="mt-1" />
            </div>
            <div className="flex items-center gap-2 text-xs text-success">
              <CheckCircle className="w-3.5 h-3.5" /> {t("bankOk")}
            </div>
          </div>

          {/* Health Check */}
          <div className="bg-card border rounded-xl p-5 space-y-4">
            <h2 className="font-heading font-semibold text-sm">{t("health")}</h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("healthEp")}</label>
              <Input defaultValue="https://api.merchant.com/v2/health" className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: t("payApi") },
                { label: t("bankVerify") },
                { label: t("cardRates") },
              ].map(s => (
                <div key={s.label} className="bg-muted rounded-lg p-3 text-center">
                  <CheckCircle className="w-4 h-4 text-success mx-auto mb-1" />
                  <p className="text-xs font-medium">{s.label}</p>
                  <p className="text-[10px] text-success">{t("operational")}</p>
                </div>
              ))}
            </div>
          </div>

          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">{t("save")}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
