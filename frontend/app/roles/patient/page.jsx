"use client";
import PatientDashboard from "../../../components/PatientDashboard";
import { theme } from "../../data/patients";

export default function PatientPage() {
  // Standalone Patient Portal: Fixed to Patient 221, Staff View disabled
  return (
    <div className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: theme.bg, color: theme.textMain, fontFamily: '"Inter", sans-serif' }}>
      <PatientDashboard patientId="221" isStaffView={false} />
    </div>
  );
}
