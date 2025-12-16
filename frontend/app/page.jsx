"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Futuristic Medical Patient Monitoring Dashboard
function MedicalMonitoringDashboard() {
  const [heartRate, setHeartRate] = useState(88);
  const [spo2, setSpo2] = useState(98);
  const [systolic, setSystolic] = useState(128);
  const [diastolic, setDiastolic] = useState(82);
  const [temperature, setTemperature] = useState(36.8);
  const [respirationRate, setRespirationRate] = useState(18);
  const [ecgPath, setEcgPath] = useState('');
  const [plethPath, setPlethPath] = useState('');
  const [respirationPath, setRespirationPath] = useState('');
  const [ecgOffset, setEcgOffset] = useState(0);
  const [plethOffset, setPlethOffset] = useState(0);
  const [respirationOffset, setRespirationOffset] = useState(0);
  const [numberFlicker, setNumberFlicker] = useState(1);
  
  // Use refs to avoid DOM queries on every frame
  const ecgContainerRef = useRef(null);
  const plethContainerRef = useRef(null);
  const respContainerRef = useRef(null);
  const containerWidthsRef = useRef({ ecg: 600, pleth: 400, resp: 600 });
  const offsetsRef = useRef({ ecg: 0, pleth: 0, resp: 0 });

  // Generate continuous ECG waveform - regular spacing with pronounced peaks like clinical monitor
  const generateContinuousEcgPath = (offset, containerWidth) => {
    const baseY = 50;
    const viewWidth = containerWidth || 600;
    const beatInterval = 120; // Regular spacing between beats (consistent rhythm)
    let path = '';
    let x = -(offset % (beatInterval * 3)); // Negative offset for continuous scroll
    
    // Generate enough beats to fill viewport + buffer, ensuring full width coverage
    let currentX = x;
    const endX = viewWidth * 2; // Generate well beyond viewport
    
    // Start path at the beginning
    path += `M${currentX},${baseY}`;
    
    // Add baseline before first beat
    const initialBaseline = 30;
    currentX += initialBaseline;
    path += ` L${currentX},${baseY}`;
    
    // Generate beats until we've covered enough width
    while (currentX < endX) {
      // Flat baseline leading to beat (most of the interval)
      const baselineEnd = currentX + beatInterval * 0.80;
      path += ` L${baselineEnd},${baseY}`;
      
      // P wave - small rounded wave before QRS
      const pWave = 3 + Math.random() * 2;
      const pX1 = currentX + beatInterval * 0.82;
      const pX2 = currentX + beatInterval * 0.84;
      path += ` Q${pX1},${baseY - pWave} ${pX2},${baseY}`;
      
      // PR segment - flat line
      path += ` L${currentX + beatInterval * 0.86},${baseY}`;
      
      // QRS complex - sharp, pronounced spikes
      // Q - small initial dip
      path += ` L${currentX + beatInterval * 0.87},${baseY + 1}`;
      // R - tall sharp peak (pronounced upward spike)
      const rWave = 28 + Math.random() * 4; // Tall R-wave
      path += ` L${currentX + beatInterval * 0.88},${baseY - rWave}`;
      // S - deep downward spike
      const sWave = 32 + Math.random() * 5; // Deep S-wave
      path += ` L${currentX + beatInterval * 0.89},${baseY + sWave}`;
      // Recovery back to baseline
      path += ` L${currentX + beatInterval * 0.90},${baseY - 2}`;
      path += ` L${currentX + beatInterval * 0.91},${baseY}`;
      
      // ST segment - flat line
      path += ` L${currentX + beatInterval * 0.95},${baseY}`;
      
      // T wave - rounded wave after QRS
      const tWave = 6 + Math.random() * 3;
      const tX1 = currentX + beatInterval * 0.97;
      const tX2 = currentX + beatInterval * 0.99;
      path += ` Q${tX1},${baseY - tWave} ${tX2},${baseY}`;
      
      // Continue baseline to next beat
      currentX += beatInterval;
      path += ` L${currentX},${baseY}`;
    }
    
    return path;
  };

  // Generate continuous plethysmograph waveform - full width with increased amplitude
  const generateContinuousPlethPath = (offset, containerWidth) => {
    const baseY = 70;
    const height = 80; // Increased height for more dynamic visualization
    const viewWidth = containerWidth || 400;
    const pulseInterval = 18 + Math.random() * 4; // Slight variation in pulse spacing
    let path = '';
    let x = -(offset % (pulseInterval * 3)); // Negative offset for continuous scroll
    
    // Generate enough pulses to fill viewport + buffer
    let currentX = x;
    const endX = viewWidth * 2;
    
    // Start path
    path += `M${currentX},${baseY}`;
    
    // Generate pulses until we've covered enough width
    while (currentX < endX) {
      const pulseWidth = pulseInterval + (Math.random() - 0.5) * 2; // Variable pulse width
      const pulseHeight = height * (0.75 + Math.random() * 0.25); // More variation in amplitude
      const variation = Math.random() * 5; // Increased variation
      
      // Rising edge - more pronounced
      path += ` L${currentX + pulseWidth * 0.15},${baseY - pulseHeight * 0.25}`;
      path += ` L${currentX + pulseWidth * 0.30},${baseY - pulseHeight * 0.60}`;
      path += ` L${currentX + pulseWidth * 0.45},${baseY - pulseHeight * 0.85}`;
      path += ` L${currentX + pulseWidth * 0.50},${baseY - pulseHeight + variation}`;
      
      // Peak - sharper
      path += ` L${currentX + pulseWidth * 0.52},${baseY - pulseHeight + variation * 0.7}`;
      
      // Dicrotic notch - more pronounced
      const notchDepth = 5 + Math.random() * 4;
      path += ` L${currentX + pulseWidth * 0.56},${baseY - pulseHeight * 0.80}`;
      path += ` L${currentX + pulseWidth * 0.60},${baseY - pulseHeight * 0.65 + notchDepth}`;
      path += ` L${currentX + pulseWidth * 0.65},${baseY - pulseHeight * 0.60}`;
      
      // Falling edge - smoother descent
      path += ` L${currentX + pulseWidth * 0.72},${baseY - pulseHeight * 0.40}`;
      path += ` L${currentX + pulseWidth * 0.82},${baseY - pulseHeight * 0.20}`;
      path += ` L${currentX + pulseWidth * 0.92},${baseY - pulseHeight * 0.05}`;
      path += ` L${currentX + pulseWidth},${baseY}`;

      currentX += pulseWidth;
    }
    
    return path;
  };

  // Generate continuous respiration waveform - full width with large sinusoidal cycles
  const generateContinuousRespirationPath = (offset, containerWidth) => {
    const baseY = 50;
    const viewWidth = containerWidth || 600;
    const cycleWidth = 60 + Math.random() * 15; // Variable cycle width for realism
    let path = '';
    let x = -(offset % (cycleWidth * 3)); // Negative offset for continuous scroll
    
    // Generate enough cycles to fill viewport + buffer
    let currentX = x;
    const endX = viewWidth * 2;
    const points = 40; // More points for smoother curves
    
    // Start path
    path += `M${currentX},${baseY}`;
    
    // Generate cycles until we've covered enough width
    while (currentX < endX) {
      // Large amplitude with variation - much more pronounced inhale/exhale
      const amplitude = 28 + Math.random() * 12; // Significantly increased amplitude
      const cycleW = cycleWidth + (Math.random() - 0.5) * 8; // Variable cycle width
      
      // Generate smooth sinusoidal wave with subtle variations
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * Math.PI * 2;
        // Add subtle variation for realism (not perfectly smooth)
        const variation = (Math.random() - 0.5) * 1.5;
        // Use sine wave for smooth breathing pattern
        const y = baseY - Math.sin(t) * amplitude + variation;
        const xPos = currentX + (i * cycleW / points);
        path += ` L${xPos},${y}`;
      }
      
      currentX += cycleW;
    }
    
    return path;
  };

  // Memoize path generation functions
  const updateContainerWidths = useCallback(() => {
    if (ecgContainerRef.current) {
      containerWidthsRef.current.ecg = ecgContainerRef.current.offsetWidth || 600;
    }
    if (plethContainerRef.current) {
      containerWidthsRef.current.pleth = plethContainerRef.current.offsetWidth || 400;
    }
    if (respContainerRef.current) {
      containerWidthsRef.current.resp = respContainerRef.current.offsetWidth || 600;
    }
  }, []);

  useEffect(() => {
    // Initialize paths - wait for DOM to be ready
    const initTimeout = setTimeout(() => {
      updateContainerWidths();
      const widths = containerWidthsRef.current;
      
      // Generate long base paths once (3x container width for seamless scrolling)
      const baseEcgPath = generateContinuousEcgPath(0, widths.ecg * 3);
      const basePlethPath = generateContinuousPlethPath(0, widths.pleth * 3);
      const baseRespirationPath = generateContinuousRespirationPath(0, widths.resp * 3);
      
      setEcgPath(baseEcgPath);
      setPlethPath(basePlethPath);
      setRespirationPath(baseRespirationPath);
    }, 0);
    
    // Update on resize (debounced)
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateContainerWidths();
        const widths = containerWidthsRef.current;
        // Regenerate paths on resize
        setEcgPath(generateContinuousEcgPath(0, widths.ecg * 3));
        setPlethPath(generateContinuousPlethPath(0, widths.pleth * 3));
        setRespirationPath(generateContinuousRespirationPath(0, widths.resp * 3));
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);

    // Continuous scrolling - use CSS transforms instead of regenerating paths
    const scrollSpeed = 60; // pixels per second
    let lastTime = Date.now();
    let animationFrameId = null;
    let isRunning = true;
    
    const animationFrame = () => {
      if (!isRunning) return;
      
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // seconds
      lastTime = now;
      
      const pixelsToMove = scrollSpeed * deltaTime;
      const widths = containerWidthsRef.current;
      
      // Update offsets in ref
      offsetsRef.current.ecg += pixelsToMove;
      offsetsRef.current.pleth += pixelsToMove * 1.5;
      offsetsRef.current.resp += pixelsToMove * 0.8;
      
      // Reset offsets when they exceed path length to create seamless loop
      const ecgPathLength = widths.ecg * 3;
      const plethPathLength = widths.pleth * 3;
      const respPathLength = widths.resp * 3;
      
      if (offsetsRef.current.ecg > ecgPathLength) {
        offsetsRef.current.ecg -= ecgPathLength;
      }
      if (offsetsRef.current.pleth > plethPathLength) {
        offsetsRef.current.pleth -= plethPathLength;
      }
      if (offsetsRef.current.resp > respPathLength) {
        offsetsRef.current.resp -= respPathLength;
      }
      
      // Only update offset state (CSS will handle the transform)
      setEcgOffset(offsetsRef.current.ecg);
      setPlethOffset(offsetsRef.current.pleth);
      setRespirationOffset(offsetsRef.current.resp);
      
      animationFrameId = requestAnimationFrame(animationFrame);
    };

    animationFrameId = requestAnimationFrame(animationFrame);

    // Update vital signs continuously (realistic variation)
    const vitalSignsInterval = setInterval(() => {
      setHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(72, Math.min(108, prev + change));
      });

      const spo2Values = [96, 97, 98, 98, 99];
      setSpo2(spo2Values[Math.floor(Math.random() * spo2Values.length)]);

      setSystolic(prev => {
        const change = Math.floor(Math.random() * 4) - 2;
        return Math.max(120, Math.min(135, prev + change));
      });

      setDiastolic(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.max(75, Math.min(85, prev + change));
      });

      setTemperature(prev => {
        const change = (Math.random() - 0.5) * 0.15;
        return Math.max(36.5, Math.min(37.2, prev + change));
      });

      setRespirationRate(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.max(16, Math.min(20, prev + change));
      });
    }, 2500);

    // Subtle flicker animation for numbers
    const flickerInterval = setInterval(() => {
      setNumberFlicker(prev => prev === 1 ? 1.02 : 1);
    }, 300);

    return () => {
      isRunning = false;
      clearTimeout(initTimeout);
      clearTimeout(resizeTimeout);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      clearInterval(vitalSignsInterval);
      clearInterval(flickerInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateContainerWidths]);

  const getHRColor = (hr) => {
    if (hr >= 100) return '#EF4444'; // Softer red
    if (hr >= 90) return '#F59E0B'; // Softer yellow/amber
    return '#E5E7EB'; // Soft white/gray for normal
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg" style={{ 
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0d1117 100%)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.6), 0 0 40px rgba(59, 130, 246, 0.1)'
    }}>
      {/* Subtle grid overlay - more visible */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.08]">
        <defs>
          <pattern id="monitorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#monitorGrid)" />
      </svg>

      <div className="relative p-4 space-y-3">
        {/* Heart Rate Panel - Top Horizontal */}
        <div className="relative overflow-hidden" style={{ 
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(229, 231, 235, 0.12)',
          borderRadius: '10px',
          padding: '12px 16px',
          backdropFilter: 'blur(12px)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base" style={{ color: getHRColor(heartRate) }}>♥</span>
              <span 
                className="font-mono text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: getHRColor(heartRate),
                  textShadow: `0 0 12px ${getHRColor(heartRate)}40`,
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98
                }}
              >
                {heartRate}
              </span>
              <span className="text-gray-300 text-xs font-medium tracking-wider uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>BPM</span>
            </div>
          </div>
          
          {/* ECG Waveform - Full Width */}
          <div 
            ref={ecgContainerRef}
            data-ecg-container
            className="relative h-24 overflow-hidden rounded" 
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          >
            <svg
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <filter id="ecgGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feOffset in="coloredBlur" dx="0" dy="0" result="offsetBlur" />
                  <feFlood floodColor="#00FF00" floodOpacity="0.6" />
                  <feComposite in2="offsetBlur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g style={{ transform: `translateX(-${ecgOffset}px)` }}>
                <path
                  d={ecgPath}
                  fill="none"
                  stroke="#00FF00"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#ecgGlow)"
                  style={{ 
                    filter: 'drop-shadow(0 0 8px rgba(0, 255, 0, 0.8)) drop-shadow(0 0 4px rgba(0, 255, 0, 0.6))',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round'
                  }}
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Middle Row: SpO₂, Blood Pressure, Temperature */}
        <div className="grid grid-cols-3 gap-4">
          {/* SpO₂ Panel */}
          <div className="relative overflow-hidden" style={{ 
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            borderRadius: '10px',
            padding: '12px 14px',
            backdropFilter: 'blur(12px)'
          }}>
            <div className="text-cyan-400 text-xs font-semibold tracking-widest mb-1.5 uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>SpO₂</div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <span 
                className="font-mono text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#22D3EE',
                  textShadow: '0 0 12px rgba(34, 211, 238, 0.4)',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98
                }}
              >
                {spo2}
              </span>
              <span className="text-cyan-400 text-base font-medium">%</span>
            </div>
            {/* Plethysmograph waveform - Full Width */}
            <div 
              ref={plethContainerRef}
              data-pleth-container
              className="relative h-16 overflow-hidden rounded" 
              style={{ background: 'rgba(0, 0, 0, 0.3)' }}
            >
              <svg
                viewBox="0 0 800 100"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%' }}
              >
                <defs>
                  <filter id="plethGlow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <g style={{ transform: `translateX(-${plethOffset}px)` }}>
                  <path
                    d={plethPath}
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#plethGlow)"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.8))' }}
                  />
                </g>
              </svg>
            </div>
          </div>

          {/* Blood Pressure Panel */}
          <div className="relative overflow-hidden" style={{ 
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '12px 14px',
            backdropFilter: 'blur(12px)'
          }}>
            <div className="text-red-400 text-xs font-semibold tracking-widest mb-1.5 uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>Blood Pressure</div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span 
                className="font-mono text-xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#EF4444',
                  textShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98
                }}
              >
                {systolic}
              </span>
              <span className="text-red-400 text-base font-medium">/</span>
              <span 
                className="font-mono text-xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#EF4444',
                  textShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98
                }}
              >
                {diastolic}
              </span>
            </div>
            <div className="text-red-400/70 text-xs font-mono">mmHg</div>
          </div>

          {/* Temperature Panel */}
          <div className="relative overflow-hidden" style={{ 
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(147, 197, 253, 0.2)',
            borderRadius: '10px',
            padding: '12px 14px',
            backdropFilter: 'blur(12px)'
          }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-sm">🌡</span>
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-300" style={{ fontFamily: 'system-ui, sans-serif' }}>Temperature</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span 
                className="font-mono text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#93C5FD',
                  textShadow: '0 0 10px rgba(147, 197, 253, 0.4)',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98
                }}
              >
                {temperature.toFixed(1)}
              </span>
              <span className="text-blue-300 text-base font-medium">°C</span>
            </div>
          </div>
        </div>

        {/* Respiration Panel - Bottom */}
        <div className="relative overflow-hidden" style={{ 
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(234, 179, 8, 0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          backdropFilter: 'blur(12px)'
        }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: 'system-ui, sans-serif' }}>Respiration</span>
              <span 
                className="font-mono text-xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#FCD34D',
                  textShadow: '0 0 12px rgba(252, 211, 77, 0.4)',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98
                }}
              >
                {respirationRate}
              </span>
              <span className="text-amber-300 text-xs font-medium tracking-wider uppercase">RPM</span>
            </div>
          </div>
          
          {/* Respiration Waveform - Full Width */}
          <div 
            ref={respContainerRef}
            data-resp-container
            className="relative h-20 overflow-hidden rounded" 
            style={{ background: 'rgba(0, 0, 0, 0.3)' }}
          >
            <svg
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <filter id="respirationGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g style={{ transform: `translateX(-${respirationOffset}px)` }}>
                <path
                  d={respirationPath}
                  fill="none"
                  stroke="#FCD34D"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#respirationGlow)"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(252, 211, 77, 0.9))' }}
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const palette = {
  brand: "#0A5FB5",
  brandBright: "#1E88E5",
  navy: "#0D47A1",
  light: "#E3F2FD",
  soft: "#A7D0F5",
  cyan: "#4FC3F7",
  border: "#CBD3DD",
  surface: "#FFFFFF",
  muted: "#F2F4F7",
  success: "#2ECC71",
  warning: "#F4B400",
  danger: "#E63946",
};

