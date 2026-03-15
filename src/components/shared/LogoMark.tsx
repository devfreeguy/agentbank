import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoMarkProps {
  /** "default" = logo.png (orange bg, for use on dark surfaces as a brand icon)
   *  "dark"    = logo-dark.png (dark bg, for use as a centered logomark on cards) */
  variant?: "default" | "dark";
  size?: number;
  className?: string;
}

export function LogoMark({
  variant = "default",
  size = 30,
  className,
}: LogoMarkProps) {
  const src =
    variant === "dark"
      ? "/assets/app/logo-dark.png"
      : "/assets/app/logo.png";

  return (
    <Image
      src={src}
      alt="AgentBank"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority
    />
  );
}
