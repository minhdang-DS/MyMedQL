"use client";
import { useState, useEffect, useRef, useCallback, useMemo, memo, lazy, Suspense } from "react";
import Link from "next/link";

// Custom hook for scroll animations - optimized
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    // Only create observer once
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { 
            setIsVisible(true);
            // Unobserve after animation triggers to prevent re-triggering
            if (observerRef.current && ref.current) {
              observerRef.current.unobserve(ref.current);
            }
          }
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px'
        }
      );
    }

    const currentRef = ref.current;
    const currentObserver = observerRef.current;

    if (currentRef && currentObserver) {
      currentObserver.observe(currentRef);
    }

    return () => {
      if (currentRef && currentObserver) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, []);

  return [ref, isVisible];
}

// Animated Section Component - memoized for performance
const AnimatedSection = memo(function AnimatedSection({ children, className = "", delay = 0 }) {
  const [ref, isVisible] = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`
      }}
    >
      {children}
    </div>
  );
});

// Clean, Professional Medical Patient Monitoring Dashboard
// Memoized to prevent unnecessary re-renders
const MedicalMonitoringDashboard = memo(function MedicalMonitoringDashboard() {
  const [heartRate, setHeartRate] = useState(88);
  const [respirationRate, setRespirationRate] = useState(18);
  const [ecgPath, setEcgPath] = useState('');
  const [respirationPath, setRespirationPath] = useState('');
  const [sweepPosition, setSweepPosition] = useState({ ecg: 0, resp: 0 });
  const [numberFlicker, setNumberFlicker] = useState(1);
  
  // Use refs to avoid DOM queries on every frame
  const ecgContainerRef = useRef(null);
  const respContainerRef = useRef(null);
  const containerWidthsRef = useRef({ ecg: 600, resp: 600 });
  const sweepPositionsRef = useRef({ ecg: 0, resp: 0 });
  const lastRegenPositionsRef = useRef({ ecg: 0, resp: 0 });

  // Generate full-width ECG waveform - always visible across entire panel
  // Memoized with useCallback to prevent recreation on every render
  const generateContinuousEcgPath = useCallback(() => {
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
    
    // Ensure path extends to full width
    if (currentX < endX) {
      path += ` L${endX},${baseY}`;
    }
    
    return path;
  }, []);

  // Generate full-width respiration waveform - always visible across entire panel
  // Memoized with useCallback to prevent recreation on every render
  const generateContinuousRespirationPath = useCallback(() => {
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
  }, []);

  // Helper function to update vital signs
  // Updates heart rate and respiration rate with realistic random variations
  const updateVitalSigns = useCallback(() => {
    setHeartRate(prev => {
      const change = Math.floor(Math.random() * 5) - 2;
      return Math.max(72, Math.min(108, prev + change));
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
    if (respContainerRef.current) {
      containerWidthsRef.current.resp = respContainerRef.current.offsetWidth || 600;
    }
  }, []);

  useEffect(() => {
    // Generate paths immediately - don't wait for DOM
    const baseEcgPath = generateContinuousEcgPath();
    const baseRespirationPath = generateContinuousRespirationPath();
    
    setEcgPath(baseEcgPath);
    setRespirationPath(baseRespirationPath);
    
    // Initialize container widths after a brief delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      updateContainerWidths();
    }, 0);
    
    // Update on resize (debounced) - increased debounce time for better performance
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updateContainerWidths();
        // Regenerate paths on resize (using fixed viewBox widths)
        setEcgPath(generateContinuousEcgPath());
        setRespirationPath(generateContinuousRespirationPath());
      }, 250); // Increased from 150ms to 250ms
    };
    
    window.addEventListener('resize', handleResize, { passive: true });

    // Sweep animation - moving erase spot from left to right
    const sweepSpeed = 100; // pixels per second (adjust for sweep speed)
    const regenInterval = 100; // Increased from 80 to reduce regeneration frequency
    let lastTime = Date.now();
    let animationFrameId = null;
    let isRunning = true;
    let frameCount = 0; // Batch state updates
    
    const animationFrame = () => {
      if (!isRunning) return;
      
      frameCount++;
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // seconds
      lastTime = now;
      
      const pixelsToMove = sweepSpeed * deltaTime;
      const widths = containerWidthsRef.current;
      
      // Update sweep positions (moving left to right)
      sweepPositionsRef.current.ecg += pixelsToMove;
      sweepPositionsRef.current.resp += pixelsToMove * 0.9;
      
      // Regenerate waveforms continuously as sweep moves (not just on reset)
      // ECG: regenerate every regenInterval pixels
      if (sweepPositionsRef.current.ecg - lastRegenPositionsRef.current.ecg >= regenInterval) {
        setEcgPath(generateContinuousEcgPath());
        lastRegenPositionsRef.current.ecg = sweepPositionsRef.current.ecg;
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
      if (sweepPositionsRef.current.resp > widths.resp) {
        sweepPositionsRef.current.resp = 0;
        lastRegenPositionsRef.current.resp = 0;
        setRespirationPath(generateContinuousRespirationPath());
        // Update vital signs when sweep resets
        updateVitalSigns();
      }
      
      // Batch state updates - only update every 2 frames to reduce re-renders
      if (frameCount % 2 === 0) {
        setSweepPosition({
          ecg: sweepPositionsRef.current.ecg,
          resp: sweepPositionsRef.current.resp
        });
      }
      
      animationFrameId = requestAnimationFrame(animationFrame);
    };

    animationFrameId = requestAnimationFrame(animationFrame);

    // Update vital signs continuously (realistic variation) - increased interval
    const vitalSignsInterval = setInterval(() => {
      updateVitalSigns();
    }, 3000); // Increased from 2500ms to 3000ms

    // Subtle flicker animation for numbers - increased interval
    const flickerInterval = setInterval(() => {
      setNumberFlicker(prev => prev === 1 ? 1.02 : 1);
    }, 400); // Increased from 300ms to 400ms

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
  }, [updateContainerWidths, updateVitalSigns, generateContinuousEcgPath, generateContinuousRespirationPath]);

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

      <div className="relative p-6 space-y-6">
        {/* Two Column Layout: BPM and Respiration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Heart Rate (BPM) Panel */}
          <div className="relative overflow-hidden rounded-xl" style={{ 
            background: 'rgba(15, 20, 28, 0.7)',
            border: '1px solid rgba(78, 205, 196, 0.25)',
            padding: '20px',
            boxShadow: '0 0 25px rgba(78, 205, 196, 0.15), inset 0 0 50px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl" style={{ color: getHRColor(heartRate) }}>♥</span>
              <div className="flex items-baseline gap-2">
                <span 
                  className="font-sans text-4xl font-bold transition-all duration-200" 
                  style={{ 
                    color: getHRColor(heartRate),
                    transform: `scale(${numberFlicker})`,
                    opacity: numberFlicker === 1 ? 1 : 0.98,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '-0.02em',
                    textShadow: `0 0 12px ${getHRColor(heartRate)}50`
                  }}
                >
                  {heartRate}
                </span>
                <span className="text-sm font-semibold tracking-wider uppercase ml-1" style={{ color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' }}>BPM</span>
              </div>
            </div>
            
            {/* ECG Waveform - Full Width - Bright Green with Sweep */}
            <div 
              ref={ecgContainerRef}
              data-ecg-container
              className="relative h-36 overflow-hidden rounded-lg" 
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
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
                {ecgPath && (
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
                )}
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

          {/* Respiration Panel */}
          <div className="relative overflow-hidden rounded-xl" style={{ 
            background: 'rgba(15, 20, 28, 0.7)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            padding: '20px',
            boxShadow: '0 0 25px rgba(255, 215, 0, 0.15), inset 0 0 50px rgba(0, 0, 0, 0.3)'
          }}>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-2xl" style={{ color: '#FFD700' }}>🫁</span>
              <div className="flex items-baseline gap-2">
                <span 
                  className="font-sans text-4xl font-bold transition-all duration-200" 
                  style={{ 
                    color: '#FFD700',
                    transform: `scale(${numberFlicker})`,
                    opacity: numberFlicker === 1 ? 1 : 0.98,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    letterSpacing: '-0.02em',
                    textShadow: '0 0 12px rgba(255, 215, 0, 0.5)'
                  }}
                >
                  {respirationRate}
                </span>
                <span className="text-sm font-semibold tracking-wider uppercase ml-1" style={{ color: '#9CA3AF', fontFamily: 'system-ui, sans-serif' }}>RPM</span>
              </div>
            </div>
            
            {/* Respiration Waveform - Full Width - Yellow/Gold with Sweep */}
            <div 
              ref={respContainerRef}
              data-resp-container
              className="relative h-36 overflow-hidden rounded-lg" 
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
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
                {respirationPath && (
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
                )}
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
    </div>
  );
});

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
    icon: '🛡️',
    title: 'Reliable monitoring you can trust',
    body: 'Patient data is recorded consistently and accurately, so alerts and vital trends can be reviewed with confidence at any time.'
  },
  {
    icon: '🔔',
    title: 'Flexible alerts for each patient',
    body: 'Set safe ranges for vital signs globally or per patient, with clear alerts that staff can acknowledge and follow up on.'
  },
  {
    icon: '🎓',
    title: 'Designed for training and demonstration',
    body: 'Supports realistic monitoring scenarios to help teams understand alert behavior and system responses.'
  }
];

const howItWorks = [
  { title: 'Collect vital signs', body: 'Monitoring devices regularly send patient vital signs to the system.' },
  { title: 'Detect potential issues', body: 'Vital signs are automatically checked against safe ranges, and alerts are created when values become abnormal.' },
  { title: 'View updates in real time', body: 'Live dashboards show current vital signs and alerts so staff can respond quickly.' }
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

const sectionCard = "rounded-xl border";

export default function Page() {
  return (
    <div 
      className="min-h-screen relative" 
      style={{ 
        backgroundColor: '#FFFFFF', 
        color: palette.navy, 
        fontFamily: '"Inter", sans-serif',
        backgroundImage: 'url(/background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        willChange: 'auto' // Optimize for rendering performance
      }}
    >
      {/* Overlay to make background faint */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.65)' // Adjust opacity here (0.65 = 35% visible, lower = more visible)
        }}
      />
      
      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
      <header className="border-b" style={{ backgroundColor: 'transparent', borderColor: 'transparent', boxShadow: 'none' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <img src="/MedQL_Modern_Clinical_Logo_White.png" alt="MyMedQL" className="h-40 w-auto" />
          <nav className="hidden items-center gap-8 text-base font-medium md:flex" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', lineHeight: '1.5' }}>
            <a href="#product" style={{ color: palette.navy }} className="relative transition-all duration-300 hover:opacity-80 hover:scale-105 hover:underline hover:underline-offset-4">Product</a>
            <a href="#how" style={{ color: palette.navy }} className="relative transition-all duration-300 hover:opacity-80 hover:scale-105 hover:underline hover:underline-offset-4">How It Works</a>
            <a href="#features" style={{ color: palette.navy }} className="relative transition-all duration-300 hover:opacity-80 hover:scale-105 hover:underline hover:underline-offset-4">Features</a>
            <a href="#demo" style={{ color: palette.navy }} className="relative transition-all duration-300 hover:opacity-80 hover:scale-105 hover:underline hover:underline-offset-4">Demo</a>
            <a href="#docs" style={{ color: palette.navy }} className="relative transition-all duration-300 hover:opacity-80 hover:scale-105 hover:underline hover:underline-offset-4">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/roles" className="rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-md" style={{ color: palette.brand, borderColor: palette.brand, fontFamily: '"Inter", sans-serif' }}>Get Started</Link>
            <button className="rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:opacity-90 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: palette.brand, color: '#000000', boxShadow: `0 4px 12px ${palette.brand}40`, fontFamily: '"Inter", sans-serif' }}>Start Demo</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="product" className="mx-auto max-w-7xl px-6 pt-12 pb-24 relative">
          <div className="absolute inset-0 opacity-5" style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(0, 184, 212, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(30, 58, 95, 0.2) 0%, transparent 50%)'
          }}></div>
          <AnimatedSection delay={0.1}>
            <div className="mb-8">
              <p className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6" style={{ backgroundColor: 'rgba(224, 247, 250, 0.85)', color: palette.brand, border: `1px solid ${palette.brand}40` }}>
                Continuous monitoring · Clear alerts · Reliable records
              </p>
            </div>
          </AnimatedSection>
          
          {/* Vertical Layout: Title above Dashboard */}
          <div className="mb-12">
            <AnimatedSection delay={0.2}>
              <div className="w-full mb-12">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ 
                  color: '#0A2540', 
                  fontFamily: '"Inter", sans-serif', 
                  letterSpacing: '-0.03em', 
                  lineHeight: '1.1', 
                  fontWeight: 800,
                  textShadow: '0 2px 20px rgba(10, 37, 64, 0.1)',
                  background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Real-time Vital Monitoring for Patient Care
                </h1>
                <p className="text-lg mb-8 leading-relaxed max-w-4xl" style={{ color: '#37474F', lineHeight: '1.7', fontFamily: '"Inter", sans-serif' }}>
                  MyMedQL continuously tracks patient vital signs and notifies healthcare staff when readings move outside safe ranges. Live dashboards and clear alerts help teams act quickly, while keeping a reliable record of patient data over time.
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  <Link href="/roles" className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-105 hover:shadow-lg" style={{ backgroundColor: palette.brand, boxShadow: `0 4px 12px ${palette.brand}40` }}>Get Started</Link>
                  <button className="rounded-lg border px-6 py-3 text-sm font-semibold transition-all duration-300 hover:bg-gray-50 hover:scale-105 hover:shadow-md" style={{ color: palette.brand, borderColor: palette.brand, backgroundColor: palette.surface }}>Request a Demo</button>
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-medium" style={{ color: palette.navy }}>
                  {['Continuous Monitoring', 'Early Warning Alerts', 'Staff & Patient Access', 'Privacy-focused Design'].map((chip, idx) => (
                    <AnimatedSection key={chip} delay={0.3 + idx * 0.05}>
                      <span className="rounded-lg px-3 py-1.5 transition-all duration-300 cursor-pointer hover:scale-110 hover:shadow-md" style={{ backgroundColor: 'rgba(224, 247, 250, 0.85)', border: `1px solid ${palette.brand}40`, color: palette.brand }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(224, 247, 250, 1)'; e.currentTarget.style.borderColor = palette.brand; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(224, 247, 250, 0.85)'; e.currentTarget.style.borderColor = palette.brand + '40'; }}>{chip}</span>
                    </AnimatedSection>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Statistics Section */}
        <AnimatedSection>
          <section className="mx-auto max-w-7xl px-6 -mt-8 pb-16">
            <div className="relative">
              {/* Glassmorphism statistics panel with blue border */}
              <div 
                className="rounded-2xl p-8 md:p-12 backdrop-blur-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '2px solid rgba(0, 184, 212, 0.5)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                  {/* Number of Staff */}
                  <div className="text-center">
                    <div 
                      className="text-5xl md:text-6xl font-bold mb-2"
                      style={{ 
                        color: '#FFFFFF',
                        fontFamily: '"Inter", sans-serif',
                        WebkitTextStroke: '0.5px #00B8D4',
                        textStroke: '0.5px #00B8D4',
                        textShadow: '-0.5px -0.5px 0 #00B8D4, 0.5px -0.5px 0 #00B8D4, -0.5px 0.5px 0 #00B8D4, 0.5px 0.5px 0 #00B8D4, 0 2px 10px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      50+
                    </div>
                    <div 
                      className="text-sm md:text-base font-medium"
                      style={{ 
                        color: '#00B8D4',
                        fontFamily: '"Inter", sans-serif',
                        textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      healthcare staff members
                    </div>
                  </div>

                  {/* Number of Patients */}
                  <div className="text-center">
                    <div 
                      className="text-5xl md:text-6xl font-bold mb-2"
                      style={{ 
                        color: '#FFFFFF',
                        fontFamily: '"Inter", sans-serif',
                        WebkitTextStroke: '0.5px #00B8D4',
                        textStroke: '0.5px #00B8D4',
                        textShadow: '-0.5px -0.5px 0 #00B8D4, 0.5px -0.5px 0 #00B8D4, -0.5px 0.5px 0 #00B8D4, 0.5px 0.5px 0 #00B8D4, 0 2px 10px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      10,000+
                    </div>
                    <div 
                      className="text-sm md:text-base font-medium"
                      style={{ 
                        color: '#00B8D4',
                        fontFamily: '"Inter", sans-serif',
                        textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      patients monitored
                    </div>
                  </div>

                  {/* Patient Satisfaction Rating */}
                  <div className="text-center">
                    <div 
                      className="text-5xl md:text-6xl font-bold mb-2"
                      style={{ 
                        color: '#FFFFFF',
                        fontFamily: '"Inter", sans-serif',
                        WebkitTextStroke: '0.5px #00B8D4',
                        textStroke: '0.5px #00B8D4',
                        textShadow: '-0.5px -0.5px 0 #00B8D4, 0.5px -0.5px 0 #00B8D4, -0.5px 0.5px 0 #00B8D4, 0.5px 0.5px 0 #00B8D4, 0 2px 10px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      95%
                    </div>
                    <div 
                      className="text-sm md:text-base font-medium"
                      style={{ 
                        color: '#00B8D4',
                        fontFamily: '"Inter", sans-serif',
                        textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      patient satisfaction rating
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="text-center">
                    <div 
                      className="text-5xl md:text-6xl font-bold mb-2"
                      style={{ 
                        color: '#FFFFFF',
                        fontFamily: '"Inter", sans-serif',
                        WebkitTextStroke: '0.5px #00B8D4',
                        textStroke: '0.5px #00B8D4',
                        textShadow: '-0.5px -0.5px 0 #00B8D4, 0.5px -0.5px 0 #00B8D4, -0.5px 0.5px 0 #00B8D4, 0.5px 0.5px 0 #00B8D4, 0 2px 10px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      &lt;2s
                    </div>
                    <div 
                      className="text-sm md:text-base font-medium"
                      style={{ 
                        color: '#00B8D4',
                        fontFamily: '"Inter", sans-serif',
                        textShadow: '0 1px 5px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      average response time
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Value Props */}
        <AnimatedSection>
          <section id="features" className="py-20" style={{ 
            background: 'linear-gradient(135deg, rgba(224, 247, 250, 0.9) 0%, rgba(178, 235, 242, 0.7) 100%)',
            position: 'relative'
          }}>
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-4xl font-bold mb-10 text-center" style={{ 
                color: '#0A2540', 
                fontFamily: '"Inter", sans-serif', 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>Why choose MyMedQL</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {valueProps.map((item, idx) => (
                  <AnimatedSection key={item.title} delay={idx * 0.1}>
                    <div className={`${sectionCard} p-8 h-64 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; }}>
                      <div className="mb-4 h-12 w-12 rounded-lg flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>
                        {item.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-3 transition-colors duration-300" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>{item.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6', fontFamily: '"Inter", sans-serif' }}>{item.body}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* How it works */}
        <AnimatedSection>
          <section id="how" className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
              <AnimatedSection delay={0.1}>
                <div className="max-w-xl">
                  <h2 className="text-4xl font-bold mb-4" style={{ 
                    color: '#0A2540', 
                    fontFamily: '"Inter", sans-serif', 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>How it works</h2>
                  <p className="text-base leading-relaxed" style={{ color: '#37474F', lineHeight: '1.7' }}>
                    MyMedQL continuously collects vital signs, checks them against safe ranges, and displays updates and alerts in real time.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid gap-4 md:grid-cols-3">
                {howItWorks.map((item, idx) => (
                  <AnimatedSection key={item.title} delay={0.2 + idx * 0.1}>
                    <div className={`${sectionCard} p-6 h-48 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; }}>
                      <div className="mb-3 flex items-center gap-3 text-sm font-semibold transition-colors duration-300" style={{ color: palette.brand, fontFamily: '"Inter", sans-serif' }}>
                        <span className="h-8 w-8 rounded-full text-center leading-8 flex items-center justify-center transition-transform duration-300 hover:scale-110" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>{idx + 1}</span>
                        {item.title}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6', fontFamily: '"Inter", sans-serif' }}>{item.body}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Data & Security */}
        <AnimatedSection>
          <section id="demo" className="py-20" style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)',
            position: 'relative'
          }}>
            <div className="mx-auto max-w-6xl px-6">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: palette.brand + '20' }}>
                  <span className="text-4xl">🔒</span>
                </div>
                <h3 className="text-4xl font-bold mb-4 text-center" style={{ 
                  color: '#0A2540', 
                  fontFamily: '"Inter", sans-serif', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Data & Security</h3>
                <p className="text-base leading-relaxed max-w-3xl mx-auto" style={{ color: '#37474F', lineHeight: '1.7', fontFamily: '"Inter", sans-serif' }}>
                  Patient data is protected with strong security measures and access controls. Only authorized users can view sensitive information, and all activity is recorded responsibly.
                </p>
              </div>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { icon: "🔐", title: "Encrypted patient data", description: "All data is encrypted at rest and in transit" },
                  { icon: "👥", title: "Role-based access", description: "Granular permissions for different user roles" },
                  { icon: "🔑", title: "Secure login and authentication", description: "Multi-factor authentication support" },
                  { icon: "📋", title: "Audit-friendly records", description: "Complete activity logs for compliance" },
                  { icon: "🛡️", title: "Privacy-focused design", description: "Built with patient privacy as a priority" },
                  { icon: "✅", title: "Authorized staff access only", description: "Strict access controls and monitoring" }
                ].map((item, idx) => (
                  <AnimatedSection key={item.title} delay={0.1 + idx * 0.05}>
                    <div className={`${sectionCard} p-6 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)', background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 247, 250, 0.3) 100%)` }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; e.currentTarget.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(224, 247, 250, 0.5) 100%)`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; e.currentTarget.style.background = `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 247, 250, 0.3) 100%)`; }}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: palette.brand + '20' }}>
                          {item.icon}
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-base font-semibold mb-2 transition-colors duration-300" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>{item.title}</h4>
                          <p className="text-xs leading-relaxed transition-colors duration-300" style={{ color: '#6B7280', lineHeight: '1.5', fontFamily: '"Inter", sans-serif' }}>{item.description}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* About Us */}
        <AnimatedSection>
          <section id="about" className="py-20" style={{ 
            background: 'linear-gradient(135deg, rgba(224, 247, 250, 0.9) 0%, rgba(178, 235, 242, 0.7) 100%)',
            position: 'relative'
          }}>
            <div className="mx-auto max-w-6xl px-6">
              <AnimatedSection delay={0.1}>
                <div className="mb-12 text-center">
                  <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold mb-4" style={{ backgroundColor: 'rgba(0, 184, 212, 0.2)', color: palette.brand, border: `1px solid ${palette.brand}40` }}>Built by students. Designed for care.</span>
                  <h2 className="text-4xl font-bold" style={{ 
                    color: '#0A2540', 
                    fontFamily: '"Inter", sans-serif', 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>About Us</h2>
                </div>
              </AnimatedSection>

              {/* Vision and Mission Cards */}
              <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: "🎯", title: "Our Goal", text: "MyMedQL is a student-built healthcare project created with one clear goal: to make patient monitoring clearer, safer, and more accessible for both patients and healthcare staff.", ariaLabel: "goal" },
                  { icon: "💡", title: "Philosophy", text: "We believe technology should support care—not complicate it. That's why MyMedQL focuses on presenting vital health information in a simple, understandable way, helping staff respond quickly.", ariaLabel: "philosophy" },
                  { icon: "🤝", title: "The Team", text: "This project was developed by a small, multidisciplinary team of students interested in healthcare, technology, and social impact. Each member contributed to shaping MyMedQL into a meaningful application.", ariaLabel: "team" },
                  { icon: "✨", title: "Our Design", text: '"Together, we designed MyMedQL as a practical learning project and a concept system that demonstrates how thoughtful software design can support patient care and clinical decision-making."', ariaLabel: "design", italic: true }
                ].map((card, idx) => (
                  <AnimatedSection key={card.title} delay={0.2 + idx * 0.1}>
                    <div className={`${sectionCard} p-6 min-h-80 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; }}>
                      <div className="mb-4 transition-transform duration-300">
                        <span className="block text-2xl" role="img" aria-label={card.ariaLabel}>{card.icon}</span>
                      </div>
                      <h3 className="mb-3 font-bold text-lg transition-colors duration-300" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', fontWeight: 700 }}>{card.title}</h3>
                      <p className={`text-sm leading-relaxed ${card.italic ? 'italic' : ''}`} style={{ color: card.italic ? palette.brand : '#37474F', lineHeight: '1.6', fontFamily: '"Inter", sans-serif' }}>
                        {card.text}
                      </p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>

            {/* Team Marquee */}
            <div className="overflow-hidden">
              <h3 className="mb-8 text-center text-2xl font-bold" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', fontWeight: 700 }}>Meet the Team behind MyMedQL</h3>
              <div className="relative w-full mask-gradient">
                <div className="flex w-max gap-6 hover:pause-on-hover animate-scroll">
                  {[
                    { name: "Cao Pham Minh Dang", role: "Database Engineer", image: "/Cao_Pham_Minh_Dang.jpg" },
                    { name: "Ngo Dinh Khanh", role: "Backend Developer", image: "/Ngo_Dinh_Khanh.jpg" },
                    { name: "Pham Dinh Hieu", role: "Backend Developer", image: "/Pham_Dinh_Hieu.jpg" },
                    { name: "Nguyen Anh Duc", role: "Frontend Developer", image: "/Nguyen_Anh_Duc.jpg" },
                    // Duplicate for seamless loop
                    { name: "Cao Pham Minh Dang", role: "Database Engineer", image: "/Cao_Pham_Minh_Dang.jpg" },
                    { name: "Ngo Dinh Khanh", role: "Backend Developer", image: "/Ngo_Dinh_Khanh.jpg" },
                    { name: "Pham Dinh Hieu", role: "Backend Developer", image: "/Pham_Dinh_Hieu.jpg" },
                    { name: "Nguyen Anh Duc", role: "Frontend Developer", image: "/Nguyen_Anh_Duc.jpg" }
                  ].map((member, idx) => (
                    <div key={idx} className={`${sectionCard} w-80 h-64 flex-shrink-0 p-6 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl flex flex-col items-center`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; }}>
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="h-32 w-32 rounded-full mb-4 object-cover transition-transform duration-300 hover:scale-110"
                        style={{ border: `3px solid ${palette.brand}40`, boxShadow: `0 4px 12px ${palette.brand}20` }}
                      />
                      <div className="font-bold truncate mb-1 transition-colors duration-300 text-center w-full" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>{member.name}</div>
                      <div className="text-xs font-semibold transition-colors duration-300 text-center" style={{ color: palette.brand }}>{member.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        </AnimatedSection>

        {/* FAQ */}
        <AnimatedSection>
          <section className="py-20" style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 248, 255, 0.9) 100%)',
            position: 'relative'
          }}>
            <div className="mx-auto max-w-6xl px-6">
              <AnimatedSection delay={0.1}>
                <h3 className="text-4xl font-bold mb-8 text-center" style={{ 
                  color: '#0A2540', 
                  fontFamily: '"Inter", sans-serif', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>FAQ</h3>
              </AnimatedSection>
              <div className="grid gap-4 md:grid-cols-2">
                {faq.map((item, idx) => (
                  <AnimatedSection key={item.q} delay={0.2 + idx * 0.1}>
                    <div className={`${sectionCard} p-6 h-40 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; }}>
                      <div className="text-sm font-semibold mb-2 transition-colors duration-300" style={{ color: palette.brand, fontFamily: '"Inter", sans-serif' }}>{item.q}</div>
                      <p className="text-sm leading-relaxed" style={{ color: '#37474F', lineHeight: '1.6', fontFamily: '"Inter", sans-serif' }}>{item.a}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Contact Section */}
        <AnimatedSection>
          <section id="contact" className="py-20" style={{ 
            background: 'linear-gradient(135deg, rgba(224, 247, 250, 0.9) 0%, rgba(178, 235, 242, 0.7) 100%)',
            position: 'relative'
          }}>
            <div className="mx-auto max-w-4xl px-6">
              <AnimatedSection delay={0.1}>
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 text-center" style={{ 
                    color: '#0A2540', 
                    fontFamily: '"Inter", sans-serif', 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Get in Touch</h2>
                  <p className="text-base leading-relaxed" style={{ color: '#37474F', lineHeight: '1.7', fontFamily: '"Inter", sans-serif' }}>
                    Have questions or want to learn more about MyMedQL? We'd love to hear from you.
                  </p>
                </div>
              </AnimatedSection>
              <div className="grid gap-8 md:grid-cols-2">
                <AnimatedSection delay={0.2}>
                  <div className={`${sectionCard} p-8 h-64 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; }}>
                    <div className="mb-4 transition-transform duration-300">
                      <span className="text-3xl inline-block" role="img" aria-label="email">📧</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 transition-colors duration-300" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>Email Us</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#37474F', lineHeight: '1.6', fontFamily: '"Inter", sans-serif' }}>
                      Send us an email and we'll get back to you as soon as possible.
                    </p>
                    <a href="mailto:contact@mymedql.com" className="text-sm font-medium transition-all duration-300 hover:underline hover:opacity-80" style={{ color: palette.brand, fontFamily: '"Inter", sans-serif' }}>
                      contact@mymedql.com
                    </a>
                  </div>
                </AnimatedSection>
                <AnimatedSection delay={0.3}>
                  <div className={`${sectionCard} p-8 h-64 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl`} style={{ borderColor: palette.brand + '40', boxShadow: `0 4px 12px ${palette.brand}20`, backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.brand; e.currentTarget.style.boxShadow = `0 8px 24px ${palette.brand}40`; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.brand + '40'; e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`; }}>
                    <div className="mb-4 transition-transform duration-300">
                      <img src="/github.png" alt="GitHub" className="w-12 h-12" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3 transition-colors duration-300" style={{ color: palette.navy, fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>GitHub</h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: '#37474F', lineHeight: '1.6', fontFamily: '"Inter", sans-serif' }}>
                      Check out our open-source project and contribute to the codebase.
                    </p>
                    <a href="https://github.com/minhdang-DS/MyMedQL" target="_blank" rel="noopener noreferrer" className="text-sm font-medium transition-all duration-300 hover:underline hover:opacity-80" style={{ color: palette.brand, fontFamily: '"Inter", sans-serif' }}>
                      github.com/minhdang-DS/MyMedQL
                    </a>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>
        </AnimatedSection>

      </main >

      <footer className="border-t bg-white" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm md:flex-row md:items-center md:justify-between" style={{ color: palette.navy }}>
          <div className="font-medium">MyMedQL · Real-time patient vital monitoring</div>
          <div className="flex flex-wrap gap-6">
            <a href="#docs" className="transition-all duration-300 hover:opacity-70 hover:underline hover:underline-offset-4" style={{ color: palette.navy }}>Docs</a>
            <a href="#demo" className="transition-all duration-300 hover:opacity-70 hover:underline hover:underline-offset-4" style={{ color: palette.navy }}>Demo</a>
            <a href="#features" className="transition-all duration-300 hover:opacity-70 hover:underline hover:underline-offset-4" style={{ color: palette.navy }}>Features</a>
            <a href="#how" className="transition-all duration-300 hover:opacity-70 hover:underline hover:underline-offset-4" style={{ color: palette.navy }}>How it works</a>
          </div>
        </div>
      </footer>
      </div>
    </div >
  );
}
