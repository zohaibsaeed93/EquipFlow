import React from "react";

type BadgeVariant = "success" | "danger" | "warning" | "neutral" | "info";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantMap: Record<BadgeVariant, string> = {
  success:
    "bg-[var(--success-muted)] text-[var(--success)] border-[var(--success-muted)]",
  danger:
    "bg-[var(--danger-muted)] text-[var(--danger)] border-[var(--danger-muted)]",
  warning:
    "bg-[var(--warning-muted)] text-[var(--warning)] border-[var(--warning-muted)]",
  neutral:
    "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)]",
  info: "bg-[var(--info-muted)] text-[var(--info)] border-[var(--info-muted)]",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
