"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Animated ECG Waveform Component with realistic heartbeat pattern
function EcgWaveform() {
  // Dynamic heart rate state - fluctuates to simulate real monitoring
  const [heartRate, setHeartRate] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [ecgPath, setEcgPath] = useState('');
  const [pathKey, setPathKey] = useState(0); // Force re-render of path

  // Generate random ECG pattern with variations
  const generateEcgPath = () => {
    let path = 'M0,35';
    const baseY = 35;
    let x = 0;

    // Generate 10 heartbeat cycles with random variations
    for (let beat = 0; beat < 10; beat++) {
      // Random variations for each beat
      const spikeUp = 5 + Math.random() * 12;      // QRS spike up (5-17 units up from baseline)
      const spikeDown = 15 + Math.random() * 10;   // QRS spike down (15-25 units down from baseline)
      const pWaveHeight = 2 + Math.random() * 3;   // P wave height variation
      const tWaveHeight = 4 + Math.random() * 5;   // T wave height variation
      const beatWidth = 40 + Math.random() * 15;   // Variable beat spacing (40-55 units)
      const noiseAmount = () => (Math.random() - 0.5) * 2; // Small baseline noise

      // Baseline with slight noise before P wave
      path += ` L${x + 2},${baseY + noiseAmount()}`;
      path += ` L${x + 4},${baseY + noiseAmount()}`;

      // P wave (small bump)
      path += ` L${x + 6},${baseY + noiseAmount()}`;
      path += ` Q${x + 9},${baseY - pWaveHeight} ${x + 12},${baseY + noiseAmount()}`;

      // PR segment (flat with noise)
      path += ` L${x + 15},${baseY + noiseAmount()}`;
      path += ` L${x + 17},${baseY + noiseAmount()}`;

      // QRS Complex - the sharp spike!
      path += ` L${x + 18},${baseY + 2 + noiseAmount()}`; // Small dip (Q)
      path += ` L${x + 20},${baseY - spikeUp}`;           // Sharp spike UP (R)
      path += ` L${x + 22},${baseY + spikeDown}`;         // Sharp spike DOWN (S)
      path += ` L${x + 24},${baseY - 5 + noiseAmount()}`; // Recovery
      path += ` L${x + 26},${baseY + noiseAmount()}`;     // Back to baseline

      // ST segment (short flat)
      path += ` L${x + 30},${baseY + noiseAmount()}`;

      // T wave (rounded bump)
      path += ` Q${x + 35},${baseY - tWaveHeight} ${x + 40},${baseY + noiseAmount()}`;

      // Baseline until next beat
      path += ` L${x + beatWidth},${baseY + noiseAmount()}`;

      x += beatWidth;
    }

    return path;
  };

  useEffect(() => {
    // Generate initial ECG path
    setEcgPath(generateEcgPath());

    // Regenerate ECG pattern every 3 seconds for dynamic variation
    const ecgInterval = setInterval(() => {
      setEcgPath(generateEcgPath());
      setPathKey(prev => prev + 1);
    }, 3000);

    // Change heart rate every 2 seconds to simulate fluctuation
    const hrInterval = setInterval(() => {
      // Generate realistic heart rate variations (68-108 BPM range with occasional spikes)
      const variations = [68, 70, 72, 74, 76, 78, 80, 82, 85, 88, 92, 96, 102, 108];
      const randomHR = variations[Math.floor(Math.random() * variations.length)];
      setHeartRate(randomHR);

      // SpO2 stays more stable (96-99%)
      const spo2Values = [96, 97, 97, 98, 98, 98, 99, 99];
      setSpo2(spo2Values[Math.floor(Math.random() * spo2Values.length)]);
    }, 2000);

    return () => {
      clearInterval(ecgInterval);
      clearInterval(hrInterval);
    };
  }, []);

  // Determine heart rate color based on value
  const getHRColor = (hr) => {
    if (hr >= 100) return '#FF5252'; // Red for high
    if (hr >= 90) return '#FFD54F';  // Yellow for elevated
    return '#00E676';                 // Green for normal
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#0a1628]" style={{ border: '1px solid #1e3a5f' }}>
      {/* Grid lines */}
      <svg className="absolute inset-0 h-full w-full opacity-15">
        <defs>
          <pattern id="gridSmall" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#4FC3F7" strokeWidth="0.3" />
          </pattern>
          <pattern id="gridLarge" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#4FC3F7" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gridSmall)" />
        <rect width="100%" height="100%" fill="url(#gridLarge)" />
      </svg>

      {/* ECG Line Animation */}
      <div className="absolute inset-0 flex items-center">
        <svg
          key={pathKey}
          className="animate-ecg-scroll"
          viewBox="0 0 500 70"
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '200%', height: '85%' }}
        >
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* ECG waveform with glow effect */}
          <path
            d={ecgPath}
            fill="none"
            stroke={getHRColor(heartRate)}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
        </svg>
      </div>

      {/* Vital signs overlay */}
      <div className="absolute bottom-2 left-3 flex items-center gap-4 text-xs font-mono">
        <span style={{ color: getHRColor(heartRate) }}>♥ {heartRate} BPM</span>
        <span style={{ color: '#4FC3F7' }}>SpO2 {spo2}%</span>
        <span style={{ color: '#FFD54F' }}>BP 120/80</span>
      </div>

      {/* Heart rate number display */}
      <div
        className="absolute top-2 right-3 font-mono text-lg font-bold transition-all duration-300"
        style={{ color: getHRColor(heartRate) }}
      >
        {heartRate}
      </div>
    </div>
  );
}

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
    title: 'Reliable monitoring you can trust',
    body: 'Patient data is recorded consistently and accurately, so alerts and vital trends can be reviewed with confidence at any time.'
  },
  {
    title: 'Flexible alerts for each patient',
    body: 'Set safe ranges for vital signs globally or per patient, with clear alerts that staff can acknowledge and follow up on.'
  },
  {
    title: 'Designed for training and demonstration',
    body: 'Supports realistic monitoring scenarios to help teams understand alert behavior and system responses.'
  }
];

