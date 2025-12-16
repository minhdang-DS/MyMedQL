"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// Clean, Professional Medical Patient Monitoring Dashboard
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
  const [sweepPosition, setSweepPosition] = useState({ ecg: 0, pleth: 0, resp: 0 });
  const [numberFlicker, setNumberFlicker] = useState(1);
  
  // Use refs to avoid DOM queries on every frame
  const ecgContainerRef = useRef(null);
  const plethContainerRef = useRef(null);
  const respContainerRef = useRef(null);
  const containerWidthsRef = useRef({ ecg: 600, pleth: 400, resp: 600 });
  const sweepPositionsRef = useRef({ ecg: 0, pleth: 0, resp: 0 });
  const lastRegenPositionsRef = useRef({ ecg: 0, pleth: 0, resp: 0 });

  // Generate full-width ECG waveform - always visible across entire panel
  const generateContinuousEcgPath = () => {
    const baseY = 50;
    // Use fixed viewBox width (1000) to ensure full panel coverage
    const viewWidth = 1000;
    // Vary beat interval significantly for each regeneration (150-250 range)
    const baseBeatInterval = 150 + Math.random() * 100;
    let path = '';
    let currentX = 0; // Start from left edge
    
    // Generate enough beats to fill entire viewport width
    const endX = viewWidth;
    
    // Vary base amplitudes for this entire waveform generation
    const baseRWaveAmplitude = 30 + Math.random() * 15; // 30-45 range
    const baseSWaveAmplitude = 32 + Math.random() * 18; // 32-50 range
    const baseTWaveAmplitude = 6 + Math.random() * 8; // 6-14 range
    const basePWaveAmplitude = 2 + Math.random() * 4; // 2-6 range
    
    // Start path at the beginning
    path += `M${currentX},${baseY}`;
    
    // Add baseline before first beat - vary initial baseline
    const initialBaseline = 20 + Math.random() * 30;
    currentX += initialBaseline;
    path += ` L${currentX},${baseY}`;
    
    // Generate beats until we've covered enough width
    while (currentX < endX) {
      // Vary beat interval for each beat (add some rhythm variation)
      const beatInterval = baseBeatInterval + (Math.random() - 0.5) * 30;
      
      // Flat baseline leading to beat (most of the interval)
      const baselineEnd = currentX + beatInterval * (0.75 + Math.random() * 0.10);
      path += ` L${baselineEnd},${baseY}`;
      
      // P wave - small rounded wave before QRS - vary timing and amplitude
      const pWave = basePWaveAmplitude + (Math.random() - 0.5) * 2;
      const pTiming = 0.80 + Math.random() * 0.05;
      const pX1 = currentX + beatInterval * (pTiming + 0.02);
      const pX2 = currentX + beatInterval * (pTiming + 0.04);
      path += ` Q${pX1},${baseY - pWave} ${pX2},${baseY}`;
      
      // PR segment - flat line with slight variation
      path += ` L${currentX + beatInterval * (0.85 + Math.random() * 0.03)},${baseY}`;
      
      // QRS complex - sharp, pronounced spikes with variable amplitude
      // Q - small initial dip - vary depth
      const qDepth = 1 + Math.random() * 3;
      path += ` L${currentX + beatInterval * (0.86 + Math.random() * 0.02)},${baseY + qDepth}`;
      // R - tall sharp peak - vary amplitude and timing
      const rWave = baseRWaveAmplitude + (Math.random() - 0.5) * 8;
      const rTiming = 0.87 + Math.random() * 0.03;
      path += ` L${currentX + beatInterval * rTiming},${baseY - rWave}`;
      // S - deep downward spike - vary amplitude and timing
      const sWave = baseSWaveAmplitude + (Math.random() - 0.5) * 10;
      const sTiming = rTiming + 0.01 + Math.random() * 0.02;
      path += ` L${currentX + beatInterval * sTiming},${baseY + sWave}`;
      // Recovery back to baseline - vary timing
      path += ` L${currentX + beatInterval * (sTiming + 0.01 + Math.random() * 0.02)},${baseY - (2 + Math.random() * 3)}`;
      path += ` L${currentX + beatInterval * (0.90 + Math.random() * 0.03)},${baseY}`;
      
      // ST segment - flat line with slight variation
      path += ` L${currentX + beatInterval * (0.93 + Math.random() * 0.04)},${baseY}`;
      
      // T wave - rounded wave after QRS - vary amplitude and timing
      const tWave = baseTWaveAmplitude + (Math.random() - 0.5) * 4;
      const tTiming = 0.95 + Math.random() * 0.04;
      const tX1 = currentX + beatInterval * tTiming;
      const tX2 = currentX + beatInterval * (tTiming + 0.02);
      path += ` Q${tX1},${baseY - tWave} ${tX2},${baseY}`;
      
      // Continue baseline to next beat
      currentX += beatInterval;
      path += ` L${currentX},${baseY}`;
    }
    
    // Ensure path extends to full width
    if (currentX < endX) {
      path += ` L${endX},${baseY}`;
    }
    
    return path;
  };

  // Generate full-width plethysmograph waveform - always visible across entire panel
  const generateContinuousPlethPath = () => {
    const baseY = 70;
    // Vary base height significantly for each regeneration (70-120 range)
    const baseHeight = 70 + Math.random() * 50;
    // Use fixed viewBox width (800) to ensure full panel coverage
    const viewWidth = 800;
    // Vary base pulse interval significantly (12-25 range)
    const basePulseInterval = 12 + Math.random() * 13;
    let path = '';
    let currentX = 0; // Start from left edge
    
    // Generate enough pulses to fill entire viewport width
    const endX = viewWidth;
    
    // Start path
    path += `M${currentX},${baseY}`;
    
    // Generate pulses until we've covered enough width
    while (currentX < endX) {
      // Vary pulse width significantly for each pulse
      const pulseWidth = basePulseInterval + (Math.random() - 0.5) * 8;
      // Vary pulse height with larger range
      const pulseHeight = baseHeight * (0.70 + Math.random() * 0.30);
      const variation = Math.random() * 10; // Increased variation
      
      // Vary the shape characteristics for each pulse
      const riseSpeed = 0.12 + Math.random() * 0.08; // Vary how fast it rises
      const peakTiming = 0.48 + Math.random() * 0.06; // Vary peak position
      const notchPosition = 0.54 + Math.random() * 0.08; // Vary notch position
      
      // Rising edge - more pronounced with variation
      path += ` L${currentX + pulseWidth * (riseSpeed + 0.03)},${baseY - pulseHeight * (0.20 + Math.random() * 0.10)}`;
      path += ` L${currentX + pulseWidth * (riseSpeed * 2 + 0.05)},${baseY - pulseHeight * (0.50 + Math.random() * 0.15)}`;
      path += ` L${currentX + pulseWidth * (riseSpeed * 3 + 0.08)},${baseY - pulseHeight * (0.75 + Math.random() * 0.15)}`;
      path += ` L${currentX + pulseWidth * peakTiming},${baseY - pulseHeight + variation}`;
      
      // Peak - sharper with variation
      path += ` L${currentX + pulseWidth * (peakTiming + 0.02 + Math.random() * 0.02)},${baseY - pulseHeight + variation * (0.6 + Math.random() * 0.2)}`;
      
      // Dicrotic notch - more pronounced and visible with variation
      const notchDepth = 5 + Math.random() * 8;
      path += ` L${currentX + pulseWidth * (notchPosition - 0.02)},${baseY - pulseHeight * (0.70 + Math.random() * 0.15)}`;
      path += ` L${currentX + pulseWidth * notchPosition},${baseY - pulseHeight * (0.60 + Math.random() * 0.10) + notchDepth}`;
      path += ` L${currentX + pulseWidth * (notchPosition + 0.05 + Math.random() * 0.05)},${baseY - pulseHeight * (0.55 + Math.random() * 0.10)}`;
      
      // Falling edge - smoother descent with variation
      const fallSpeed = 0.70 + Math.random() * 0.15;
      path += ` L${currentX + pulseWidth * fallSpeed},${baseY - pulseHeight * (0.35 + Math.random() * 0.10)}`;
      path += ` L${currentX + pulseWidth * (fallSpeed + 0.10 + Math.random() * 0.05)},${baseY - pulseHeight * (0.15 + Math.random() * 0.10)}`;
      path += ` L${currentX + pulseWidth * (fallSpeed + 0.20 + Math.random() * 0.05)},${baseY - pulseHeight * (0.03 + Math.random() * 0.05)}`;
      path += ` L${currentX + pulseWidth},${baseY}`;

      currentX += pulseWidth;
    }
    
    // Ensure path extends to full width
    if (currentX < endX) {
      path += ` L${endX},${baseY}`;
    }
    
    return path;
  };

  // Generate full-width respiration waveform - always visible across entire panel
  const generateContinuousRespirationPath = () => {
    const baseY = 50;
    // Use fixed viewBox width (1000) to ensure full panel coverage
    const viewWidth = 1000;
    // Vary base cycle width significantly for each regeneration (45-90 range)
    const baseCycleWidth = 45 + Math.random() * 45;
    // Vary base amplitude significantly (25-55 range)
    const baseAmplitude = 25 + Math.random() * 30;
    let path = '';
    let currentX = 0; // Start from left edge
    
    // Generate enough cycles to fill entire viewport width
    const endX = viewWidth;
    const points = 40; // More points for smoother curves
    
    // Start path
    path += `M${currentX},${baseY}`;
    
    // Generate cycles until we've covered enough width
    while (currentX < endX) {
      // Vary amplitude significantly for each cycle
      const amplitude = baseAmplitude + (Math.random() - 0.5) * 12;
      // Vary cycle width significantly for each cycle
      const cycleW = baseCycleWidth + (Math.random() - 0.5) * 20;
      
      // Vary wave shape characteristics
      const phaseShift = Math.random() * Math.PI * 0.3; // Add phase variation
      const shapeFactor = 0.8 + Math.random() * 0.4; // Vary wave shape (sine vs modified)
      
      // Generate smooth sinusoidal wave with realistic variations
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * Math.PI * 2 + phaseShift;
        // Add variation for clinical realism (not perfectly smooth)
        const variation = (Math.random() - 0.5) * 4;
        // Use sine wave with shape factor for variation
        const waveValue = Math.sin(t) * shapeFactor;
        const y = baseY - waveValue * amplitude + variation;
        const xPos = currentX + (i * cycleW / points);
        path += ` L${xPos},${y}`;
      }
      
      currentX += cycleW;
    }
    
    // Ensure path extends to full width
    if (currentX < endX) {
      path += ` L${endX},${baseY}`;
    }
    
    return path;
  };

  // Helper function to update vital signs
  const updateVitalSigns = useCallback(() => {
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
  }, []);

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
      
      // Generate full-width paths that fill the entire viewBox (fixed widths)
      const baseEcgPath = generateContinuousEcgPath();
      const basePlethPath = generateContinuousPlethPath();
      const baseRespirationPath = generateContinuousRespirationPath();
      
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
        // Regenerate paths on resize (using fixed viewBox widths)
        setEcgPath(generateContinuousEcgPath());
        setPlethPath(generateContinuousPlethPath());
        setRespirationPath(generateContinuousRespirationPath());
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);

    // Sweep animation - moving erase spot from left to right
    const sweepSpeed = 100; // pixels per second (adjust for sweep speed)
    const regenInterval = 80; // Regenerate waveform every N pixels as sweep moves
    let lastTime = Date.now();
    let animationFrameId = null;
    let isRunning = true;
    
    const animationFrame = () => {
      if (!isRunning) return;
      
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // seconds
      lastTime = now;
      
      const pixelsToMove = sweepSpeed * deltaTime;
      const widths = containerWidthsRef.current;
      
      // Update sweep positions (moving left to right)
      sweepPositionsRef.current.ecg += pixelsToMove;
      sweepPositionsRef.current.pleth += pixelsToMove * 1.2;
      sweepPositionsRef.current.resp += pixelsToMove * 0.9;
      
      // Regenerate waveforms continuously as sweep moves (not just on reset)
      // ECG: regenerate every regenInterval pixels
      if (sweepPositionsRef.current.ecg - lastRegenPositionsRef.current.ecg >= regenInterval) {
        setEcgPath(generateContinuousEcgPath());
        lastRegenPositionsRef.current.ecg = sweepPositionsRef.current.ecg;
      }
      
      // Pleth: regenerate every regenInterval pixels
      if (sweepPositionsRef.current.pleth - lastRegenPositionsRef.current.pleth >= regenInterval) {
        setPlethPath(generateContinuousPlethPath());
        lastRegenPositionsRef.current.pleth = sweepPositionsRef.current.pleth;
      }
      
      // Respiration: regenerate every regenInterval pixels
      if (sweepPositionsRef.current.resp - lastRegenPositionsRef.current.resp >= regenInterval) {
        setRespirationPath(generateContinuousRespirationPath());
        lastRegenPositionsRef.current.resp = sweepPositionsRef.current.resp;
      }
      
      // Reset sweep positions when they exceed container width (wrap back to left)
      if (sweepPositionsRef.current.ecg > widths.ecg) {
        sweepPositionsRef.current.ecg = 0;
        lastRegenPositionsRef.current.ecg = 0;
        // Regenerate waveform with new random variations
        setEcgPath(generateContinuousEcgPath());
        // Update vital signs when sweep resets
        updateVitalSigns();
      }
      if (sweepPositionsRef.current.pleth > widths.pleth) {
        sweepPositionsRef.current.pleth = 0;
        lastRegenPositionsRef.current.pleth = 0;
        setPlethPath(generateContinuousPlethPath());
        // Update vital signs when sweep resets
        updateVitalSigns();
      }
      if (sweepPositionsRef.current.resp > widths.resp) {
        sweepPositionsRef.current.resp = 0;
        lastRegenPositionsRef.current.resp = 0;
        setRespirationPath(generateContinuousRespirationPath());
        // Update vital signs when sweep resets
        updateVitalSigns();
      }
      
      // Update sweep position state
      setSweepPosition({
        ecg: sweepPositionsRef.current.ecg,
        pleth: sweepPositionsRef.current.pleth,
        resp: sweepPositionsRef.current.resp
      });
      
      animationFrameId = requestAnimationFrame(animationFrame);
    };

    animationFrameId = requestAnimationFrame(animationFrame);

    // Update vital signs continuously (realistic variation)
    const vitalSignsInterval = setInterval(() => {
      updateVitalSigns();
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
  }, [updateContainerWidths, updateVitalSigns]);

  const getHRColor = (hr) => {
    if (hr >= 100) return '#FF6B6B'; // Red for critical alerts
    if (hr >= 90) return '#FFD93D'; // Amber for elevated
    return '#4ECDC4'; // Bright green/cyan for normal
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl" style={{ 
      background: '#0A0E14',
      border: '1px solid rgba(78, 205, 196, 0.15)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 100px rgba(0, 0, 0, 0.3)'
    }}>
      {/* Subtle grid overlay */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]">
        <defs>
          <pattern id="monitorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4ECDC4" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#monitorGrid)" />
      </svg>

      <div className="relative p-5 space-y-4">
        {/* Heart Rate Panel - Top Horizontal */}
        <div className="relative overflow-hidden rounded-lg" style={{ 
          background: 'rgba(15, 20, 28, 0.6)',
          border: '1px solid rgba(78, 205, 196, 0.2)',
          padding: '14px 18px',
          boxShadow: '0 0 20px rgba(78, 205, 196, 0.1), inset 0 0 40px rgba(0, 0, 0, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-lg" style={{ color: getHRColor(heartRate) }}>♥</span>
              <span 
                className="font-sans text-3xl font-bold transition-all duration-200" 
                style={{ 
                  color: getHRColor(heartRate),
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  textShadow: `0 0 10px ${getHRColor(heartRate)}40`
                }}
              >
                {heartRate}
              </span>
              <span className="text-xs font-medium tracking-wider uppercase" style={{ color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' }}>BPM</span>
            </div>
          </div>
          
          {/* ECG Waveform - Full Width - Bright Green with Sweep */}
          <div 
            ref={ecgContainerRef}
            data-ecg-container
            className="relative h-32 overflow-hidden rounded" 
            style={{ background: 'rgba(0, 0, 0, 0.4)' }}
          >
            <svg
              viewBox="0 0 1000 100"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <filter id="ecgGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Gradient fade behind sweep */}
                <linearGradient id="ecgFadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
                  <stop offset="50%" stopColor="rgba(0,0,0,0.3)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </linearGradient>
                {/* Mask for sweep effect - white shows, black/transparent hides */}
                <mask id="ecgSweepMask">
                  <rect width="100%" height="100%" fill="white" />
                  {/* Fade area behind sweep */}
                  <rect 
                    x={Math.max(0, (sweepPosition.ecg / (containerWidthsRef.current.ecg || 600)) * 1000 - 80)} 
                    y="0" 
                    width="80" 
                    height="100" 
                    fill="url(#ecgFadeGradient)"
                  />
                </mask>
              </defs>
              {/* Full waveform - always visible */}
              <path
                d={ecgPath}
                fill="none"
                stroke="#00FF88"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ecgGlow)"
                mask="url(#ecgSweepMask)"
                style={{ 
                  filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.8)) drop-shadow(0 0 8px rgba(0, 255, 136, 0.4))'
                }}
              />
              {/* Sweep line - vertical band moving left to right */}
              <line
                x1={(sweepPosition.ecg / (containerWidthsRef.current.ecg || 600)) * 1000}
                y1="0"
                x2={(sweepPosition.ecg / (containerWidthsRef.current.ecg || 600)) * 1000}
                y2="100"
                stroke="#00FF88"
                strokeWidth="1.5"
                opacity="0.7"
                style={{ filter: 'drop-shadow(0 0 6px rgba(0, 255, 136, 0.9))' }}
              />
            </svg>
          </div>
        </div>

        {/* Middle Row: SpO₂, Blood Pressure, Temperature */}
        <div className="grid grid-cols-3 gap-4">
          {/* SpO₂ Panel */}
          <div className="relative overflow-hidden rounded-lg" style={{ 
            background: 'rgba(15, 20, 28, 0.6)',
            border: '1px solid rgba(78, 205, 196, 0.2)',
            padding: '14px',
            boxShadow: '0 0 15px rgba(78, 205, 196, 0.08), inset 0 0 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="text-xs font-semibold tracking-wider mb-2 uppercase" style={{ color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' }}>SpO₂</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span 
                className="font-sans text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#4ECDC4',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 8px rgba(78, 205, 196, 0.4)'
                }}
              >
                {spo2}
              </span>
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>%</span>
            </div>
            {/* Plethysmograph waveform - Cyan/Teal with Sweep */}
            <div 
              ref={plethContainerRef}
              data-pleth-container
              className="relative h-24 overflow-hidden rounded" 
              style={{ background: 'rgba(0, 0, 0, 0.4)' }}
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
                  <linearGradient id="plethFadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
                    <stop offset="50%" stopColor="rgba(0,0,0,0.3)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </linearGradient>
                  <mask id="plethSweepMask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect 
                      x={Math.max(0, (sweepPosition.pleth / (containerWidthsRef.current.pleth || 400)) * 800 - 60)} 
                      y="0" 
                      width="60" 
                      height="100" 
                      fill="url(#plethFadeGradient)"
                    />
                  </mask>
                </defs>
                {/* Full waveform - always visible */}
                <path
                  d={plethPath}
                  fill="none"
                  stroke="#00D9FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#plethGlow)"
                  mask="url(#plethSweepMask)"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0, 217, 255, 0.7)) drop-shadow(0 0 8px rgba(0, 217, 255, 0.3))' }}
                />
                {/* Sweep line */}
                <line
                  x1={(sweepPosition.pleth / (containerWidthsRef.current.pleth || 400)) * 800}
                  y1="0"
                  x2={(sweepPosition.pleth / (containerWidthsRef.current.pleth || 400)) * 800}
                  y2="100"
                  stroke="#00D9FF"
                  strokeWidth="1.5"
                  opacity="0.7"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(0, 217, 255, 0.9))' }}
                />
              </svg>
            </div>
          </div>

          {/* Blood Pressure Panel */}
          <div className="relative overflow-hidden rounded-lg" style={{ 
            background: 'rgba(15, 20, 28, 0.6)',
            border: '1px solid rgba(78, 205, 196, 0.2)',
            padding: '14px',
            boxShadow: '0 0 15px rgba(78, 205, 196, 0.08), inset 0 0 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="text-xs font-semibold tracking-wider mb-2 uppercase" style={{ color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' }}>Blood Pressure</div>
            <div className="flex items-baseline gap-2 mb-1">
              <span 
                className="font-sans text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#4ECDC4',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 8px rgba(78, 205, 196, 0.4)'
                }}
              >
                {systolic}
              </span>
              <span className="text-lg font-medium" style={{ color: '#9CA3AF' }}>/</span>
              <span 
                className="font-sans text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#4ECDC4',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 8px rgba(78, 205, 196, 0.4)'
                }}
              >
                {diastolic}
              </span>
            </div>
            <div className="text-xs font-medium" style={{ color: '#9CA3AF' }}>mmHg</div>
          </div>

          {/* Temperature Panel */}
          <div className="relative overflow-hidden rounded-lg" style={{ 
            background: 'rgba(15, 20, 28, 0.6)',
            border: '1px solid rgba(78, 205, 196, 0.2)',
            padding: '14px',
            boxShadow: '0 0 15px rgba(78, 205, 196, 0.08), inset 0 0 30px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🌡</span>
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' }}>Temperature</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span 
                className="font-sans text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#4ECDC4',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 8px rgba(78, 205, 196, 0.4)'
                }}
              >
                {temperature.toFixed(1)}
              </span>
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>°C</span>
            </div>
          </div>
        </div>

        {/* Respiration Panel - Bottom */}
        <div className="relative overflow-hidden rounded-lg" style={{ 
          background: 'rgba(15, 20, 28, 0.6)',
          border: '1px solid rgba(78, 205, 196, 0.2)',
          padding: '14px 18px',
          boxShadow: '0 0 20px rgba(78, 205, 196, 0.1), inset 0 0 40px rgba(0, 0, 0, 0.3)'
        }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' }}>Respiration</span>
              <span 
                className="font-sans text-2xl font-bold transition-all duration-200" 
                style={{ 
                  color: '#FFD700',
                  transform: `scale(${numberFlicker})`,
                  opacity: numberFlicker === 1 ? 1 : 0.98,
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.5)'
                }}
              >
                {respirationRate}
              </span>
              <span className="text-xs font-medium tracking-wider uppercase" style={{ color: '#9CA3AF' }}>RPM</span>
            </div>
          </div>
          
          {/* Respiration Waveform - Full Width - Yellow/Gold with Sweep */}
          <div 
            ref={respContainerRef}
            data-resp-container
            className="relative h-28 overflow-hidden rounded" 
            style={{ background: 'rgba(0, 0, 0, 0.4)' }}
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
                <linearGradient id="respFadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
                  <stop offset="50%" stopColor="rgba(0,0,0,0.3)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                </linearGradient>
                <mask id="respSweepMask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect 
                    x={Math.max(0, (sweepPosition.resp / (containerWidthsRef.current.resp || 600)) * 1000 - 80)} 
                    y="0" 
                    width="80" 
                    height="100" 
                    fill="url(#respFadeGradient)"
                  />
                </mask>
              </defs>
              {/* Full waveform - always visible */}
              <path
                d={respirationPath}
                fill="none"
                stroke="#FFD700"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#respirationGlow)"
                mask="url(#respSweepMask)"
                style={{ filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 8px rgba(255, 215, 0, 0.4))' }}
              />
              {/* Sweep line */}
              <line
                x1={(sweepPosition.resp / (containerWidthsRef.current.resp || 600)) * 1000}
                y1="0"
                x2={(sweepPosition.resp / (containerWidthsRef.current.resp || 600)) * 1000}
                y2="100"
                stroke="#FFD700"
                strokeWidth="1.5"
                opacity="0.7"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.9))' }}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const palette = {
  // Primary colors: lively blues, teal, vibrant accents
  brand: "#00B8D4", // Vibrant teal-blue
  brandBright: "#00D9FF", // Bright cyan
  navy: "#1E3A5F", // Deep navy
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

