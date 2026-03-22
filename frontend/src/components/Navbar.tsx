import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";

  const links = isAdmin
    ? [
      { to: "/dashboard", label: "Dashboard", icon: "grid" },
      { to: "/book", label: "Book Equipment", icon: "calendar" },
      { to: "/bookings", label: "My Bookings", icon: "list" },
      { to: "/availability", label: "Availability", icon: "clock" },
      { to: "/equipment", label: "Equipment", icon: "wrench" },
    ]
    : [
      { to: "/dashboard", label: "Dashboard", icon: "grid" },
      { to: "/book", label: "Book Equipment", icon: "calendar" },
      { to: "/bookings", label: "My Bookings", icon: "list" },
      { to: "/availability", label: "Availability", icon: "clock" },
    ];

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav
      className="sticky top-0 z-40 border-b backdrop-blur-xl"
      style={{
        backgroundColor: "var(--nav-bg)",
        borderColor: "var(--nav-border)",
      }}
    >
      <div className="w-full max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5 group"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <span
                className="text-lg font-bold hidden sm:inline tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Equip<span style={{ color: "var(--accent)" }}>Flow</span>
              </span>
            </button>
          </div>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <button
                  key={link.to}
                  onClick={() => navigate(link.to)}
                  className="relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: active
                      ? "var(--accent-muted)"
                      : "transparent",
                    color: active
                      ? "var(--accent)"
                      : "var(--text-tertiary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor =
                        "var(--accent-muted)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--text-tertiary)";
                    }
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: theme toggle, user info, logout */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                color: "var(--text-tertiary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--accent-muted)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-tertiary)";
              }}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>

            {/* User info */}
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span
                className="text-sm font-semibold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {user?.name}
              </span>
              <Badge
                variant={isAdmin ? "warning" : "info"}
                className="mt-0.5 text-[10px] px-2 py-0.5"
              >
                {user?.role === "admin" ? "Admin" : "User"}
              </Badge>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
              {initials}
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="ml-1 hidden sm:inline-flex"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </Button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden ml-1 p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 pb-5 pt-3 space-y-2 animate-slide-down"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--card-bg)",
          }}
        >
          {links.map((link) => (
            <button
              key={link.to}
              onClick={() => {
                navigate(link.to);
                setMobileOpen(false);
              }}
              className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color:
                  location.pathname === link.to
                    ? "var(--accent)"
                    : "var(--text-secondary)",
                backgroundColor:
                  location.pathname === link.to
                    ? "var(--accent-muted)"
                    : "transparent",
              }}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};
