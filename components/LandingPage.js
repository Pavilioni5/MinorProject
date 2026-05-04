"use client";

import { useState } from "react";
import { useTheme, ThemeToggle } from "@/components/ThemeProvider";

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant Recommendations",
    desc: "Get cost-optimized architecture suggestions in seconds across AWS, Azure & GCP.",
  },
  {
    icon: "📊",
    title: "Smart Comparison",
    desc: "Side-by-side cost breakdowns, scalability scores, and SLA guarantees.",
  },
  {
    icon: "💰",
    title: "Budget-Aware",
    desc: "Multi-currency support with growth projections built into every recommendation.",
  },
];

export default function LandingPage({ signInAction, signUpAction }) {
  const [activeTab, setActiveTab] = useState("signin");
  const { theme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", transition: "background 0.3s", display: "flex", flexDirection: "column" }}>
      {/* Header matching CloudRecommender */}
      <header style={{ background: theme.headerBg, color: "#fff", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>☁</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>CloudRec</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: -2 }}>Cloud Architecture Advisor</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <ThemeToggle />
          {["AWS", "Azure", "GCP"].map(p => (
            <span key={p} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>{p}</span>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px", flex: 1, display: "flex", flexWrap: "wrap", gap: "60px", alignItems: "center" }}>
        
        {/* Left column */}
        <div style={{ flex: "1 1 400px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 24, background: "rgba(79,70,229,0.1)", color: "#4F46E5", fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4F46E5" }} />
            Smart Cloud Architecture Advisor
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 900, color: theme.heading, letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.1 }}>
            Find Your Ideal<br />
            <span style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Cloud Architecture
            </span>
          </h1>

          <p style={{ color: theme.textSecondary, fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
            Answer 3 simple questions and get a cost-optimized, growth-aware recommendation across AWS, Azure, and GCP — no cloud expertise needed.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, background: theme.cardBg, padding: 16, borderRadius: 12, border: "1px solid " + theme.cardBorder, boxShadow: theme.shadow }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: theme.heading, marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column (Auth Card) */}
        <div style={{ flex: "1 1 350px", maxWidth: 420 }}>
          <div style={{ background: theme.cardBg, borderRadius: 24, boxShadow: theme.shadow, padding: "40px 32px", border: "1px solid " + theme.cardBorder, position: "relative" }}>
            
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>☁️</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: theme.heading, marginBottom: 8 }}>
                {activeTab === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
              <p style={{ fontSize: 14, color: theme.textSecondary }}>
                {activeTab === "signin" ? "Sign in to access your cloud recommendations" : "Join CloudRec and start optimizing costs"}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: 4, borderRadius: 12, background: theme.bg, border: "1px solid " + theme.cardBorder, marginBottom: 24 }}>
              <button 
                onClick={() => setActiveTab("signin")}
                style={{ padding: "10px 0", borderRadius: 10, border: "none", background: activeTab === "signin" ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "transparent", color: activeTab === "signin" ? "#fff" : theme.textSecondary, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: activeTab === "signin" ? "0 4px 12px rgba(79,70,229,0.3)" : "none" }}
              >
                Sign In
              </button>
              <button 
                onClick={() => setActiveTab("signup")}
                style={{ padding: "10px 0", borderRadius: 10, border: "none", background: activeTab === "signup" ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "transparent", color: activeTab === "signup" ? "#fff" : theme.textSecondary, fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: activeTab === "signup" ? "0 4px 12px rgba(79,70,229,0.3)" : "none" }}
              >
                Sign Up
              </button>
            </div>

            <form action={activeTab === "signin" ? signInAction : signUpAction}>
              <button type="submit" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px 24px", borderRadius: 12, border: "1px solid " + theme.cardBorder, background: theme.bg, color: theme.heading, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 20 }}>
                <svg style={{ width: 20, height: 20 }} viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {activeTab === "signin" ? "Continue with Google" : "Sign up with Google"}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: theme.cardBorder }} />
              <div style={{ fontSize: 12, color: theme.textSecondary }}>{activeTab === "signin" ? "New here?" : "Already have an account?"}</div>
              <div style={{ flex: 1, height: 1, background: theme.cardBorder }} />
            </div>

            <button 
              onClick={() => setActiveTab(activeTab === "signin" ? "signup" : "signin")}
              style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #4F46E5", background: "transparent", color: "#4F46E5", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              {activeTab === "signin" ? "Create an account →" : "← Sign in instead"}
            </button>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "24px 32px", borderTop: "1px solid " + theme.cardBorder }}>
        <p style={{ fontSize: 12, color: theme.textSecondary }}>
          © 2026 CloudRec — Cloud Architecture Advisor.
        </p>
      </footer>
    </div>
  );
}
