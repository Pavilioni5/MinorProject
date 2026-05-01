"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CostBarChart, ScoreRadarChart, ComponentBreakdownChart } from "@/components/Charts";
import { useTheme, ThemeToggle } from "@/components/ThemeProvider";

const PROVIDER_COLORS = { aws: "#FF9900", azure: "#0078D4", gcp: "#34A853" };

export default function DashboardClient({ recommendations: initialRecs }) {
  const [recommendations, setRecommendations] = useState(initialRecs);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);
  const { theme } = useTheme();
  const router = useRouter();

  const filtered = filter === "all" ? recommendations : recommendations.filter(r => r.appType === filter);
  const appTypes = [...new Set(recommendations.map(r => r.appType))];

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm("Delete this recommendation?")) return;
    setDeleting(id);
    try {
      await fetch("/api/recommendations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setRecommendations(prev => prev.filter(r => r.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e) { console.error(e); }
    setDeleting(null);
  }

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
        <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: theme.textSecondary, fontWeight: 600, fontSize: 14, marginBottom: 24 }}>
          ← Back to History
        </button>

        <div style={{ background: theme.cardBg, borderRadius: 20, padding: "32px 36px", boxShadow: theme.shadow, border: "1px solid " + theme.cardBorder, marginBottom: 24, transition: "all 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: theme.heading, marginBottom: 6 }}>{rec.appLabel}</h2>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: theme.tagBg, color: "#4F46E5" }}>{rec.users >= 1000 ? `${(rec.users / 1000).toFixed(1)}K` : rec.users} DAU</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: theme.successBg, color: theme.successText }}>{rec.growthLabel}</span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: theme.isDark ? "#2D1810" : "#FFF7ED", color: "#C2410C" }}>${rec.budget}/mo budget</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{new Date(rec.createdAt).toISOString().split("T")[0]}</div>
                <div style={{ marginTop: 6, fontWeight: 800, fontSize: 18, color: PROVIDER_COLORS[rec.topPick] || theme.heading }}>🏆 {rec.topPickName}</div>
                <div style={{ fontSize: 12, color: theme.textSecondary }}>${rec.topCost.toFixed(2)}/mo</div>
              </div>
              <button onClick={(e) => handleDelete(e, rec.id)} style={{ padding: "8px 14px", borderRadius: 10, border: "2px solid #EF4444", background: "transparent", color: "#EF4444", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>
                {deleting === rec.id ? "..." : "🗑️ Delete"}
              </button>
            </div>
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12, marginTop: 32 }}>💰 Cost Comparison</h3>
          <CostBarChart results={results} />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12, marginTop: 32 }}>📊 Provider Scores</h3>
          <ScoreRadarChart results={results} />

          <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 12, marginTop: 32 }}>🔧 Component Breakdown</h3>
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
          { label: "Total Recommendations", value: stats.total, icon: "📋", bg: theme.tagBg, color: "#4F46E5" },
          { label: "Avg Budget", value: `$${stats.avgBudget}/mo`, icon: "💰", bg: theme.isDark ? "#2D1810" : "#FFF7ED", color: "#C2410C" },
          { label: "Most Picked Provider", value: providerNames[stats.topProvider] || stats.topProvider, icon: "🏆", bg: theme.successBg, color: theme.isDark ? "#4ADE80" : "#166534" },
        ].map(s => (
          <div key={s.label} style={{ background: theme.cardBg, borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid " + theme.cardBorder, transition: "all 0.3s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
              <span style={{ fontSize: 12, color: theme.textSecondary, fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.heading }}>Recommendation History</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setFilter("all")} style={{ padding: "6px 16px", borderRadius: 20, border: filter === "all" ? "2px solid #4F46E5" : "2px solid " + theme.cardBorder, background: filter === "all" ? "#4F46E5" : theme.cardBg, color: filter === "all" ? "#fff" : theme.textSecondary, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>All</button>
          {appTypes.map(t => {
            const labels = { web_app: "Web App", api_backend: "API", ml_pipeline: "ML", data_warehouse: "Data" };
            return (
              <button key={t} onClick={() => setFilter(t)} style={{ padding: "6px 16px", borderRadius: 20, border: filter === t ? "2px solid #4F46E5" : "2px solid " + theme.cardBorder, background: filter === t ? "#4F46E5" : theme.cardBg, color: filter === t ? "#fff" : theme.textSecondary, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>{labels[t] || t}</button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: theme.cardBg, borderRadius: 20, border: "1px solid " + theme.cardBorder }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: theme.heading, marginBottom: 8 }}>No recommendations yet</div>
          <div style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 20 }}>Go make your first cloud architecture recommendation!</div>
          <a href="/" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 12, background: "#4F46E5", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Get Started →</a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(rec => (
            <div key={rec.id} style={{ background: theme.cardBg, borderRadius: 16, padding: "20px 24px", border: "2px solid " + theme.cardBorder, transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setSelected(rec)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: PROVIDER_COLORS[rec.topPick] + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: PROVIDER_COLORS[rec.topPick] }}>
                  {rec.topPickName?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: theme.heading, marginBottom: 4 }}>{rec.appLabel}</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 11, color: theme.textSecondary }}>
                    <span>{rec.users >= 1000 ? `${(rec.users / 1000).toFixed(1)}K` : rec.users} DAU</span>
                    <span>·</span>
                    <span>{rec.growthLabel}</span>
                    <span>·</span>
                    <span>${rec.budget}/mo</span>
                  </div>
                </div>
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: PROVIDER_COLORS[rec.topPick] }}>{rec.topPickName} — ${rec.topCost.toFixed(2)}/mo</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{new Date(rec.createdAt).toISOString().split("T")[0]}</div>
                </div>
                <button onClick={(e) => handleDelete(e, rec.id)} title="Delete" style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid " + (theme.isDark ? "#7F1D1D" : "#FECACA"), background: theme.isDark ? "#1C0A0A" : "#FEF2F2", color: "#EF4444", cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}>
                  {deleting === rec.id ? "..." : "🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
