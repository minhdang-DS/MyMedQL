"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { getPatients, getPatientHistory, getThresholds, updateThreshold, deletePatient } from "../../services/api";
import { useWebSocket } from "../../hooks/useWebSocket";

const palette = {
  // Primary colors: lively blues, teal, vibrant accents (matching landing page)
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

function determineStatus(heartRate, spo2, thresholds = []) {
  const hrCritical = getThresholdValue(thresholds, 'heart_rate', 'critical');
  const hrWarning = getThresholdValue(thresholds, 'heart_rate', 'warning');
  const spo2Critical = getThresholdValue(thresholds, 'spo2', 'critical');
  const spo2Warning = getThresholdValue(thresholds, 'spo2', 'warning');
  
  // Check critical thresholds first
  if (hrCritical && ((hrCritical.min_value !== null && heartRate < hrCritical.min_value) || 
                    (hrCritical.max_value !== null && heartRate > hrCritical.max_value))) {
    return { status: "Alert", priority: 1 };
  }
  if (spo2Critical && ((spo2Critical.min_value !== null && spo2 < spo2Critical.min_value) || 
                      (spo2Critical.max_value !== null && spo2 > spo2Critical.max_value))) {
    return { status: "Alert", priority: 1 };
  }
  
  // Check warning thresholds
  if (hrWarning && ((hrWarning.min_value !== null && heartRate < hrWarning.min_value) || 
                     (hrWarning.max_value !== null && heartRate > hrWarning.max_value))) {
    return { status: "Warning", priority: 2 };
  }
  if (spo2Warning && ((spo2Warning.min_value !== null && spo2 < spo2Warning.min_value) || 
                       (spo2Warning.max_value !== null && spo2 > spo2Warning.max_value))) {
    return { status: "Warning", priority: 2 };
  }
  
  return { status: "Stable", priority: 3 };
}

export default function StaffPage() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState(null);
  const [editFormData, setEditFormData] = useState({ min_value: null, max_value: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { lastMessage } = useWebSocket();
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set()); // Track acknowledged alert IDs
  const [viewAllAlertsOpen, setViewAllAlertsOpen] = useState(false); // Modal state for viewing all alerts
  const [warningPatientsCount, setWarningPatientsCount] = useState(0); // Count of patients in warning state (updated every 1 minute)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // Modal state for delete confirmation
  const [patientToDelete, setPatientToDelete] = useState(null); // Patient to be deleted

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

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

  // Fetch patients and their latest vitals
  useEffect(() => {
    let isMounted = true; // Track if component is still mounted
    
    async function fetchPatientsData() {
      try {
        setLoading(true);
        console.log("=== FETCHING PATIENTS ===");
        console.log("Thresholds available:", thresholds?.length || 0);
        
        // Fetch all patients
        const patientsList = await getPatients();
        console.log("Patients fetched:", patientsList?.length || 0, patientsList);
        
        if (!isMounted) {
          console.log("Component unmounted, skipping state update");
          return;
        }
        
        if (!patientsList || patientsList.length === 0) {
          console.warn("No patients returned from API");
          setPatients([]);
          setLoading(false);
          return;
        }
        
        console.log("Processing", patientsList.length, "patients...");
        
        // Fetch latest vitals for each patient
        console.log("Fetching vitals for", patientsList.length, "patients...");
        const patientsWithVitals = await Promise.all(
          patientsList.map(async (patient, index) => {
            try {
              console.log(`[${index + 1}/${patientsList.length}] Fetching history for patient ${patient.patient_id}...`);
              const history = await getPatientHistory(patient.patient_id, 1);
              console.log(`[${index + 1}/${patientsList.length}] History received:`, history?.length || 0, "records");
              const latestVital = history && history.length > 0 ? history[0] : null;
              
              const heartRate = latestVital?.heart_rate || null;
              const spo2 = latestVital?.spo2 || null;
              
              // Use current thresholds state (may be empty initially, that's OK)
              const { status, priority } = determineStatus(heartRate || 0, spo2 || 0, thresholds);
              
              return {
                id: String(patient.patient_id),
                patient_id: patient.patient_id,
                name: `${patient.first_name} ${patient.last_name}`,
                status: status,
                priority: priority,
                heartRate: heartRate,
                spo2: spo2,
                room: patient.room_id || `Room ${patient.patient_id}`,
              };
            } catch (error) {
              console.error(`[${index + 1}/${patientsList.length}] Error fetching vitals for patient ${patient.patient_id}:`, error);
              console.error(`Error details:`, error.message, error.stack);
              // Return patient with default values even if history fetch fails
              return {
                id: String(patient.patient_id),
                patient_id: patient.patient_id,
                name: `${patient.first_name} ${patient.last_name}`,
                status: "Stable",
                priority: 3,
                heartRate: null,
                spo2: null,
                room: patient.room_id || `Room ${patient.patient_id}`,
              };
            }
          })
        );
        
        console.log("Patients with vitals processed:", patientsWithVitals.length);
        console.log("Sample patient:", patientsWithVitals[0]);
        
        if (!isMounted) {
          console.log("Component unmounted, skipping state update");
          return;
        }
        
        setPatients(patientsWithVitals);
        console.log("Patients state updated!");
        
        // Generate alerts from patients using thresholds
        // Only create critical alerts if they don't exist OR if they exist but are not acknowledged
        // Don't create warning alerts - we'll just count patients in warning state
        setAlerts(prevAlerts => {
          const alertMap = new Map(prevAlerts.map(a => [a.id, a]));
          const hrCritical = getThresholdValue(thresholds, 'heart_rate', 'critical');
          const spo2Critical = getThresholdValue(thresholds, 'spo2', 'critical');
          
          patientsWithVitals.forEach((p) => {
            // Check for critical heart rate alerts - only create if not already acknowledged
            if (p.heartRate !== null && p.heartRate !== undefined && hrCritical) {
              if ((hrCritical.min_value !== null && p.heartRate < hrCritical.min_value) ||
                  (hrCritical.max_value !== null && p.heartRate > hrCritical.max_value)) {
                const alertId = `hr-critical-${p.id}`;
                // Only create alert if it doesn't exist OR if it exists but is not acknowledged
                const existingAlert = alertMap.get(alertId);
                if (!existingAlert || !acknowledgedAlerts.has(alertId)) {
                  if (!existingAlert) {
                    alertMap.set(alertId, {
                      id: alertId,
                      type: "Tachycardia/Bradycardia",
                      patient: p.name,
                      severity: "Critical",
                      time: new Date().toLocaleTimeString(),
                      desc: `HR ${hrCritical.max_value !== null && p.heartRate > hrCritical.max_value ? '>' : '<'} ${hrCritical.max_value !== null && p.heartRate > hrCritical.max_value ? hrCritical.max_value : hrCritical.min_value} bpm`
                    });
                  }
                }
              }
            }
            // Check for critical SpO2 alerts - only create if not already acknowledged
            if (p.spo2 !== null && p.spo2 !== undefined && spo2Critical) {
              if ((spo2Critical.min_value !== null && p.spo2 < spo2Critical.min_value) ||
                  (spo2Critical.max_value !== null && p.spo2 > spo2Critical.max_value)) {
                const alertId = `spo2-critical-${p.id}`;
                // Only create alert if it doesn't exist OR if it exists but is not acknowledged
                const existingAlert = alertMap.get(alertId);
                if (!existingAlert || !acknowledgedAlerts.has(alertId)) {
                  if (!existingAlert) {
                    alertMap.set(alertId, {
                      id: alertId,
                      type: "Low SpO2",
                      patient: p.name,
                      severity: "Critical",
                      time: new Date().toLocaleTimeString(),
                      desc: `SpO2 ${spo2Critical.max_value !== null && p.spo2 > spo2Critical.max_value ? '>' : '<'} ${spo2Critical.max_value !== null && p.spo2 > spo2Critical.max_value ? spo2Critical.max_value : spo2Critical.min_value}%`
                    });
                  }
                }
              }
            }
          });
          return Array.from(alertMap.values());
        });
      } catch (error) {
        console.error("=== ERROR FETCHING PATIENTS ===");
        console.error("Error:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        // Set empty array on error so UI shows "No patients found" instead of loading forever
        if (isMounted) {
          setPatients([]);
        }
      } finally {
        if (isMounted) {
        setLoading(false);
          console.log("=== FETCH COMPLETE ===");
        }
      }
    }
    
    // Fetch patients immediately, and also when thresholds change (to recalculate status)
    fetchPatientsData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [thresholds, acknowledgedAlerts]);

  // Handle WebSocket updates for real-time vitals and emergency alerts
  useEffect(() => {
    // Handle emergency alerts
    if (lastMessage && lastMessage.type === "emergency_alert" && lastMessage.alert) {
      console.log("🚨 Received emergency alert:", lastMessage);
      const emergencyAlert = lastMessage.alert;
      setAlerts(prevAlerts => {
        const alertMap = new Map(prevAlerts.map(a => [a.id, a]));
        // Add emergency alert if it doesn't exist
        if (!alertMap.has(emergencyAlert.id)) {
          const newAlert = {
            id: emergencyAlert.id,
            type: emergencyAlert.type,
            patient: emergencyAlert.patient,
            severity: emergencyAlert.severity || "Critical", // Ensure severity is set
            time: emergencyAlert.time,
            desc: emergencyAlert.desc
          };
          console.log("🚨 Adding emergency alert to state:", newAlert);
          alertMap.set(emergencyAlert.id, newAlert);
        } else {
          console.log("🚨 Emergency alert already exists:", emergencyAlert.id);
        }
        const updatedAlerts = Array.from(alertMap.values());
        console.log("🚨 Updated alerts list:", updatedAlerts);
        return updatedAlerts;
      });
      return;
    }
    
    // Handle vitals updates
    if (lastMessage && lastMessage.type === "vitals_update" && lastMessage.data && Array.isArray(lastMessage.data)) {
      try {
        // Update patients with new vitals
        setPatients(prevPatients => {
          if (!prevPatients || prevPatients.length === 0) {
            return prevPatients; // Don't update if patients haven't loaded yet
          }
          
          const updatedPatients = prevPatients.map(p => ({ ...p })); // Create deep copy
          const patientMap = new Map(updatedPatients.map(p => [p.patient_id, p]));
          const hrCritical = getThresholdValue(thresholds, 'heart_rate', 'critical');
          const hrWarning = getThresholdValue(thresholds, 'heart_rate', 'warning');
          const spo2Critical = getThresholdValue(thresholds, 'spo2', 'critical');
          const spo2Warning = getThresholdValue(thresholds, 'spo2', 'warning');
          
          // Update vitals for all patients in the WebSocket message
          lastMessage.data.forEach((vital) => {
            if (!vital || typeof vital.patient_id === 'undefined') {
              return; // Skip invalid vital data
            }
            
            const patientId = Number(vital.patient_id);
            const patient = patientMap.get(patientId);
            
            if (patient) {
              const { status, priority } = determineStatus(
                vital.heart_rate || 0,
                vital.spo2 || 0,
                thresholds
              );
              
              patient.heartRate = vital.heart_rate !== null && vital.heart_rate !== undefined ? vital.heart_rate : patient.heartRate;
              patient.spo2 = vital.spo2 !== null && vital.spo2 !== undefined ? vital.spo2 : patient.spo2;
              patient.status = status;
              patient.priority = priority;
            }
          });
          
          // Update alerts - only create critical alerts if they don't exist OR if they exist but are not acknowledged
          // Don't create warning alerts - we'll just count patients in warning state
          setAlerts(prevAlerts => {
            const alertMap = new Map(prevAlerts.map(a => [a.id, a]));
            
            lastMessage.data.forEach((vital) => {
              if (!vital || typeof vital.patient_id === 'undefined') {
                return;
              }
              
              const patientId = Number(vital.patient_id);
              const patient = patientMap.get(patientId);
              
              if (!patient) return;
              
              // Check for critical heart rate alerts - only create if not already acknowledged
              if (vital.heart_rate !== null && vital.heart_rate !== undefined && hrCritical) {
                if ((hrCritical.min_value !== null && vital.heart_rate < hrCritical.min_value) ||
                    (hrCritical.max_value !== null && vital.heart_rate > hrCritical.max_value)) {
                  const alertId = `hr-critical-${patientId}`;
                  // Only create alert if it doesn't exist OR if it exists but is not acknowledged
                  const existingAlert = alertMap.get(alertId);
                  if (!existingAlert || !acknowledgedAlerts.has(alertId)) {
                    if (!existingAlert) {
                      alertMap.set(alertId, {
                        id: alertId,
                        type: "Tachycardia/Bradycardia",
                        patient: patient.name,
                        severity: "Critical",
                        time: new Date().toLocaleTimeString(),
                        desc: `HR ${hrCritical.max_value !== null && vital.heart_rate > hrCritical.max_value ? '>' : '<'} ${hrCritical.max_value !== null && vital.heart_rate > hrCritical.max_value ? hrCritical.max_value : hrCritical.min_value} bpm`
                      });
                    }
                  }
                }
              }
              // Check for critical SpO2 alerts - only create if not already acknowledged
              if (vital.spo2 !== null && vital.spo2 !== undefined && spo2Critical) {
                if ((spo2Critical.min_value !== null && vital.spo2 < spo2Critical.min_value) ||
                    (spo2Critical.max_value !== null && vital.spo2 > spo2Critical.max_value)) {
                  const alertId = `spo2-critical-${patientId}`;
                  // Only create alert if it doesn't exist OR if it exists but is not acknowledged
                  const existingAlert = alertMap.get(alertId);
                  if (!existingAlert || !acknowledgedAlerts.has(alertId)) {
                    if (!existingAlert) {
                      alertMap.set(alertId, {
                        id: alertId,
                        type: "Low SpO2",
                        patient: patient.name,
                        severity: "Critical",
                        time: new Date().toLocaleTimeString(),
                        desc: `SpO2 ${spo2Critical.max_value !== null && vital.spo2 > spo2Critical.max_value ? '>' : '<'} ${spo2Critical.max_value !== null && vital.spo2 > spo2Critical.max_value ? spo2Critical.max_value : spo2Critical.min_value}%`
                      });
                    }
                  }
                }
              }
            });
            
            return Array.from(alertMap.values());
          });
          
          return updatedPatients;
        });
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    }
  }, [lastMessage, thresholds, acknowledgedAlerts]);

  // Count patients in warning state every 1 minute (excluding those in critical/danger state)
  useEffect(() => {
    const countWarningPatients = () => {
      const hrWarning = getThresholdValue(thresholds, 'heart_rate', 'warning');
      const spo2Warning = getThresholdValue(thresholds, 'spo2', 'warning');
      const hrCritical = getThresholdValue(thresholds, 'heart_rate', 'critical');
      const spo2Critical = getThresholdValue(thresholds, 'spo2', 'critical');
      
      let count = 0;
      patients.forEach((p) => {
        // First check if patient is in critical state - if so, skip them
        let isInCritical = false;
        
        // Check heart rate critical
        if (p.heartRate !== null && p.heartRate !== undefined && hrCritical) {
          if ((hrCritical.min_value !== null && p.heartRate < hrCritical.min_value) ||
              (hrCritical.max_value !== null && p.heartRate > hrCritical.max_value)) {
            isInCritical = true;
          }
        }
        
        // Check SpO2 critical
        if (!isInCritical && p.spo2 !== null && p.spo2 !== undefined && spo2Critical) {
          if ((spo2Critical.min_value !== null && p.spo2 < spo2Critical.min_value) ||
              (spo2Critical.max_value !== null && p.spo2 > spo2Critical.max_value)) {
            isInCritical = true;
          }
        }
        
        // If patient is in critical, don't count them in warning
        if (isInCritical) {
          return;
        }
        
        // Now check if patient is in warning state
        let isInWarning = false;
        
        // Check heart rate warning
        if (p.heartRate !== null && p.heartRate !== undefined && hrWarning) {
          if ((hrWarning.min_value !== null && p.heartRate < hrWarning.min_value) ||
              (hrWarning.max_value !== null && p.heartRate > hrWarning.max_value)) {
            isInWarning = true;
          }
        }
        
        // Check SpO2 warning
        if (!isInWarning && p.spo2 !== null && p.spo2 !== undefined && spo2Warning) {
          if ((spo2Warning.min_value !== null && p.spo2 < spo2Warning.min_value) ||
              (spo2Warning.max_value !== null && p.spo2 > spo2Warning.max_value)) {
            isInWarning = true;
          }
        }
        
        if (isInWarning) {
          count++;
        }
      });
      
      setWarningPatientsCount(count);
    };
    
    // Count immediately
    countWarningPatients();
    
    // Count every 1 minute (60000ms)
    const interval = setInterval(countWarningPatients, 60000);
    
    return () => clearInterval(interval);
  }, [patients, thresholds]);

  // Handle alert acknowledgment
  const handleAcknowledgeAlert = (alertId) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  };

  // Handle delete patient
  const handleDeleteClick = (e, patient) => {
    e.preventDefault();
    e.stopPropagation();
    setPatientToDelete(patient);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    
    try {
      await deletePatient(patientToDelete.patient_id);
      // Refresh patients list
      const patientsList = await getPatients();
      const patientsWithVitals = await Promise.all(
        patientsList.map(async (patient) => {
          try {
            const history = await getPatientHistory(patient.patient_id, 1);
            const latestVital = history && history.length > 0 ? history[0] : null;
            const heartRate = latestVital?.heart_rate || null;
            const spo2 = latestVital?.spo2 || null;
            const { status, priority } = determineStatus(heartRate || 0, spo2 || 0, thresholds);
            
            return {
              id: String(patient.patient_id),
              patient_id: patient.patient_id,
              name: `${patient.first_name} ${patient.last_name}`,
              status: status,
              priority: priority,
              heartRate: heartRate,
              spo2: spo2,
              room: patient.room_id || `Room ${patient.patient_id}`,
            };
          } catch (error) {
            console.error(`Error fetching vitals for patient ${patient.patient_id}:`, error);
            return {
              id: String(patient.patient_id),
              patient_id: patient.patient_id,
              name: `${patient.first_name} ${patient.last_name}`,
              status: "Stable",
              priority: 3,
              heartRate: null,
              spo2: null,
              room: patient.room_id || `Room ${patient.patient_id}`,
            };
          }
        })
      );
      setPatients(patientsWithVitals);
      setDeleteConfirmOpen(false);
      setPatientToDelete(null);
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient. Please try again.");
    }
  };

  // Computed Stats - using useMemo to ensure reactivity
  const patientsNeedingAttention = useMemo(() => patients.filter(p => p.priority < 3).length, [patients]);
  // Critical alerts: only count unacknowledged ones
  const criticalAlertsCount = useMemo(() => 
    alerts.filter(a => a.severity === "Critical" && !acknowledgedAlerts.has(a.id)).length,
    [alerts, acknowledgedAlerts]
  );
  // Warning alerts: use the count of patients in warning state (updated every 1 minute)
  const warningAlertsCount = warningPatientsCount;
  const totalPatients = useMemo(() => patients.length, [patients]);

  // Filter and Sort Patients - stable sort by patient_id
  const filteredPatients = patients
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
      const matchesFilter = showAlertsOnly ? p.priority < 3 : true;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // First sort by priority (for alerts), then by patient_id for stable sorting
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Stable sort by patient_id
      return Number(a.patient_id) - Number(b.patient_id);
    });

  const openEditModal = (threshold) => {
    setSelectedThreshold(threshold);
    setEditFormData({
      min_value: threshold.min_value,
      max_value: threshold.max_value
    });
    setEditModalOpen(true);
  };

  const handleSaveThreshold = async () => {
    if (!selectedThreshold) return;
    
    try {
      setSaving(true);
      await updateThreshold(selectedThreshold.name, selectedThreshold.type, editFormData);
      
      // Refresh thresholds
      const updatedThresholds = await getThresholds();
      setThresholds(updatedThresholds);
      
      // Refresh patients to recalculate status
      const patientsList = await getPatients();
      const patientsWithVitals = await Promise.all(
        patientsList.map(async (patient) => {
          try {
            const history = await getPatientHistory(patient.patient_id, 1);
            const latestVital = history && history.length > 0 ? history[0] : null;
            const heartRate = latestVital?.heart_rate || null;
            const spo2 = latestVital?.spo2 || null;
            const { status, priority } = determineStatus(heartRate || 0, spo2 || 0, updatedThresholds);
            
            return {
              id: String(patient.patient_id),
              patient_id: patient.patient_id,
              name: `${patient.first_name} ${patient.last_name}`,
              status: status,
              priority: priority,
              heartRate: heartRate,
              spo2: spo2,
              room: patient.room_id || `Room ${patient.patient_id}`,
            };
          } catch (error) {
            console.error(`Error fetching vitals for patient ${patient.patient_id}:`, error);
            return {
              id: String(patient.patient_id),
              patient_id: patient.patient_id,
              name: `${patient.first_name} ${patient.last_name}`,
              status: "Stable",
              priority: 3,
              heartRate: null,
              spo2: null,
              room: patient.room_id || `Room ${patient.patient_id}`,
            };
          }
        })
      );
      setPatients(patientsWithVitals);
      
      setEditModalOpen(false);
      setSelectedThreshold(null);
    } catch (error) {
      console.error("Error saving threshold:", error);
      alert("Failed to save threshold. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Get display name for threshold
  const getThresholdDisplayName = (name) => {
    const names = {
      'heart_rate': 'Heart Rate',
      'spo2': 'SpO2',
      'temperature_c': 'Temperature',
      'bp_systolic': 'Systolic BP',
      'bp_diastolic': 'Diastolic BP',
      'respiration': 'Respiration'
    };
    return names[name] || name;
  };

  // Get unit for threshold
  const getThresholdUnit = (name) => {
    const units = {
      'heart_rate': 'BPM',
      'spo2': '%',
      'temperature_c': '°C',
      'bp_systolic': 'mmHg',
      'bp_diastolic': 'mmHg',
      'respiration': 'breaths/min'
    };
    return units[name] || '';
  };

  // Get icon for threshold
  const getThresholdIcon = (name) => {
    const icons = {
      'heart_rate': '❤️',
      'spo2': '🫁',
      'temperature_c': '🌡️',
      'bp_systolic': '🩺',
      'bp_diastolic': '🩺',
      'respiration': '💨'
    };
    return icons[name] || '⚙️';
  };

  // Group thresholds by name
  const groupedThresholds = thresholds.reduce((acc, threshold) => {
    if (!acc[threshold.name]) {
      acc[threshold.name] = {};
    }
    acc[threshold.name][threshold.type] = threshold;
    return acc;
  }, {});

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(224, 247, 250, 0.5) 100%)',
        color: palette.navy,
        fontFamily: '"Inter", sans-serif'
      }}>
        {/* Sticky Header with Glassmorphism */}
        <header className="sticky top-0 z-30 border-b backdrop-blur-md transition-all" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: palette.brand + '40',
          boxShadow: `0 4px 12px ${palette.brand}20`
        }}>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-6">
              {/* Title with Icon */}
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2" style={{ 
                  backgroundColor: palette.brand + '20',
                  color: palette.brand
                }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight" style={{
                    color: palette.navyDark,
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Patient Monitor
                  </h1>
                  <div className="flex items-center gap-2 text-xs font-medium" style={{ color: palette.brand }}>
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: palette.success }}></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: palette.success }}></span>
                    </span>
                    System Operational
                  </div>
                </div>
              </div>

              {/* Status Chips */}
              <div className="flex gap-3 border-l pl-6" style={{ borderColor: palette.brand + '40' }}>
                <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${patientsNeedingAttention > 0 ? 'text-white' : ''}`} style={{
                  backgroundColor: patientsNeedingAttention > 0 ? palette.warning : 'rgba(224, 247, 250, 0.85)',
                  color: patientsNeedingAttention > 0 ? 'white' : palette.brand,
                  border: `1px solid ${patientsNeedingAttention > 0 ? palette.warning : palette.brand + '40'}`,
                  boxShadow: patientsNeedingAttention > 0 ? `0 4px 12px ${palette.warning}40` : `0 4px 12px ${palette.brand}20`
                }}>
                  {patientsNeedingAttention > 0 && <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>}
                  {patientsNeedingAttention} Need Attention
                </div>

                {criticalAlertsCount > 0 && (
                  <div className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition-all" style={{
                    backgroundColor: palette.danger,
                    boxShadow: `0 4px 12px ${palette.danger}40`
                  }}>
                    🚨 {criticalAlertsCount} Critical
                  </div>
                )}
              </div>
            </div>

            <Link href="/roles" className="group flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-150" style={{ 
              color: palette.brand, 
              borderColor: palette.brand,
              backgroundColor: palette.surface
            }} onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }} onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}>
              Switch Role <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </header>


        <main className="mx-auto max-w-7xl px-6 py-8">
          {/* Dashboard Stats Cards with Glassmorphism Style */}
          <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Patients Card */}
            <div className="group rounded-xl border p-6 transition-all duration-150 cursor-pointer" style={{ 
              borderColor: palette.brand + '40',
              boxShadow: `0 2px 8px ${palette.brand}15`,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(224, 247, 250, 0.3) 100%)'
            }} onMouseEnter={(e) => { 
              e.currentTarget.style.borderColor = palette.brand + '60'; 
              e.currentTarget.style.boxShadow = `0 2px 12px ${palette.brand}25`;
            }} onMouseLeave={(e) => { 
              e.currentTarget.style.borderColor = palette.brand + '40'; 
              e.currentTarget.style.boxShadow = `0 2px 8px ${palette.brand}15`;
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold uppercase tracking-wider" style={{ color: palette.brand }}>Total Patients</div>
                <div className="rounded-lg p-2" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-5xl font-bold mb-2" style={{ color: palette.navyDark }}>{totalPatients}</div>
              <div className="text-xs font-semibold" style={{ color: palette.textSecondary }}>Active monitoring</div>
            </div>

            {/* Critical Alerts Card */}
            <div className="group rounded-xl border p-6 transition-all duration-150 cursor-pointer" style={{ 
              borderColor: palette.danger + '40',
              boxShadow: `0 2px 8px ${palette.danger}15`,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)'
            }} onMouseEnter={(e) => { 
              e.currentTarget.style.borderColor = palette.danger + '60'; 
              e.currentTarget.style.boxShadow = `0 2px 12px ${palette.danger}25`;
            }} onMouseLeave={(e) => { 
              e.currentTarget.style.borderColor = palette.danger + '40'; 
              e.currentTarget.style.boxShadow = `0 2px 8px ${palette.danger}15`;
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold uppercase tracking-wider" style={{ color: palette.danger }}>Critical Alerts</div>
                <div className="rounded-lg p-2" style={{ backgroundColor: palette.danger + '20', color: palette.danger }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-5xl font-bold mb-2" style={{ color: palette.danger }}>{criticalAlertsCount}</div>
              <div className="text-xs font-semibold" style={{ color: palette.textSecondary }}>Requires immediate attention</div>
            </div>

            {/* Warning Alerts Card */}
            <div className="group rounded-xl border p-6 transition-all duration-150 cursor-pointer" style={{ 
              borderColor: palette.warning + '40',
              boxShadow: `0 2px 8px ${palette.warning}15`,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 215, 0, 0.1) 100%)'
            }} onMouseEnter={(e) => { 
              e.currentTarget.style.borderColor = palette.warning + '60'; 
              e.currentTarget.style.boxShadow = `0 2px 12px ${palette.warning}25`;
            }} onMouseLeave={(e) => { 
              e.currentTarget.style.borderColor = palette.warning + '40'; 
              e.currentTarget.style.boxShadow = `0 2px 8px ${palette.warning}15`;
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold uppercase tracking-wider" style={{ color: palette.warning }}>Warning Alerts</div>
                <div className="rounded-lg p-2" style={{ backgroundColor: palette.warning + '20', color: palette.warning }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-5xl font-bold mb-2" style={{ color: palette.warning }}>{warningAlertsCount}</div>
              <div className="text-xs font-semibold" style={{ color: palette.textSecondary }}>Monitor closely</div>
            </div>

            {/* System Status Card */}
            <div className="group rounded-xl border p-6 transition-all duration-150 cursor-pointer" style={{ 
              borderColor: palette.success + '40',
              boxShadow: `0 2px 8px ${palette.success}15`,
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(0, 230, 118, 0.1) 100%)'
            }} onMouseEnter={(e) => { 
              e.currentTarget.style.borderColor = palette.success + '60'; 
              e.currentTarget.style.boxShadow = `0 2px 12px ${palette.success}25`;
            }} onMouseLeave={(e) => { 
              e.currentTarget.style.borderColor = palette.success + '40'; 
              e.currentTarget.style.boxShadow = `0 2px 8px ${palette.success}15`;
            }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold uppercase tracking-wider" style={{ color: palette.success }}>System Status</div>
                <div className="rounded-lg p-2" style={{ backgroundColor: palette.success + '20', color: palette.success }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="relative flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: palette.success }}></span>
                  <span className="relative inline-flex h-4 w-4 rounded-full" style={{ backgroundColor: palette.success }}></span>
                </span>
                <span className="text-3xl font-bold" style={{ color: palette.navyDark }}>Online</span>
              </div>
              <div className="text-xs font-semibold" style={{ color: palette.textSecondary }}>All systems operational</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

            {/* LEFT COLUMN: Alerts & Thresholds (4 cols) */}
            <div className="space-y-8 lg:col-span-4">

              {/* Live Alerts Panel */}
              <section className="overflow-hidden rounded-xl border" style={{ 
                borderColor: palette.brand + '40',
                boxShadow: `0 4px 12px ${palette.brand}20`,
                backgroundColor: 'rgba(255, 255, 255, 0.85)'
              }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ 
                  borderColor: palette.brand + '40',
                  backgroundColor: 'rgba(224, 247, 250, 0.5)'
                }}>
                  <h2 className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider" style={{ color: palette.navy }}>
                    <div className="rounded-lg p-1.5" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </div>
                    Live Alerts
                  </h2>
                  <button 
                    onClick={() => setViewAllAlertsOpen(true)}
                    className="text-xs font-semibold transition-all duration-150 hover:opacity-80" 
                    style={{ color: palette.brand }}
                  >
                    View All
                  </button>
                </div>

                <div className="flex flex-col max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${palette.brand}40 transparent` }}>
                  {/* Only show critical alerts (no warnings) */}
                  {alerts
                    .filter(a => a.severity === "Critical") // Only show critical alerts
                    .sort((a, b) => {
                      // Sort: unacknowledged critical first, then acknowledged
                      const aAcknowledged = acknowledgedAlerts.has(a.id);
                      const bAcknowledged = acknowledgedAlerts.has(b.id);
                      if (aAcknowledged && !bAcknowledged) return 1;
                      if (!aAcknowledged && bAcknowledged) return -1;
                      return 0;
                    })
                    .map((alert, idx) => {
                    const isAcknowledged = acknowledgedAlerts.has(alert.id);

                      return (
                        <div key={alert.id} className={`group relative border-l-4 p-5 last:border-b-0 transition-all duration-150 ${isAcknowledged ? 'bg-gradient-to-r from-slate-50 to-slate-100/50' : 'bg-gradient-to-r from-white to-red-50/30'}`} style={{
                          borderLeftColor: isAcknowledged ? '#94a3b8' : palette.danger,
                          opacity: isAcknowledged ? 0.6 : 1
                        }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isAcknowledged ? 'text-slate-600' : 'text-white'}`} style={{
                              backgroundColor: isAcknowledged ? '#e2e8f0' : palette.danger,
                              boxShadow: isAcknowledged ? 'none' : `0 4px 12px ${palette.danger}40`
                            }}>
                              {isAcknowledged ? 'Acknowledged' : alert.severity}
                            </span>
                            <span className="text-xs font-semibold" style={{ color: isAcknowledged ? '#94a3b8' : palette.textSecondary }}>{alert.time}</span>
                          </div>
                          {!isAcknowledged && <span className="flex h-3 w-3 rounded-full animate-pulse" style={{ backgroundColor: palette.danger }}></span>}
                        </div>

                        <div className="mb-4">
                          <div className="font-bold flex items-center gap-2 text-sm mb-1" style={{ color: isAcknowledged ? '#64748b' : palette.navyDark }}>
                            <span className={`inline-block w-2 h-2 rounded-full ${isAcknowledged ? '' : ''}`} style={{
                              backgroundColor: isAcknowledged ? '#94a3b8' : palette.danger
                            }}></span>
                            {alert.type}
                            <span className="font-normal" style={{ color: isAcknowledged ? '#94a3b8' : palette.textSecondary }}>in</span>
                            <span className="font-semibold" style={{ color: isAcknowledged ? '#64748b' : palette.navyDark }}>{alert.patient}</span>
                          </div>
                          <div className="text-xs mt-2 font-mono px-3 py-2 rounded-lg border" style={{ 
                            color: isAcknowledged ? '#64748b' : palette.textPrimary,
                            backgroundColor: isAcknowledged ? '#f1f5f9' : palette.muted,
                            borderColor: isAcknowledged ? '#cbd5e1' : palette.brand + '40'
                          }}>{alert.desc}</div>
                        </div>

                        <div className="flex gap-2">
                          {!isAcknowledged ? (
                            <button 
                              onClick={() => handleAcknowledgeAlert(alert.id)}
                              className="flex-1 rounded-lg border py-2 text-xs font-bold shadow-sm transition-all duration-150" 
                              style={{ 
                                color: palette.navy,
                                borderColor: palette.brand + '40',
                                backgroundColor: palette.surface
                              }} 
                              onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                              }} 
                              onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                            >
                              Acknowledge
                            </button>
                          ) : (
                            <div className="flex-1 rounded-lg border py-2 text-xs font-bold text-center" style={{ 
                              color: '#94a3b8',
                              borderColor: '#cbd5e1',
                              backgroundColor: '#f8fafc'
                            }}>
                              Acknowledged
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Thresholds Panel */}
              <section className="overflow-hidden rounded-xl border" style={{ 
                borderColor: palette.brand + '40',
                boxShadow: `0 4px 12px ${palette.brand}20`,
                backgroundColor: 'rgba(255, 255, 255, 0.85)'
              }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ 
                  borderColor: palette.brand + '40',
                  backgroundColor: 'rgba(224, 247, 250, 0.5)'
                }}>
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: palette.navy }}>
                    <div className="rounded-lg p-1" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    Global Thresholds
                  </h2>
                </div>

                <div className="p-3 space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: `${palette.brand}40 transparent` }}>
                  {Object.keys(groupedThresholds).length > 0 ? (
                    Object.entries(groupedThresholds).map(([name, types]) => {
                      const warning = types.warning;
                      const critical = types.critical;
                      const displayName = getThresholdDisplayName(name);
                      const unit = getThresholdUnit(name);
                      const icon = getThresholdIcon(name);
                      
                      return (
                        <div key={name} className="space-y-1.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">{icon}</span>
                            <span className="text-xs font-bold" style={{ color: palette.navy }}>{displayName}</span>
                          </div>
                          
                          <div className="flex gap-1.5">
                            {warning && (
                              <div className="flex-1 flex items-center justify-between rounded-lg border p-2 transition-all duration-150 cursor-pointer group" style={{ 
                                borderColor: palette.warning + '40',
                                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 215, 0, 0.1) 100%)'
                              }} onClick={() => openEditModal(warning)} onMouseEnter={(e) => { 
                                e.currentTarget.style.borderColor = palette.warning + '60'; 
                                e.currentTarget.style.boxShadow = `0 2px 8px ${palette.warning}25`;
                              }} onMouseLeave={(e) => { 
                                e.currentTarget.style.borderColor = palette.warning + '40'; 
                                e.currentTarget.style.boxShadow = 'none';
                              }}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[10px] text-white px-1.5 py-0.5 rounded font-bold whitespace-nowrap" style={{
                                    backgroundColor: palette.warning
                                  }}>W</span>
                                  <div className="text-xs font-medium truncate" style={{ color: palette.navyDark }}>
                                    {warning.min_value !== null ? `${warning.min_value}` : '-'} 
                                    {warning.min_value !== null && warning.max_value !== null ? '-' : ''}
                                    {warning.max_value !== null ? `${warning.max_value}` : ''}
                                    <span className="text-[10px] ml-0.5">{unit}</span>
                                  </div>
                                </div>
                                <button className="rounded p-1 transition-all duration-150 flex-shrink-0" style={{ 
                                  backgroundColor: palette.warning + '20',
                                  color: palette.warning
                                }} onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '0.8';
                                }} onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                              </div>
                            )}
                            
                            {critical && (
                              <div className="flex-1 flex items-center justify-between rounded-lg border p-2 transition-all duration-150 cursor-pointer group" style={{ 
                                borderColor: palette.danger + '40',
                                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 82, 82, 0.1) 100%)'
                              }} onClick={() => openEditModal(critical)} onMouseEnter={(e) => { 
                                e.currentTarget.style.borderColor = palette.danger + '60'; 
                                e.currentTarget.style.boxShadow = `0 2px 8px ${palette.danger}25`;
                              }} onMouseLeave={(e) => { 
                                e.currentTarget.style.borderColor = palette.danger + '40'; 
                                e.currentTarget.style.boxShadow = 'none';
                              }}>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="text-[10px] text-white px-1.5 py-0.5 rounded font-bold whitespace-nowrap" style={{
                                    backgroundColor: palette.danger
                                  }}>C</span>
                                  <div className="text-xs font-medium truncate" style={{ color: palette.navyDark }}>
                                    {critical.min_value !== null ? `${critical.min_value}` : '-'} 
                                    {critical.min_value !== null && critical.max_value !== null ? '-' : ''}
                                    {critical.max_value !== null ? `${critical.max_value}` : ''}
                                    <span className="text-[10px] ml-0.5">{unit}</span>
                                  </div>
                                </div>
                                <button className="rounded p-1 transition-all duration-150 flex-shrink-0" style={{ 
                                  backgroundColor: palette.danger + '20',
                                  color: palette.danger
                                }} onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '0.8';
                                }} onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}>
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      <p>No thresholds configured</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Patient List (8 cols) */}
            <div className="lg:col-span-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{
                    color: palette.navyDark,
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0A2540 0%, #1E3A5F 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Patients</h2>
                  <p className="text-sm font-medium" style={{ color: palette.textSecondary }}>Monitoring {filteredPatients.length} active devices</p>
                </div>

                <div className="flex gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search ID or Name..."
                      className="w-full rounded-lg border px-4 py-2.5 pl-10 text-sm transition-all duration-300 focus:shadow-md"
                      style={{ 
                        borderColor: palette.brand + '40',
                        backgroundColor: palette.surface,
                        boxShadow: `0 4px 12px ${palette.brand}20`
                      }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = palette.brand;
                        e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}40`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = palette.brand + '40';
                        e.currentTarget.style.boxShadow = `0 4px 12px ${palette.brand}20`;
                      }}
                    />
                    <svg className="absolute left-3 top-3 h-5 w-5" style={{ color: palette.textSecondary }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <button
                    onClick={() => setShowAlertsOnly(!showAlertsOnly)}
                    className="flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-150"
                    style={{
                      borderColor: showAlertsOnly ? palette.warning : palette.brand + '40',
                      backgroundColor: showAlertsOnly ? palette.warning : palette.surface,
                      color: showAlertsOnly ? 'white' : palette.brand,
                      boxShadow: showAlertsOnly ? `0 2px 8px ${palette.warning}25` : `0 2px 8px ${palette.brand}15`
                    }}
                    onMouseEnter={(e) => {
                      if (!showAlertsOnly) {
                        e.currentTarget.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {showAlertsOnly ? '⚠️ Alerts Only' : 'Filter: All'}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mb-2"></div>
                    <p>Loading patients...</p>
                  </div>
                ) : filteredPatients.length > 0 ? filteredPatients.map((p) => {
                  const isCritical = p.status === 'Alert';
                  const isWarning = p.status === 'Warning';
                  const borderColor = isCritical ? 'border-red-200' : isWarning ? 'border-amber-200' : 'border-slate-200';
                  const bgColor = isCritical ? 'bg-white' : 'bg-white';
                  const shadow = isCritical ? 'shadow-red-50 ring-1 ring-red-100' : 'shadow-sm';

                  return (
                    <div key={p.id} className="relative">
                      <Link href={`/roles/staff/patient/${p.id}`} className="block">
                        <div className="group rounded-xl border p-5 transition-all duration-150 cursor-pointer" style={{ 
                        borderColor: (isCritical ? palette.danger : isWarning ? palette.warning : palette.brand) + '40',
                        boxShadow: `0 2px 8px ${(isCritical ? palette.danger : isWarning ? palette.warning : palette.brand)}15`,
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, ${(isCritical ? 'rgba(255, 82, 82, 0.1)' : isWarning ? 'rgba(255, 215, 0, 0.1)' : 'rgba(224, 247, 250, 0.3)')} 100%)`,
                        borderLeftWidth: '4px',
                        borderLeftColor: isCritical ? palette.danger : isWarning ? palette.warning : palette.brand
                      }} onMouseEnter={(e) => { 
                        e.currentTarget.style.borderColor = (isCritical ? palette.danger : isWarning ? palette.warning : palette.brand) + '60';
                        e.currentTarget.style.boxShadow = `0 2px 12px ${(isCritical ? palette.danger : isWarning ? palette.warning : palette.brand)}25`;
                      }} onMouseLeave={(e) => { 
                        e.currentTarget.style.borderColor = (isCritical ? palette.danger : isWarning ? palette.warning : palette.brand) + '40';
                        e.currentTarget.style.boxShadow = `0 2px 8px ${(isCritical ? palette.danger : isWarning ? palette.warning : palette.brand)}15`;
                      }}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{
                                backgroundColor: isCritical ? palette.danger : isWarning ? palette.warning : palette.success,
                                boxShadow: `0 4px 12px ${(isCritical ? palette.danger : isWarning ? palette.warning : palette.success)}40`
                              }}>
                                {p.status}
                              </span>
                              <div className="text-xl font-bold" style={{ color: palette.navyDark }}>{p.name}</div>
                            </div>
                            <div className="text-xs font-semibold flex items-center gap-2" style={{ color: palette.textSecondary }}>
                              <span className="px-2 py-0.5 rounded-md" style={{ backgroundColor: palette.muted }}>ID: {p.id}</span>
                              <span style={{ color: palette.border }}>•</span>
                              <span className="px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: palette.brand + '20', color: palette.brand }}>Rm: {p.room}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-5">
                          {/* Heart Rate */}
                          <div className="rounded-xl p-3 border" style={{ 
                            backgroundColor: palette.muted,
                            borderColor: palette.brand + '40'
                          }}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: palette.navy }}>
                                <span>❤️</span>
                                Heart Rate
                              </span>
                              <span className={`font-mono font-extrabold text-lg ${
                                isCritical ? '' : isWarning ? '' : ''
                              }`} style={{
                                color: isCritical ? palette.danger : isWarning ? palette.warning : palette.navyDark
                              }}>
                                {p.heartRate !== null && p.heartRate !== undefined ? `${p.heartRate}` : 'N/A'}
                                <span className="text-xs font-sans ml-1" style={{ color: palette.textSecondary }}>BPM</span>
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: palette.border + '40' }}>
                              <div 
                                className="h-full rounded-full transition-all duration-500"
                                style={{ 
                                  width: p.heartRate !== null && p.heartRate !== undefined
                                    ? `${Math.min(100, (p.heartRate / 150) * 100)}%` 
                                    : '0%',
                                  backgroundColor: isCritical ? palette.danger : isWarning ? palette.warning : palette.brand
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* SpO2 */}
                          <div className="rounded-xl p-3 border" style={{ 
                            backgroundColor: palette.muted,
                            borderColor: palette.brand + '40'
                          }}>
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-2" style={{ color: palette.navy }}>
                                <span>🫁</span>
                                SpO2
                              </span>
                              <span className={`font-mono font-extrabold text-lg ${
                                isCritical ? '' : isWarning ? '' : ''
                              }`} style={{
                                color: isCritical ? palette.danger : isWarning ? palette.warning : palette.navyDark
                              }}>
                                {p.spo2 !== null && p.spo2 !== undefined ? `${p.spo2}%` : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: palette.brand + '40' }}>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ 
                            backgroundColor: palette.muted,
                            color: palette.textSecondary
                          }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Patient {p.id}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg" style={{ 
                            backgroundColor: palette.success + '20',
                            color: palette.success
                          }}>
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: palette.success }}></span>
                              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: palette.success }}></span>
                            </span>
                            Live
                          </div>
                        </div>
                      </div>
                      </Link>
                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteClick(e, p)}
                        className="absolute top-4 right-4 p-2 rounded-lg transition-all duration-150 hover:opacity-80"
                        style={{
                          backgroundColor: palette.danger + '20',
                          color: palette.danger
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = palette.danger + '30';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = palette.danger + '20';
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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

        {/* View All Alerts Modal */}
        {viewAllAlertsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setViewAllAlertsOpen(false)}>
            <div className="w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: palette.brand + '40' }}>
                <h2 className="text-xl font-bold" style={{ color: palette.navyDark }}>All Live Alerts</h2>
                <button 
                  onClick={() => setViewAllAlertsOpen(false)}
                  className="rounded-lg p-2 transition-all duration-150 hover:opacity-80"
                  style={{ color: palette.textSecondary }}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin', scrollbarColor: `${palette.brand}40 transparent` }}>
                {alerts.filter(a => a.severity === "Critical").length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No critical alerts at this time</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts
                      .filter(a => a.severity === "Critical") // Only show critical alerts
                      .sort((a, b) => {
                        const aAcknowledged = acknowledgedAlerts.has(a.id);
                        const bAcknowledged = acknowledgedAlerts.has(b.id);
                        if (aAcknowledged && !bAcknowledged) return 1;
                        if (!aAcknowledged && bAcknowledged) return -1;
                        return 0;
                      })
                      .map((alert) => {
                        const isCritical = alert.severity === 'Critical';
                        const isAcknowledged = acknowledgedAlerts.has(alert.id);

                      return (
                        <div key={alert.id} className={`group relative border-l-4 p-4 rounded-xl transition-all duration-150 ${isAcknowledged ? 'bg-gradient-to-r from-slate-50 to-slate-100/50' : 'bg-gradient-to-r from-white to-red-50/30'}`} style={{
                          borderLeftColor: isAcknowledged ? '#94a3b8' : palette.danger,
                          opacity: isAcknowledged ? 0.6 : 1
                        }}>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isAcknowledged ? 'text-slate-600' : 'text-white'}`} style={{
                                backgroundColor: isAcknowledged ? '#e2e8f0' : palette.danger,
                                boxShadow: isAcknowledged ? 'none' : `0 4px 12px ${palette.danger}40`
                              }}>
                                {isAcknowledged ? 'Acknowledged' : alert.severity}
                              </span>
                              <span className="text-xs font-semibold" style={{ color: isAcknowledged ? '#94a3b8' : palette.textSecondary }}>{alert.time}</span>
                            </div>
                            {!isAcknowledged && <span className="flex h-3 w-3 rounded-full animate-pulse" style={{ backgroundColor: palette.danger }}></span>}
                          </div>

                          <div className="mb-3">
                            <div className="font-bold flex items-center gap-2 text-sm mb-1" style={{ color: isAcknowledged ? '#64748b' : palette.navyDark }}>
                              <span className={`inline-block w-2 h-2 rounded-full ${isAcknowledged ? '' : ''}`} style={{
                                backgroundColor: isAcknowledged ? '#94a3b8' : palette.danger
                              }}></span>
                              {alert.type}
                              <span className="font-normal" style={{ color: isAcknowledged ? '#94a3b8' : palette.textSecondary }}>in</span>
                              <span className="font-semibold" style={{ color: isAcknowledged ? '#64748b' : palette.navyDark }}>{alert.patient}</span>
                            </div>
                            <div className="text-xs mt-2 font-mono px-3 py-2 rounded-lg border" style={{ 
                              color: isAcknowledged ? '#64748b' : palette.textPrimary,
                              backgroundColor: isAcknowledged ? '#f1f5f9' : palette.muted,
                              borderColor: isAcknowledged ? '#cbd5e1' : palette.brand + '40'
                            }}>{alert.desc}</div>
                          </div>

                          <div className="flex gap-2">
                            {!isAcknowledged ? (
                              <button 
                                onClick={() => handleAcknowledgeAlert(alert.id)}
                                className="flex-1 rounded-lg border py-2 text-xs font-bold shadow-sm transition-all duration-150" 
                                style={{ 
                                  color: palette.navy,
                                  borderColor: palette.brand + '40',
                                  backgroundColor: palette.surface
                                }} 
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '0.8';
                                }} 
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                              >
                                Acknowledge
                              </button>
                            ) : (
                              <div className="flex-1 rounded-lg border py-2 text-xs font-bold text-center" style={{ 
                                color: '#94a3b8',
                                borderColor: '#cbd5e1',
                                backgroundColor: '#f8fafc'
                              }}>
                                Acknowledged
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal (re-styled) */}
        {
          editModalOpen && selectedThreshold && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`rounded-full p-2 ${selectedThreshold.type === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">Edit Threshold</h3>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                      Modifying <strong className="text-slate-800">{getThresholdDisplayName(selectedThreshold.name)}</strong> - <strong className={selectedThreshold.type === 'critical' ? 'text-red-600' : 'text-amber-600'}>{selectedThreshold.type.toUpperCase()}</strong>
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      This will immediately affect alerts for all connected patients.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Minimum Value ({getThresholdUnit(selectedThreshold.name)})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      value={editFormData.min_value !== null && editFormData.min_value !== undefined ? editFormData.min_value : ''}
                      onChange={(e) => setEditFormData({ ...editFormData, min_value: e.target.value === '' ? null : parseFloat(e.target.value) })}
                      placeholder="Leave empty for no minimum"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Maximum Value ({getThresholdUnit(selectedThreshold.name)})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      value={editFormData.max_value !== null && editFormData.max_value !== undefined ? editFormData.max_value : ''}
                      onChange={(e) => setEditFormData({ ...editFormData, max_value: e.target.value === '' ? null : parseFloat(e.target.value) })}
                      placeholder="Leave empty for no maximum"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setEditModalOpen(false);
                      setSelectedThreshold(null);
                    }}
                    disabled={saving}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveThreshold}
                    disabled={saving}
                    className={`rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 ${
                      selectedThreshold.type === 'critical' 
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                        : 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                    }`}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && patientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setDeleteConfirmOpen(false); setPatientToDelete(null); }}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-4 mb-6">
                <div className="rounded-full p-2 bg-red-100 text-red-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">Delete Patient</h3>
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    Are you sure you want to delete <strong className="text-slate-800">{patientToDelete.name}</strong> (ID: {patientToDelete.id})?
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    This action cannot be undone. All related records (vitals, admissions, etc.) will also be deleted.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setDeleteConfirmOpen(false); setPatientToDelete(null); }}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-150 hover:opacity-80"
                  style={{
                    borderColor: palette.border + '40',
                    color: palette.navy,
                    backgroundColor: palette.surface
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all duration-150 hover:opacity-90"
                  style={{
                    backgroundColor: palette.danger
                  }}
                >
                  Delete Patient
                </button>
              </div>
            </div>
          </div>
        )}

      </div >
    </ProtectedRoute>
  );
}
