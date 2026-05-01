"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const COLORS = { aws: "#FF9900", azure: "#0078D4", gcp: "#34A853" };
const NAMES = { aws: "AWS", azure: "Azure", gcp: "GCP" };

export function CostBarChart({ results }) {
  const data = results.filter(r => r.fits).map(r => ({
    name: NAMES[r.provider],
    "Base Cost": parseFloat(r.total.toFixed(2)),
    "Growth-Adjusted": parseFloat(r.adj.toFixed(2)),
    fill: COLORS[r.provider],
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={v => `$${v.toFixed(2)}`} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
          <Legend />
          <Bar dataKey="Base Cost" fill="#6366F1" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Growth-Adjusted" fill="#A78BFA" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreRadarChart({ results }) {
  const data = [
    { metric: "Cost Efficiency", ...Object.fromEntries(results.filter(r => r.fits).map(r => [NAMES[r.provider], parseFloat(((1 - (r.adj / 200)) * 100).toFixed(1))])) },
    { metric: "Scalability", ...Object.fromEntries(results.filter(r => r.fits).map(r => [NAMES[r.provider], parseFloat((r.scale * 100).toFixed(1))])) },
    { metric: "SLA", ...Object.fromEntries(results.filter(r => r.fits).map(r => [NAMES[r.provider], parseFloat(((r.sla - 99) * 100).toFixed(1))])) },
    { metric: "Overall Score", ...Object.fromEntries(results.filter(r => r.fits).map(r => [NAMES[r.provider], parseFloat((r.score * 100).toFixed(1))])) },
  ];

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fontWeight: 600 }} />
          <PolarRadiusAxis tick={{ fontSize: 10 }} />
          {results.filter(r => r.fits).map(r => (
            <Radar key={r.provider} name={NAMES[r.provider]} dataKey={NAMES[r.provider]} stroke={COLORS[r.provider]} fill={COLORS[r.provider]} fillOpacity={0.15} strokeWidth={2} />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComponentBreakdownChart({ results }) {
  const topResult = results.find(r => r.fits);
  if (!topResult) return null;

  const data = topResult.items.map(item => ({
    name: item.component.replace("_", " "),
    ...Object.fromEntries(results.filter(r => r.fits).map(r => {
      const matchItem = r.items.find(i => i.component === item.component);
      return [NAMES[r.provider], matchItem ? parseFloat(matchItem.cost.toFixed(2)) : 0];
    })),
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} style={{ textTransform: "capitalize" }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `$${v}`} />
          <Tooltip formatter={v => `$${v.toFixed(2)}/mo`} contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB" }} />
          <Legend />
          {results.filter(r => r.fits).map(r => (
            <Bar key={r.provider} dataKey={NAMES[r.provider]} fill={COLORS[r.provider]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
