import { MessageCircle } from "lucide-react";
import type { MessagingChannel } from "@/data/mock";

// WhatsApp glyph (lucide doesn't ship one)
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.52 3.48A11.78 11.78 0 0 0 12.05 0C5.5 0 .2 5.3.2 11.84c0 2.09.55 4.12 1.6 5.92L0 24l6.4-1.68a11.83 11.83 0 0 0 5.65 1.44h.01c6.55 0 11.84-5.3 11.84-11.84a11.77 11.77 0 0 0-3.38-8.44ZM12.05 21.6h-.01a9.76 9.76 0 0 1-4.97-1.36l-.36-.21-3.8 1 1.02-3.7-.23-.38a9.74 9.74 0 0 1-1.5-5.21c0-5.4 4.4-9.79 9.85-9.79 2.63 0 5.1 1.02 6.96 2.88a9.76 9.76 0 0 1 2.88 6.93c0 5.4-4.4 9.84-9.84 9.84Zm5.4-7.34c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.19-.24-.58-.49-.5-.66-.51l-.57-.01a1.1 1.1 0 0 0-.79.37c-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.22 1.35.19 1.86.12.57-.08 1.76-.72 2-1.42.25-.7.25-1.29.18-1.42-.07-.13-.27-.2-.57-.35Z" />
  </svg>
);

const meta: Record<MessagingChannel, { label: string; cls: string }> = {
  trtc:     { label: "In-app",   cls: "bg-primary/10 text-primary" },
  whatsapp: { label: "WhatsApp", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
};

export function ChannelBadge({
  channel,
  size = "sm",
  showLabel = true,
}: {
  channel: MessagingChannel;
  size?: "xs" | "sm";
  showLabel?: boolean;
}) {
  const m = meta[channel];
  const Icon = channel === "whatsapp" ? WhatsAppIcon : MessageCircle;
  const sizeCls = size === "xs"
    ? "text-[9px] px-1 py-0.5 gap-0.5 [&_svg]:w-2.5 [&_svg]:h-2.5"
    : "text-[10px] px-1.5 py-0.5 gap-1 [&_svg]:w-3 [&_svg]:h-3";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${m.cls} ${sizeCls}`}
      title={`Customer is messaging via ${m.label}`}
    >
      <Icon />
      {showLabel && <span>{m.label}</span>}
    </span>
  );
}

export default ChannelBadge;
