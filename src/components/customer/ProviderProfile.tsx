import { Shield, CheckCircle, Star, Clock, TrendingUp, Award } from "lucide-react";

export default function ProviderProfile() {
  return (
    <div className="space-y-4 animate-[fade-in_0.3s_ease-out]">
      {/* Provider Card */}
      <div className="bg-card border rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">
            <span className="text-accent-foreground font-heading font-bold text-xl">LC</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-bold text-base">LightChat Official</h3>
              <CheckCircle className="w-4 h-4 text-accent fill-accent/20" />
            </div>
            <p className="text-xs text-muted-foreground">Platform Verified · Since 2019</p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { icon: Shield, label: "Verified", value: "KYB ✓" },
            { icon: Star, label: "Rating", value: "4.9/5" },
            { icon: Clock, label: "Avg Payout", value: "< 5 min" },
          ].map(b => (
            <div key={b.label} className="bg-muted/50 rounded-xl p-2.5 text-center">
              <b.icon className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">{b.label}</p>
              <p className="text-xs font-semibold">{b.value}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: TrendingUp, label: "Total Traded", value: "$50M+" },
            { icon: Award, label: "Completed Orders", value: "200K+" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 bg-accent/5 border border-accent/10 rounded-xl p-3">
              <s.icon className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
                <p className="text-sm font-heading font-bold">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Marks */}
      <div className="bg-card border rounded-2xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Trust & Compliance</p>
        <div className="space-y-2.5">
          {[
            { label: "Identity Verified (KYB)", desc: "Business registration confirmed" },
            { label: "Escrow Protection", desc: "Funds held securely until settlement" },
            { label: "Licensed Operator", desc: "Regulatory compliant operations" },
            { label: "Dispute Resolution", desc: "24h response guarantee" },
          ].map(t => (
            <div key={t.label} className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium">{t.label}</p>
                <p className="text-[10px] text-muted-foreground">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
