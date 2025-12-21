"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "../../../services/auth";

// Medical Blue Palette - matching the design system
const palette = {
  primary: "#1F6AE1",     // Medical Blue - Trustworthy
  primaryLight: "#EFF6FF", // Very light blue for backgrounds
  secondary: "#10B981",   // Soft Teal/Green - Positive/Health
  background: "#F2F8FF",  // Main Background
  textMain: "#1F2A44",    // Dark Navy - Readability
  textLight: "#64748B",   // Soft Gray - Descriptions
  white: "#FFFFFF",
  border: "#E2E8F0",
  error: "#EF4444",       // Red for errors
};

export default function StaffLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form data
  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      await login(formData.email, formData.password);
      // Redirect to staff dashboard after successful login
      router.push("/roles/staff");
    } catch (err) {
      setErrors({ form: err.message || "Authentication failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: '"Inter", sans-serif'
      }}
    >
      {/* Overlay to make background faint - matching landing page */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.65)'
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/roles"
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:text-blue-600"
          style={{ color: palette.textLight }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Role Selection
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border p-8" style={{ borderColor: palette.border }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: palette.primaryLight }}>
              <svg className="w-8 h-8" style={{ color: palette.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 2a2 2 0 0 0-2 2v5a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4a2 2 0 0 0-2-2h-4Z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13v1a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6v-3" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: palette.textMain }}>
              Staff Login
            </h1>
            <p className="text-sm" style={{ color: palette.textLight }}>
              Access your medical staff dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {errors.form}
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: palette.textMain }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${errors.email ? "border-red-300 focus:ring-red-200" : "focus:ring-blue-200"
                  }`}
                style={{
                  borderColor: errors.email ? palette.error : palette.border,
                  fontFamily: '"Inter", sans-serif'
                }}
                placeholder="staff@hospital.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs" style={{ color: palette.error }}>{errors.email}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: palette.textMain }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${errors.password ? "border-red-300 focus:ring-red-200" : "focus:ring-blue-200"
                  }`}
                style={{
                  borderColor: errors.password ? palette.error : palette.border,
                  fontFamily: '"Inter", sans-serif'
                }}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: palette.error }}>{errors.password}</p>
              )}
            </div>

            {/* Forgot Password link */}
            <div className="flex justify-end">
              <Link
                href="#"
                className="text-sm font-medium transition-colors hover:text-blue-600"
                style={{ color: palette.primary }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              style={{
                backgroundColor: palette.primary,
                fontFamily: '"Inter", sans-serif'
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: palette.border }}>
            <p className="text-xs" style={{ color: palette.textLight }}>
              By logging in, you agree to our{" "}
              <Link href="#" className="font-medium hover:underline" style={{ color: palette.primary }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="font-medium hover:underline" style={{ color: palette.primary }}>
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

