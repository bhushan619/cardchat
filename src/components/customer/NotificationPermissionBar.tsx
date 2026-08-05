import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

const DISMISS_KEY = "notif_prompt_dismissed";

export default function NotificationPermissionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    const supported = typeof window !== "undefined" && "Notification" in window;
    // Show when unsupported-but-prototype or permission not yet granted
    if (!supported || Notification.permission !== "granted") setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const allow = async () => {
    try {
      if ("Notification" in window) {
        const res = await Notification.requestPermission();
        if (res === "granted") {
          toast.success("Notifications enabled");
          dismiss();
          return;
        }
        toast.error("Notifications blocked. Enable them in your device settings.");
        return;
      }
      toast.success("Notifications enabled");
      dismiss();
    } catch {
      toast.error("Couldn't update notification settings");
    }
  };

  if (!visible) return null;

  return (
    <div className="shrink-0 flex items-center gap-2.5 px-3 py-2 bg-accent/10 border-b border-accent/20">
      <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
        <Bell className="w-3.5 h-3.5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium leading-tight">Turn on notifications</p>
        <p className="text-[10px] text-muted-foreground leading-tight truncate">
          Get order updates and agent replies instantly.
        </p>
      </div>
      <button
        onClick={allow}
        className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-accent text-accent-foreground"
      >
        Allow
      </button>
      <button
        onClick={dismiss}
        aria-label="Dismiss notification prompt"
        className="shrink-0 text-muted-foreground hover:text-foreground p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
