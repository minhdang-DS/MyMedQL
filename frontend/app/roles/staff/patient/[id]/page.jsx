"use client";
import { useState, useEffect } from "react";
import PatientDashboard from "../../../../../components/PatientDashboard";
import { themes } from "../../../../data/patients";

import ProtectedRoute from "../../../../../components/ProtectedRoute";

export default function StaffPatientDetailPage({ params }) {
    const { id } = params;
    const [patientStatus, setPatientStatus] = useState("stable"); // "stable", "warning", or "critical"
    
    // Handle status change with logging for debugging
    const handleStatusChange = (newStatus) => {
        console.log("🔄 Patient status changed:", newStatus);
        setPatientStatus(newStatus);
    };
    
    // Get theme based on patient status
    const currentTheme = themes[patientStatus] || themes.stable;
    
    // Log theme changes for debugging
    useEffect(() => {
        console.log("🎨 Theme updated:", patientStatus, currentTheme);
    }, [patientStatus, currentTheme]);

    // Staff View: Dynamic Patient ID, Staff View Enabled (Return button)
    return (
        <ProtectedRoute>
            <div className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: currentTheme.bg, color: currentTheme.textMain }}>
                <PatientDashboard patientId={id} isStaffView={true} onStatusChange={handleStatusChange} />
            </div>
        </ProtectedRoute>
    );
}
