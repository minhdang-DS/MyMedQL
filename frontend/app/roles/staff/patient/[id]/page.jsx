"use client";
import PatientDashboard from "../../../../../components/PatientDashboard";
import { theme } from "../../../../data/patients";

export default function StaffPatientDetailPage({ params }) {
    const { id } = params;

    // Staff View: Dynamic Patient ID, Staff View Enabled (Return button)
    return (
        <div className="min-h-screen transition-colors duration-1000" style={{ backgroundColor: theme.bg, color: theme.textMain }}>
            <PatientDashboard patientId={id} isStaffView={true} />
        </div>
    );
}
