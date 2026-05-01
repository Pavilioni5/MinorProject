"use client";

import { useState, useEffect, createContext, useContext } from "react";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("cloudrec-currency");
    if (saved && ["USD", "INR", "EUR"].includes(saved)) setCurrency(saved);

    fetch("/api/exchange-rates")
      .then(r => r.json())
      .then(data => {
        setRates(data.rates);
        setLastUpdated(data.lastUpdated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("cloudrec-currency", currency);
  }, [currency]);

  // Convert USD amount to selected currency
  function convert(usdAmount) {
    if (!rates || !rates[currency]) return usdAmount;
    return usdAmount * rates[currency].rate;
  }

  // Convert from selected currency back to USD (for budget input)
  function toUSD(localAmount) {
    if (!rates || !rates[currency]) return localAmount;
    return localAmount / rates[currency].rate;
  }

  // Format USD amount in selected currency
  function format(usdAmount) {
    const converted = convert(usdAmount);
    const info = rates?.[currency] || { symbol: "$" };
    if (currency === "INR") {
      return `${info.symbol}${Math.round(converted).toLocaleString("en-IN")}`;
    }
    return `${info.symbol}${converted.toFixed(2)}`;
  }

  // Get the symbol for current currency
  function getSymbol() {
    return rates?.[currency]?.symbol || "$";
  }

  // Get budget range for the selected currency
  function getBudgetRange() {
    const rate = rates?.[currency]?.rate || 1;
    return {
      min: Math.round(10 * rate),
      max: Math.round(2000 * rate),
    };
  }

  // Format a local currency amount (not USD-based)
  function formatLocal(amount) {
    const info = rates?.[currency] || { symbol: "$" };
    if (currency === "INR") {
      return `${info.symbol}${Math.round(amount).toLocaleString("en-IN")}`;
    }
    return `${info.symbol}${amount.toFixed(2)}`;
  }

  return (
    <CurrencyContext.Provider value={{
      currency, setCurrency, rates, loading, lastUpdated,
      convert, toUSD, format, getSymbol, getBudgetRange, formatLocal
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencySelector() {
  const { currency, setCurrency, rates, loading } = useCurrency();

  if (loading || !rates) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <select
        value={currency}
        onChange={e => setCurrency(e.target.value)}
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 8,
          padding: "5px 8px",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          outline: "none",
        }}
      >
        {Object.entries(rates).map(([code, info]) => (
          <option key={code} value={code} style={{ background: "#1a1a2e", color: "#fff" }}>
            {info.symbol} {code} — {info.name}
          </option>
        ))}
      </select>
      {currency !== "USD" && rates[currency] && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
          1 USD = {rates[currency].rate.toFixed(2)} {currency}
        </span>
      )}
    </div>
  );
}
