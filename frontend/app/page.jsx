import Link from "next/link";

const palette = {
  brand: "#0A5FB5",
  brandBright: "#1E88E5",
  navy: "#0D47A1",
  light: "#E3F2FD",
  soft: "#A7D0F5",
  cyan: "#4FC3F7",
  border: "#CBD3DD",
  surface: "#FFFFFF",
  muted: "#F2F4F7",
  success: "#2ECC71",
  warning: "#F4B400",
  danger: "#E63946",
};

const valueProps = [
  {
    title: 'Database-first reliability',
    body: 'MySQL 8, partitioned vitals, stored procedures, and triggers that make the database the active core of monitoring.'
  },
  {
    title: 'Configurable alerting',
    body: 'Global or per-patient thresholds with an auditable alert + acknowledgment workflow.'
  },
  {
    title: 'Reproducible scenarios',
    body: 'Simulator-driven stable → deterioration → recovery flows that graders can replay deterministically.'
  }
];

const howItWorks = [
  { title: 'Ingest', body: 'Devices or simulator push vitals every 1–5s via secure APIs.' },
  { title: 'Detect', body: 'DB triggers + thresholds create alerts instantly and log them for audit.' },
  { title: 'Visualize', body: 'WebSocket dashboard streams vitals and alert banners in near real time.' }
];

const useCases = [
  'ICU-style monitoring',
  'Simulation lab / teaching',
  'Research cohorts'
];

const faq = [
  {
    q: 'How are alerts generated?',
    a: 'AFTER INSERT triggers on vitals compare readings against thresholds and create alert rows.'
  },
  {
    q: 'What roles are supported?',
    a: 'Admin, doctor, nurse, and viewer with RBAC checks in the backend.'
  },
  {
    q: 'How fast is the demo?',
    a: 'Targets ~50 inserts/sec with sub-second alert propagation for typical queries.'
  },
  {
    q: 'Can I run it locally?',
    a: 'Yes—Docker Compose brings up DB, backend, and frontend with seeded demo data.'
  }
];

const sectionCard = "rounded-2xl border bg-white shadow-sm";

