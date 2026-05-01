"use client";

import { useState } from "react";
import { CostBarChart, ScoreRadarChart, ComponentBreakdownChart } from "@/components/Charts";

const PROVIDERS = {
  aws: { name: "Amazon Web Services", short: "AWS", color: "#FF9900", bg: "#FFF8ED", logo: "☁" },
  azure: { name: "Microsoft Azure", short: "Azure", color: "#0078D4", bg: "#EEF6FF", logo: "⬡" },
  gcp: { name: "Google Cloud", short: "GCP", color: "#34A853", bg: "#EEF9EE", logo: "◈" },
};

const APP_TYPES = [
  { id: "web_app", label: "Web Application", icon: "🌐", desc: "Full-stack web app with frontend & backend" },
  { id: "api_backend", label: "API Backend", icon: "⚡", desc: "REST/GraphQL API service" },
  { id: "ml_pipeline", label: "ML Pipeline", icon: "🤖", desc: "Machine learning model training & inference" },
  { id: "data_warehouse", label: "Data Warehouse", icon: "🗄️", desc: "Analytics & big data processing" },
];

const GROWTH_OPTIONS = [
  { id: "none", label: "No Growth", icon: "→", desc: "Stable usage expected", mult: 0 },
  { id: "low", label: "Low Growth", icon: "↗", desc: "+15% cost buffer", mult: 15 },
  { id: "medium", label: "Medium Growth", icon: "⬈", desc: "+30% cost buffer", mult: 30 },
  { id: "high", label: "High Growth", icon: "🚀", desc: "+50% cost buffer", mult: 50 },
];

const GROWTH_MULT = { none: 0, low: 0.15, medium: 0.30, high: 0.50 };

const PRICING = {
  aws: {
    compute:       { small: 17, medium: 35, large: 65, serverless: 9.2,  name: { small: "EC2 t3.small", medium: "EC2 t3.medium", large: "EC2 t3.large", serverless: "Lambda + API GW" } },
    database:      { small: 30, medium: 45, large: 80,                   name: { small: "RDS t3.small", medium: "RDS t3.medium", large: "RDS t3.large" } },
    storage:       { standard: 11.5,                                     name: { standard: "S3 Standard" } },
    cdn:           { standard: 10,                                        name: { standard: "CloudFront" } },
    load_balancer: { standard: 18,                                        name: { standard: "ALB" } },
    scale: 0.82, sla: 99.99,
  },
  azure: {
    compute:       { small: 18.5, medium: 37.5, large: 67, serverless: 10.4, name: { small: "VM B1ms", medium: "VM B2s", large: "VM B4ms", serverless: "Azure Functions" } },
    database:      { small: 32,   medium: 48.2, large: 85,                   name: { small: "SQL Basic", medium: "SQL S2", large: "SQL S4" } },
    storage:       { standard: 12.1,                                          name: { standard: "Blob Storage" } },
    cdn:           { standard: 9.8,                                           name: { standard: "Azure CDN" } },
    load_balancer: { standard: 19.2,                                          name: { standard: "Azure LB" } },
    scale: 0.80, sla: 99.99,
  },
  gcp: {
    compute:       { small: 15, medium: 33.2, large: 60, serverless: 8.8, name: { small: "e2-small", medium: "e2-medium", large: "e2-standard-2", serverless: "Cloud Functions" } },
    database:      { small: 28, medium: 43.8, large: 75,                  name: { small: "Cloud SQL micro", medium: "Cloud SQL small", large: "Cloud SQL n1-s2" } },
    storage:       { standard: 10.8,                                       name: { standard: "Cloud Storage" } },
    cdn:           { standard: 9.5,                                        name: { standard: "Cloud CDN" } },
    load_balancer: { standard: 17.4,                                       name: { standard: "Cloud LB" } },
    scale: 0.83, sla: 99.99,
  },
};

