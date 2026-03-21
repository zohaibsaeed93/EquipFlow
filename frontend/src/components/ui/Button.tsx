import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm shadow-[var(--accent-glow)]",
  secondary:
    "bg-[var(--card-bg)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-secondary)] hover:border-[var(--border-hover)]",
  danger:
    "bg-[var(--danger)] text-white hover:brightness-110 shadow-sm shadow-[var(--danger-muted)]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent)]",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
