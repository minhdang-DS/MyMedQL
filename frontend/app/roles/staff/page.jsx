import Link from "next/link";

const palette = {
  primary: "#0A5FB5",
  primaryBright: "#1E88E5",
  navy: "#0D47A1",
  lightBg: "#E3F2FD",
  softBlue: "#A7D0F5",
  greyBorder: "#CBD3DD",
  success: "#2ECC71",
  danger: "#E63946"
};

const patients = [
  { name: "Patient 104", status: "Stable", vitals: "HR 96 · SpO2 97%", device: "Patch-12" },
  { name: "Patient 221", status: "Alert", vitals: "HR 128 · SpO2 90%", device: "Patch-08" }
];

const alerts = [
  { type: "Tachycardia", patient: "Patient 221", severity: "High", time: "Now" },
  { type: "Low SpO2", patient: "Patient 104", severity: "Medium", time: "3m ago" }
];

export default function StaffPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.lightBg, color: palette.navy }}>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: palette.primaryBright }}>Staff workspace</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ color: palette.navy }}>Monitor patients & manage alerts</h1>
            <p className="mt-2 text-sm" style={{ color: palette.navy }}>Live vitals, alerts with acknowledgment, and threshold controls.</p>
          </div>
          <Link href="/roles" className="text-sm font-semibold" style={{ color: palette.primaryBright }}>← Switch role</Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2" style={{ borderColor: palette.greyBorder }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Live Alerts</h2>
              <button className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ color: palette.primaryBright, borderColor: palette.primaryBright }}>View log</button>
            </div>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div key={`${alert.type}-${alert.patient}`} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm shadow-sm" style={{ borderColor: "#F8BBD0", backgroundColor: "#FFF5F5" }}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.danger }} />
                      <span className="font-semibold" style={{ color: "#C62828" }}>{alert.type}</span>
                      <span className="text-xs" style={{ color: "#C62828" }}>{alert.time}</span>
                    </div>
                    <div className="text-xs" style={{ color: palette.navy }}>{alert.patient} · Acknowledge or escalate</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm" style={{ color: palette.primaryBright }}>Acknowledge</button>
                    <button className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow" style={{ backgroundColor: palette.primary }}>Escalate</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.greyBorder }}>
            <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Thresholds</h2>
            <p className="mt-2 text-xs" style={{ color: palette.navy }}>Adjust global or patient-specific thresholds.</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: palette.greyBorder }}>
                <div style={{ color: palette.navy }}>HR Upper</div>
                <div className="flex items-center gap-2" style={{ color: palette.navy }}>
                  <span>120 bpm</span>
                  <button className="text-xs font-semibold" style={{ color: palette.primaryBright }}>Edit</button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: palette.greyBorder }}>
                <div style={{ color: palette.navy }}>SpO2 Lower</div>
                <div className="flex items-center gap-2" style={{ color: palette.navy }}>
                  <span>92 %</span>
                  <button className="text-xs font-semibold" style={{ color: palette.primaryBright }}>Edit</button>
                </div>
              </div>
            </div>
            <button className="mt-4 w-full rounded-full px-4 py-2 text-xs font-semibold text-white shadow" style={{ backgroundColor: palette.primary }}>Create patient-specific threshold</button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.greyBorder }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Patients</h2>
            <button className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ color: palette.primaryBright, borderColor: palette.primaryBright }}>Assign device</button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {patients.map((p) => (
              <div key={p.name} className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm shadow-sm" style={{ borderColor: palette.greyBorder }}>
                <div className="flex flex-col">
                  <span className="font-semibold" style={{ color: palette.navy }}>{p.name}</span>
                  <span className="text-xs" style={{ color: palette.navy }}>{p.vitals}</span>
                  <span className="text-xs" style={{ color: palette.navy }}>Device: {p.device}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === 'Alert' ? '' : ''}`} style={p.status === 'Alert'
                  ? { backgroundColor: "#FFF5F5", color: "#B71C1C", border: "1px solid #FEE2E2" }
                  : { backgroundColor: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