function getComponents(appType, users) {
  const isServerless = appType === "api_backend" && users < 1000;
  const computeTier = users < 1000 ? (isServerless ? "serverless" : "small") : users < 10000 ? "medium" : "large";
  const dbTier      = users < 5000 ? "small" : users < 50000 ? "medium" : "large";
  const comps = [
    { type: "compute",  tier: computeTier },
    { type: "database", tier: dbTier },
    { type: "storage",  tier: "standard" },
  ];
  if (appType === "web_app" || appType === "data_warehouse" || users >= 5000) {
    comps.push({ type: "cdn",           tier: "standard" });
    comps.push({ type: "load_balancer", tier: "standard" });
  }
  return comps;
}

function calcResults(appType, users, growth, budget) {
  const comps = getComponents(appType, users);
  const mult  = GROWTH_MULT[growth] ?? 0;
  const results = Object.entries(PRICING).map(([pid, pdata]) => {
    let total = 0;
    const items = comps.map(c => {
      const cost     = pdata[c.type]?.[c.tier] ?? 0;
      const svcName  = pdata[c.type]?.name?.[c.tier] ?? c.type;
      total += cost;
      return { component: c.type, tier: c.tier, service: svcName, cost };
    });
    const adj = total * (1 + mult);
    return { provider: pid, total, adj, items, scale: pdata.scale, sla: pdata.sla, fits: adj <= budget };
  });

  const eligible = results.filter(r => r.fits && r.total > 0);
  const costs    = eligible.map(r => r.adj);
  const minC     = Math.min(...costs), maxC = Math.max(...costs);
  return results.map(r => {
    if (!r.fits || r.total === 0) return { ...r, score: 0 };
    const rank  = maxC === minC ? 0 : (r.adj - minC) / (maxC - minC);
    const score = 0.5 * (1 - rank) + 0.3 * r.scale + 0.2 * ((r.sla - 99) / 1);
    return { ...r, score };
  }).sort((a, b) => b.score - a.score);
}

// ─── Step indicator ────────────────────────────────────────────
function Steps({ current }) {
  const steps = ["App Type", "Scale", "Budget", "Results"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: i < current ? "#1a1a2e" : i === current ? "#4F46E5" : "#E5E7EB",
              color: i <= current ? "#fff" : "#9CA3AF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, transition: "all 0.3s",
              boxShadow: i === current ? "0 0 0 4px rgba(79,70,229,0.2)" : "none",
            }}>
              {i < current ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: i === current ? "#4F46E5" : "#9CA3AF", whiteSpace: "nowrap" }}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? "#1a1a2e" : "#E5E7EB", margin: "0 8px", marginBottom: 22, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Card picker ───────────────────────────────────────────────
