"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PatientDashboard from "../../../../components/PatientDashboard";
import { getCurrentUser } from "../../../services/auth";
import ProtectedRoute from "../../../../components/ProtectedRoute";

function DashboardContent() {
    const [patientId, setPatientId] = useState(null);
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

    if (!patientId) {
        return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
    }

    return <PatientDashboard patientId={patientId} isStaffView={false} />;
}

export default function PatientDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['patient']}>
            <DashboardContent />
        </ProtectedRoute>
    );
}
