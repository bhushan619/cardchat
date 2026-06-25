import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number | string;
  className?: string;
  iconClassName?: string;
  prefix?: string;
};

/**
 * Admin-panel display helper for the new "Points" currency.
 * Renders a coin icon followed by the numeric value.
 */
export function PointsAmount({ value, className, iconClassName, prefix }: Props) {
  const num = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <span className={cn("inline-flex items-center gap-0.5 whitespace-nowrap", className)}>
      <Coins className={cn("w-3 h-3", iconClassName)} aria-hidden />
      {prefix}
      {num}
    </span>
  );
}

export default PointsAmount;
