import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-md transition-all duration-200 ${className}`}
      style={{ boxShadow: `0 4px 16px ${`var(--card-shadow)`}` }}
    >
      {children}
    </div>
  );
};
