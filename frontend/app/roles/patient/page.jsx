"use client";
import { useState } from "react";
import PatientDashboard from "../../../components/PatientDashboard";
import { themes } from "../../data/patients";

export default function PatientPage() {
  const [patientStatus, setPatientStatus] = useState("stable"); // "stable", "warning", or "critical"
  
  // Get theme based on patient status
  const currentTheme = themes[patientStatus] || themes.stable;

  // Standalone Patient Portal: Fixed to Patient 221, Staff View disabled
  return (
    <div className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: currentTheme.bg, color: currentTheme.textMain, fontFamily: '"Inter", sans-serif' }}>
      <PatientDashboard patientId="221" isStaffView={false} onStatusChange={setPatientStatus} />
    </div>
  );
}