const valueProps = [
  {
    title: 'Reliable monitoring you can trust',
    body: 'Patient data is recorded consistently and accurately, so alerts and vital trends can be reviewed with confidence at any time.'
  },
  {
    title: 'Flexible alerts for each patient',
    body: 'Set safe ranges for vital signs globally or per patient, with clear alerts that staff can acknowledge and follow up on.'
  },
  {
    title: 'Designed for training and demonstration',
    body: 'Supports realistic monitoring scenarios to help teams understand alert behavior and system responses.'
  }
];

const howItWorks = [
  { title: 'Collect vital signs', body: 'Monitoring devices regularly send patient vital signs to the system.' },
  { title: 'Detect potential issues', body: 'Vital signs are automatically checked against safe ranges, and alerts are created when values become abnormal.' },
  { title: 'View updates in real time', body: 'Live dashboards show current vital signs and alerts so staff can respond quickly.' }
];

const useCases = [
  'Hospital & ward monitoring',
  'Remote patient monitoring',
  'Training & system demonstration'
];

const faq = [
  {
    q: 'How are alerts generated?',
    a: 'Alerts are created automatically when vital signs go outside safe ranges, helping staff respond quickly to changes in patient condition.'
  },
  {
    q: 'What user roles are supported?',
    a: 'The system supports different access levels for administrators, clinicians, and viewers to ensure appropriate data access.'
  },
  {
    q: 'How responsive is the system?',
    a: 'Vital signs and alerts update in near real time, allowing timely monitoring and intervention.'
  },
  {
    q: 'Can I try it on my own computer?',
    a: 'Yes. You can run a full demo locally to explore the system and its features.'
  }
];

