import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      role: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        name: formData.name,
        password: formData.password,
        email: formData.email || undefined,
        role: formData.role as "user" | "admin",
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-2.5 rounded-xl text-sm transition-colors duration-200";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
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
              Join <span style={{ color: "var(--accent)" }}>EquipFlow</span>
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Create your account to start booking equipment
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Username <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                disabled={isLoading}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Full Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={isLoading}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Email{" "}
                <span
                  style={{ color: "var(--text-tertiary)" }}
                  className="font-normal"
                >
                  (optional)
                </span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                disabled={isLoading}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Confirm Password{" "}
                <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                disabled={isLoading}
                className={inputClasses}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                Admin accounts may require approval.
              </p>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          {/* Footer */}
          <p
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold transition-colors"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
