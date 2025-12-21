// Theme variants based on patient status
export const themes = {
    stable: {
        bg: "#F8FAFC", // Slate-50 - Very soft/clean (default)
        card: "#FFFFFF",
        textMain: "#1E293B", // Slate-800
        textMuted: "#64748B", // Slate-500
        primary: "#0284C7", // Sky-600 (Calm Blue)
        success: "#10B981", // Emerald-500
        warning: "#F59E0B", // Amber-500
        critical: "#E11D48", // Rose-600 (Softer than pure red)
        criticalBg: "#FFF1F2", // Rose-50
        monitorBg: "#0F172A", // Slate-900 (Dark but blue-tinted)
    },
    warning: {
        bg: "#FEF3C7", // Amber-100 - More visible yellow tinted background
        card: "#FFFFFF",
        textMain: "#78350F", // Amber-900 - Darker text for contrast
        textMuted: "#92400E", // Amber-800
        primary: "#F59E0B", // Amber-500
        success: "#10B981", // Emerald-500
        warning: "#F59E0B", // Amber-500
        critical: "#E11D48", // Rose-600
        criticalBg: "#FEF3C7", // Amber-100
        monitorBg: "#1C1917", // Dark background with yellow tint
    },
    critical: {
        bg: "#FFE4E6", // Rose-100 - More visible red tinted background
        card: "#FFFFFF",
        textMain: "#881337", // Rose-900 - Darker text for contrast
        textMuted: "#9F1239", // Rose-800
        primary: "#E11D48", // Rose-600
        success: "#10B981", // Emerald-500
        warning: "#F59E0B", // Amber-500
        critical: "#E11D48", // Rose-600
        criticalBg: "#FFE4E6", // Rose-100
        monitorBg: "#1F1F1F", // Dark background with red tint
    }
};

// Default theme (stable)
export const theme = themes.stable;

export const patientDatabase = {
    "104": { name: "Patient 104", room: "201-A", status: "Stable", isCritical: false },
    "221": { name: "Patient 221", room: "305-ICU", status: "Alert", isCritical: true },
    "305": { name: "Patient 305", room: "210-B", status: "Warning", isCritical: false, isWarning: true },
    "412": { name: "Patient 412", room: "404-A", status: "Stable", isCritical: false },
    "508": { name: "Patient 508", room: "102-C", status: "Stable", isCritical: false },
    "119": { name: "Patient 119", room: "215-A", status: "Warning", isCritical: false, isWarning: true },
};
