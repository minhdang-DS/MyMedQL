"use client";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { getPatientHistory, getPatient, getThresholds, getPatientDevice, getPatientAlerts } from "../app/services/api";
import { useWebSocket } from "../app/hooks/useWebSocket";

// Use the same palette as staff page
const palette = {
  brand: "#00B8D4", // Vibrant teal-blue
  brandBright: "#00D9FF", // Bright cyan
  navy: "#1E3A5F", // Deep navy
  navyDark: "#0A2540", // Darker navy
  light: "#E0F7FA", // Bright light cyan
  soft: "#B2EBF2", // Bright cyan-gray
  cyan: "#00D9FF", // Bright cyan
  border: "#B0BEC5", // Medium gray-blue border
  surface: "#FFFFFF", // Pure white
  muted: "#F5F8FA", // Very light gray-blue
  success: "#00E676", // Bright green
  warning: "#FFD700", // Bright yellow/gold
  danger: "#FF5252", // Bright red for alerts
  accent: "#00D9FF", // Bright cyan for highlights
  textPrimary: "#37474F", // Primary text color
  textSecondary: "#6B7280", // Secondary text color
};

// Helper function to get threshold value from thresholds array
function getThresholdValue(thresholds, name, type) {
  const threshold = thresholds.find(t => t.name === name && t.type === type);
  return threshold;
}

