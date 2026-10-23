import { useEffect, useState } from "react";
import { Bell, Megaphone, ArrowRight, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AppNotification, loadNotifications, scheduleUtc } from "@/lib/notifications";
import { INBOX_EVENT, readNotificationIds, saveNotificationRead, notificationPreference, visibleCampaigns } from "@/lib/customerNotifications";
import { CURRENT_CUSTOMER_ALIAS } from "@/lib/vipCustomers";
import { getCustomerTags } from "@/lib/customerTags";

export default function NotificationInbox() {
  const [open, setOpen] = useState(false);
  const [reads, setReads] = useState<string[]>(readNotificationIds);
  const [campaigns, setCampaigns] = useState<AppNotification[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const refresh = () => {
      setReads(readNotificationIds());
      // The demo customer is VIP. Audience matching uses tag IDs, not aliases.
      const tags = getCustomerTags().filter(t => t.id === "vip").map(t => t.id);
      setCampaigns(visibleCampaigns(loadNotifications(), notificationPreference("Promotions & Campaigns", false), CURRENT_CUSTOMER_ALIAS, tags));
    };
    refresh();
    [INBOX_EVENT, "cc_notifications_changed", "customer-tags-updated"].forEach(e => window.addEventListener(e, refresh));
    const timer = window.setInterval(refresh, 30000);
    return () => {
      window.clearInterval(timer);
      [INBOX_EVENT, "cc_notifications_changed", "customer-tags-updated"].forEach(e => window.removeEventListener(e, refresh));
    };
  }, []);
  const unread = campaigns.filter(n => !reads.includes(n.id)).length;
  const tap = (n: AppNotification) => {
    saveNotificationRead(n.id);
    if (n.action === "native" && n.pathParam.startsWith("/customer")) { setOpen(false); navigate(n.pathParam); }
    else if (["h5", "browser"].includes(n.action) && /^https:\/\//.test(n.pathParam)) window.open(n.pathParam, "_blank", "noopener,noreferrer");
  };
  return <>
    <Button variant="outline" size="icon" className="relative shrink-0" aria-label={`Notifications, ${unread} unread`} onClick={() => setOpen(true)}>
      <Bell className="h-5 w-5" />
      {unread > 0 && <span className="absolute -right-1 -top-1 min-w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] px-1">{unread > 99 ? "99+" : unread}</span>}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[80dvh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 border-b text-left">
          <DialogTitle>Notifications</DialogTitle><DialogDescription>{unread} unread</DialogDescription>
          <Button size="sm" variant="ghost" className="self-start" disabled={!unread} onClick={() => campaigns.forEach(n => saveNotificationRead(n.id))}><CheckCheck className="h-4 w-4 mr-2" />Mark all read</Button>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          {campaigns.length === 0 && <div className="p-10 text-center text-muted-foreground"><Bell className="h-8 w-8 mx-auto mb-3" /><p>No notifications yet</p></div>}
          {campaigns.map(n => <article key={n.id} className="p-4 border-b last:border-0">
            <Button variant="ghost" className="w-full h-auto p-0 hover:bg-transparent hover:text-foreground whitespace-normal text-left justify-start items-start gap-3" onClick={() => tap(n)}>
              <span className="p-2 rounded-lg bg-warning/10 text-warning shrink-0"><Megaphone className="h-5 w-5" /></span>
              <span className="flex-1 min-w-0 space-y-1"><span className="block text-sm font-semibold">{n.title}</span><span className="block text-xs font-normal text-muted-foreground break-words">{n.body}</span><span className="block text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(n.sendType === "scheduled" ? scheduleUtc(n.sendAt) : n.createdAt || Date.now()), { addSuffix: true })}</span></span>
              {!reads.includes(n.id) && <span className="notification-unread-dot mt-1 shrink-0" aria-label="Unread" />}
              {n.action !== "none" && <ArrowRight className="h-3 w-3 shrink-0 mt-1" />}
            </Button>
            {n.imageUrl && <Button variant="ghost" className="h-auto p-0 mt-3 w-full overflow-hidden" aria-label={`Preview image for ${n.title}`} onClick={() => { saveNotificationRead(n.id); setImage(n.imageUrl ?? null); }}><img src={n.imageUrl} alt={n.title} className="max-h-44 w-full object-contain rounded-lg" /></Button>}
          </article>)}
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={!!image} onOpenChange={v => !v && setImage(null)}><DialogContent className="max-w-3xl w-[calc(100%-2rem)]"><DialogHeader><DialogTitle>Notification image</DialogTitle></DialogHeader>{image && <img src={image} alt="Campaign preview" className="w-full max-h-[70dvh] object-contain" />}</DialogContent></Dialog>
  </>;
}