"use client";

import { useState } from "react";
import { CostBarChart, ScoreRadarChart, ComponentBreakdownChart } from "@/components/Charts";

const PROVIDER_COLORS = { aws: "#FF9900", azure: "#0078D4", gcp: "#34A853" };

export default function DashboardClient({ recommendations }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? recommendations : recommendations.filter(r => r.appType === filter);
  const appTypes = [...new Set(recommendations.map(r => r.appType))];

  const stats = {
    total: recommendations.length,
    avgBudget: recommendations.length > 0 ? (recommendations.reduce((s, r) => s + r.budget, 0) / recommendations.length).toFixed(0) : 0,
    topProvider: recommendations.length > 0 ? (() => {
      const counts = {};
      recommendations.forEach(r => { counts[r.topPick] = (counts[r.topPick] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    })() : "N/A",
  };
  const providerNames = { aws: "AWS", azure: "Azure", gcp: "GCP" };

  if (selected) {
    const rec = selected;
    const results = rec.results || [];
    return (
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#6B7280", fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
          ← Back to History
        </button>

        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 36px", boxShadow: "0 4px 30px rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.1)", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 6 }}>{rec.appLabel}</h2>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#EEF2FF", color: "#4F46E5" }}>{rec.users >= 1000 ? `${(rec.users / 1000).toFixed(1)}K` : rec.users} DAU</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#F0FDF4", color: "#166534" }}>{rec.growthLabel}</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: "#FFF7ED", color: "#C2410C" }}>${rec.budget}/mo budget</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{new Date(rec.createdAt).toISOString().split("T")[0]}</div>
              <div style={{ marginTop: 6, fontWeight: 800, fontSize: 18, color: PROVIDER_COLORS[rec.topPick] || "#111" }}>🏆 {rec.topPickName}</div>
              <div style={{ fontSize: 12, color: "#6B7280" }}>${rec.topCost.toFixed(2)}/mo</div>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 12, marginTop: 32 }}>💰 Cost Comparison</h3>
          <CostBarChart results={results} />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 12, marginTop: 32 }}>📊 Provider Scores</h3>
          <ScoreRadarChart results={results} />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 12, marginTop: 32 }}>🔧 Component Breakdown</h3>
          <ComponentBreakdownChart results={results} />
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Recommendations", value: stats.total, icon: "📋", bg: "#EEF2FF", color: "#4F46E5" },
          { label: "Avg Budget", value: `$${stats.avgBudget}/mo`, icon: "💰", bg: "#FFF7ED", color: "#C2410C" },
          { label: "Most Picked Provider", value: providerNames[stats.topProvider] || stats.topProvider, icon: "🏆", bg: "#F0FDF4", color: "#166534" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
              <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>Recommendation History</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setFilter("all")} style={{ padding: "6px 16px", borderRadius: 20, border: filter === "all" ? "2px solid #4F46E5" : "2px solid #E5E7EB", background: filter === "all" ? "#4F46E5" : "#fff", color: filter === "all" ? "#fff" : "#6B7280", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>All</button>
          {appTypes.map(t => {
            const labels = { web_app: "Web App", api_backend: "API", ml_pipeline: "ML", data_warehouse: "Data" };
            return (
              <button key={t} onClick={() => setFilter(t)} style={{ padding: "6px 16px", borderRadius: 20, border: filter === t ? "2px solid #4F46E5" : "2px solid #E5E7EB", background: filter === t ? "#4F46E5" : "#fff", color: filter === t ? "#fff" : "#6B7280", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>{labels[t] || t}</button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20, border: "1px solid #E5E7EB" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#374151", marginBottom: 8 }}>No recommendations yet</div>
          <div style={{ color: "#6B7280", fontSize: 14, marginBottom: 20 }}>Go make your first cloud architecture recommendation!</div>
          <a href="/" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 12, background: "#4F46E5", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Get Started →</a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(rec => (
            <button key={rec.id} onClick={() => setSelected(rec)} style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "2px solid #E5E7EB", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: PROVIDER_COLORS[rec.topPick] + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: PROVIDER_COLORS[rec.topPick] }}>
                    {rec.topPickName?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#111", marginBottom: 4 }}>{rec.appLabel}</div>
                    <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#6B7280" }}>
                      <span>{rec.users >= 1000 ? `${(rec.users / 1000).toFixed(1)}K` : rec.users} DAU</span>
                      <span>·</span>
                      <span>{rec.growthLabel}</span>
                      <span>·</span>
                      <span>${rec.budget}/mo</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: PROVIDER_COLORS[rec.topPick] }}>{rec.topPickName} — ${rec.topCost.toFixed(2)}/mo</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{new Date(rec.createdAt).toISOString().split("T")[0]}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
