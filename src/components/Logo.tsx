import logoAsset from "@/assets/cardchat-logo.png.asset.json";

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="CardChat logo"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
}
