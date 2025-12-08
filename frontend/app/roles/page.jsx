import Link from "next/link";

const palette = {
  primary: "#0A5FB5",
  primaryBright: "#1E88E5",
  navy: "#0D47A1",
  lightBg: "#E3F2FD",
  softBlue: "#A7D0F5",
  greyBorder: "#CBD3DD",
  success: "#2ECC71"
};

const roles = [
  {
    title: "Staff",
    href: "/roles/staff",
    badge: "Clinician / Admin",
    desc: "Access patient lists, live vitals dashboards, alerts, and threshold controls.",
    highlights: ["Patient list & device assignments", "Live alerts with acknowledge", "Threshold & scenario controls"]
  },
  {
    title: "Patient",
    href: "/roles/patient",
    badge: "Patient view",
    desc: "Personal vitals trends, recent alerts, and guidance on next steps.",
    highlights: ["Personal vitals timeline", "Recent alerts & status", "Care guidance / follow-ups"]
  }
];

export default function RoleSelectPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.lightBg, color: palette.navy }}>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold" style={{ color: palette.primaryBright }}>Choose your role</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ color: palette.navy }}>Who is using MyMedQL today?</h1>
            <p className="mt-2 text-sm" style={{ color: palette.navy }}>Pick a role to enter a tailored experience.</p>
          </div>
          <Link href="/" className="text-sm font-semibold" style={{ color: palette.primaryBright }}>Back to home</Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {roles.map((role) => (
            <Link key={role.title} href={role.href} className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md" style={{ borderColor: palette.greyBorder }}>
              <div className="flex items-center justify-between">
                <div className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: palette.softBlue, color: palette.primary }}>
                  {role.badge}
                </div>
                <span className="text-sm" style={{ color: palette.primaryBright }}>→</span>
              </div>
              <h2 className="mt-4 text-xl font-bold" style={{ color: palette.navy }}>{role.title}</h2>
              <p className="mt-2 text-sm" style={{ color: palette.navy }}>{role.desc}</p>
              <div className="mt-4 space-y-2 text-sm" style={{ color: palette.navy }}>
                {role.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.success }} />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: palette.primary }}>
                Enter {role.title} space <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
