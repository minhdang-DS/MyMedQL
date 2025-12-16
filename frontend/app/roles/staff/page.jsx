"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const palette = {
  brand: "#0A5FB5",
  brandBright: "#1E88E5",
  navy: "#0D47A1",
  light: "#E3F2FD",
  soft: "#A7D0F5",
  border: "#CBD3DD",
  surface: "#FFFFFF",
  success: "#2ECC71",
  danger: "#E63946",
  warning: "#F4B400",
  info: "#4FC3F7",
};

// Mock data with severity levels
const initialPatients = [
  { id: "104", name: "Patient 104", status: "Stable", vitals: "HR 96 · SpO2 97%", device: "Patch-12", priority: 3 },
  { id: "221", name: "Patient 221", status: "Alert", vitals: "HR 128 · SpO2 90%", device: "Patch-08", priority: 1 },
  { id: "305", name: "Patient 305", status: "Warning", vitals: "HR 105 · SpO2 95%", device: "Patch-15", priority: 2 },
  { id: "412", name: "Patient 412", status: "Stable", vitals: "HR 72 · SpO2 99%", device: "Patch-03", priority: 3 }
];

const initialAlerts = [
  { id: 1, type: "Tachycardia", patient: "Patient 221", severity: "Critical", time: "Now", desc: "HR > 120 bpm" },
  { id: 2, type: "Elevated HR", patient: "Patient 305", severity: "Warning", time: "2m ago", desc: "HR > 100 bpm" },
  { id: 3, type: "Low SpO2", patient: "Patient 104", severity: "Info", time: "5m ago", desc: "Brief dip < 94%" }
];

