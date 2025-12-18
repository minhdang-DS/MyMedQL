import Link from "next/link";

// Medical Blue Palette
const palette = {
  primary: "#1F6AE1",     // Medical Blue - Trustworthy
  primaryLight: "#EFF6FF", // Very light blue for backgrounds
  secondary: "#10B981",   // Soft Teal/Green - Positive/Health
  background: "#F2F8FF",  // Main Background
  textMain: "#1F2A44",    // Dark Navy - Readability
  textLight: "#64748B",   // Soft Gray - Descriptions
  white: "#FFFFFF",
  border: "#E2E8F0",
};

export default function RoleSelectPage() {
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
          backgroundColor: 'rgba(255, 255, 255, 0.65)' // Same overlay as landing page
        }}
      />
      
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          {/* Logo Placeholder - keeping it subtle */}
          <div className="flex justify-center mb-6">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={palette.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3V4a1 1 0 0 1 1 1v5a4 4 0 0 1-8 0V5a1 1 0 0 1 1-1V2.3z" />
                <path d="M8 15v6" />
                <path d="M3 21h18" />
                <path d="M10 21v-6" />
                <path d="M5 2h2" />
                <path d="M17 2h2" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: palette.textMain }}>
            Welcome to MyMedQL
          </h1>
          <p className="text-lg font-medium" style={{ color: palette.textLight }}>
            Select your portal to continue.
          </p>
        </div>

        {/* Role Cards Container */}
        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">

          {/* Staff Card */}
          <Link href="/roles/staff/login" className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border" style={{ borderColor: palette.border }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>

            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 2a2 2 0 0 0-2 2v5a4 4 0 0 0 4 4 4 4 0 0 0 4-4V4a2 2 0 0 0-2-2h-4Z" />
                  <path d="M15 13v1a6 6 0 0 1-6 6v0a6 6 0 0 1-6-6v-3" />
                </svg>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-50 text-blue-700">
                Clinician Access
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-3" style={{ color: palette.textMain }}>Medical Staff</h2>
            <p className="mb-6 leading-relaxed" style={{ color: palette.textLight }}>
              Access real-time patient monitoring dashboards, manage alerts, and review clinical history.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Live Vital Monitoring",
                "Patient Prioritization",
                "Clinical Alert Management"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium" style={{ color: palette.textMain }}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center bg-green-50 text-emerald-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="w-full py-3 px-4 rounded-xl font-semibold text-center transition-all bg-white border border-blue-200 text-blue-700 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white">
              Enter Staff Portal
            </div>
          </Link>

          {/* Patient Card */}
          <Link href="/roles/patient/login" className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border" style={{ borderColor: palette.border }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

            <div className="flex items-start justify-between mb-6">
              <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-teal-50 text-teal-700">
                Patient View
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-3" style={{ color: palette.textMain }}>Patient Area</h2>
            <p className="mb-6 leading-relaxed" style={{ color: palette.textLight }}>
              View your personal health trends, check recent monitoring status, and understand your care plan.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Personal Health Insights",
                "Simplified Vital Trends",
                "Care Guidance & Support"
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium" style={{ color: palette.textMain }}>
                  <div className="h-5 w-5 rounded-full flex items-center justify-center bg-green-50 text-emerald-600">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="w-full py-3 px-4 rounded-xl font-semibold text-center transition-all bg-white border border-teal-200 text-teal-700 group-hover:bg-teal-600 group-hover:border-teal-600 group-hover:text-white">
              Enter Patient Portal
            </div>
          </Link>

        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors">
            <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
            Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
