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

const vitals = [
  { label: "Heart Rate", value: "82 bpm", trend: "Stable" },
  { label: "SpO2", value: "97%", trend: "Up" },
  { label: "BP", value: "118 / 76", trend: "Stable" },
  { label: "Temperature", value: "36.8°C", trend: "Stable" }
];

const alerts = [
  { title: "Tachycardia resolved", time: "10m ago", status: "Resolved" },
  { title: "Low SpO2", time: "30m ago", status: "Acknowledged" }
];

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
          <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2" style={{ borderColor: palette.border }}>
            <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Vitals overview</h2>
            <p className="mt-2 text-xs" style={{ color: palette.navy }}>Latest readings and trends.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {vitals.map((v) => (
                <div key={v.label} className="rounded-xl border bg-white px-4 py-3 shadow-sm" style={{ borderColor: palette.border }}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold" style={{ color: palette.navy }}>{v.label}</span>
                    <span className="text-xs" style={{ color: palette.brandBright }}>{v.trend}</span>
                  </div>
                  <div className="mt-2 text-xl font-bold" style={{ color: palette.navy }}>{v.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.border }}>
            <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Recent alerts</h2>
            <div className="mt-4 space-y-3 text-sm">
              {alerts.map((a) => (
                <div key={a.title} className="rounded-lg border bg-[#F8FAFC] px-3 py-2 shadow-sm" style={{ borderColor: palette.border }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold" style={{ color: palette.navy }}>{a.title}</span>
                    <span className="text-xs font-semibold" style={a.status === 'Resolved' ? { color: palette.success } : { color: palette.brand }}>
                      {a.status}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: palette.navy }}>{a.time}</div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ backgroundColor: palette.brand }}>View full history</button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.border }}>
          <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Care guidance</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm" style={{ color: palette.navy }}>
            <li>Keep sensor attached; check placement if alerts repeat.</li>
            <li>Follow breathing exercises if SpO2 dips; contact staff if symptoms worsen.</li>
            <li>Stay hydrated and rest; report dizziness or chest discomfort immediately.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
