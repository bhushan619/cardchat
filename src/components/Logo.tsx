import logoUrl from "@/assets/cardchat-logo.png";

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img
      src={logoUrl}
      alt="CardChat logo"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
}
