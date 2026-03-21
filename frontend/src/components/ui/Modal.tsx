import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      <div
        className="fixed inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--modal-overlay)" }}
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full max-w-lg rounded-2xl border p-6 shadow-2xl animate-slide-up ${className}`}
          style={{
            backgroundColor: "var(--modal-bg)",
            borderColor: "var(--modal-border)",
            backdropFilter: "blur(24px)",
          }}
        >
          {title && (
            <h2
              className="mb-5 text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