const howItWorks = [
  { title: 'Collect vital signs', body: 'Monitoring devices regularly send patient vital signs to the system.' },
  { title: 'Detect potential issues', body: 'Vital signs are automatically checked against safe ranges, and alerts are created when values become abnormal.' },
  { title: 'View updates in real time', body: 'Live dashboards show current vital signs and alerts so staff can respond quickly.' }
];

const useCases = [
  'Hospital & ward monitoring',
  'Remote patient monitoring',
  'Training & system demonstration'
];

const faq = [
  {
    q: 'How are alerts generated?',
    a: 'Alerts are created automatically when vital signs go outside safe ranges, helping staff respond quickly to changes in patient condition.'
  },
  {
    q: 'What user roles are supported?',
    a: 'The system supports different access levels for administrators, clinicians, and viewers to ensure appropriate data access.'
  },
  {
    q: 'How responsive is the system?',
    a: 'Vital signs and alerts update in near real time, allowing timely monitoring and intervention.'
  },
  {
    q: 'Can I try it on my own computer?',
    a: 'Yes. You can run a full demo locally to explore the system and its features.'
  }
];

const sectionCard = "rounded-2xl border bg-white shadow-sm";

export default function Page() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: palette.light, color: palette.navy }}>
      <header className="border-b bg-white" style={{ borderColor: palette.border }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
          <img src="/MedQL_Modern_Clinical_Logo_White.png" alt="MyMedQL" className="h-40 w-auto" />
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
        <section id="product" className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-24 pb-16 md:flex-row md:items-center md:gap-14">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: palette.soft, color: palette.brand }}>
              Continuous monitoring · Clear alerts · Reliable records
            </p>
            <h1 className="text-3xl font-bold leading-tight md:text-4xl" style={{ color: palette.navy }}>
              Real-time vital monitoring for safer patient care
            </h1>
            <p className="text-lg" style={{ color: palette.navy }}>
              MyMedQL continuously tracks patient vital signs and notifies healthcare staff when readings move outside safe ranges. Live dashboards and clear alerts help teams act quickly, while keeping a reliable record of patient data over time.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/roles" className="rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.brand }}>Get Started</Link>
              <button className="rounded-full border px-5 py-3 text-sm font-semibold" style={{ color: palette.brandBright, borderColor: palette.brandBright, backgroundColor: palette.surface }}>Try Live Demo</button>
            </div>
            <div className="flex flex-wrap gap-4 text-xs font-semibold" style={{ color: palette.navy }}>
              {['Continuous Monitoring', 'Early Warning Alerts', 'Staff & Patient Access', 'Privacy-focused Design'].map((chip) => (
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
                  <span className="font-semibold" style={{ color: palette.brandBright }}>Live</span>
                </div>
                <EcgWaveform />
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
        </section >

        {/* Value Props */}
        < section id="features" className="py-14" style={{ backgroundColor: palette.surface }
        }>
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold" style={{ color: palette.navy }}>Why choose MyMedQL</h2>
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
        </section >

        {/* How it works */}
        < section id="how" className="mx-auto max-w-6xl px-6 py-14" >
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold" style={{ color: palette.navy }}>How it works</h2>
              <p className="mt-3 text-sm" style={{ color: palette.navy }}>
                MyMedQL continuously collects vital signs, checks them against safe ranges, and displays updates and alerts in real time.
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
        </section >

        {/* Use cases and scenarios */}
        < section id="demo" className="py-14" style={{ backgroundColor: palette.surface }}>
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
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Example patient monitoring timeline</h3>
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
                      Normal vital signs are monitored continuously
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.danger }} />
                      An abnormal heart rate triggers an alert for staff
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: palette.brandBright }} />
                      Vitals return to normal and the alert is resolved
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold text-white" style={{ backgroundColor: palette.brand }}>Run Scenario</button>
                </div>
              </div>
            </div>
          </div>
        </section >

        {/* Data & Security */}
        < section id="docs" className="mx-auto max-w-6xl px-6 py-14" >
          <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-xl">
                <h3 className="text-xl font-bold" style={{ color: palette.navy }}>Data & Security</h3>
                <p className="mt-2 text-sm" style={{ color: palette.navy }}>
                  Patient data is protected with strong security measures and access controls. Only authorized users can view sensitive information, and all activity is recorded responsibly.
                </p>
              </div>
              <div className="grid gap-3 text-sm md:grid-cols-2" style={{ color: palette.navy }}>
                {[
                  "Encrypted patient data",
                  "Role-based access",
                  "Secure login and authentication",
                  "Audit-friendly records",
                  "Privacy-focused design",
                  "Authorized staff access only"
                ].map((item) => (
                  <span key={item} className="rounded-xl px-4 py-3" style={{ backgroundColor: palette.light }}>{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section >

        {/* About Us */}
        <section id="about" className="py-14" style={{ backgroundColor: palette.surface }}>
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-10 text-center">
              <span className="inline-block rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: palette.soft, color: palette.brand }}>Built by students. Designed for care.</span>
              <h2 className="mt-3 text-3xl font-bold" style={{ color: palette.navy }}>About Us</h2>
            </div>

            {/* Vision and Mission Cards */}
            <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="goal">🎯</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>Our Goal</h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.navy }}>
                  MyMedQL is a student-built healthcare project created with one clear goal: to make patient monitoring clearer, safer, and more accessible for both patients and healthcare staff.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="philosophy">💡</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>Philosophy</h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.navy }}>
                  We believe technology should support care—not complicate it. That’s why MyMedQL focuses on presenting vital health information in a simple, understandable way, helping staff respond quickly.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="team">🤝</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>The Team</h3>
                <p className="text-sm leading-relaxed" style={{ color: palette.navy }}>
                  This project was developed by a small, multidisciplinary team of students interested in healthcare, technology, and social impact. Each member contributed to shaping MyMedQL into a meaningful application.
                </p>
              </div>

              <div className={`${sectionCard} p-6`} style={{ borderColor: palette.border }}>
                <div className="mb-3">
                  <span className="block text-2xl" role="img" aria-label="design">✨</span>
                </div>
                <h3 className="mb-2 font-bold" style={{ color: palette.navy }}>Our Design</h3>
                <p className="text-sm italic leading-relaxed" style={{ color: palette.brand }}>
                  "Together, we designed MyMedQL as a practical learning project and a concept system that demonstrates how thoughtful software design can support patient care and clinical decision-making."
                </p>
              </div>
            </div>

            {/* Team Marquee */}
            <div className="overflow-hidden">
              <h3 className="mb-6 text-center text-xl font-bold" style={{ color: palette.navy }}>Meet the Team behind MyMedQL</h3>
              <div className="relative w-full mask-gradient">
                <div className="flex w-max gap-6 hover:pause-on-hover animate-scroll">
                  {[
                    { name: "Cao Pham Minh Dang", role: "Backend Developer" },
                    { name: "Ngo Dinh Khanh", role: "Frontend Developer" },
                    { name: "Pham Dinh Hieu", role: "Database Engineer" },
                    { name: "Nguyen Anh Duc", role: "DevOps / QA" },
                    // Duplicate for seamless loop
                    { name: "Cao Pham Minh Dang", role: "Backend Developer" },
                    { name: "Ngo Dinh Khanh", role: "Frontend Developer" },
                    { name: "Pham Dinh Hieu", role: "Database Engineer" },
                    { name: "Nguyen Anh Duc", role: "DevOps / QA" }
                  ].map((member, idx) => (
                    <div key={idx} className={`${sectionCard} w-64 flex-shrink-0 p-5 transition hover:shadow-md`} style={{ borderColor: palette.border }}>
                      <div className="h-10 w-10 rounded-full mb-3 flex items-center justify-center text-sm font-bold" style={{ backgroundColor: palette.light, color: palette.brand }}>
                        {member.name.charAt(0)}
                      </div>
                      <div className="font-bold truncate" style={{ color: palette.navy }}>{member.name}</div>
                      <div className="text-xs mt-1 font-semibold" style={{ color: palette.brandBright }}>{member.role}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        < section className="py-14" >
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
        </section >

        {/* CTA */}
        < section className="mx-auto max-w-6xl px-6 pb-16" >
          <div className="rounded-2xl px-8 py-10 text-white" style={{ backgroundColor: palette.brand }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold">Spin it up in minutes.</h3>
                <p className="mt-2 text-sm" style={{ color: palette.soft }}>
                  Start a complete demo environment in minutes with everything preconfigured.
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
        </section >
      </main >

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
    </div >
  );
}
