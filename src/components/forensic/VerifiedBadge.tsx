import { ShieldCheck } from "lucide-react";

interface VerifiedBadgeProps {
  label?: string;
  className?: string;
}

export default function VerifiedBadge({ label = "Verified via Global Forensic DB", className = "" }: VerifiedBadgeProps) {
  return (
    <span className={`badge-verified ${className}`}>
      <ShieldCheck className="w-3 h-3" />
      {label}
    </span>
  );
}
