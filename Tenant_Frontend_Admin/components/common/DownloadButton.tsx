import Link from "next/link";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  href: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "white";
}

export default function DownloadButton({
  href,
  label = "Download Free Trial",
  size = "md",
  variant = "outline",
}: DownloadButtonProps) {
  const sizeClasses = {
    sm: "text-sm py-2 px-4",
    md: "text-sm py-2.5 px-5",
    lg: "text-base py-3 px-6",
  };

  const variantClasses = {
    primary: "btn-primary",
    outline: "btn-outline",
    white: "btn-ghost-white",
  };

  return (
    <Link
      href={href}
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      <Download size={size === "lg" ? 18 : 15} />
      {label}
    </Link>
  );
}
