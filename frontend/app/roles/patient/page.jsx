"use client";
import Link from "next/link";

const palette = {
  brand: "#0A5FB5",
  brandBright: "#1E88E5",
  navy: "#0D47A1",
  light: "#E3F2FD",
  soft: "#A7D0F5",
  border: "#CBD3DD",
  surface: "#FFFFFF",
  success: "#2ECC71",
  warning: "#F4B400",
  danger: "#E63946",
};

// Enhanced vitals data with trends and history for sparklines
const vitals = [
  {
    label: "Heart Rate",
    value: "82 bpm",
    trend: "Stable",
    trendDir: "right",
    trendColor: "#757575", // Gray for stable
    comparison: "Similar to yesterday (avg 81)",
    history: [78, 80, 82, 81, 83, 82, 82]
  },
  {
    label: "SpO2",
    value: "97%",
    trend: "Improving",
    trendDir: "up",
    trendColor: palette.success, // Green for up (good)
    comparison: "Higher than yesterday (95%)",
    history: [94, 95, 95, 96, 96, 97, 97]
  },
  {
    label: "Blood Pressure",
    value: "118/76",
    trend: "Stable",
    trendDir: "right",
    trendColor: "#757575",
    comparison: "Optimal range",
    history: [120, 119, 118, 118, 117, 118, 118]
  },
  {
    label: "Temperature",
    value: "36.8°C",
    trend: "Stable",
    trendDir: "right",
    trendColor: "#757575",
    comparison: "Normal",
    history: [36.7, 36.8, 36.8, 36.9, 36.8, 36.8, 36.8]
  }
];

const alerts = [
  {
    title: "Tachycardia resolved",
    time: "10m ago",
    status: "Resolved",
    explanation: "Your heart rate was temporarily higher than normal. It has returned to a safe range.",
    type: "info"
  },
  {
    title: "Low SpO2",
    time: "30m ago",
    status: "Acknowledged",
    explanation: "Your oxygen levels dipped briefly. Following the breathing exercises has helped improve it.",
    type: "warning"
  }
];

// Simple Sparkline Component
function Sparkline({ data, color }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 30;
  const width = 100;

  // Create points for SVG polyline
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const normalizedY = (val - min) / range;
    const y = height - (normalizedY * height); // Invert Y because SVG 0 is top
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible opacity-50">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle cx={width} cy={height - ((data[data.length - 1] - min) / range * height)} r="3" fill={color} />
    </svg>
  );
}

export default function PatientPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.light, color: palette.navy }}>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: palette.brandBright }}>Patient view</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ color: palette.navy }}>Your vitals and alerts</h1>
            <p className="mt-2 text-sm" style={{ color: palette.navy }}>Personal dashboard with recent alerts and guidance.</p>
          </div>
          <Link href="/roles" className="text-sm font-semibold" style={{ color: palette.brandBright }}>← Switch role</Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {/* Vitals Overview */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2" style={{ borderColor: palette.border }}>
            <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Vitals overview</h2>
            <p className="mt-2 text-xs" style={{ color: palette.navy }}>Latest readings and trends over the last 7 days.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {vitals.map((v) => (
                <div key={v.label} className="relative overflow-hidden rounded-xl border bg-white px-5 py-4 shadow-sm transition hover:shadow-md" style={{ borderColor: palette.border }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-semibold opacity-70" style={{ color: palette.navy }}>{v.label}</span>
                      <div className="mt-1 text-2xl font-bold" style={{ color: palette.navy }}>{v.value}</div>
                    </div>
                    {/* Trend Icon */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold" style={{ backgroundColor: `${v.trendColor}15`, color: v.trendColor }}>
                        {v.trendDir === 'up' && '↑'}
                        {v.trendDir === 'down' && '↓'}
                        {v.trendDir === 'right' && '→'}
                        <span>{v.trend}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Text */}
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-xs font-medium text-gray-500">{v.comparison}</span>
                    <div className="w-24">
                      <Sparkline data={v.history} color={v.trendColor} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts (Friendly) */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.border }}>
            <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Recent messages</h2>
            <div className="mt-4 space-y-4 text-sm">
              {alerts.map((a) => (
                <div key={a.title} className="rounded-xl border bg-gray-50 px-4 py-4 shadow-sm" style={{ borderColor: palette.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold" style={{ color: palette.navy }}>{a.title}</span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={a.status === 'Resolved' ? { backgroundColor: '#E8F5E9', color: palette.success } : { backgroundColor: '#FFF3E0', color: palette.brand }}>
                      {a.status}
                    </span>
                  </div>
                  {/* Friendly Explanation */}
                  <p className="text-xs leading-relaxed text-gray-600 bg-white p-2 rounded border border-gray-100 mb-2">
                    {a.explanation}
                  </p>
                  <div className="text-[10px] text-gray-400 text-right">{a.time}</div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110" style={{ backgroundColor: palette.brand }}>View full history</button>
          </div>
        </div>

        {/* Care Guidance */}
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.border }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Care guidance</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              "Keep sensor attached; check placement if alerts repeat.",
              "Follow breathing exercises if SpO2 dips.",
              "Stay hydrated and report chest discomfort immediately."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-blue-50 bg-blue-50/50 p-3 text-xs text-blue-900">
                <span className="mt-0.5 text-blue-400">•</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
