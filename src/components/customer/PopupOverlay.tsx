import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import {
  Popup,
  PopupScreen,
  eligiblePopups,
  markSeen,
} from "@/lib/popups";

interface Props {
  screen: PopupScreen;
  platform?: "android" | "ios";
  appVersion?: string;
  alias?: string;
}

export default function PopupOverlay({
  screen,
  platform = "android",
  appVersion = "2.4.0",
  alias,
}: Props) {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Popup[]>([]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const ctx = useMemo(
    () => ({ screen, platform, appVersion, alias }),
    [screen, platform, appVersion, alias]
  );

  useEffect(() => {
    const refresh = () => {
      setQueue(eligiblePopups(ctx));
      setIndex(0);
      setFailed(false);
    };
    refresh();
    window.addEventListener("cc_popups_changed", refresh);
    return () => window.removeEventListener("cc_popups_changed", refresh);
  }, [ctx]);

  const current = queue[index];

  useEffect(() => {
    if (current) markSeen(current.code);
  }, [current]);

  if (!current || failed) return null;

  const dismiss = () => {
    setFailed(false);
    setIndex((i) => i + 1);
  };

  const handleTap = () => {
    if (current.action === "none") return;
    if (current.action === "native") {
      dismiss();
      navigate(current.pathParam || "/customer");
      return;
    }
    window.open(current.pathParam, "_blank", "noopener");
    dismiss();
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 p-6">
      <div
        className={
          current.type === "full_screen"
            ? "relative w-full max-w-sm"
            : "relative w-[280px]"
        }
      >
        <button
          onClick={dismiss}
          aria-label="Close popup"
          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md"
        >
          <X className="h-4 w-4" />
        </button>
        <img
          src={current.image}
          alt={current.name}
          onError={() => setFailed(true)}
          onClick={handleTap}
          className={`w-full rounded-2xl object-cover shadow-2xl ${
            current.action !== "none" ? "cursor-pointer" : ""
          } ${current.type === "in_between" ? "h-[360px]" : ""}`}
        />
      </div>
    </div>
  );
}
