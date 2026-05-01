import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

const APP_LABELS = { web_app: "Web Application", api_backend: "API Backend", ml_pipeline: "ML Pipeline", data_warehouse: "Data Warehouse" };
const GROWTH_LABELS = { none: "No Growth", low: "Low Growth", medium: "Medium Growth", high: "High Growth" };
const PROVIDER_NAMES = { aws: "AWS", azure: "Azure", gcp: "GCP" };

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/")

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const recommendations = user
    ? await prisma.recommendation.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
    : []

  const serialized = recommendations.map(r => ({
    ...r,
    budget: Number(r.budget),
    topCost: Number(r.topCost),
    createdAt: r.createdAt.toISOString(),
    appLabel: APP_LABELS[r.appType] || r.appType,
    growthLabel: GROWTH_LABELS[r.growth] || r.growth,
    topPickName: PROVIDER_NAMES[r.topPick] || r.topPick,
  }))

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 50%, #F0F9FF 100%)" }}>
      {/* Header */}
      <header style={{ background: "#1a1a2e", color: "#fff", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>☁</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>CloudRec Dashboard</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Your recommendation history</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/" style={{ color: "#A78BFA", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>← New Recommendation</a>
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{session.user?.name}</span>
          <form action={async () => { "use server"; await signOut() }}>
            <button style={{ padding: "6px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Sign Out</button>
          </form>
        </div>
      </header>

      <DashboardClient recommendations={serialized} />
    </div>
  )
}