const sectionCard = "rounded-2xl border bg-white shadow-sm";

export default function Page() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.light, color: palette.navy }}>
      <header className="border-b bg-white" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
          <img src="/MedQL_Modern_Clinical_Logo_White.png" alt="MyMedQL" className="h-40 w-auto" />
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: palette.navy }}>
            <a href="#product" className="hover:text-[#0A5FB5]">Product</a>
            <a href="#how" className="hover:text-[#0A5FB5]">How It Works</a>
            <a href="#features" className="hover:text-[#0A5FB5]">Features</a>
            <a href="#demo" className="hover:text-[#0A5FB5]">Demo</a>
            <a href="#docs" className="hover:text-[#0A5FB5]">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/roles" className="rounded-full border px-4 py-2 text-sm font-semibold" style={{ color: palette.brandBright, borderColor: palette.brandBright }}>Get Started</Link>
            <button className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: palette.brand }}>Start Demo</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="product" className="mx-auto max-w-7xl px-6 pt-24 pb-16">
          <div className="mb-6">
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4" style={{ backgroundColor: palette.soft, color: palette.brand }}>
              Continuous monitoring · Clear alerts · Reliable records
            </p>
          </div>
          
          {/* Landscape Layout: Title and Dashboard side by side */}
          <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
            <div className="flex-1 lg:max-w-md">
              <h1 className="text-3xl font-bold leading-tight mb-4" style={{ color: palette.navy }}>
                Real-time vital monitoring for safer patient care
              </h1>
              <p className="text-lg mb-6" style={{ color: palette.navy }}>
                MyMedQL continuously tracks patient vital signs and notifies healthcare staff when readings move outside safe ranges. Live dashboards and clear alerts help teams act quickly, while keeping a reliable record of patient data over time.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Link href="/roles" className="rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.brand }}>Get Started</Link>
                <button className="rounded-full border px-5 py-3 text-sm font-semibold" style={{ color: palette.brandBright, borderColor: palette.brandBright, backgroundColor: palette.surface }}>Try Live Demo</button>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-semibold" style={{ color: palette.navy }}>
                {['Continuous Monitoring', 'Early Warning Alerts', 'Staff & Patient Access', 'Privacy-focused Design'].map((chip) => (
                  <span key={chip} className="rounded-full px-3 py-1" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>{chip}</span>
                ))}
              </div>
            </div>
            
            {/* Dashboard - Landscape Mode */}
            <div className="flex-1 lg:flex-[1.5] w-full">
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f1419 100%)',
                border: '2px solid rgba(79, 195, 247, 0.3)',
                boxShadow: '0 0 60px rgba(79, 195, 247, 0.2), inset 0 0 60px rgba(0, 0, 0, 0.5)'
              }}>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-semibold text-base tracking-wider">PATIENT MONITORING DASHBOARD</div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30" style={{ textShadow: '0 0 8px rgba(76, 175, 80, 0.5)' }}>● LIVE</span>
                  </div>
                  <MedicalMonitoringDashboard />
                </div>
                <div className="mt-6 space-y-3 p-5" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
                <div className="flex items-center justify-between rounded-lg px-4 py-3 text-sm" style={{ 
                  background: 'rgba(34, 211, 238, 0.08)', 
                  border: '1px solid rgba(34, 211, 238, 0.15)' 
                }}>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)' }} />
                    <span className="font-semibold text-gray-100" style={{ fontFamily: 'system-ui, sans-serif' }}>Patient 104</span>
                    <span className="text-xs text-cyan-300/80 font-mono">HR 96 · SpO₂ 97%</span>
                  </div>
                  <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-md hover:bg-cyan-400/10">View</button>
                </div>
                <div className="flex items-center justify-between rounded-lg px-4 py-3 text-sm" style={{ 
                  background: 'rgba(239, 68, 68, 0.12)', 
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.1)'
                }}>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)' }} />
                    <div className="flex flex-col">
                      <span className="font-semibold text-red-400" style={{ fontFamily: 'system-ui, sans-serif' }}>Alert · Tachycardia</span>
                      <span className="text-xs text-red-300/80 font-mono mt-0.5">HR 128 at 14:03</span>
                    </div>
                  </div>
                  <button 
                    className="rounded-full px-5 py-2 text-xs font-semibold text-white bg-red-500/90 hover:bg-red-500 border border-red-400/50 transition-all duration-200 shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95" 
                    style={{ 
                      fontFamily: 'system-ui, sans-serif',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Acknowledge
                  </button>
                </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        < section id="features" className="py-14" style={{ backgroundColor: palette.surface }
        }>
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold" style={{ color: palette.navy }}>Why choose MyMedQL</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {valueProps.map((item) => (
                <div key={item.title} className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                  <div className="mb-3 h-10 w-10 rounded-full" style={{ backgroundColor: palette.soft, color: palette.brand }}></div>
                  <h3 className="text-lg font-semibold" style={{ color: palette.navy }}>{item.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: palette.navy }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section >

        {/* How it works */}
        < section id="how" className="mx-auto max-w-6xl px-6 py-14" >
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold" style={{ color: palette.navy }}>How it works</h2>
              <p className="mt-3 text-sm" style={{ color: palette.navy }}>
                MyMedQL continuously collects vital signs, checks them against safe ranges, and displays updates and alerts in real time.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorks.map((item, idx) => (
                <div key={item.title} className={`${sectionCard} p-5`} style={{ borderColor: palette.border }}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: palette.brand }}>
                    <span className="h-6 w-6 rounded-full text-center leading-6" style={{ backgroundColor: palette.soft }}>{idx + 1}</span>
                    {item.title}
                  </div>
                  <p className="text-sm" style={{ color: palette.navy }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section >

        {/* Use cases and scenarios */}
        < section id="demo" className="py-14" style={{ backgroundColor: palette.surface }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Use cases</h3>
                <div className="mt-4 space-y-3">
                  {useCases.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3" style={{ borderColor: palette.border }}>
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.success }} />
                      <span className="text-sm font-semibold" style={{ color: palette.navy }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Example patient monitoring timeline</h3>
                <div className="mt-4 rounded-2xl border p-6" style={{ background: `linear-gradient(135deg, ${palette.surface}, ${palette.light})`, borderColor: palette.border }}>
                  <div className="flex items-center justify-between text-xs font-semibold" style={{ color: palette.navy }}>
                    <span>Time</span>
                    <span>Alerts</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full" style={{ backgroundColor: palette.border }}>
                    <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: palette.success }} />
                  </div>
                  <div className="mt-4 space-y-3 text-sm" style={{ color: palette.navy }}>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.success }} />
                      Normal vital signs are monitored continuously
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.danger }} />
                      An abnormal heart rate triggers an alert for staff
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.brandBright }} />
                      Vitals return to normal and the alert is resolved
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.brand }}>Run Scenario</button>
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* Data & Security */}
        < section id="docs" className="mx-auto max-w-6xl px-6 py-14" >
          <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Data & Security</h3>
                <p className="mt-2 text-sm" style={{ color: palette.navy }}>
                  Patient data is protected with strong security measures and access controls. Only authorized users can view sensitive information, and all activity is recorded responsibly.
                </p>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-2" style={{ color: palette.navy }}>
                {[
                  "Encrypted patient data",
                  "Role-based access",
                  "Secure login and authentication",
                  "Audit-friendly records",
                  "Privacy-focused design",
                  "Authorized staff access only"
                ].map((item) => (
                  <span key={item} className="rounded-xl px-4 py-3" style={{ backgroundColor: palette.light }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section >

        {/* About Us */}
        <section id="about" className="py-14" style={{ backgroundColor: palette.surface }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: palette.soft, color: palette.brand }}>Built by students. Designed for care.</span>
              <h2 className="mt-3 text-3xl font-bold" style={{ color: palette.navy }}>About Us</h2>
            </div>

            {/* Vision and Mission Cards */}
            <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="goal">🎯</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>Our Goal</h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.navy }}>
                  MyMedQL is a student-built healthcare project created with one clear goal: to make patient monitoring clearer, safer, and more accessible for both patients and healthcare staff.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="philosophy">💡</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>Philosophy</h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.navy }}>
                  We believe technology should support care—not complicate it. That’s why MyMedQL focuses on presenting vital health information in a simple, understandable way, helping staff respond quickly.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="team">🤝</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>The Team</h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.navy }}>
                  This project was developed by a small, multidisciplinary team of students interested in healthcare, technology, and social impact. Each member contributed to shaping MyMedQL into a meaningful application.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="design">✨</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>Our Design</h3>
                <p className="text-sm italic leading-relaxed" style={{ color: palette.brand }}>
                  "Together, we designed MyMedQL as a practical learning project and a concept system that demonstrates how thoughtful software design can support patient care and clinical decision-making."
                </p>
              </div>
            </div>

            {/* Team Marquee */}
            <div className="overflow-hidden">
              <h3 className="mb-6 text-center text-xl font-bold" style={{ color: palette.navy }}>Meet the Team behind MyMedQL</h3>
              <div className="relative w-full mask-gradient">
                <div className="flex w-max gap-6 hover:pause-on-hover animate-scroll">
                  {[
                    { name: "Cao Pham Minh Dang", role: "Backend Developer" },
                    { name: "Ngo Dinh Khanh", role: "Frontend Developer" },
                    { name: "Pham Dinh Hieu", role: "Database Engineer" },
                    { name: "Nguyen Anh Duc", role: "DevOps / QA" },
                    // Duplicate for seamless loop
                    { name: "Cao Pham Minh Dang", role: "Backend Developer" },
                    { name: "Ngo Dinh Khanh", role: "Frontend Developer" },
                    { name: "Pham Dinh Hieu", role: "Database Engineer" },
                    { name: "Nguyen Anh Duc", role: "DevOps / QA" }
                  ].map((member, idx) => (
                    <div key={idx} className={`${sectionCard} w-64 flex-shrink-0 p-5 transition hover:shadow-md`} style={{ borderColor: palette.border }}>
                      <div className="h-10 w-10 rounded-full mb-3 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: palette.light, color: palette.brand }}>
                        {member.name.charAt(0)}
                      </div>
                      <div className="font-bold truncate" style={{ color: palette.navy }}>{member.name}</div>
                      <div className="text-xs mt-1 font-semibold" style={{ color: palette.brandBright }}>{member.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        < section className="py-14" >
          <div className="mx-auto max-w-6xl px-6">
            <h3 className="text-xl font-bold" style={{ color: palette.navy }}>FAQ</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <div key={item.q} className={`${sectionCard} p-5`} style={{ borderColor: palette.border }}>
                  <div className="text-sm font-semibold" style={{ color: palette.brand }}>{item.q}</div>
                  <p className="mt-2 text-sm" style={{ color: palette.navy }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section >

        {/* CTA */}
        < section className="mx-auto max-w-6xl px-6 pb-16" >
          <div className="rounded-2xl px-8 py-10 text-white" style={{ backgroundColor: palette.brand }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Spin it up in minutes.</h3>
                <p className="mt-2 text-sm" style={{ color: palette.soft }}>
                  Start a complete demo environment in minutes with everything preconfigured.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold" style={{ color: palette.brand }}>Run with Docker</button>
                <Link href="/roles" className="rounded-full border px-5 py-3 text-sm font-semibold text-white" style={{ borderColor: "#FFFFFF" }}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section >
      </main >

      <footer className="border-t bg-white" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm md:flex-row md:items-center md:justify-between" style={{ color: palette.navy }}>
          <div>MyMedQL · Real-time patient vital monitoring</div>
          <div className="flex flex-wrap gap-4">
            <a href="#docs" className="hover:text-[#0A5FB5]">Docs</a>
            <a href="#demo" className="hover:text-[#0A5FB5]">Demo</a>
            <a href="#features" className="hover:text-[#0A5FB5]">Features</a>
            <a href="#how" className="hover:text-[#0A5FB5]">How it works</a>
          </div>
        </div>
      </footer>
    </div >
  );
}