// Generate alerts based on vitals and thresholds
function generateAlerts(vitals, thresholds) {
  if (!vitals || !thresholds || thresholds.length === 0) {
    return [];
  }

  const alerts = [];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Heart Rate checks
  if (vitals.heartRate !== null && vitals.heartRate !== undefined) {
    const hrCritical = getThresholdValue(thresholds, 'heart_rate', 'critical');
    const hrWarning = getThresholdValue(thresholds, 'heart_rate', 'warning');

    if (hrCritical) {
      if ((hrCritical.min_value !== null && vitals.heartRate < hrCritical.min_value) ||
          (hrCritical.max_value !== null && vitals.heartRate > hrCritical.max_value)) {
        alerts.push({
          title: "Heart Rate Critical",
          time: timeStr,
          body: `Your heart rate is ${vitals.heartRate < hrCritical.min_value ? 'below' : 'above'} the safe range (${hrCritical.min_value || 'N/A'}-${hrCritical.max_value || 'N/A'} BPM).`,
          reassurance: "Your care team has been notified and is monitoring your condition.",
          isCritical: true,
        });
      }
    }

    if (hrWarning && alerts.find(a => a.title === "Heart Rate Critical") === undefined) {
      if ((hrWarning.min_value !== null && vitals.heartRate < hrWarning.min_value) ||
          (hrWarning.max_value !== null && vitals.heartRate > hrWarning.max_value)) {
        alerts.push({
          title: "Heart Rate Warning",
          time: timeStr,
          body: `Your heart rate is ${vitals.heartRate < hrWarning.min_value ? 'slightly below' : 'slightly above'} the normal range (${hrWarning.min_value || 'N/A'}-${hrWarning.max_value || 'N/A'} BPM).`,
          reassurance: "Please remain calm and take slow, deep breaths.",
          isCritical: false,
        });
      }
    }
  }

  // SpO2 checks
  if (vitals.spo2 !== null && vitals.spo2 !== undefined) {
    const spo2Critical = getThresholdValue(thresholds, 'spo2', 'critical');
    const spo2Warning = getThresholdValue(thresholds, 'spo2', 'warning');

    if (spo2Critical) {
      if ((spo2Critical.min_value !== null && vitals.spo2 < spo2Critical.min_value) ||
          (spo2Critical.max_value !== null && vitals.spo2 > spo2Critical.max_value)) {
        alerts.push({
          title: "Oxygen Level Critical",
          time: timeStr,
          body: `Your oxygen saturation is ${vitals.spo2 < spo2Critical.min_value ? 'below' : 'above'} the safe range (${spo2Critical.min_value || 'N/A'}-${spo2Critical.max_value || 'N/A'}%).`,
          reassurance: "Your care team has been notified immediately.",
          isCritical: true,
        });
      }
    }

    if (spo2Warning && alerts.find(a => a.title === "Oxygen Level Critical") === undefined) {
      if ((spo2Warning.min_value !== null && vitals.spo2 < spo2Warning.min_value) ||
          (spo2Warning.max_value !== null && vitals.spo2 > spo2Warning.max_value)) {
        alerts.push({
          title: "Oxygen Level Warning",
          time: timeStr,
          body: `Your oxygen saturation is ${vitals.spo2 < spo2Warning.min_value ? 'slightly below' : 'slightly above'} the normal range (${spo2Warning.min_value || 'N/A'}-${spo2Warning.max_value || 'N/A'}%).`,
          reassurance: "Try taking slow, deep breaths to help improve oxygen levels.",
          isCritical: false,
        });
      }
    }
  }

  // Blood Pressure checks
  if (vitals.bpSystolic !== null && vitals.bpSystolic !== undefined) {
    const bpSystolicCritical = getThresholdValue(thresholds, 'bp_systolic', 'critical');
    const bpSystolicWarning = getThresholdValue(thresholds, 'bp_systolic', 'warning');

    if (bpSystolicCritical) {
      if ((bpSystolicCritical.min_value !== null && vitals.bpSystolic < bpSystolicCritical.min_value) ||
          (bpSystolicCritical.max_value !== null && vitals.bpSystolic > bpSystolicCritical.max_value)) {
        alerts.push({
          title: "Blood Pressure Critical",
          time: timeStr,
          body: `Your systolic blood pressure is ${vitals.bpSystolic < bpSystolicCritical.min_value ? 'below' : 'above'} the safe range (${bpSystolicCritical.min_value || 'N/A'}-${bpSystolicCritical.max_value || 'N/A'} mmHg).`,
          reassurance: "Your care team has been notified and is monitoring your condition.",
          isCritical: true,
        });
      }
    }

    if (bpSystolicWarning && alerts.find(a => a.title === "Blood Pressure Critical") === undefined) {
      if ((bpSystolicWarning.min_value !== null && vitals.bpSystolic < bpSystolicWarning.min_value) ||
          (bpSystolicWarning.max_value !== null && vitals.bpSystolic > bpSystolicWarning.max_value)) {
        alerts.push({
          title: "Blood Pressure Warning",
          time: timeStr,
          body: `Your systolic blood pressure is ${vitals.bpSystolic < bpSystolicWarning.min_value ? 'slightly below' : 'slightly above'} the normal range (${bpSystolicWarning.min_value || 'N/A'}-${bpSystolicWarning.max_value || 'N/A'} mmHg).`,
          reassurance: "Please remain calm and avoid sudden movements.",
          isCritical: false,
        });
      }
    }
  }

  // Temperature checks
  if (vitals.temperature !== null && vitals.temperature !== undefined) {
    const tempCritical = getThresholdValue(thresholds, 'temperature_c', 'critical');
    const tempWarning = getThresholdValue(thresholds, 'temperature_c', 'warning');

    if (tempCritical) {
      if ((tempCritical.min_value !== null && vitals.temperature < tempCritical.min_value) ||
          (tempCritical.max_value !== null && vitals.temperature > tempCritical.max_value)) {
        alerts.push({
          title: "Temperature Critical",
          time: timeStr,
          body: `Your body temperature is ${vitals.temperature < tempCritical.min_value ? 'below' : 'above'} the safe range (${tempCritical.min_value || 'N/A'}-${tempCritical.max_value || 'N/A'}°C).`,
          reassurance: "Your care team has been notified and is monitoring your condition.",
          isCritical: true,
        });
      }
    }

    if (tempWarning && alerts.find(a => a.title === "Temperature Critical") === undefined) {
      if ((tempWarning.min_value !== null && vitals.temperature < tempWarning.min_value) ||
          (tempWarning.max_value !== null && vitals.temperature > tempWarning.max_value)) {
        alerts.push({
          title: "Temperature Warning",
          time: timeStr,
          body: `Your body temperature is ${vitals.temperature < tempWarning.min_value ? 'slightly below' : 'slightly above'} the normal range (${tempWarning.min_value || 'N/A'}-${tempWarning.max_value || 'N/A'}°C).`,
          reassurance: "This is being monitored closely.",
          isCritical: false,
        });
      }
    }
  }

  // Respiration checks
  if (vitals.respiration !== null && vitals.respiration !== undefined) {
    const respCritical = getThresholdValue(thresholds, 'respiration', 'critical');
    const respWarning = getThresholdValue(thresholds, 'respiration', 'warning');

    if (respCritical) {
      if ((respCritical.min_value !== null && vitals.respiration < respCritical.min_value) ||
          (respCritical.max_value !== null && vitals.respiration > respCritical.max_value)) {
        alerts.push({
          title: "Respiration Rate Critical",
          time: timeStr,
          body: `Your respiration rate is ${vitals.respiration < respCritical.min_value ? 'below' : 'above'} the safe range (${respCritical.min_value || 'N/A'}-${respCritical.max_value || 'N/A'} breaths/min).`,
          reassurance: "Your care team has been notified and is monitoring your condition.",
          isCritical: true,
        });
      }
    }

    if (respWarning && alerts.find(a => a.title === "Respiration Rate Critical") === undefined) {
      if ((respWarning.min_value !== null && vitals.respiration < respWarning.min_value) ||
          (respWarning.max_value !== null && vitals.respiration > respWarning.max_value)) {
        alerts.push({
          title: "Respiration Rate Warning",
          time: timeStr,
          body: `Your respiration rate is ${vitals.respiration < respWarning.min_value ? 'slightly below' : 'slightly above'} the normal range (${respWarning.min_value || 'N/A'}-${respWarning.max_value || 'N/A'} breaths/min).`,
          reassurance: "Try to maintain steady, controlled breathing.",
          isCritical: false,
        });
      }
    }
  }

  // Sort alerts: critical first, then warnings
  alerts.sort((a, b) => {
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;
    return 0;
  });

  // If no alerts, return a default "All Vitals Normal" message
  if (alerts.length === 0) {
    return [{
      title: "All Vitals Normal",
      time: timeStr,
      body: "Your vital signs are within normal ranges.",
      reassurance: "Continue monitoring as usual.",
      isCritical: false,
    }];
  }

  return alerts;
}

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
    const hrColor = isCritical ? palette.danger : palette.success;
    const spo2Color = isCritical ? palette.warning : palette.brand;

    return (
        <div className="relative w-full overflow-hidden rounded-xl border transition-all duration-150" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            background: isCritical 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(0, 184, 212, 0.1) 100%)',
            borderColor: isCritical ? palette.danger + '40' : palette.brand + '40',
            boxShadow: `0 4px 12px ${isCritical ? palette.danger + '20' : palette.brand + '20'}`
        }}>
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: `linear-gradient(${palette.brand} 1px, transparent 1px), linear-gradient(90deg, ${palette.brand} 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
            </div>

            <div className="relative p-6 space-y-6">
                {/* Top Row: ECG & HR */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* HR Box */}
                    <div className="lg:col-span-1 p-4 rounded-xl border backdrop-blur-sm" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderColor: palette.brand + '40',
                        boxShadow: `0 2px 8px ${palette.brand}15`
                    }}>
                        <div className="flex items-center gap-2 mb-2">
                            <svg className={`w-5 h-5 ${isCritical ? 'animate-ping' : 'animate-pulse'}`} fill={hrColor} viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: palette.textSecondary }}>Heart Rate</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-mono font-bold transition-colors" style={{ color: hrColor }}>{heartRate}</span>
                            <span className="text-sm font-medium" style={{ color: palette.textSecondary }}>BPM</span>
                        </div>
                        <div className="mt-2 text-xs" style={{ color: palette.textSecondary }}>
                            {isCritical ? "Beating faster than normal" : "Normal rhythm"}
                        </div>
                    </div>
                    {/* ECG Plot */}
                    <div className="lg:col-span-3 h-32 relative rounded-xl border overflow-hidden" style={{
                        backgroundColor: palette.muted,
                        borderColor: palette.brand + '40'
                    }} ref={ecgContainerRef}>
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <defs>
                                <mask id="maskEcg"><rect width="100%" height="100%" fill="white" /><rect x={Math.max(0, (sweepPosition.ecg / (containerWidthsRef.current.ecg || 600) * 1000) - 100)} width="100" height="100" fill="black" /></mask>
                            </defs>
                            <path d={ecgPath} stroke={hrColor} fill="none" strokeWidth="2" mask="url(#maskEcg)" />
                        </svg>
                    </div>
                </div>

                {/* Middle Row: SpO2, BP, Temp - Dynamic grid adapts to number of available plots */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* SpO2 - Only show if data available */}
                    {(spo2 !== null && spo2 !== undefined) && (
                    <div className="p-4 rounded-xl border" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderColor: palette.brand + '40',
                        boxShadow: `0 2px 8px ${palette.brand}15`
                    }}>
                        <div className="text-xs font-bold uppercase mb-1" style={{ color: palette.textSecondary }}>Oxygen (SpO2)</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-bold" style={{ color: spo2Color }}>{spo2}</span>
                            <span className="text-sm" style={{ color: palette.textSecondary }}>%</span>
                        </div>
                        <div className="h-10 mt-2 relative rounded overflow-hidden" style={{ backgroundColor: palette.muted }} ref={plethContainerRef}>
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 100">
                                <path d={plethPath} stroke={palette.brandBright} fill="none" strokeWidth="2" mask="url(#maskEcg)" />
                            </svg>
                        </div>
                        {isCritical && <div className="mt-1 text-xs" style={{ color: palette.warning }}>Slightly low</div>}
                    </div>
                    )}

                    {/* BP - Only show if data available */}
                    {((systolic !== null && systolic !== undefined) || (diastolic !== null && diastolic !== undefined)) && (
                    <div className="p-4 rounded-xl border" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderColor: palette.brand + '40',
                        boxShadow: `0 2px 8px ${palette.brand}15`
                    }}>
                        <div className="text-xs font-bold uppercase mb-1" style={{ color: palette.textSecondary }}>Blood Pressure</div>
                        <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-mono font-bold" style={{ color: palette.navyDark }}>{systolic ?? '--'}</span>
                            <span className="text-xl" style={{ color: palette.textSecondary }}>/</span>
                                <span className="text-3xl font-mono font-bold" style={{ color: palette.navyDark }}>{diastolic ?? '--'}</span>
                        </div>
                        <div className="text-xs mt-2" style={{ color: palette.textSecondary }}>mmHg (Auto-check 15m)</div>
                    </div>
                    )}

                    {/* Temp - Only show if data available */}
                    {(temperature !== null && temperature !== undefined) && (
                    <div className="p-4 rounded-xl border" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderColor: palette.brand + '40',
                        boxShadow: `0 2px 8px ${palette.brand}15`
                    }}>
                        <div className="text-xs font-bold uppercase mb-1" style={{ color: palette.textSecondary }}>Temperature</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-mono font-bold" style={{ color: palette.brand }}>{temperature}</span>
                            <span className="text-sm" style={{ color: palette.textSecondary }}>°C</span>
                        </div>
                        <div className="text-xs mt-2" style={{ color: palette.textSecondary }}>Normal range</div>
                    </div>
                    )}
                </div>

                {/* Bottom Row: Respiration - Only show if data available */}
                {(respirationRate !== null && respirationRate !== undefined) && (
                <div className="p-4 rounded-xl border" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderColor: palette.brand + '40',
                    boxShadow: `0 2px 8px ${palette.brand}15`
                }}>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold uppercase" style={{ color: palette.textSecondary }}>Respiration</span>
                        <span className="text-2xl font-mono font-bold" style={{ color: palette.warning }}>{respirationRate}</span>
                        <span className="text-xs" style={{ color: palette.textSecondary }}>breaths/min</span>
                    </div>
                    <div className="h-20 relative rounded overflow-hidden" style={{ backgroundColor: palette.muted }} ref={respContainerRef}>
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 100">
                            <path d={respirationPath} stroke="#FFD700" fill="none" strokeWidth="2" mask="url(#maskEcg)" />
                        </svg>
                    </div>
                </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="px-6 py-3 border-t flex justify-between items-center" style={{
                borderColor: palette.brand + '40',
                backgroundColor: 'rgba(224, 247, 250, 0.5)'
            }}>
                <div className="flex items-center gap-2 text-xs font-mono" style={{ color: palette.textSecondary }}>
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: palette.success }}></span>
                    LIVE MONITORING
                </div>
                {isCritical && (
                    <span className="text-xs font-bold animate-pulse" style={{ color: palette.danger }}>TRANSMITTING ALERT DATA...</span>
                )}
            </div>
        </div>
    );
}

// --- Main Reusable Patient Content Component ---
export default function PatientDashboard({ patientId, isStaffView, onStatusChange }) {
    const [currentUser, setCurrentUser] = useState({ name: "Loading...", room: "...", status: "Stable", isCritical: false });
    const [isCritical, setIsCritical] = useState(false);
    const [vitals, setVitals] = useState(null);
    const [thresholds, setThresholds] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [device, setDevice] = useState({ device_type: null, serial_number: null, manufacturer: null });
    const { lastMessage } = useWebSocket();

    // Fetch thresholds
    useEffect(() => {
        async function fetchThresholdsData() {
            try {
                const thresholdsList = await getThresholds();
                setThresholds(thresholdsList);
            } catch (error) {
                console.error("Error fetching thresholds:", error);
            }
        }
        fetchThresholdsData();
    }, []);

    // Fetch alerts from database
    useEffect(() => {
        async function fetchAlertsData() {
            try {
                const alertsList = await getPatientAlerts(patientId, 20);
                // Convert database alerts to display format
                const formattedAlerts = alertsList.map(alert => {
                    const alertTime = new Date(alert.created_at);
                    const timeStr = alertTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    // Determine if critical based on alert_type
                    const isCritical = alert.alert_type === 'critical' || alert.alert_type === 'emergency';
                    
                    return {
                        title: alert.alert_type === 'emergency' ? 'Emergency Alert' : 
                               alert.alert_type === 'critical' ? 'Critical Alert' :
                               alert.alert_type === 'warning' ? 'Warning Alert' : 'Alert',
                        time: timeStr,
                        body: alert.message,
                        reassurance: isCritical 
                            ? "Your care team has been notified and is monitoring your condition."
                            : "Please monitor closely and contact staff if needed.",
                        isCritical: isCritical,
                        acknowledged: alert.acknowledged_at !== null,
                        fromDatabase: true // Mark as database alert
                    };
                });
                
                // If we have database alerts, use them; otherwise fall back to generated alerts
                if (formattedAlerts.length > 0) {
                    setAlerts(formattedAlerts);
                }
            } catch (error) {
                console.error("Error fetching alerts:", error);
                // If fetching fails, we'll fall back to generated alerts
            }
        }
        fetchAlertsData();
    }, [patientId]);

    // Fetch initial history and device
    useEffect(() => {
        async function fetchData() {
            console.log("Fetching data for patientId:", patientId);
            try {
                // Fetch patient details for name
                const patientData = await getPatient(patientId);
                console.log("Patient Data:", patientData);
                const name = patientData ? `${patientData.first_name} ${patientData.last_name}` : `Patient ${patientId}`;
                const room = patientData?.room_id || "101";
                console.log("Computed Name:", name);

                // Fetch device information
                try {
                    const deviceData = await getPatientDevice(patientId);
                    setDevice({
                        device_type: deviceData.device_type || "Unknown Device",
                        serial_number: deviceData.serial_number || "N/A",
                        manufacturer: deviceData.manufacturer || "Unknown"
                    });
                } catch (deviceErr) {
                    console.error("Failed to fetch device data:", deviceErr);
                    setDevice({ device_type: "Unknown Device", serial_number: "N/A", manufacturer: "Unknown" });
                }

                const history = await getPatientHistory(patientId, 1);
                if (history && history.length > 0) {
                    const latest = history[0];
                    const vitalsData = {
                        heartRate: latest.heart_rate,
                        spo2: latest.spo2,
                        bpSystolic: latest.bp_systolic,
                        bpDiastolic: latest.bp_diastolic,
                        temperature: latest.temperature_c,
                        respiration: latest.respiration
                    };
                    setVitals(vitalsData);

                    setCurrentUser(prev => ({ ...prev, name: name, room: room }));
                } else {
                    // Even if no history, set the name
                    setCurrentUser(prev => ({ ...prev, name: name, room: room }));
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
            console.log('Processing vitals update:', lastMessage);
            console.log('Looking for patient_id:', patientId, 'Type:', typeof patientId);
            
            // Normalize patientId to number for comparison
            const targetPatientId = Number(patientId);
            
            const update = lastMessage.data.find(d => {
                // Handle both number and string patient_id from database
                const dPatientId = Number(d.patient_id);
                const match = dPatientId === targetPatientId;
                if (match) {
                    console.log('Found matching update:', d);
                }
                return match;
            });
            
            if (update) {
                console.log('Updating vitals with:', update);
                const vitalsData = {
                    heartRate: update.heart_rate,
                    spo2: update.spo2,
                    bpSystolic: update.bp_systolic,
                    bpDiastolic: update.bp_diastolic,
                    temperature: update.temperature_c,
                    respiration: update.respiration
                };
                setVitals(vitalsData);
                
                // Determine critical state from thresholds
                const hrCritical = getThresholdValue(thresholds, 'heart_rate', 'critical');
                const spo2Critical = getThresholdValue(thresholds, 'spo2', 'critical');
                const critical = (hrCritical && ((hrCritical.min_value !== null && update.heart_rate < hrCritical.min_value) || 
                                                (hrCritical.max_value !== null && update.heart_rate > hrCritical.max_value))) ||
                                 (spo2Critical && ((spo2Critical.min_value !== null && update.spo2 < spo2Critical.min_value) || 
                                                (spo2Critical.max_value !== null && update.spo2 > spo2Critical.max_value)));
                setIsCritical(critical);
                setCurrentUser(prev => ({ ...prev, isCritical: critical, status: critical ? "Alert" : "Stable" }));
            } else {
                console.log('No matching update found for patient_id:', patientId, '(normalized:', targetPatientId, ')');
                console.log('Available patient_ids in data:', lastMessage.data.map(d => `${d.patient_id} (${typeof d.patient_id})`));
            }
        }
    }, [lastMessage, patientId, thresholds]);

    // Update critical state when alerts change
    useEffect(() => {
        if (alerts.length > 0) {
            const hasCriticalAlert = alerts.some(a => a.isCritical);
            setIsCritical(hasCriticalAlert);
            setCurrentUser(prev => ({ ...prev, isCritical: hasCriticalAlert, status: hasCriticalAlert ? "Alert" : "Stable" }));
        }
    }, [alerts]);

    // Generate alerts when vitals or thresholds change (as fallback if no DB alerts)
    useEffect(() => {
        if (vitals && thresholds.length > 0) {
            // Generate alerts as fallback/complement to database alerts
            const generatedAlerts = generateAlerts(vitals, thresholds);
            
            // If we have database alerts, check if we should merge generated alerts
            // Only use generated alerts if we have no unacknowledged database alerts
            const hasUnacknowledgedDbAlerts = alerts.some(a => !a.acknowledged && a.fromDatabase);
            
            if (!hasUnacknowledgedDbAlerts && (alerts.length === 0 || alerts.every(a => a.acknowledged))) {
                setAlerts(generatedAlerts);
            }
        }
    }, [vitals, thresholds]);

    // Determine patient status from both alerts and vitals/thresholds
    // Priority: Critical > Warning > Stable
    const determinePatientStatus = () => {
        // First check alerts (most reliable source)
        const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
        const hasCriticalAlerts = unacknowledgedAlerts.some(a => a.isCritical);
        // Check for warning alerts - either isCritical is false OR title contains "Warning" (case insensitive)
        const hasWarningAlerts = unacknowledgedAlerts.some(a => {
            const titleLower = (a.title || "").toLowerCase();
            return (!a.isCritical && (titleLower.includes("warning") || titleLower.includes("alert")));
        });
        
        console.log("🔍 Status check - Alerts:", {
            total: alerts.length,
            unacknowledged: unacknowledgedAlerts.length,
            critical: hasCriticalAlerts,
            warning: hasWarningAlerts,
            alertTitles: unacknowledgedAlerts.map(a => ({ title: a.title, isCritical: a.isCritical, acknowledged: a.acknowledged }))
        });
        
        if (hasCriticalAlerts) {
            console.log("✅ Status: CRITICAL (from alerts)");
            return "critical";
        }
        if (hasWarningAlerts) {
            console.log("✅ Status: WARNING (from alerts)");
            return "warning";
        }
        
        // If no alerts, check vitals against thresholds
        if (vitals && thresholds.length > 0) {
            const hrCritical = getThresholdValue(thresholds, 'heart_rate', 'critical');
            const hrWarning = getThresholdValue(thresholds, 'heart_rate', 'warning');
            const spo2Critical = getThresholdValue(thresholds, 'spo2', 'critical');
            const spo2Warning = getThresholdValue(thresholds, 'spo2', 'warning');
            
            // Check for critical conditions
            const isCritical = (hrCritical && vitals.heartRate !== null && vitals.heartRate !== undefined && 
                               ((hrCritical.min_value !== null && vitals.heartRate < hrCritical.min_value) || 
                                (hrCritical.max_value !== null && vitals.heartRate > hrCritical.max_value))) ||
                               (spo2Critical && vitals.spo2 !== null && vitals.spo2 !== undefined &&
                               ((spo2Critical.min_value !== null && vitals.spo2 < spo2Critical.min_value) || 
                                (spo2Critical.max_value !== null && vitals.spo2 > spo2Critical.max_value)));
            
            if (isCritical) {
                return "critical";
            }
            
            // Check for warning conditions (only if not critical)
            const isWarning = (hrWarning && vitals.heartRate !== null && vitals.heartRate !== undefined &&
                              ((hrWarning.min_value !== null && vitals.heartRate < hrWarning.min_value) || 
                               (hrWarning.max_value !== null && vitals.heartRate > hrWarning.max_value))) ||
                              (spo2Warning && vitals.spo2 !== null && vitals.spo2 !== undefined &&
                              ((spo2Warning.min_value !== null && vitals.spo2 < spo2Warning.min_value) || 
                               (spo2Warning.max_value !== null && vitals.spo2 > spo2Warning.max_value)));
            
            if (isWarning) {
                console.log("✅ Status: WARNING (from vitals/thresholds)");
                return "warning";
            }
        }
        
        console.log("✅ Status: STABLE");
        return "stable";
    };
    
    // Determine status color based on alerts (for UI display)
    const hasCriticalAlerts = alerts.some(a => a.isCritical && !a.acknowledged);
    const hasWarningAlerts = alerts.some(a => !a.isCritical && !a.acknowledged && (a.title.includes("Warning") || a.title.includes("warning")));
    
    // Get current patient status
    const patientStatus = determinePatientStatus();
    
    // Notify parent component of status change whenever status might change
    useEffect(() => {
        if (onStatusChange) {
            const currentStatus = determinePatientStatus();
            console.log("📊 PatientDashboard - Status determined:", currentStatus, {
                alertsCount: alerts.length,
                criticalAlerts: alerts.filter(a => a.isCritical && !a.acknowledged).length,
                warningAlerts: alerts.filter(a => !a.isCritical && !a.acknowledged && (a.title.includes("Warning") || a.title.includes("warning"))).length,
                hasVitals: !!vitals,
                thresholdsCount: thresholds.length
            });
            onStatusChange(currentStatus);
        }
    }, [alerts, vitals, thresholds, onStatusChange]);
    
    const content = {
        statusBadge: hasCriticalAlerts ? "Attention Needed" : (hasWarningAlerts ? "Warning" : currentUser.status),
        statusColor: hasCriticalAlerts 
            ? "bg-red-100 text-red-700 border-red-200" 
            : (hasWarningAlerts 
                ? "bg-amber-100 text-amber-700 border-amber-200" 
                : "bg-emerald-100 text-emerald-700 border-emerald-200"),
        greeting: `Hello, ${currentUser.name}`,
        room: currentUser.room,
        subtext: hasCriticalAlerts 
            ? "We noticed a change in your vitals. Your care team has been notified." 
            : (hasWarningAlerts 
                ? "Some of your vitals are slightly outside normal ranges. Please monitor closely."
                : "Your vitals are looking stable today. Keep up the good work."),
        alerts: alerts.length > 0 ? alerts : [{
            title: "All Vitals Normal",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            body: "Your vital signs are within normal ranges.",
            reassurance: "Continue monitoring as usual.",
            isCritical: false,
        }],
        guidance: hasCriticalAlerts ? [
            { icon: "🪑", text: "Please sit or lie down immediately." },
            { icon: "🌬️", text: "Take slow, deep breaths to help calm your heart." },
            { icon: "📞", text: "If you feel chest pain, use the Help button." },
        ] : (hasWarningAlerts ? [
            { icon: "🌬️", text: "Take slow, deep breaths." },
            { icon: "💧", text: "Stay hydrated throughout the day." },
            { icon: "🚶", text: "Take a short walk if you feel up to it." },
        ] : [
            { icon: "💧", text: "Stay hydrated throughout the day." },
            { icon: "🚶", text: "Take a short walk if you feel up to it." },
        ])
    };

    return (
        <div className="min-h-screen relative" style={{
            backgroundColor: palette.muted,
            color: palette.navy,
            fontFamily: '"Inter", sans-serif',
            backgroundImage: 'url(/background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            willChange: 'auto'
        }}>
            {/* Overlay to make background faint */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.65)'
                }}
            />

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10">
                {/* Sticky Header */}
                <header className="sticky top-0 z-30 border-b backdrop-blur-md" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                    borderColor: palette.border + '40', 
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)' 
                }}>
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-6">
                            {/* Title */}
                            <div>
                                <h1 className="text-xl font-bold tracking-tight" style={{ 
                                    fontFamily: '"Inter", sans-serif',
                                    background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>Patient Monitor</h1>
                                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: palette.textSecondary }}>
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                    </span>
                                    System Operational
                                </div>
                            </div>

                            {/* Status Chips */}
                            <div className="flex gap-3 border-l pl-6" style={{ borderColor: palette.border + '40' }}>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${content.statusColor}`}>
                                        {content.statusBadge}
                                    </span>
                                    <span className="text-xs font-mono font-bold px-2 py-1.5 rounded-lg" style={{ 
                                        backgroundColor: palette.muted,
                                        color: palette.textSecondary
                                    }}>
                                        Rm: {content.room}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Navigation Button */}
                        {isStaffView ? (
                            <Link href="/roles/staff" className="group flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-150 hover:shadow-md" style={{ 
                                color: palette.brand, 
                                borderColor: palette.brand + '40',
                                backgroundColor: palette.surface
                            }} onMouseEnter={(e) => { 
                                e.currentTarget.style.borderColor = palette.brand + '60'; 
                                e.currentTarget.style.boxShadow = `0 2px 12px ${palette.brand}20`;
                            }} onMouseLeave={(e) => { 
                                e.currentTarget.style.borderColor = palette.brand + '40'; 
                                e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`;
                            }}>
                                ← Return to Staff Portal
                            </Link>
                        ) : (
                            <Link href="/roles" className="text-sm font-semibold transition-all duration-150 hover:opacity-80" style={{ color: palette.brand }}>
                                ← Switch role
                            </Link>
                        )}
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-8">
                    {/* Patient Info Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2" style={{ color: palette.navyDark }}>{content.greeting}</h1>
                        <p className="text-lg max-w-3xl pr-8" style={{ color: palette.textSecondary }}>{content.subtext}</p>
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
                    <section className="rounded-xl border p-6" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderColor: palette.brand + '40',
                        boxShadow: `0 4px 12px ${palette.brand}20`
                    }}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: palette.navyDark }}>
                            {isCritical ? "🚨 What you should do now" : "✨ Daily Guidance"}
                        </h2>
                        <div className="space-y-3">
                            {content.guidance.map((item, i) => (
                                <div key={i} className="flex items-start gap-4 p-3 rounded-xl border" style={{
                                    backgroundColor: palette.muted,
                                    borderColor: palette.border + '40'
                                }}>
                                    <span className="text-2xl">{item.icon}</span>
                                    <span className="mt-1 font-medium" style={{ color: palette.textPrimary }}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                        {isCritical && (
                            <div className="mt-4 pt-4 border-t text-sm text-center" style={{
                                borderColor: palette.border + '40',
                                color: palette.textSecondary
                            }}>
                                Don't worry, we are watching these numbers closely.
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Status & History */}
                <div className="space-y-6">

                    {/* 3. Alerts */}
                    <section className="rounded-xl border p-6" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderColor: palette.brand + '40',
                        boxShadow: `0 4px 12px ${palette.brand}20`
                    }}>
                        <h2 className="text-lg font-bold mb-4" style={{ color: palette.navyDark }}>
                            {isCritical ? "Active Messages" : "Recent Updates"}
                        </h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: `${palette.brand}40 transparent` }}>
                            {content.alerts.map((alert, i) => {
                                // Determine alert color: green for normal, yellow for warning, red for danger
                                const isNormal = !alert.isCritical && !alert.title.includes("Warning");
                                const alertColor = isNormal ? palette.success : (alert.isCritical ? palette.danger : palette.warning);
                                
                                return (
                                    <div key={i} className={`p-5 rounded-xl border-l-4 transition-all duration-150 ${alert.isCritical ? 'animate-pulse' : ''}`} style={{
                                        backgroundColor: isNormal
                                            ? 'rgba(255, 255, 255, 0.85)'
                                            : (alert.isCritical 
                                                ? 'linear-gradient(135deg, rgba(255, 82, 82, 0.15) 0%, rgba(255, 82, 82, 0.05) 100%)'
                                                : 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)'),
                                        background: isNormal
                                            ? 'rgba(255, 255, 255, 0.85)'
                                            : (alert.isCritical 
                                                ? 'linear-gradient(135deg, rgba(255, 82, 82, 0.15) 0%, rgba(255, 82, 82, 0.05) 100%)'
                                                : 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)'),
                                        borderLeftColor: alertColor,
                                        borderLeftWidth: '4px',
                                        borderRight: `1px solid ${alertColor + '40'}`,
                                        borderTop: `1px solid ${alertColor + '40'}`,
                                        borderBottom: `1px solid ${alertColor + '40'}`,
                                        boxShadow: isNormal
                                            ? `0 2px 8px ${palette.success}20`
                                            : (alert.isCritical 
                                                ? `0 4px 16px ${palette.danger}30` 
                                                : `0 2px 8px ${palette.warning}20`)
                                    }}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {!isNormal && (
                                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider text-white flex-shrink-0`} style={{
                                                        backgroundColor: alertColor,
                                                        boxShadow: `0 2px 8px ${alertColor}40`
                                                    }}>
                                                        {alert.isCritical ? '🚨 CRITICAL' : '⚠️ WARNING'}
                                                    </span>
                                                )}
                                                <span className="font-bold text-base flex-shrink-0" style={{ color: alertColor }}>{alert.title}</span>
                                            </div>
                                            <span className="text-xs font-semibold flex-shrink-0 ml-4" style={{ color: palette.textSecondary }}>{alert.time}</span>
                                        </div>
                                        <p className="text-base mb-3 font-medium pr-8" style={{ color: palette.textPrimary }}>{alert.body}</p>
                                        <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{
                                            backgroundColor: isNormal 
                                                ? 'rgba(0, 230, 118, 0.1)' 
                                                : (alert.isCritical ? 'rgba(255, 82, 82, 0.1)' : 'rgba(255, 215, 0, 0.1)'),
                                            border: `1px solid ${alertColor + '30'}`
                                        }}>
                                            <span className="text-lg flex-shrink-0">ℹ️</span>
                                            <span className="text-sm font-medium flex-1" style={{ color: palette.textPrimary }}>{alert.reassurance}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button className="w-full mt-4 text-xs font-semibold py-2 transition-all duration-150 hover:opacity-80" style={{ color: palette.textSecondary }}>
                            View History
                        </button>
                    </section>

                    {/* 4. Support / Device */}
                    <section className="rounded-xl border p-6" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        borderColor: palette.brand + '40',
                        boxShadow: `0 4px 12px ${palette.brand}20`
                    }}>
                        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: palette.textSecondary }}>Device Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>📱</div>
                                    <span className="text-sm font-medium" style={{ color: palette.textPrimary }}>Device Type</span>
                                </div>
                                <span className="text-xs font-semibold" style={{ color: palette.navyDark }}>{device.device_type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>🔢</div>
                                    <span className="text-sm font-medium" style={{ color: palette.textPrimary }}>Serial Number</span>
                                </div>
                                <span className="text-xs font-mono font-semibold" style={{ color: palette.navyDark }}>{device.serial_number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>🏭</div>
                                    <span className="text-sm font-medium" style={{ color: palette.textPrimary }}>Manufacturer</span>
                                </div>
                                <span className="text-xs font-semibold" style={{ color: palette.navyDark }}>{device.manufacturer}</span>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
                </main>
            </div>

        </div>
    );
}
