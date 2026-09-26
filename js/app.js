// app.js
// Shared across index.html and coin.html: theme toggle, currency selection,
// and small formatting/API helpers. Loaded before home.js / coin.js.

const API_BASE = "https://api.coingecko.com/api/v3";

// Map of currency code -> display symbol, used everywhere prices are shown.
const CURRENCY_SYMBOLS = { usd: "$", eur: "€", inr: "₹" };

/* ---------------- Theme ---------------- */
// Reads/writes the "coinscope-theme" key in localStorage so the choice
// survives a page reload, and applies it via a data-theme attribute on <html>
// (see the [data-theme="light"] block in style.css).
function initTheme() {
  const saved = localStorage.getItem("coinscope-theme") || "dark";
  applyTheme(saved);

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      localStorage.setItem("coinscope-theme", next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = theme === "light" ? "🌙" : "☀️";
}

/* ---------------- Currency ---------------- */
// The chosen currency is passed between pages as a ?currency= query param
// (a small improvement over the original, which reset to USD on every
// navigation) and mirrored into the <select> on whichever page is open.
function getCurrencyFromURL() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("currency");
  return CURRENCY_SYMBOLS[code] ? code : "usd";
}

function initCurrencySelect(onChange) {
  const select = document.getElementById("currency-select");
  if (!select) return;

  select.value = getCurrencyFromURL();
  select.addEventListener("change", () => onChange(select.value));
}

/* ---------------- Formatting ---------------- */
function formatCurrency(value, currencyCode) {
  if (typeof value !== "number") return "--";
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "";
  return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
}

function formatPercent(value) {
  if (typeof value !== "number") return "--";
  return `${Math.floor(value * 100) / 100}%`;
}

/* ---------------- Status banner ---------------- */
// Small helper used by both pages to show a loading spinner text or an
// error message in the #status element, and hide it once real content is ready.
function setStatus(message, isError = false) {
  const el = document.getElementById("status");
  if (!el) return;
  if (!message) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.textContent = message;
  el.classList.toggle("error", isError);
}

initTheme();
