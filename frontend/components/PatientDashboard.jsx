"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { theme } from "../app/data/patients";
import { getPatientHistory, getPatient } from "../app/services/api";
import { useWebSocket } from "../app/hooks/useWebSocket";

// --- ECG Dashboard Component ---
// --- ECG Dashboard Component ---
function MedicalMonitoringDashboard({ isCritical, vitals }) {
    // State for vitals - initialized based on prop or passed vitals
    const [heartRate, setHeartRate] = useState(vitals?.heartRate || (isCritical ? 128 : 72));
    const [spo2, setSpo2] = useState(vitals?.spo2 || (isCritical ? 90 : 98));
    const [systolic, setSystolic] = useState(vitals?.bpSystolic || (isCritical ? 145 : 118));
    const [diastolic, setDiastolic] = useState(vitals?.bpDiastolic || (isCritical ? 92 : 76));
    const [temperature, setTemperature] = useState(vitals?.temperature || (isCritical ? 37.2 : 36.6));
    const [respirationRate, setRespirationRate] = useState(vitals?.respiration || (isCritical ? 24 : 16));

    useEffect(() => {
        if (vitals) {
            setHeartRate(vitals.heartRate);
            setSpo2(vitals.spo2);
            setSystolic(vitals.bpSystolic);
            setDiastolic(vitals.bpDiastolic);
            setTemperature(vitals.temperature);
            setRespirationRate(vitals.respiration);
        }
    }, [vitals]);

    // Waveform state
    const [ecgPath, setEcgPath] = useState('');
    const [plethPath, setPlethPath] = useState('');
    const [respirationPath, setRespirationPath] = useState('');

    // Refs for animation
    const ecgContainerRef = useRef(null);
    const plethContainerRef = useRef(null);
    const respContainerRef = useRef(null);
    const containerWidthsRef = useRef({ ecg: 600, pleth: 400, resp: 600 });

    // Animation state refs
    const sweepPositionsRef = useRef({ ecg: 0, pleth: 0, resp: 0 });
    const [sweepPosition, setSweepPosition] = useState({ ecg: 0, pleth: 0, resp: 0 });

    // Reset/Adjust vitals when isCritical changes
    useEffect(() => {
        if (isCritical) {
            setHeartRate(128);
            setSpo2(90);
            setSystolic(145);
            setDiastolic(92);
            setRespirationRate(24);
        } else {
            setHeartRate(72);
            setSpo2(98);
            setSystolic(118);
            setDiastolic(76);
            setRespirationRate(16);
        }
    }, [isCritical]);

    // Waveform Generators (Simplified logic)
    const generateEcg = useCallback(() => {
        const beatInterval = isCritical ? 80 : 120;
        let path = `M0,50 L10,50`;
        let x = 10;
        while (x < 1000) {
            x += 10; path += ` L${x},50`; // Baseline
            x += 5; path += ` L${x},${isCritical ? 45 : 48}`; // P
            x += 5; path += ` L${x},50`;
            x += 5; path += ` L${x},52`; // Q
            x += 5; path += ` L${x},${isCritical ? 15 : 10}`; // R (Higher spike)
            x += 5; path += ` L${x},55`; // S
            x += 10; path += ` L${x},50`;
            x += 10; path += ` L${x},${isCritical ? 42 : 45}`; // T
            x += 10; path += ` L${x},50`;
            x += beatInterval; // Gap
        }
        return path;
    }, [isCritical]);

    const generatePleth = useCallback(() => {
        let path = `M0,70`;
        let x = 0;
        const interval = isCritical ? 30 : 50;
        while (x < 800) {
            x += interval * 0.3; path += ` L${x},30`; // Up
            x += interval * 0.1; path += ` L${x},35`; // Peak
            x += interval * 0.2; path += ` L${x},50`; // Notch
            x += interval * 0.4; path += ` L${x},70`; // Down
        }
        return path;
    }, [isCritical]);

    const generateResp = useCallback(() => {
        let path = `M0,50`;
        let x = 0;
        const interval = isCritical ? 40 : 70;
        while (x < 1000) {
            // Sine-ish wave
            for (let i = 0; i < interval; i += 5) {
                x += 5;
                path += ` L${x},${50 + Math.sin(i) * 20}`;
            }
        }
        return path;
    }, [isCritical]);

    // Vitals Fluctuation Loop - REMOVED in favor of real data
    // Kept only if no vitals provided for fallback demo
    useEffect(() => {
        if (vitals) return; // Skip simulation if real data exists

        const interval = setInterval(() => {
            if (isCritical) {
                setHeartRate(p => Math.min(140, Math.max(120, p + (Math.random() > 0.5 ? 1 : -1))));
                setSpo2(p => Math.min(92, Math.max(88, p + (Math.random() > 0.5 ? 1 : -1))));
                setSystolic(p => Math.round(Math.min(155, Math.max(140, p + (Math.random() - 0.5) * 2))));
            } else {
                setHeartRate(p => Math.min(75, Math.max(68, p + (Math.random() > 0.5 ? 1 : -1))));
                setSpo2(p => 98);
                setSystolic(p => Math.round(Math.min(122, Math.max(115, p + (Math.random() - 0.5) * 2))));
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [isCritical, vitals]);

    // Size & Path Init
    const updateSizes = useCallback(() => {
        if (ecgContainerRef.current) containerWidthsRef.current.ecg = ecgContainerRef.current.offsetWidth || 600;
        if (plethContainerRef.current) containerWidthsRef.current.pleth = plethContainerRef.current.offsetWidth || 400;
        if (respContainerRef.current) containerWidthsRef.current.resp = respContainerRef.current.offsetWidth || 600;
    }, []);

    useEffect(() => {
        updateSizes();
        setEcgPath(generateEcg());
        setPlethPath(generatePleth());
        setRespirationPath(generateResp());
        window.addEventListener('resize', updateSizes);
        return () => window.removeEventListener('resize', updateSizes);
    }, [generateEcg, generatePleth, generateResp, updateSizes]);

    // Animation Loop
    useEffect(() => {
        let frameId;
        let lastT = Date.now();
        const speed = isCritical ? 180 : 100;

        const loop = () => {
            const now = Date.now();
            const dt = (now - lastT) / 1000;
            lastT = now;
            const move = speed * dt;

            sweepPositionsRef.current.ecg += move;
            sweepPositionsRef.current.pleth += move;
            sweepPositionsRef.current.resp += move * 0.8;

            // Wrap logic
            if (sweepPositionsRef.current.ecg > containerWidthsRef.current.ecg) sweepPositionsRef.current.ecg = 0;
            if (sweepPositionsRef.current.pleth > containerWidthsRef.current.pleth) sweepPositionsRef.current.pleth = 0;
            if (sweepPositionsRef.current.resp > containerWidthsRef.current.resp) sweepPositionsRef.current.resp = 0;

            setSweepPosition({ ...sweepPositionsRef.current });
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [isCritical]);

    // Helper colors
    const hrColor = isCritical ? theme.critical : theme.success;
    const spo2Color = isCritical ? theme.warning : "#4ECDC4"; // Cyan

    return (
        <div className="relative w-full overflow-hidden rounded-2xl shadow-xl transition-colors duration-1000" style={{ backgroundColor: theme.monitorBg, borderColor: isCritical ? '#4A0404' : '#1E293B' }}>
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: `linear-gradient(#4ECDC4 1px, transparent 1px), linear-gradient(90deg, #4ECDC4 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
            </div>

            <div className="relative p-6 space-y-6">
                {/* Top Row: ECG & HR */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* HR Box */}
                    <div className="lg:col-span-1 p-4 rounded-xl bg-slate-800/60 border border-slate-700 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className={`w-5 h-5 ${isCritical ? 'animate-ping' : 'animate-pulse'}`} fill={hrColor} viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Heart Rate</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-mono font-bold transition-colors" style={{ color: hrColor }}>{heartRate}</span>
                            <span className="text-sm font-medium text-slate-500">BPM</span>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            {isCritical ? "Beating faster than normal" : "Normal rhythm"}
                        </div>
                    </div>
                    {/* ECG Plot */}
                    <div className="lg:col-span-3 h-32 relative rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden" ref={ecgContainerRef}>
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <defs>
                                <mask id="maskEcg"><rect width="100%" height="100%" fill="white" /><rect x={Math.max(0, (sweepPosition.ecg / (containerWidthsRef.current.ecg || 600) * 1000) - 100)} width="100" height="100" fill="black" /></mask>
                            </defs>
                            <path d={ecgPath} stroke={hrColor} fill="none" strokeWidth="2" mask="url(#maskEcg)" />
                        </svg>
                    </div>
                </div>

                {/* Middle Row: SpO2, BP, Temp */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* SpO2 */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Oxygen (SpO2)</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-bold" style={{ color: spo2Color }}>{spo2}</span>
                            <span className="text-sm text-slate-500">%</span>
                        </div>
                        <div className="h-10 mt-2 relative rounded overflow-hidden bg-slate-900/50" ref={plethContainerRef}>
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 100">
                                <path d={plethPath} stroke="#00D9FF" fill="none" strokeWidth="2" mask="url(#maskEcg)" />
                            </svg>
                        </div>
                        {isCritical && <div className="mt-1 text-xs text-amber-400">Slightly low</div>}
                    </div>

                    {/* BP */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Blood Pressure</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-mono font-bold text-white">{systolic}</span>
                            <span className="text-xl text-slate-500">/</span>
                            <span className="text-3xl font-mono font-bold text-white">{diastolic}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">mmHg (Auto-check 15m)</div>
                    </div>

                    {/* Temp */}
                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                        <div className="text-xs font-bold text-slate-400 uppercase mb-1">Temperature</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-bold text-[#4ECDC4]">{temperature}</span>
                            <span className="text-sm text-slate-500">°C</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">Normal range</div>
                    </div>
                </div>

                {/* Bottom Row: Respiration */}
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Respiration</span>
                        <span className="text-2xl font-mono font-bold text-[#FFD700]">{respirationRate}</span>
                        <span className="text-xs text-slate-500">breaths/min</span>
                    </div>
                    <div className="h-20 relative rounded bg-slate-900/50 overflow-hidden" ref={respContainerRef}>
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d={respirationPath} stroke="#FFD700" fill="none" strokeWidth="2" mask="url(#maskEcg)" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Status Footer */}
            <div className="px-6 py-3 border-t border-slate-700 bg-slate-800/80 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    LIVE MONITORING
                </div>
                {isCritical && (
                    <span className="text-xs font-bold text-red-400 animate-pulse">TRANSMITTING ALERT DATA...</span>
                )}
            </div>
        </div>
    );
}

// --- Main Reusable Patient Content Component ---
export default function PatientDashboard({ patientId, isStaffView }) {
    const [currentUser, setCurrentUser] = useState({ name: "Loading...", room: "...", status: "Stable", isCritical: false });
    const [isCritical, setIsCritical] = useState(false);
    const [vitals, setVitals] = useState(null);
    const { lastMessage } = useWebSocket();

    // Fetch initial history
    useEffect(() => {
        async function fetchData() {
            console.log("Fetching data for patientId:", patientId);
            try {
                // Fetch patient details for name
                const patientData = await getPatient(patientId);
                console.log("Patient Data:", patientData);
                const name = patientData ? `${patientData.first_name} ${patientData.last_name}` : `Patient ${patientId}`;
                console.log("Computed Name:", name);

                const history = await getPatientHistory(patientId, 1);
                if (history && history.length > 0) {
                    const latest = history[0];
                    setVitals({
                        heartRate: latest.heart_rate,
                        spo2: latest.spo2,
                        bpSystolic: latest.bp_systolic,
                        bpDiastolic: latest.bp_diastolic,
                        temperature: latest.temperature_c,
                        respiration: latest.respiration
                    });

                    setCurrentUser(prev => ({ ...prev, name: name, room: "101" }));
                } else {
                    // Even if no history, set the name
                    setCurrentUser(prev => ({ ...prev, name: name, room: "101" }));
                }
            } catch (err) {
                console.error("Failed to fetch patient data:", err);
                // Fallback name with error for debugging
                setCurrentUser(prev => ({ ...prev, name: `Error: ${err.message}`, room: "101" }));
            }
        }
        fetchData();
    }, [patientId]);

    // Handle WebSocket updates
    useEffect(() => {
        if (lastMessage && lastMessage.type === "vitals_update") {
            const update = lastMessage.data.find(d => d.patient_id === patientId || d.patient_id === parseInt(patientId));
            if (update) {
                setVitals({
                    heartRate: update.heart_rate,
                    spo2: update.spo2,
                    bpSystolic: update.bp_systolic,
                    bpDiastolic: update.bp_diastolic,
                    temperature: update.temperature_c,
                    respiration: update.respiration
                });
                // Simple logic to determine critical state from vitals
                const critical = update.heart_rate > 120 || update.spo2 < 90;
                setIsCritical(critical);
                setCurrentUser(prev => ({ ...prev, isCritical: critical, status: critical ? "Alert" : "Stable" }));
            }
        }
    }, [lastMessage, patientId]);

    const content = isCritical ? {
        statusBadge: "Attention Needed",
        statusColor: "bg-red-100 text-red-700 border-red-200",
        greeting: `Hello, ${currentUser.name}`,
        room: currentUser.room,
        subtext: "We noticed a change in your vitals. Your care team has been notified.",
        alerts: [
            {
                title: "Heart Rate Elevated",
                time: "Just now",
                body: "Your heart is beating faster than usual (>120 BPM).",
                reassurance: "A nurse is reviewing this right now.",
                isCritical: true,
            },
            {
                title: "Oxygen Levels Lower",
                time: "5m ago",
                body: "Your oxygen is slightly low (90%).",
                reassurance: "Try taking slow, deep breaths.",
                isCritical: false,
            }
        ],
        guidance: [
            { icon: "🪑", text: "Please sit or lie down immediately." },
            { icon: "🌬️", text: "Take slow, deep breaths to help calm your heart." },
            { icon: "📞", text: "If you feel chest pain, use the Help button." },
        ]
    } : {
        statusBadge: currentUser.status,
        statusColor: currentUser.isWarning ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200",
        greeting: `Hello, ${currentUser.name}`,
        room: currentUser.room,
        subtext: "Your vitals are looking stable today. Keep up the good work.",
        alerts: [
            {
                title: "All Vitals Normal",
                time: "10:00 AM",
                body: "Your morning check-up looks great.",
                reassurance: "Next scheduled check: 2:00 PM",
                isCritical: false,
            }
        ],
        guidance: [
            { icon: "💧", text: "Stay hydrated throughout the day." },
            { icon: "🚶", text: "Take a short walk if you feel up to it." },
        ]
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10" style={{ fontFamily: '"Inter", sans-serif' }}>

            {/* Toggle (Hidden/dev feature for demo) */}
            <div className="fixed bottom-4 right-4 opacity-50 hover:opacity-100 transition-opacity z-50">
                <button
                    onClick={() => setIsCritical(!isCritical)}
                    className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full shadow-lg"
                >
                    Demo: {isCritical ? "Set Stable" : "Set Critical"}
                </button>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${content.statusColor}`}>
                            {content.statusBadge}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            Rm: {content.room}
                        </span>
                    </div>
                    {/* Show greeting for patient, or "Patient View: [Name]" for staff? 
                Actually, let's keep it immersive as if I'm looking at what the patient sees, 
                but maybe change the title if it's staff view? 
                The prompt asked for "patient detail view", but said "Visually similar to patient portal". 
                I will stick to the same "Hello, Patient X" greeting as it's a nice touch or maybe just "Patient X" for staff.
                Let's stick to the greeting for now as it makes the demo feel like "Remote Patient Monitor".
            */}
                    <h1 className="text-3xl font-bold text-slate-900">{content.greeting}</h1>
                    <p className="mt-1 text-slate-600 max-w-xl text-lg">{content.subtext}</p>
                </div>

                {/* Dynamic Navigation Button */}
                {isStaffView ? (
                    <Link href="/roles/staff" className="group flex items-center gap-2 rounded-lg border bg-white py-2 px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-sky-600">
                        <span>←</span> Return to Staff Portal
                    </Link>
                ) : (
                    <Link href="/roles" className="text-sm font-semibold text-sky-600 hover:text-sky-700 transition">
                        ← Switch role
                    </Link>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Main Column: Monitor & Actions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* 1. Vital Monitor */}
                    <section>
                        <MedicalMonitoringDashboard isCritical={isCritical} vitals={vitals} />
                        <p className="text-xs text-center mt-3 text-slate-400">
                            Data is encrypted and transmitted securely to Central Station.
                        </p>
                    </section>

                    {/* 2. Action Checklist */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            {isCritical ? "🚨 What you should do now" : "✨ Daily Guidance"}
                        </h2>
                        <div className="space-y-3">
                            {content.guidance.map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="mt-1 text-slate-700 font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>
                        {isCritical && (
                            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 text-center">
                                Don't worry, we are watching these numbers closely.
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Status & History */}
                <div className="space-y-6">

                    {/* 3. Alerts */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">
                            {isCritical ? "Active Messages" : "Recent Updates"}
                        </h2>
                        <div className="space-y-4">
                            {content.alerts.map((alert, i) => (
                                <div key={i} className={`p-4 rounded-xl border ${alert.isCritical ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-bold text-sm ${alert.isCritical ? 'text-rose-700' : 'text-slate-700'}`}>{alert.title}</span>
                                        <span className="text-[10px] text-slate-400">{alert.time}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{alert.body}</p>
                                    <div className="text-xs font-medium px-2 py-1 bg-white/60 rounded inline-block text-slate-500">
                                        ℹ️ {alert.reassurance}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 text-xs font-semibold text-slate-500 hover:text-slate-700 py-2">
                            View History
                        </button>
                    </section>

                    {/* 4. Support / Device */}
                    <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Device Health</h3>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-lg">🔋</div>
                                <span className="text-sm font-medium text-slate-700">Battery Good</span>
                            </div>
                            <span className="text-xs font-mono text-slate-500">84%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">📡</div>
                                <span className="text-sm font-medium text-slate-700">Signal Strong</span>
                            </div>
                            <span className="text-xs font-mono text-slate-500">LTE</span>
                        </div>
                    </section>

                    {/* 5. Emergency Button */}
                    <button className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${isCritical ? 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-rose-200' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                        {isCritical ? "🚑 Call for Help Now" : "Emergency Help"}
                    </button>
                    {isCritical && (
                        <p className="text-[10px] text-center text-slate-400 px-4">
                            Only press if you feel your condition is worsening rapidly.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
