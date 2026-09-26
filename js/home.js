// home.js
// Handles everything on index.html: fetching the coin list, rendering the
// table, the search box, and reacting to a currency change.

let allCoins = [];
let currentCurrency = getCurrencyFromURL();

async function fetchCoins(currency) {
  setStatus("Loading market data…");
  document.getElementById("coin-rows").innerHTML = "";

  const url = `${API_BASE}/coins/markets?vs_currency=${encodeURIComponent(currency)}&order=market_cap_desc&per_page=25&page=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API responded with ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      setStatus("No coin data returned right now. Please try again shortly.", true);
      return;
    }

    allCoins = data;
    setStatus(null);
    renderCoinList(document.getElementById("search-input").value.trim());
    populateDatalist();
  } catch (err) {
    console.error("[home] failed to fetch coin list:", err);
    setStatus("Couldn't load market data. Check your connection and try again.", true);
  }
}

function populateDatalist() {
  const list = document.getElementById("coin-list");
  list.innerHTML = allCoins.map((c) => `<option value="${c.name}"></option>`).join("");
}

function renderCoinList(filterText) {
  const rowsContainer = document.getElementById("coin-rows");
  const filtered = filterText
    ? allCoins.filter((c) => c.name.toLowerCase().includes(filterText.toLowerCase()))
    : allCoins;

  if (filtered.length === 0) {
    rowsContainer.innerHTML = `<div class="row"><span></span><span>No coins match your search.</span></div>`;
    return;
  }

  rowsContainer.innerHTML = filtered
    .slice(0, 10)
    .map((coin) => {
      const changeClass = coin.price_change_percentage_24h > 0 ? "up" : "down";
      return `
        <a class="row" href="coin.html?id=${coin.id}&currency=${currentCurrency}">
          <span class="col-rank">${coin.market_cap_rank ?? "-"}</span>
          <span class="col-coin"><img src="${coin.image}" alt="" />${coin.name} (${coin.symbol.toUpperCase()})</span>
          <span class="col-price">${formatCurrency(coin.current_price, currentCurrency)}</span>
          <span class="col-change ${changeClass}">${formatPercent(coin.price_change_percentage_24h)}</span>
          <span class="col-cap">${formatCurrency(coin.market_cap, currentCurrency)}</span>
        </a>`;
    })
    .join("");
}

function handleSearchSubmit(event) {
  event.preventDefault();
  const value = document.getElementById("search-input").value.trim();
  renderCoinList(value);
}

function handleCurrencyChange(newCurrency) {
  currentCurrency = newCurrency;
  fetchCoins(currentCurrency);
}

document.getElementById("search-form").addEventListener("submit", handleSearchSubmit);
initCurrencySelect(handleCurrencyChange);
fetchCoins(currentCurrency);