const sectionCard = "rounded-xl border bg-white";

export default function Page() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFFF', color: palette.navy, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <header className="border-b bg-white" style={{ borderColor: palette.border, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <img src="/MedQL_Modern_Clinical_Logo_White.png" alt="MyMedQL" className="h-32 w-auto" />
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex" style={{ color: palette.navy }}>
            <a href="#product" style={{ color: palette.navy }} className="hover:opacity-70 transition-opacity">Product</a>
            <a href="#how" style={{ color: palette.navy }} className="hover:opacity-70 transition-opacity">How It Works</a>
            <a href="#features" style={{ color: palette.navy }} className="hover:opacity-70 transition-opacity">Features</a>
            <a href="#demo" style={{ color: palette.navy }} className="hover:opacity-70 transition-opacity">Demo</a>
            <a href="#docs" style={{ color: palette.navy }} className="hover:opacity-70 transition-opacity">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/roles" className="rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all hover:bg-gray-50" style={{ color: palette.brand, borderColor: palette.brand }}>Get Started</Link>
            <button className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: palette.brand, boxShadow: `0 4px 12px ${palette.brand}40` }}>Start Demo</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="product" className="mx-auto max-w-7xl px-6 pt-20 pb-20">
          <div className="mb-8">
            <p className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6" style={{ backgroundColor: '#E0F7FA', color: palette.brand, border: `1px solid ${palette.brand}40` }}>
              Continuous monitoring · Clear alerts · Reliable records
            </p>
          </div>
          
          {/* Landscape Layout: Title and Dashboard side by side */}
          <div className="flex flex-col lg:flex-row gap-12 items-start mb-12">
            <div className="flex-1 lg:max-w-lg">
              <h1 className="text-4xl font-bold leading-tight mb-6" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                Real-time vital monitoring for safer patient care
              </h1>
              <p className="text-lg mb-8 leading-relaxed" style={{ color: '#37474F', lineHeight: '1.7' }}>
                MyMedQL continuously tracks patient vital signs and notifies healthcare staff when readings move outside safe ranges. Live dashboards and clear alerts help teams act quickly, while keeping a reliable record of patient data over time.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/roles" className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: palette.brand, boxShadow: `0 4px 12px ${palette.brand}40` }}>Get Started</Link>
                <button className="rounded-lg border px-6 py-3 text-sm font-semibold transition-all hover:bg-gray-50" style={{ color: palette.brand, borderColor: palette.brand, backgroundColor: palette.surface }}>Request a Demo</button>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-medium" style={{ color: palette.navy }}>
                {['Continuous Monitoring', 'Early Warning Alerts', 'Staff & Patient Access', 'Privacy-focused Design'].map((chip) => (
                  <span key={chip} className="rounded-lg px-3 py-1.5" style={{ backgroundColor: '#E0F7FA', border: `1px solid ${palette.brand}40`, color: palette.brand }}>{chip}</span>
                ))}
              </div>
            </div>
            
            {/* Dashboard - Landscape Mode */}
            <div className="flex-1 lg:flex-[1.5] w-full">
              <div className="rounded-2xl overflow-hidden" style={{ 
                background: '#0A0E14',
                border: '1px solid rgba(78, 205, 196, 0.2)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 40px rgba(78, 205, 196, 0.1)'
              }}>
                <div className="p-5" style={{ background: 'rgba(10, 14, 20, 0.8)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-base tracking-wide" style={{ color: '#4ECDC4', fontFamily: 'system-ui, sans-serif' }}>Patient Monitoring Dashboard</div>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'rgba(78, 205, 196, 0.15)', color: '#00FF88', border: '1px solid rgba(0, 255, 136, 0.3)' }}>● LIVE</span>
                  </div>
                  <MedicalMonitoringDashboard />
                </div>
                <div className="space-y-3 p-5" style={{ background: 'rgba(15, 20, 28, 0.6)', borderTop: '1px solid rgba(78, 205, 196, 0.15)' }}>
                <div className="flex items-center justify-between rounded-lg px-4 py-3 text-sm" style={{ 
                  background: 'rgba(15, 20, 28, 0.8)', 
                  border: '1px solid rgba(78, 205, 196, 0.2)',
                  boxShadow: '0 0 10px rgba(78, 205, 196, 0.05)'
                }}>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#00FF88', boxShadow: '0 0 6px rgba(0, 255, 136, 0.6)' }} />
                    <span className="font-semibold" style={{ color: '#E5E7EB', fontFamily: 'system-ui, sans-serif' }}>Patient 104</span>
                    <span className="text-xs font-mono" style={{ color: '#4ECDC4' }}>HR 96 · SpO₂ 97%</span>
                  </div>
                  <button className="text-xs font-semibold transition-colors px-3 py-1.5 rounded-md hover:bg-white/10" style={{ color: '#4ECDC4' }}>View</button>
                </div>
                <div className="flex items-center justify-between rounded-lg px-4 py-3 text-sm" style={{ 
                  background: 'rgba(15, 20, 28, 0.8)', 
                  border: '1px solid rgba(255, 107, 107, 0.4)',
                  boxShadow: '0 0 15px rgba(255, 107, 107, 0.2)'
                }}>
                  <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: '#FF6B6B', boxShadow: '0 0 8px rgba(255, 107, 107, 0.7)' }} />
                    <div className="flex flex-col">
                      <span className="font-semibold" style={{ color: '#FF6B6B', fontFamily: 'system-ui, sans-serif' }}>Alert · Tachycardia</span>
                      <span className="text-xs font-mono mt-0.5" style={{ color: '#9CA3AF' }}>HR 128 at 14:03</span>
                    </div>
                  </div>
                  <button 
                    className="rounded-lg px-5 py-2 text-xs font-semibold text-white transition-all hover:opacity-90" 
                    style={{ 
                      backgroundColor: '#FF6B6B',
                      boxShadow: '0 0 12px rgba(255, 107, 107, 0.4)'
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
        <section id="features" className="py-16" style={{ backgroundColor: '#E0F7FA' }}>
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold mb-10" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Why choose MyMedQL</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {valueProps.map((item) => (
                <div key={item.title} className={`${sectionCard} p-8`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                  <div className="mb-4 h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}></div>
                  <h3 className="text-lg font-semibold mb-3" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-4" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>How it works</h2>
              <p className="text-base leading-relaxed" style={{ color: '#37474F', lineHeight: '1.7' }}>
                MyMedQL continuously collects vital signs, checks them against safe ranges, and displays updates and alerts in real time.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorks.map((item, idx) => (
                <div key={item.title} className={`${sectionCard} p-6`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                  <div className="mb-3 flex items-center gap-3 text-sm font-semibold" style={{ color: palette.brand }}>
                    <span className="h-8 w-8 rounded-full text-center leading-8 flex items-center justify-center" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>{idx + 1}</span>
                    {item.title}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6' }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases and scenarios */}
        <section id="demo" className="py-16" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold mb-6" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Use cases</h3>
                <div className="space-y-3">
                  {useCases.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg border bg-white px-5 py-4" style={{ borderColor: palette.brand + '40', boxShadow: `0 2px 8px ${palette.brand}15` }}>
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: palette.success }} />
                      <span className="text-sm font-semibold" style={{ color: palette.navy }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Example patient monitoring timeline</h3>
                <div className="rounded-xl border p-8" style={{ background: '#E0F7FA', borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                  <div className="flex items-center justify-between text-xs font-semibold mb-4" style={{ color: palette.navy }}>
                    <span>Time</span>
                    <span>Alerts</span>
                  </div>
                  <div className="h-2 rounded-full mb-6" style={{ backgroundColor: palette.border }}>
                    <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: palette.success }} />
                  </div>
                  <div className="space-y-4 text-sm mb-6" style={{ color: '#37474F' }}>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.success }} />
                      Normal vital signs are monitored continuously
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.danger }} />
                      An abnormal heart rate triggers an alert for staff
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.brand }} />
                      Vitals return to normal and the alert is resolved
                    </div>
                  </div>
                  <button className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: palette.brand, boxShadow: `0 4px 12px ${palette.brand}40` }}>Run Scenario</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data & Security */}
        <section id="docs" className="mx-auto max-w-6xl px-6 py-16">
          <div className={`${sectionCard} p-8`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
            <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold mb-3" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Data & Security</h3>
                <p className="text-base leading-relaxed" style={{ color: '#37474F', lineHeight: '1.7' }}>
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
                  <span key={item} className="rounded-lg px-4 py-3 font-medium" style={{ backgroundColor: '#E0F7FA', border: `1px solid ${palette.brand}40`, color: palette.brand }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="py-16" style={{ backgroundColor: '#E0F7FA' }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold mb-4" style={{ backgroundColor: palette.brand + '20', color: palette.brand, border: `1px solid ${palette.brand}40` }}>Built by students. Designed for care.</span>
              <h2 className="text-3xl font-bold" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>About Us</h2>
            </div>

            {/* Vision and Mission Cards */}
            <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                <div className="mb-4">
                  <span className="block text-2xl" role="img" aria-label="goal">🎯</span>
                </div>
                <h3 className="mb-3 font-bold text-lg" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Our Goal</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6' }}>
                  MyMedQL is a student-built healthcare project created with one clear goal: to make patient monitoring clearer, safer, and more accessible for both patients and healthcare staff.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                <div className="mb-4">
                  <span className="block text-2xl" role="img" aria-label="philosophy">💡</span>
                </div>
                <h3 className="mb-3 font-bold text-lg" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Philosophy</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6' }}>
                  We believe technology should support care—not complicate it. That's why MyMedQL focuses on presenting vital health information in a simple, understandable way, helping staff respond quickly.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                <div className="mb-4">
                  <span className="block text-2xl" role="img" aria-label="team">🤝</span>
                </div>
                <h3 className="mb-3 font-bold text-lg" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>The Team</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6' }}>
                  This project was developed by a small, multidisciplinary team of students interested in healthcare, technology, and social impact. Each member contributed to shaping MyMedQL into a meaningful application.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                <div className="mb-4">
                  <span className="block text-2xl" role="img" aria-label="design">✨</span>
                </div>
                <h3 className="mb-3 font-bold text-lg" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Our Design</h3>
                <p className="text-sm italic leading-relaxed" style={{ color: palette.brand, lineHeight: '1.6' }}>
                  "Together, we designed MyMedQL as a practical learning project and a concept system that demonstrates how thoughtful software design can support patient care and clinical decision-making."
                </p>
              </div>
            </div>

            {/* Team Marquee */}
            <div className="overflow-hidden">
              <h3 className="mb-8 text-center text-2xl font-bold" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Meet the Team behind MyMedQL</h3>
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
                    <div key={idx} className={`${sectionCard} w-64 flex-shrink-0 p-6 transition hover:shadow-lg`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                      <div className="h-12 w-12 rounded-full mb-4 flex items-center justify-center text-base font-bold" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>
                        {member.name.charAt(0)}
                      </div>
                      <div className="font-bold truncate mb-1" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>{member.name}</div>
                      <div className="text-xs font-semibold" style={{ color: palette.brand }}>{member.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="mx-auto max-w-6xl px-6">
            <h3 className="text-2xl font-bold mb-8" style={{ color: palette.navy, fontFamily: 'system-ui, -apple-system, sans-serif' }}>FAQ</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <div key={item.q} className={`${sectionCard} p-6`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20` }}>
                  <div className="text-sm font-semibold mb-2" style={{ color: palette.brand }}>{item.q}</div>
                  <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6' }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-xl px-8 py-12 text-white" style={{ backgroundColor: palette.brand, boxShadow: `0 8px 24px ${palette.brand}50` }}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>Spin it up in minutes.</h3>
                <p className="text-base" style={{ color: '#B2EBF2' }}>
                  Start a complete demo environment in minutes with everything preconfigured.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg bg-white px-6 py-3 text-sm font-semibold transition-all hover:opacity-90" style={{ color: palette.brand }}>Run with Docker</button>
                <Link href="/roles" className="rounded-lg border px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10" style={{ borderColor: "#FFFFFF" }}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main >

      <footer className="border-t bg-white" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between" style={{ color: palette.navy }}>
          <div className="font-medium">MyMedQL · Real-time patient vital monitoring</div>
          <div className="flex flex-wrap gap-6">
            <a href="#docs" className="hover:opacity-70 transition-opacity" style={{ color: palette.navy }}>Docs</a>
            <a href="#demo" className="hover:opacity-70 transition-opacity" style={{ color: palette.navy }}>Demo</a>
            <a href="#features" className="hover:opacity-70 transition-opacity" style={{ color: palette.navy }}>Features</a>
            <a href="#how" className="hover:opacity-70 transition-opacity" style={{ color: palette.navy }}>How it works</a>
          </div>
        </div>
      </footer>
    </div >
  );
}
