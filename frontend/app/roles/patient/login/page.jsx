"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Medical Teal/Green Palette - matching patient theme
const palette = {
  primary: "#10B981",     // Emerald/Teal - Health/Wellness
  primaryLight: "#ECFDF5", // Very light green for backgrounds
  secondary: "#059669",   // Darker teal
  background: "#F0FDF4",  // Main Background
  textMain: "#1F2A44",    // Dark Navy - Readability
  textLight: "#64748B",   // Soft Gray - Descriptions
  white: "#FFFFFF",
  border: "#D1FAE5",      // Light green border
  error: "#EF4444",       // Red for errors
};

export default function PatientLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    patientId: "",
    dateOfBirth: "",
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
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Full name is required";
      }
      if (!formData.patientId) {
        newErrors.patientId = "Patient ID is required";
      }
      if (!formData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to patient dashboard after successful login/signup
      router.push("/roles/patient");
    }, 1500);
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
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:text-emerald-600"
          style={{ color: palette.textLight }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Role Selection
        </Link>

        {/* Login/Signup Card */}
        <div className="bg-white rounded-2xl shadow-xl border p-8" style={{ borderColor: palette.border }}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: palette.primaryLight }}>
              <svg className="w-8 h-8" style={{ color: palette.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: palette.textMain }}>
              {isLogin ? "Patient Login" : "Patient Sign Up"}
            </h1>
            <p className="text-sm" style={{ color: palette.textLight }}>
              {isLogin 
                ? "Access your personal health dashboard" 
                : "Create your patient account"}
            </p>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="flex items-center gap-2 mb-6 p-1 rounded-lg bg-gray-100">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrors({});
                setFormData({ email: "", password: "", confirmPassword: "", name: "", patientId: "", dateOfBirth: "" });
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                isLogin 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              style={isLogin ? { color: palette.primary } : {}}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrors({});
                setFormData({ email: "", password: "", confirmPassword: "", name: "", patientId: "", dateOfBirth: "" });
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                !isLogin 
                  ? "bg-white text-emerald-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              style={!isLogin ? { color: palette.primary } : {}}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: palette.textMain }}>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    errors.name ? "border-red-300 focus:ring-red-200" : "focus:ring-emerald-200"
                  }`}
                  style={{ 
                    borderColor: errors.name ? palette.error : palette.border,
                    fontFamily: '"Inter", sans-serif'
                  }}
                  placeholder="John Smith"
                />
                {errors.name && (
                  <p className="mt-1 text-xs" style={{ color: palette.error }}>{errors.name}</p>
                )}
              </div>
            )}

            {/* Patient ID field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="patientId" className="block text-sm font-semibold mb-2" style={{ color: palette.textMain }}>
                  Patient ID
                </label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    errors.patientId ? "border-red-300 focus:ring-red-200" : "focus:ring-emerald-200"
                  }`}
                  style={{ 
                    borderColor: errors.patientId ? palette.error : palette.border,
                    fontFamily: '"Inter", sans-serif'
                  }}
                  placeholder="PAT-12345"
                />
                {errors.patientId && (
                  <p className="mt-1 text-xs" style={{ color: palette.error }}>{errors.patientId}</p>
                )}
              </div>
            )}

            {/* Date of Birth field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold mb-2" style={{ color: palette.textMain }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    errors.dateOfBirth ? "border-red-300 focus:ring-red-200" : "focus:ring-emerald-200"
                  }`}
                  style={{ 
                    borderColor: errors.dateOfBirth ? palette.error : palette.border,
                    fontFamily: '"Inter", sans-serif'
                  }}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-xs" style={{ color: palette.error }}>{errors.dateOfBirth}</p>
                )}
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
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                  errors.email ? "border-red-300 focus:ring-red-200" : "focus:ring-emerald-200"
                }`}
                style={{ 
                  borderColor: errors.email ? palette.error : palette.border,
                  fontFamily: '"Inter", sans-serif'
                }}
                placeholder="patient@email.com"
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
                className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                  errors.password ? "border-red-300 focus:ring-red-200" : "focus:ring-emerald-200"
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

            {/* Confirm Password field (only for signup) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: palette.textMain }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    errors.confirmPassword ? "border-red-300 focus:ring-red-200" : "focus:ring-emerald-200"
                  }`}
                  style={{ 
                    borderColor: errors.confirmPassword ? palette.error : palette.border,
                    fontFamily: '"Inter", sans-serif'
                  }}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs" style={{ color: palette.error }}>{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot Password link (only for login) */}
            {isLogin && (
              <div className="flex justify-end">
                <Link 
                  href="#" 
                  className="text-sm font-medium transition-colors hover:text-emerald-600"
                  style={{ color: palette.primary }}
                >
                  Forgot password?
                </Link>
              </div>
            )}

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
                  {isLogin ? "Logging in..." : "Creating account..."}
                </span>
              ) : (
                isLogin ? "Login" : "Create Account"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: palette.border }}>
            <p className="text-xs" style={{ color: palette.textLight }}>
              By {isLogin ? "logging in" : "signing up"}, you agree to our{" "}
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

