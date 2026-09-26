// coin.js
// Handles everything on coin.html: reads the coin id from the URL, fetches
// its details + 10-day price history, and renders the stats card and the
// Chart.js line chart.

const currentCurrency = getCurrencyFromURL();
let priceChart = null;

function getCoinIdFromURL() {
  return new URLSearchParams(window.location.search).get("id");
}

async function loadCoin() {
  const coinId = getCoinIdFromURL();
  if (!coinId) {
    setStatus("No coin selected. Go back to the home page and pick one.", true);
    return;
  }

  setStatus("Loading coin data…");

  try {
    const [coinRes, historyRes] = await Promise.all([
      fetch(`${API_BASE}/coins/${coinId}`),
      fetch(`${API_BASE}/coins/${coinId}/market_chart?vs_currency=${currentCurrency}&days=10&interval=daily`),
    ]);

    if (!coinRes.ok || !historyRes.ok) {
      throw new Error(`API responded with ${coinRes.status} / ${historyRes.status}`);
    }

    const coinData = await coinRes.json();
    const historyData = await historyRes.json();

    if (!coinData.market_data || !Array.isArray(historyData.prices)) {
      setStatus("This coin's data isn't available right now.", true);
      return;
    }

    setStatus(null);
    renderCoinInfo(coinData);
    renderChart(historyData.prices);
  } catch (err) {
    console.error("[coin] failed to load coin:", err);
    setStatus("Couldn't load this coin. Check your connection and try again.", true);
  }
}

function renderCoinInfo(coin) {
  document.getElementById("coin-view").hidden = false;
  document.getElementById("coin-image").src = coin.image.large;
  document.getElementById("coin-name").textContent = coin.name;
  document.getElementById("coin-symbol").textContent = `(${coin.symbol.toUpperCase()})`;

  const md = coin.market_data;
  document.getElementById("stat-rank").textContent = coin.market_cap_rank ?? "--";
  document.getElementById("stat-price").textContent = formatCurrency(md.current_price[currentCurrency], currentCurrency);
  document.getElementById("stat-cap").textContent = formatCurrency(md.market_cap[currentCurrency], currentCurrency);
  document.getElementById("stat-high").textContent = formatCurrency(md.high_24h[currentCurrency], currentCurrency);
  document.getElementById("stat-low").textContent = formatCurrency(md.low_24h[currentCurrency], currentCurrency);
}

function renderChart(prices) {
  const labels = prices.map(([timestamp]) =>
    new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  );
  const values = prices.map(([, price]) => price);

  const ctx = document.getElementById("price-chart").getContext("2d");
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#2dd4bf";

  if (priceChart) priceChart.destroy();

  priceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: `Price (${currentCurrency.toUpperCase()})`,
          data: values,
          borderColor: accent,
          backgroundColor: accent + "22",
          fill: true,
          tension: 0.25,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: (v) => formatCurrency(v, currentCurrency) } },
      },
    },
  });
}

initCurrencySelect((newCurrency) => {
  // Reload the page with the new currency so both the stats and the chart
  // refetch consistent data, mirroring how the home page re-fetches on change.
  const params = new URLSearchParams(window.location.search);
  params.set("currency", newCurrency);
  window.location.search = params.toString();
});

loadCoin();
