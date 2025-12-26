import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWaveform Hook - Real-time Medical Waveform Visualization Engine
 * 
 * Generates medical-grade waveforms (ECG, SpO2, Respiration) based on mathematical models.
 * 
 * @param {number|null|undefined} rate - Heart rate (BPM) or respiration rate (breaths/min)
 * @param {string} type - Waveform type: 'ecg', 'pleth', or 'resp'
 * @returns {string} SVG path string for rendering
 */
export function useWaveform(rate, type = 'ecg') {
    // State for SVG path string
    const [path, setPath] = useState('');

    // Data buffer: rolling array storing last 500 points
    const bufferRef = useRef(new Array(500).fill(50)); // Initialize with baseline (50)
    
    // Phase accumulator: continuous variable tracking cycle progress (0 to 2π)
    const phaseRef = useRef(0);
    
    // Animation frame reference
    const frameIdRef = useRef(null);
    const lastTimeRef = useRef(Date.now());
    
    // Track if buffer has been pre-filled and last rate value
    const hasPrefilledRef = useRef(false);
    const lastRateRef = useRef(null);

    // ViewBox dimensions: 0 0 1000 100
    const VIEWBOX_WIDTH = 1000;
    const VIEWBOX_HEIGHT = 100;
    const BASELINE = 50; // Center of Y-axis
    const BUFFER_SIZE = 500; // 1000 / 2 (2 units per frame)
    const X_RESOLUTION = 2; // units per frame

    /**
     * Calculate y(t) for ECG waveform
     * Piecewise function for P-Q-R-S-T complex
     * Note: t should be normalized to [0, 2π) for this function
     */
    const ecgY = useCallback((t) => {
        // Normalize t to [0, 2π) for piecewise function
        t = ((t % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);

        // P-Wave: 0.5 < t < 0.9
        if (t > 0.5 && t < 0.9) {
            return BASELINE - 5 * Math.sin(7 * (t - 0.5));
        }
        // Q-Wave: 2.8 < t < 3.0
        if (t > 2.8 && t < 3.0) {
            return BASELINE + 5;
        }
        // R-Wave Spike: 3.0 <= t < 3.2
        if (t >= 3.0 && t < 3.2) {
            return BASELINE - 40;
        }
        // S-Wave: 3.2 <= t < 3.4
        if (t >= 3.2 && t < 3.4) {
            return BASELINE + 10;
        }
        // T-Wave: 4.5 < t < 5.5
        if (t > 4.5 && t < 5.5) {
            return BASELINE - 8 * Math.sin(3 * (t - 4.5));
        }
        // Baseline with small noise
        return BASELINE + (Math.random() - 0.5) * 0.5;
    }, []);

    /**
     * Calculate y(t) for SpO2 plethysmograph waveform
     * Continuous function: y = 50 - 20sin(t) + 5sin(2t + 0.5)
     * Note: t can be any value, Math.sin handles periodicity automatically
     */
    const plethY = useCallback((t) => {
        // No need to normalize - Math.sin handles periodicity naturally
        const A1 = 20; // Amplitude of primary wave
        const A2 = 5;  // Amplitude of dicrotic notch
        const phi = 0.5; // Phase offset for the notch
        return BASELINE - A1 * Math.sin(t) + A2 * Math.sin(2 * t + phi);
    }, []);

    /**
     * Calculate y(t) for Respiration waveform
     * Simple sine wave: y = 50 - 20sin(t)
     * Note: t can be any value, Math.sin handles periodicity automatically
     */
    const respY = useCallback((t) => {
        // No need to normalize - Math.sin handles periodicity naturally
        const A = 20; // Amplitude
        return BASELINE - A * Math.sin(t);
    }, []);

    /**
     * Generate y(t) based on waveform type
     */
    const calculateY = useCallback((t) => {
        // Zero-state handling: flatline at baseline
        if (rate === null || rate === undefined || rate === 0) {
            return BASELINE;
        }

        switch (type) {
            case 'ecg':
                return ecgY(t);
            case 'pleth':
                return plethY(t);
            case 'resp':
                return respY(t);
            default:
                return BASELINE;
        }
    }, [rate, type, ecgY, plethY, respY]);

    /**
     * Generate SVG path string from buffer
     */
    const generatePath = useCallback(() => {
        const buffer = bufferRef.current;
        if (buffer.length === 0) return '';

        let pathStr = `M0,${buffer[0]}`;
        for (let i = 1; i < buffer.length; i++) {
            const x = i * X_RESOLUTION;
            const y = buffer[i];
            pathStr += ` L${x},${y}`;
        }
        return pathStr;
    }, []);

    /**
     * Pre-fill buffer with waveform history when first valid rate is received
     * This ensures the graph doesn't start "in the middle" but shows a full history
     */
    const prefillBuffer = useCallback((currentRate) => {
        if (!currentRate || currentRate === 0) return;

        const rateHz = currentRate / 60;
        const omega = 2 * Math.PI * rateHz;
        
        // Calculate time step: we want BUFFER_SIZE points
        // At 60 FPS, each frame is ~16.67ms, so we generate points going backwards
        const timeStep = 1.0 / 60; // ~16.67ms per point
        const newBuffer = [];
        
        // Start from current phase (0) and go backwards to fill the buffer
        // This creates a "history" that leads up to the current moment
        let phase = 0;
        
        for (let i = BUFFER_SIZE - 1; i >= 0; i--) {
            let phaseForCalculation = phase;
            
            // For ECG, normalize phase for piecewise function
            if (type === 'ecg') {
                phaseForCalculation = ((phase % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            }
            
            const y = calculateY(phaseForCalculation);
            newBuffer[i] = y;
            
            // Move backwards in phase
            phase -= omega * timeStep;
        }
        
        // Update buffer and set phase to 0 (current moment)
        bufferRef.current = newBuffer;
        phaseRef.current = 0;
        hasPrefilledRef.current = true;
        
        // Generate path immediately
        setPath(generatePath());
    }, [type, calculateY, generatePath]);

    /**
     * Pre-fill buffer when rate first becomes valid
     * This ensures the graph shows a full history immediately instead of starting empty
     */
    useEffect(() => {
        const currentRate = (rate !== null && rate !== undefined && rate !== 0) ? rate : null;
        const lastRate = lastRateRef.current;
        
        // Check if rate just became valid (was null/0, now has value)
        // Only pre-fill once when rate first becomes valid
        const rateJustBecameValid = (lastRate === null || lastRate === 0 || lastRate === undefined) && 
                                     currentRate !== null && currentRate !== 0 &&
                                     !hasPrefilledRef.current;
        
        if (rateJustBecameValid) {
            prefillBuffer(currentRate);
        }
        
        // Update last rate
        lastRateRef.current = currentRate;
        
        // Reset pre-fill flag if rate goes back to invalid
        if (currentRate === null || currentRate === 0) {
            hasPrefilledRef.current = false;
        }
    }, [rate, prefillBuffer]);

    /**
     * Animation loop - 60 FPS
     */
    useEffect(() => {
        const loop = () => {
            const now = Date.now();
            const dt = (now - lastTimeRef.current) / 1000; // Delta time in seconds
            lastTimeRef.current = now;

            // Zero-state: maintain flatline
            if (rate === null || rate === undefined || rate === 0) {
                // Keep buffer at baseline
                bufferRef.current.fill(BASELINE);
                hasPrefilledRef.current = false; // Reset pre-fill flag
                setPath(generatePath());
                frameIdRef.current = requestAnimationFrame(loop);
                return;
            }

            // Calculate angular frequency: ω = 2πR/60
            const rateHz = rate / 60; // Convert BPM/breaths per min to Hz
            const omega = 2 * Math.PI * rateHz;

            // Update phase: t(τ) = t(0) + ω * Δτ
            // Let phase accumulate continuously - Math.sin/cos handle periodicity naturally
            phaseRef.current += omega * dt;
            
            // For ECG, we still need normalized phase for piecewise function
            // For continuous waveforms (pleth, resp), we can use phase directly
            let phaseForCalculation = phaseRef.current;
            if (type === 'ecg') {
                // Normalize for ECG piecewise function
                phaseForCalculation = ((phaseRef.current % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
            }

            // Calculate y(t) using mathematical model
            const y = calculateY(phaseForCalculation);

            // Push new y to buffer, shift old values (rolling array)
            // Maintain exactly BUFFER_SIZE points
            bufferRef.current.push(y);
            if (bufferRef.current.length > BUFFER_SIZE) {
                bufferRef.current.shift(); // Remove oldest point
            }
            // Ensure buffer is exactly BUFFER_SIZE points
            while (bufferRef.current.length < BUFFER_SIZE) {
                bufferRef.current.unshift(BASELINE); // Pad with baseline if needed
            }

            // Generate SVG path from buffer
            setPath(generatePath());

            // Continue animation loop
            frameIdRef.current = requestAnimationFrame(loop);
        };

        // Start animation loop
        frameIdRef.current = requestAnimationFrame(loop);

        // Cleanup
        return () => {
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
            }
        };
    }, [rate, type, calculateY, generatePath]);

    return path;
}