export default function StaffPage() {
  const [patients, setPatients] = useState(initialPatients);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // Computed Stats for Global Banner
  const patientsNeedingAttention = patients.filter(p => p.priority < 3).length;
  const criticalAlertsCount = alerts.filter(a => a.severity === "Critical").length;

  // Filter and Sort Patients
  const filteredPatients = patients
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
      const matchesFilter = showAlertsOnly ? p.priority < 3 : true;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.priority - b.priority);

  // Live update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prev => [...prev]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Critical': return { bg: '#FFF5F5', text: '#C62828', border: '#FEE2E2', badge: palette.danger };
      case 'Warning': return { bg: '#FFFDE7', text: '#F57F17', border: '#FFF9C4', badge: palette.warning };
      case 'Info': default: return { bg: '#E3F2FD', text: palette.navy, border: '#BBDEFB', badge: palette.brandBright };
    }
  };

  const openEditModal = (thresholdName) => {
    setSelectedThreshold(thresholdName);
    setEditModalOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.light, color: palette.navy }}>
      <div className="mx-auto max-w-6xl px-6 py-6 ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: palette.brandBright }}>Staff workspace</p>
            <h1 className="mt-1 text-2xl font-bold" style={{ color: palette.navy }}>Patient Monitor</h1>
          </div>
          <Link href="/roles" className="text-xs font-semibold hover:underline" style={{ color: palette.brandBright }}>← Switch role</Link>
        </div>
      </div>

      {/* Global Status Banner */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10" style={{ borderColor: palette.border }}>
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold ${patientsNeedingAttention > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <span className={`flex h-2 w-2 rounded-full ${patientsNeedingAttention > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
              {patientsNeedingAttention} patients need attention
            </div>
            {criticalAlertsCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-bold text-red-800 animate-pulse">
                ⚠️ {criticalAlertsCount} critical alert{criticalAlertsCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 font-medium">System operational • Last sync: 2s ago</div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mt-2 grid gap-6 md:grid-cols-3">
          {/* Live Alerts Panel */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-2" style={{ borderColor: palette.border }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Live Alerts</h2>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
              </div>
              <div className="flex gap-2">
                <button className="text-[10px] font-semibold text-blue-600 hover:underline">View alert history</button>
                <button className="rounded-full border px-3 py-1 text-xs font-semibold hover:bg-gray-50" style={{ color: palette.brandBright, borderColor: palette.brandBright }}>View log</button>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => {
                const styles = getSeverityStyles(alert.severity);
                return (
                  <div key={alert.id} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm shadow-sm transition hover:shadow-md" style={{ borderColor: styles.border, backgroundColor: styles.bg }}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: styles.badge }}>
                          {alert.severity}
                        </span>
                        <span className="font-bold" style={{ color: styles.text }}>{alert.type}</span>
                        <span className="text-xs opacity-75" style={{ color: styles.text }}>• {alert.time}</span>
                      </div>
                      <div className="text-xs font-medium" style={{ color: palette.navy }}>
                        {alert.patient} <span className="text-gray-400">|</span> {alert.desc}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold hover:bg-gray-50" style={{ color: styles.text, border: `1px solid ${styles.border}` }}>Acknowledge</button>
                      {alert.severity === 'Critical' && (
                        <button className="rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm hover:brightness-110" style={{ backgroundColor: palette.danger }}>Escalate</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thresholds Panel */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.border }}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Thresholds</h2>
                <p className="mt-1 text-xs" style={{ color: palette.navy }}>Global safety limits.</p>
              </div>
              <button className="text-[10px] font-semibold text-blue-600 hover:underline">History</button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: palette.border }}>
                <div style={{ color: palette.navy }}>HR Upper</div>
                <div className="flex items-center gap-2" style={{ color: palette.navy }}>
                  <span className="font-mono font-semibold">120 bpm</span>
                  <button onClick={() => openEditModal("HR Upper")} className="text-xs font-semibold underline decoration-dotted" style={{ color: palette.brandBright }}>Edit</button>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2" style={{ borderColor: palette.border }}>
                <div style={{ color: palette.navy }}>SpO2 Lower</div>
                <div className="flex items-center gap-2" style={{ color: palette.navy }}>
                  <span className="font-mono font-semibold">92 %</span>
                  <button onClick={() => openEditModal("SpO2 Lower")} className="text-xs font-semibold underline decoration-dotted" style={{ color: palette.brandBright }}>Edit</button>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded bg-gray-50 p-2 text-[10px] text-gray-500 border border-gray-100">
              Audit Log: <strong>Admin Sara</strong> changed HR Upper to 120 (2h ago)
            </div>
          </div>
        </div>

        {/* Patients List with Search & Filter */}
        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: palette.border }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: palette.navy }}>Patients</h2>
              <div className="text-xs text-gray-500">Showing {filteredPatients.length} patients</div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search ID or Name"
                className="rounded-lg border px-3 py-1.5 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${showAlertsOnly ? 'bg-orange-100 border-orange-200 text-orange-800' : 'bg-white hover:bg-gray-50'}`}
              >
                {showAlertsOnly ? 'Filter: Alerts Only' : 'Filter: All'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {filteredPatients.length > 0 ? filteredPatients.map((p) => {
              const isCritical = p.status === 'Alert';
              const isWarning = p.status === 'Warning';
              return (
                <div key={p.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm shadow-sm ${isCritical ? 'ring-1 ring-red-100' : ''}`} style={{ borderColor: palette.border, backgroundColor: isCritical ? '#FFF5F5' : '#fff' }}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" style={{ color: palette.navy }}>{p.name}</span>
                      {isCritical && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                    </div>
                    <div className="mt-1 font-mono text-xs" style={{ color: palette.navy }}>{p.vitals}</div>
                    <span className="text-[10px] text-gray-400">ID: {p.id} • Device: {p.device} • Live</span>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={
                    isCritical ? { backgroundColor: "#FFEbee", color: "#C62828", border: "1px solid #FFCDD2" } :
                      isWarning ? { backgroundColor: "#FFFDE7", color: "#F9A825", border: "1px solid #FFF59D" } :
                        { backgroundColor: "#E8F5E9", color: "#2E7D32", border: "1px solid #C8E6C9" }
                  }>
                    {p.status}
                  </span>
                </div>
              );
            }) : (
              <div className="col-span-2 py-8 text-center text-gray-400 text-sm">
                No patients found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Threshold Confirmation Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-red-600">⚠️ Confirm Threshold Change</h3>
            <p className="mt-2 text-sm text-gray-700">
              You are editing the <strong>{selectedThreshold}</strong> limit.
              Changing this will affect alerting for <strong>all active patients</strong>.
            </p>
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
              This action will be logged in the audit trail under your ID.
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditModalOpen(false)}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Confirm & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