export default function Page() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.light, color: palette.navy }}>
      <header className="border-b bg-white" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="text-xl font-semibold" style={{ color: palette.brand }}>MyMedQL</div>
          <nav className="hidden items-center gap-6 text-sm md:flex" style={{ color: palette.navy }}>
            <a href="#product" className="hover:text-[#0A5FB5]">Product</a>
            <a href="#how" className="hover:text-[#0A5FB5]">How It Works</a>
            <a href="#features" className="hover:text-[#0A5FB5]">Features</a>
            <a href="#demo" className="hover:text-[#0A5FB5]">Demo</a>
            <a href="#docs" className="hover:text-[#0A5FB5]">Docs</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/roles" className="rounded-full border px-4 py-2 text-sm font-semibold" style={{ color: palette.brandBright, borderColor: palette.brandBright }}>Get Started</Link>
            <button className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: palette.brand }}>Start Demo</button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section id="product" className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center md:gap-14">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: palette.soft, color: palette.brand }}>
              Real-time vitals · Auditable alerts · DB-first
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl" style={{ color: palette.navy }}>
              Real-time vitals. Auditable alerts. Database-first monitoring.
            </h1>
            <p className="text-lg" style={{ color: palette.navy }}>
              MyMedQL ingests patient vitals every few seconds, triggers MySQL-backed alerts in under a second, and streams them to a clinician-friendly dashboard. Every threshold, alert, and device assignment is stored for reproducibility.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/roles" className="rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.brand }}>Get Started</Link>
              <button className="rounded-full border px-5 py-3 text-sm font-semibold" style={{ color: palette.brandBright, borderColor: palette.brandBright, backgroundColor: palette.surface }}>See Data Model</button>
              <button className="rounded-full border px-5 py-3 text-sm font-semibold" style={{ color: palette.brandBright, borderColor: palette.brandBright, backgroundColor: palette.surface }}>Launch Demo</button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold" style={{ color: palette.navy }}>
              {['MySQL 8', 'Partitioned vitals', 'RBAC by design', 'WebSocket updates'].map((chip) => (
                <span key={chip} className="rounded-full px-3 py-1" style={{ backgroundColor: palette.surface, border: `1px solid ${palette.border}` }}>{chip}</span>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
              <div className="flex items-center justify-between">
                <div className="font-semibold" style={{ color: palette.navy }}>Live Dashboard</div>
                <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: "#E8F5E9", color: palette.success }}>Online</span>
              </div>
              <div className="mt-4 h-40 rounded-xl p-3 text-xs" style={{ background: `linear-gradient(135deg, ${palette.light}, ${palette.surface})`, color: palette.navy, border: `1px solid ${palette.border}` }}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold" style={{ color: palette.navy }}>HR / SpO2 / BP</span>
                  <span className="font-semibold" style={{ color: palette.brandBright }}>Streaming</span>
                </div>
                <div className="h-28 rounded-lg bg-white shadow-inner" style={{ border: `1px solid ${palette.border}` }} />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm" style={{ borderColor: palette.border }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.success }} />
                    <span className="font-semibold" style={{ color: palette.navy }}>Patient 104</span>
                    <span className="text-xs" style={{ color: palette.navy }}>HR 96 · SpO2 97%</span>
                  </div>
                  <button className="text-xs font-semibold" style={{ color: palette.brandBright }}>View</button>
                </div>
                <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: palette.border, backgroundColor: "#FFF5F5" }}>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.danger }} />
                    <span className="font-semibold" style={{ color: "#C62828" }}>Alert · Tachycardia</span>
                    <span className="text-xs" style={{ color: "#C62828" }}>HR 128 at 14:03</span>
                  </div>
                  <button className="rounded-full bg-white px-2 py-1 text-xs font-semibold" style={{ color: "#C62828", border: `1px solid ${palette.border}` }}>Acknowledge</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section id="features" className="py-14" style={{ backgroundColor: palette.surface }}>
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold" style={{ color: palette.navy }}>Why teams choose MyMedQL</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {valueProps.map((item) => (
                <div key={item.title} className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                  <div className="mb-3 h-10 w-10 rounded-full" style={{ backgroundColor: palette.soft, color: palette.brand }}></div>
                  <h3 className="text-lg font-semibold" style={{ color: palette.navy }}>{item.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: palette.navy }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold" style={{ color: palette.navy }}>How it works</h2>
              <p className="mt-3 text-sm" style={{ color: palette.navy }}>
                Database-first flow: ingest, detect, and visualize with MySQL triggers, partitioned vitals, and WebSocket-powered UI.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {howItWorks.map((item, idx) => (
                <div key={item.title} className={`${sectionCard} p-5`} style={{ borderColor: palette.border }}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: palette.brand }}>
                    <span className="h-6 w-6 rounded-full text-center leading-6" style={{ backgroundColor: palette.soft }}>{idx + 1}</span>
                    {item.title}
                  </div>
                  <p className="text-sm" style={{ color: palette.navy }}>{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases and scenarios */}
        <section id="demo" className="py-14" style={{ backgroundColor: palette.surface }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Use cases</h3>
                <div className="mt-4 space-y-3">
                  {useCases.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3" style={{ borderColor: palette.border }}>
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette.success }} />
                      <span className="text-sm font-semibold" style={{ color: palette.navy }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Demo scenario: stable → deterioration → recovery</h3>
                <div className="mt-4 rounded-2xl border p-6" style={{ background: `linear-gradient(135deg, ${palette.surface}, ${palette.light})`, borderColor: palette.border }}>
                  <div className="flex items-center justify-between text-xs font-semibold" style={{ color: palette.navy }}>
                    <span>Time</span>
                    <span>Alerts</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full" style={{ backgroundColor: palette.border }}>
                    <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: palette.success }} />
                  </div>
                  <div className="mt-4 space-y-3 text-sm" style={{ color: palette.navy }}>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.success }} />
                      Stable vitals streamed every 2s.
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.danger }} />
                      Tachycardia burst triggers alert; dashboard shows banner + acknowledge.
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.brandBright }} />
                      Recovery trend visible in chart; alert resolved after acknowledgment.
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.brand }}>Run Scenario</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data & Security */}
        <section id="docs" className="mx-auto max-w-6xl px-6 py-14">
          <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Data & Security</h3>
                <p className="mt-2 text-sm" style={{ color: palette.navy }}>
                  Built for auditable, performant clinical data flows: indexing, partitioning, RBAC, bcrypt, and encrypted sensitive fields.
                </p>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-2" style={{ color: palette.navy }}>
                {[
                  "MySQL 8, 3NF schema",
                  "Indexes on (patient_id, ts)",
                  "Optional monthly partitioning",
                  "bcrypt + parameterized queries",
                  "Encrypted medical history fields",
                  "RBAC: admin, doctor, nurse, viewer"
                ].map((item) => (
                  <span key={item} className="rounded-xl px-4 py-3" style={{ backgroundColor: palette.light }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14" style={{ backgroundColor: palette.surface }}>
          <div className="mx-auto max-w-6xl px-6">
            <h3 className="text-xl font-bold" style={{ color: palette.navy }}>FAQ</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {faq.map((item) => (
                <div key={item.q} className={`${sectionCard} p-5`} style={{ borderColor: palette.border }}>
                  <div className="text-sm font-semibold" style={{ color: palette.brand }}>{item.q}</div>
                  <p className="mt-2 text-sm" style={{ color: palette.navy }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="rounded-2xl px-8 py-10 text-white" style={{ backgroundColor: palette.brand }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Spin it up in minutes.</h3>
                <p className="mt-2 text-sm" style={{ color: palette.soft }}>
                  Docker Compose brings up MySQL, backend, and frontend with seeded demo data.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold" style={{ color: palette.brand }}>Run with Docker</button>
                <Link href="/roles" className="rounded-full border px-5 py-3 text-sm font-semibold text-white" style={{ borderColor: "#FFFFFF" }}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm md:flex-row md:items-center md:justify-between" style={{ color: palette.navy }}>
          <div>MyMedQL · Real-time patient vital monitoring</div>
          <div className="flex flex-wrap gap-4">
            <a href="#docs" className="hover:text-[#0A5FB5]">Docs</a>
            <a href="#demo" className="hover:text-[#0A5FB5]">Demo</a>
            <a href="#features" className="hover:text-[#0A5FB5]">Features</a>
            <a href="#how" className="hover:text-[#0A5FB5]">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
