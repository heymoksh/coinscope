# CoinScope

A small cryptocurrency market tracker built with plain HTML, CSS, and JavaScript.

## Overview

CoinScope shows the top cryptocurrencies by market cap, lets you search for a
specific coin, switch between USD/EUR/INR, and open any coin to see its price
history on a chart along with its current stats. It's a personal
reimplementation of an earlier React version of the same idea, rebuilt without
a framework so every part of it is easy to read and explain.

## Features

- Live market table (rank, name, price, 24h change, market cap) for the top 25 coins by market cap
- Search box with autocomplete suggestions, filtering the table by coin name
- Currency switcher (USD / EUR / INR) that re-fetches prices in the chosen currency
- Light/dark theme toggle, remembered across visits via `localStorage`
- Coin detail page with a 10-day price history chart (Chart.js) and key stats (rank, price, market cap, 24h high/low)
- Loading and error states on both pages, so a slow or failed API call never leaves a blank screen

## Tech Stack

- HTML5
- CSS3 (custom properties for theming, flexbox/grid layout, media queries)
- Vanilla JavaScript (`fetch`, `async/await`, DOM manipulation)
- [CoinGecko public API](https://www.coingecko.com/en/api) (no backend, no API key required for these endpoints)
- [Chart.js](https://www.chartjs.org/) for the price history chart

## API

All data comes from CoinGecko's public REST API:

| Endpoint | Used for |
|---|---|
| `GET /coins/markets?vs_currency={currency}&order=market_cap_desc&per_page=25&page=1` | The home page table |
| `GET /coins/{id}` | Coin name, image, rank, and current market stats on the detail page |
| `GET /coins/{id}/market_chart?vs_currency={currency}&days=10&interval=daily` | The 10-day price history feeding the chart |

These endpoints work without an API key on CoinGecko's free tier, but are
rate-limited (roughly 10-30 requests/minute). If you hit the rate limit during
development, CoinGecko lets you create a free "Demo" API key and send it as
the `x-cg-demo-api-key` header — add that header inside `fetchCoins()` in
`js/home.js` and `loadCoin()` in `js/coin.js` if needed. No key is committed
to this project.

## Project Structure

```
coinscope/
├── index.html        # Home page: hero, search, market table
├── coin.html          # Coin detail page: chart + stats
├── css/
│   └── style.css      # All styling, theme variables, responsive rules
├── js/
│   ├── app.js          # Shared: theme toggle, currency helpers, formatting
│   ├── home.js         # Home page logic (fetch + render table, search)
│   └── coin.js         # Coin page logic (fetch + render chart, stats)
└── README.md
```

## How to Run

No build step or install required.

1. Clone or download this repository.
2. Open the folder in VS Code (or any editor).
3. Open `index.html` with the **Live Server** extension (or any static file
   server — the API calls use `fetch`, which needs `http://`, not `file://`).
4. Click a coin to see its detail page and chart.

## Screenshots

_Add screenshots of the home page and a coin detail page here once deployed._

## Future Improvements

- Pagination or "load more" instead of a fixed top-25 list
- A watchlist saved to `localStorage`
- Debounced live search instead of submit-on-enter
- Caching recent API responses to reduce rate-limit issues

## Credits

Rebuilt from an earlier React + Vite version of the same concept, as a
learning exercise in doing the same job with no framework.
