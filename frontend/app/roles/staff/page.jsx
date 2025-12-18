"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const palette = {
  primary: "#0284c7", // Sky 600
  dark: "#0c4a6e",    // Sky 900
  surface: "#f8fafc", // Slate 50
  white: "#ffffff",
  border: "#e2e8f0",  // Slate 200
  critical: "#dc2626", // Red 600
  warning: "#f59e0b", // Amber 500
  success: "#10b981", // Emerald 500
  info: "#3b82f6",    // Blue 500
};

// Mock data with severity levels
const initialPatients = [
  { id: "104", name: "Patient 104", status: "Stable", vitals: "HR 96 · SpO2 97%", device: "Patch-12", priority: 3, room: "201-A" },
  { id: "221", name: "Patient 221", status: "Alert", vitals: "HR 128 · SpO2 90%", device: "Patch-08", priority: 1, room: "305-ICU" },
  { id: "305", name: "Patient 305", status: "Warning", vitals: "HR 105 · SpO2 95%", device: "Patch-15", priority: 2, room: "210-B" },
  { id: "412", name: "Patient 412", status: "Stable", vitals: "HR 72 · SpO2 99%", device: "Patch-03", priority: 3, room: "404-A" },
  { id: "508", name: "Patient 508", status: "Stable", vitals: "HR 68 · SpO2 98%", device: "Patch-05", priority: 3, room: "102-C" },
  { id: "119", name: "Patient 119", status: "Warning", vitals: "HR 110 · SpO2 96%", device: "Patch-09", priority: 2, room: "215-A" },
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

  // Computed Stats
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

  const openEditModal = (thresholdName) => {
    setSelectedThreshold(thresholdName);
    setEditModalOpen(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.surface, color: "#334155", fontFamily: '"Inter", sans-serif' }}>

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 border-b bg-white shadow-sm transition-all" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Title */}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800" style={{ fontFamily: '"Inter", sans-serif' }}>Patient Monitor</h1>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                System Operational
              </div>
            </div>

            {/* Status Chips */}
            <div className="flex gap-3 border-l pl-6" style={{ borderColor: palette.border }}>
              <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${patientsNeedingAttention > 0 ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-slate-50 text-slate-600'}`}>
                {patientsNeedingAttention > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                {patientsNeedingAttention} Need Attention
              </div>

              {criticalAlertsCount > 0 && (
                <div className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm animate-pulse">
                  🚨 {criticalAlertsCount} Critical
                </div>
              )}
            </div>
          </div>

          <Link href="/roles" className="group flex items-center gap-2 rounded-lg py-2 px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-sky-600">
            Switch Role <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </header>


      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* LEFT COLUMN: Alerts & Thresholds (4 cols) */}
          <div className="space-y-8 lg:col-span-4">

            {/* Live Alerts Panel */}
            <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: palette.border }}>
              <div className="flex items-center justify-between border-b px-5 py-4 bg-slate-50/50" style={{ borderColor: palette.border }}>
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  Live Alerts
                </h2>
                <button className="text-xs font-semibold text-sky-600 hover:text-sky-700">View All</button>
              </div>

              <div className="flex flex-col">
                {/* Categorize Alerts Logic */}
                {alerts.sort((a, b) => (a.severity === 'Critical' ? -1 : 1)).map((alert, idx) => {
                  const isCritical = alert.severity === 'Critical';
                  const isWarning = alert.severity === 'Warning';

                  return (
                    <div key={alert.id} className={`group relative border-b p-5 last:border-0 hover:bg-slate-50 transition-colors ${isCritical ? 'bg-red-50/30' : ''}`} style={{ borderColor: palette.border }}>
                      {/* Left Stripe Indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-sky-400'}`}></div>

                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isCritical ? 'bg-red-100 text-red-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                            }`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs font-medium text-slate-400">{alert.time}</span>
                        </div>
                        {isCritical && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                      </div>

                      <div className="mb-3">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {alert.type}
                          <span className="font-normal text-slate-500">in</span>
                          <span className="text-slate-800">{alert.patient}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">{alert.desc}</div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 rounded-lg border bg-white py-1.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all">
                          Acknowledge
                        </button>
                        {isCritical && (
                          <button className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all">
                            ESCALATE
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Thresholds Panel */}
            <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: palette.border }}>
              <div className="flex items-center justify-between border-b px-5 py-4 bg-slate-50/50" style={{ borderColor: palette.border }}>
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-600">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Global Thresholds
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {[
                  { label: "High HR Limit", value: "120 BPM", icon: "❤️" },
                  { label: "Low SpO2 Limit", value: "92 %", icon: "🫁" }
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between rounded-xl border p-3 hover:border-sky-200 hover:bg-sky-50 transition-colors cursor-pointer group" style={{ borderColor: palette.border }} onClick={() => openEditModal(setting.label)}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl bg-white p-1.5 rounded-lg border shadow-sm">{setting.icon}</span>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 group-hover:text-slate-500">{setting.label}</div>
                        <div className="font-bold text-slate-800">{setting.value}</div>
                      </div>
                    </div>
                    <button className="rounded-lg p-2 text-slate-400 hover:text-sky-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 px-5 py-2 border-t text-[10px] text-slate-500 font-mono" style={{ borderColor: palette.border }}>
                Audit: Admin Sara set HR &gt; 120 (2h ago)
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Patient List (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Patients</h2>
                <p className="text-sm text-slate-500">Monitoring {filteredPatients.length} active devices</p>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ID..."
                    className="w-full rounded-lg border bg-white px-4 py-2 pl-9 text-sm shadow-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    style={{ borderColor: palette.border }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <button
                  onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold shadow-sm transition-all ${showAlertsOnly ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white hover:bg-slate-50 text-slate-600'}`}
                  style={{ borderColor: showAlertsOnly ? "" : palette.border }}
                >
                  {showAlertsOnly ? '⚠️ Alerts Only' : 'Filter: All'}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPatients.length > 0 ? filteredPatients.map((p) => {
                const isCritical = p.status === 'Alert';
                const isWarning = p.status === 'Warning';
                const borderColor = isCritical ? 'border-red-200' : isWarning ? 'border-amber-200' : 'border-slate-200';
                const bgColor = isCritical ? 'bg-white' : 'bg-white';
                const shadow = isCritical ? 'shadow-red-50 ring-1 ring-red-100' : 'shadow-sm';

                return (
                  <Link href={`/roles/staff/patient/${p.id}`} key={p.id} className="block">
                    <div className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${borderColor} ${bgColor} ${shadow}`}>
                      {/* Status Strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'}`}></div>

                      <div className="pl-2">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-lg font-bold text-slate-800">{p.name}</div>
                            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                              <span>ID: {p.id}</span>
                              <span className="text-slate-300">|</span>
                              <span>Rm: {p.room}</span>
                            </div>
                          </div>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${isCritical ? 'bg-red-100 text-red-700' : isWarning ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                            {p.status}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Heart Rate</span>
                            <span className={`font-mono font-bold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
                              {p.vitals.split('·')[0].replace('HR ', '')} <span className="text-xs text-slate-400 font-sans">BPM</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${isCritical ? 'bg-red-500 w-3/4' : 'bg-sky-500 w-1/2'}`}></div>
                          </div>

                          <div className="flex justify-between items-center text-sm pt-1">
                            <span className="text-slate-500 font-medium">SpO2</span>
                            <span className="font-mono font-bold text-slate-800">
                              {p.vitals.split('·')[1].replace('SpO2 ', '')}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {p.device}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            </span>
                            Live
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              }) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 border rounded-xl border-dashed">
                  <svg className="w-8 h-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <p>No patients found.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main >

      {/* Edit Modal (re-styled) */}
      {
        editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-red-100 p-2 text-red-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Safety Threshold</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    You are modifying <strong className="text-slate-800">{selectedThreshold}</strong>.
                    This will immediately affect alerts for all connected patients.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
}
