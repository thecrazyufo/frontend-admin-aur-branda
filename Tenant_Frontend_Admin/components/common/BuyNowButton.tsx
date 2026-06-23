import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface BuyNowButtonProps {
  href: string;
  label?: string;
  price?: number;
  size?: "sm" | "md" | "lg";
}

export default function BuyNowButton({
  href,
  label,
  price,
  size = "md",
}: BuyNowButtonProps) {
  const sizeClasses = {
    sm: "text-sm py-2 px-4",
    md: "text-sm py-2.5 px-5",
    lg: "text-base py-3 px-7",
  };

  return (
    <Link href={href} className={`btn btn-accent ${sizeClasses[size]}`}>
      <ShoppingCart size={size === "lg" ? 18 : 15} />
      {label || (price ? `Buy Now — $${price}` : "Buy Now")}
    </Link>
  );
}
