"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PatientDashboard from "../../../../components/PatientDashboard";
import { getCurrentUser } from "../../../services/auth";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { themes } from "../../../data/patients";

function DashboardContent() {
    const [patientId, setPatientId] = useState(null);
    const [patientStatus, setPatientStatus] = useState("stable"); // "stable", "warning", or "critical"
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        if (user && user.role === 'patient' && user.id) {
            setPatientId(user.id);
        } else {
            // If not a patient or no ID, redirect to login
            router.push('/roles/patient/login');
        }
    }, [router]);

    // Get theme based on patient status
    const currentTheme = themes[patientStatus] || themes.stable;

    if (!patientId) {
        return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: currentTheme.bg, color: currentTheme.textMain }}>Loading dashboard...</div>;
    }

    return (
        <div className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: currentTheme.bg, color: currentTheme.textMain }}>
            <PatientDashboard patientId={patientId} isStaffView={false} onStatusChange={setPatientStatus} />
        </div>
    );
}

export default function PatientDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['patient']}>
            <DashboardContent />
        </ProtectedRoute>
    );
}