function CardPicker({ options, value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
      {options.map(opt => {
        const sel = value === opt.id;
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)} style={{
            background: sel ? "#1a1a2e" : "#fff",
            border: sel ? "2px solid #4F46E5" : "2px solid #E5E7EB",
            borderRadius: 14, padding: "20px 18px", cursor: "pointer",
            textAlign: "left", transition: "all 0.2s",
            boxShadow: sel ? "0 4px 20px rgba(79,70,229,0.2)" : "0 1px 4px rgba(0,0,0,0.06)",
            transform: sel ? "translateY(-2px)" : "none",
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{opt.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: sel ? "#fff" : "#111", marginBottom: 5 }}>{opt.label}</div>
            <div style={{ fontSize: 12, color: sel ? "rgba(255,255,255,0.7)" : "#6B7280", lineHeight: 1.4 }}>{opt.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Slider input ──────────────────────────────────────────────
function SliderInput({ value, onChange, min, max, step, format }) {
  const pct = ((Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 100;
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: "#4F46E5", fontFamily: "monospace" }}>
          {format(value)}
        </span>
      </div>
      <input type="range" min={Math.log(min)} max={Math.log(max)} step={0.01}
        value={Math.log(value)}
        onChange={e => onChange(Math.round(Math.exp(parseFloat(e.target.value))))}
        style={{ width: "100%", accentColor: "#4F46E5", height: 6 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>
        <span>{format(min)}</span><span>{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Provider result card ──────────────────────────────────────
function ProviderCard({ result, rank }) {
  const [open, setOpen] = useState(false);
  const p   = PROVIDERS[result.provider];
  const top = rank === 0;

  return (
    <div style={{
      border: top ? `2px solid ${p.color}` : "2px solid #E5E7EB",
      borderRadius: 18, overflow: "hidden",
      boxShadow: top ? `0 8px 32px ${p.color}30` : "0 2px 8px rgba(0,0,0,0.06)",
      background: "#fff", marginBottom: 16,
      transform: top ? "scale(1.01)" : "none",
      opacity: result.fits ? 1 : 0.5,
    }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", background: top ? p.bg : "#FAFAFA", display: "flex", alignItems: "center", gap: 16 }}>
        {top && (
          <div style={{ background: p.color, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 20, letterSpacing: 1 }}>
            ★ TOP PICK
          </div>
        )}
        <div style={{ fontSize: 32 }}>{p.logo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#111" }}>{p.name}</div>
          <div style={{ fontSize: 13, color: "#6B7280" }}>
            Score: {(result.score * 100).toFixed(1)} · SLA {result.sla}% · Scale {(result.scale * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 24, color: p.color }}>${result.adj.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: "#9CA3AF" }}>growth-adjusted/mo</div>
          <div style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>${result.total.toFixed(2)} base/mo</div>
        </div>
      </div>

      {/* Budget bar */}
      {result.fits && (
        <div style={{ padding: "0 24px 0" }}>
          <div style={{ height: 4, background: "#F3F4F6", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (result.adj / (result.adj * 1.5)) * 100)}%`, background: p.color, borderRadius: 2 }} />
          </div>
        </div>
      )}

      {/* Toggle line items */}
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: "12px 24px", background: "none", border: "none",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 13, color: "#6B7280", fontWeight: 600,
      }}>
        <span>View component breakdown</span>
        <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: "0 24px 20px", borderTop: "1px solid #F3F4F6" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 12 }}>
            <thead>
              <tr style={{ color: "#9CA3AF", textTransform: "uppercase", fontSize: 11 }}>
                <th style={{ textAlign: "left", paddingBottom: 8, fontWeight: 700 }}>Component</th>
                <th style={{ textAlign: "left", paddingBottom: 8, fontWeight: 700 }}>Service</th>
                <th style={{ textAlign: "right", paddingBottom: 8, fontWeight: 700 }}>$/mo</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map(item => (
                <tr key={item.component} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: "8px 0", color: "#374151", textTransform: "capitalize", fontWeight: 600 }}>
                    {item.component.replace("_", " ")}
                  </td>
                  <td style={{ padding: "8px 0", color: "#6B7280" }}>{item.service}</td>
                  <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 700, color: "#111" }}>${item.cost.toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid #E5E7EB" }}>
                <td colSpan={2} style={{ padding: "10px 0", fontWeight: 800, color: "#111" }}>Total (base)</td>
                <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 800, color: "#111" }}>${result.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────
export default function CloudRecommender() {
  const [step, setStep]       = useState(0);
  const [appType, setAppType] = useState("");
  const [users, setUsers]     = useState(1000);
  const [growth, setGrowth]   = useState("");
  const [budget, setBudget]   = useState(150);
  const [results, setResults] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  function handleGetRec() {
    const r = calcResults(appType, users, growth, budget);
    setResults(r);
    setStep(3);
    setSaved(false);
  }

  async function handleSave() {
    if (!results || saving || saved) return;
    setSaving(true);
    const topResult = results.find(r => r.fits);
    try {
      await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appType, users, growth, budget, results,
          topPick: topResult?.provider || "none",
          topCost: topResult?.adj || 0,
        }),
      });
      setSaved(true);
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  function reset() {
    setStep(0); setAppType(""); setGrowth(""); setUsers(1000); setBudget(150); setResults(null); setSaved(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 50%, #F0F9FF 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ background: "#1a1a2e", color: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>☁</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>CloudRec</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: -2 }}>Cloud Architecture Advisor</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="/dashboard" style={{ color: "#A78BFA", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>📊 Dashboard</a>
          {["AWS", "Azure", "GCP"].map(p => (
            <span key={p} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>{p}</span>
          ))}
        </div>
      </header>

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }}>

        {/* Hero — only on step 0 before any choice */}
        {step === 0 && !appType && (
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>☁️</div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: "#1a1a2e", letterSpacing: -1.5, marginBottom: 12, lineHeight: 1.1 }}>
              Find Your Ideal<br />
              <span style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Cloud Architecture
              </span>
            </h1>
            <p style={{ color: "#6B7280", fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              Answer 3 questions. Get a cost-optimized, growth-aware recommendation across AWS, Azure, and GCP — no cloud expertise needed.
            </p>
          </div>
        )}

        {/* Wizard card */}
        <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 4px 40px rgba(79,70,229,0.08)", padding: "40px 40px", border: "1px solid rgba(79,70,229,0.1)" }}>

          <Steps current={step} />

          {/* Step 0: App type */}
          {step === 0 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8 }}>What are you building?</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>Choose the type that best describes your application.</p>
              <CardPicker options={APP_TYPES} value={appType} onChange={v => { setAppType(v); setTimeout(() => setStep(1), 250); }} />
            </div>
          )}

          {/* Step 1: Scale & growth */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8 }}>Expected scale & growth</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 32 }}>How many daily active users at launch, and how fast will you grow?</p>

              <div style={{ marginBottom: 36 }}>
                <label style={{ fontWeight: 700, fontSize: 14, color: "#374151", display: "block", marginBottom: 16 }}>Daily Active Users at Launch</label>
                <SliderInput value={users} onChange={setUsers} min={100} max={500000} step={1} format={n => n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : `${n}`} />
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: 14, color: "#374151", display: "block", marginBottom: 16 }}>Growth Trajectory (next 12 months)</label>
                <CardPicker options={GROWTH_OPTIONS} value={growth} onChange={setGrowth} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
                <button onClick={() => setStep(0)} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#374151", fontSize: 14 }}>← Back</button>
                <button onClick={() => setStep(2)} disabled={!growth} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: growth ? "#4F46E5" : "#E5E7EB", color: growth ? "#fff" : "#9CA3AF", cursor: growth ? "pointer" : "not-allowed", fontWeight: 700, fontSize: 14 }}>Next →</button>
              </div>
            </div>
          )}

          {/* Step 2: Budget */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8 }}>Monthly cloud budget</h2>
              <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 32 }}>Set your maximum monthly spend. Growth adjustment is already applied to results.</p>

              <SliderInput value={budget} onChange={setBudget} min={10} max={2000} step={1} format={n => `$${n}`} />

              <div style={{ marginTop: 28, padding: "16px 20px", background: "#F0F9FF", borderRadius: 14, border: "1px solid #BAE6FD", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#0369A1", marginBottom: 4 }}>Quick Summary</div>
                  <div style={{ fontSize: 13, color: "#0284C7", lineHeight: 1.5 }}>
                    <strong>{APP_TYPES.find(a => a.id === appType)?.label}</strong> · <strong>{users >= 1000 ? `${(users / 1000).toFixed(1)}K` : users} DAU</strong> · <strong>{GROWTH_OPTIONS.find(g => g.id === growth)?.label}</strong> growth
                    <br />Budget: <strong>${budget}/month</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32 }}>
                <button onClick={() => setStep(1)} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#374151", fontSize: 14 }}>← Back</button>
                <button onClick={handleGetRec} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 15, boxShadow: "0 4px 16px rgba(79,70,229,0.3)" }}>
                  Get Recommendation ✦
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && results && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 4 }}>Your Recommendations</h2>
                  <p style={{ color: "#6B7280", fontSize: 13 }}>
                    {APP_TYPES.find(a => a.id === appType)?.label} · {users >= 1000 ? `${(users / 1000).toFixed(1)}K` : users} DAU · {GROWTH_OPTIONS.find(g => g.id === growth)?.label} growth · ${budget}/mo budget
                  </p>
                </div>
                <button onClick={reset} style={{ padding: "10px 20px", borderRadius: 12, border: "2px solid #E5E7EB", background: "#fff", cursor: "pointer", fontWeight: 700, color: "#374151", fontSize: 13 }}>
                  ↺ Start Over
                </button>
              </div>

              {results.filter(r => r.fits).length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#EF4444" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Budget Too Low</div>
                  <div style={{ color: "#6B7280", fontSize: 14 }}>No providers fit within ${budget}/month with {GROWTH_OPTIONS.find(g => g.id === growth)?.mult}% growth buffer. Try increasing your budget.</div>
                </div>
              )}

              {results.map((r, i) => <ProviderCard key={r.provider} result={r} rank={r.fits ? results.filter(x => x.fits).indexOf(r) : 99} />)}

              {/* Cost comparison mini-chart */}
              {results.filter(r => r.fits).length > 0 && (
                <div style={{ marginTop: 24, padding: "20px 24px", background: "#F8F7FF", borderRadius: 16, border: "1px solid #E5E7EB" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 16 }}>Cost Comparison (Growth-Adjusted)</div>
                  {results.filter(r => r.fits).map(r => {
                    const p    = PROVIDERS[r.provider];
                    const maxA = Math.max(...results.filter(x => x.fits).map(x => x.adj));
                    const pct  = (r.adj / maxA) * 100;
                    return (
                      <div key={r.provider} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
                          <span style={{ color: "#374151" }}>{p.short}</span>
                          <span style={{ color: p.color }}>${r.adj.toFixed(2)}/mo</span>
                        </div>
                        <div style={{ height: 8, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: p.color, borderRadius: 4, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Charts */}
              {results.filter(r => r.fits).length > 0 && (
                <>
                  <div style={{ marginTop: 32, background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 16 }}>💰 Cost Comparison</h3>
                    <CostBarChart results={results} />
                  </div>
                  <div style={{ marginTop: 16, background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 16 }}>📊 Provider Scores</h3>
                    <ScoreRadarChart results={results} />
                  </div>
                  <div style={{ marginTop: 16, background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 16 }}>🔧 Component Breakdown</h3>
                    <ComponentBreakdownChart results={results} />
                  </div>
                </>
              )}

              {/* Architecture note */}
              <div style={{ marginTop: 20, padding: "16px 20px", background: "#F0FDF4", borderRadius: 14, border: "1px solid #BBF7D0", fontSize: 13, color: "#166534" }}>
                <strong>Components selected for your workload:</strong>{" "}
                {getComponents(appType, users).map(c => c.type.replace("_", " ")).join(" · ")}
              </div>

              {/* Save & Dashboard buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={handleSave} disabled={saving || saved} style={{ flex: 1, padding: "14px 24px", borderRadius: 12, border: "none", background: saved ? "#10B981" : "linear-gradient(135deg, #4F46E5, #7C3AED)", color: "#fff", cursor: saving || saved ? "default" : "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.3s" }}>
                  {saved ? "✓ Saved to Dashboard" : saving ? "Saving..." : "💾 Save Recommendation"}
                </button>
                {saved && (
                  <a href="/dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 24px", borderRadius: 12, border: "2px solid #4F46E5", background: "#fff", color: "#4F46E5", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                    View Dashboard →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 12, marginTop: 32, lineHeight: 1.6 }}>
          Prices are approximate estimates based on standard on-demand rates. Actual costs may vary.
          <br />Data sourced from AWS, Azure, and GCP public pricing pages.
        </p>
      </main>
    </div>
  );
}
