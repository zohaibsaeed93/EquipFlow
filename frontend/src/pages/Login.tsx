import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: "var(--accent-muted)", opacity: 0.5 }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: "var(--info-muted)", opacity: 0.4 }}
        />
      </div>

      <div className="relative w-full max-w-[460px] animate-slide-up">
        <Card className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-lg mb-4 shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Welcome to{" "}
              <span style={{ color: "var(--accent)" }}>EquipFlow</span>
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign in to manage equipment bookings
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-5 flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "var(--danger-muted)",
                color: "var(--danger)",
                border: "1px solid var(--danger-muted)",
              }}
            >
              <span className="mt-0.5 shrink-0">&#9888;</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors duration-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors duration-200"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <p
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
