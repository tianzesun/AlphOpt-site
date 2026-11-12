"use strict";

// Sample data for the showcase. Replace with a real API feed when available.
const SIGNALS = [
  { ticker: "NVDA", name: "NVIDIA Corp.", asset: "option", dir: "bull", contract: "Call · $145 strike · 30 DTE", entry: 4.2, target: 6.8, stop: 3.1, confidence: 82, horizon: "2–4 weeks",
    factors: [["Unusual call volume (3× 20-day avg.)", 31], ["Breakout above 20-day range", 26], ["IV below 6-month median", 18], ["Positive analyst revision trend", 7]] },
  { ticker: "AAPL", name: "Apple Inc.", asset: "stock", dir: "bull", contract: "Shares", entry: 228.5, target: 246, stop: 219, confidence: 74, horizon: "3–6 weeks",
    factors: [["Higher lows on rising volume", 28], ["Sector relative strength turning up", 22], ["Supportive news sentiment", 14], ["Earnings drift pattern", 10]] },
  { ticker: "TSLA", name: "Tesla Inc.", asset: "option", dir: "bear", contract: "Put · $230 strike · 21 DTE", entry: 7.6, target: 12.4, stop: 5.2, confidence: 68, horizon: "1–3 weeks",
    factors: [["Failed retest of resistance", 27], ["Put/call skew rising", 21], ["Negative momentum divergence", 13], ["Heavy call open interest above price", 7]] },
  { ticker: "MSFT", name: "Microsoft Corp.", asset: "stock", dir: "bull", contract: "Shares", entry: 418, target: 448, stop: 404, confidence: 79, horizon: "4–8 weeks",
    factors: [["Trend continuation after pullback", 30], ["Institutional accumulation signal", 24], ["Low realized volatility", 15], ["Cloud segment sentiment", 10]] },
  { ticker: "AMD", name: "Advanced Micro Devices", asset: "option", dir: "bull", contract: "Call · $160 strike · 45 DTE", entry: 6.1, target: 9.9, stop: 4.3, confidence: 71, horizon: "3–6 weeks",
    factors: [["Bullish options sweep activity", 29], ["Reclaimed 50-day moving average", 22], ["Peer group momentum", 12], ["IV rank moderate", 8]] },
  { ticker: "XOM", name: "Exxon Mobil Corp.", asset: "stock", dir: "bear", contract: "Short / avoid", entry: 112.4, target: 104, stop: 116.5, confidence: 63, horizon: "2–4 weeks",
    factors: [["Lower highs on declining volume", 24], ["Weak commodity correlation", 19], ["Sector rotation outflows", 13], ["Bearish news sentiment", 7]] },
  { ticker: "SPY", name: "S&P 500 ETF", asset: "option", dir: "bull", contract: "Call spread · $585/$595 · 28 DTE", entry: 3.4, target: 6.2, stop: 2.1, confidence: 66, horizon: "2–4 weeks",
    factors: [["Market breadth improving", 25], ["VIX term structure normalizing", 20], ["Seasonal tendency", 12], ["Dealer gamma supportive", 9]] },
  { ticker: "META", name: "Meta Platforms", asset: "stock", dir: "bull", contract: "Shares", entry: 586, target: 632, stop: 562, confidence: 77, horizon: "4–6 weeks",
    factors: [["Cup-and-handle completion", 29], ["Strong relative strength vs. index", 23], ["Ad-market sentiment improving", 15], ["Options positioning bullish", 10]] },
  { ticker: "BA", name: "Boeing Co.", asset: "option", dir: "bear", contract: "Put · $170 strike · 35 DTE", entry: 5.3, target: 8.9, stop: 3.8, confidence: 61, horizon: "2–5 weeks",
    factors: [["Breakdown below support", 23], ["Rising put open interest", 19], ["Negative headline flow", 12], ["Weak sector breadth", 7]] },
];

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const SVG_NS = "http://www.w3.org/2000/svg";

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "style") node.style.cssText = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(child instanceof Node ? child : String(child));
  }
  return node;
}

const money = (n) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const riskReward = (s) => Math.abs(s.target - s.entry) / Math.abs(s.entry - s.stop);

// Deterministic pseudo-random walk so each ticker always draws the same chart.
function seededSeries(seed, points, trend) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rand = () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
  const out = [50];
  for (let i = 1; i < points; i++) out.push(out[i - 1] + (rand() - 0.5) * 6 + trend);
  return out;
}

function drawChart(svg, series, color, { fill = true } = {}) {
  svg.replaceChildren();
  const [w, h, pad] = [300, 110, 6];
  const min = Math.min(...series), max = Math.max(...series);
  const x = (i) => (i / (series.length - 1)) * w;
  const y = (v) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const line = series.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const gradId = "g" + Math.random().toString(36).slice(2, 8);

  if (fill) {
    const defs = document.createElementNS(SVG_NS, "defs");
    const grad = document.createElementNS(SVG_NS, "linearGradient");
    grad.setAttribute("id", gradId);
    grad.setAttribute("x1", "0"); grad.setAttribute("y1", "0");
    grad.setAttribute("x2", "0"); grad.setAttribute("y2", "1");
    for (const [offset, opacity] of [["0", "0.35"], ["1", "0"]]) {
      const stop = document.createElementNS(SVG_NS, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      stop.setAttribute("stop-opacity", opacity);
      grad.append(stop);
    }
    defs.append(grad);
    const area = document.createElementNS(SVG_NS, "path");
    area.setAttribute("d", `${line} L${w},${h} L0,${h} Z`);
    area.setAttribute("fill", `url(#${gradId})`);
    svg.append(defs, area);
  }

  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", line);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", "2.2");
  path.setAttribute("stroke-linejoin", "round");
  path.setAttribute("vector-effect", "non-scaling-stroke");
  svg.append(path);
}

const colorFor = (dir) => (dir === "bull" ? "#22c55e" : "#f87171");
const seriesFor = (s, points = 40) => seededSeries(s.ticker, points, s.dir === "bull" ? 0.9 : -0.9);
const dirBadge = (dir) =>
  el("span", { class: `dir dir--${dir}` }, dir === "bull" ? "▲ Bullish" : "▼ Bearish");

/* ---------- Nav ---------- */
function initNav() {
  const nav = $(".nav");
  const toggle = $(".nav__toggle");
  const links = $("#nav-links");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setOpen = (open) => {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
}

/* ---------- Hero ---------- */
function initHero() {
  drawChart($("#hero-chart"), seededSeries("hero-nvda", 48, 1.1), "#22d3a6");

  const track = $("#ticker-track");
  const items = SIGNALS.map((s) =>
    el("span", { class: "ticker__item" },
      el("b", {}, s.ticker),
      el("span", { class: s.dir === "bull" ? "up" : "down" }, s.dir === "bull" ? "▲ BUY" : "▼ SELL"),
      el("span", { class: "muted" }, s.asset === "option" ? "OPT" : "STK"),
      el("span", { class: "muted" }, `${s.confidence}%`)
    )
  );
  // Duplicate the list so the CSS marquee loops seamlessly.
  track.append(...items, ...items.map((n) => {
    const clone = n.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  }));
}

/* ---------- Signal board ---------- */
const state = { asset: "all", dir: "all", sort: "confidence" };

function signalCard(s) {
  const spark = document.createElementNS(SVG_NS, "svg");
  spark.setAttribute("class", "card__spark");
  spark.setAttribute("viewBox", "0 0 300 110");
  spark.setAttribute("preserveAspectRatio", "none");
  spark.setAttribute("aria-hidden", "true");
  drawChart(spark, seriesFor(s, 30), colorFor(s.dir));

  const card = el("button", { class: "card", type: "button", "aria-haspopup": "dialog",
      "aria-label": `${s.ticker} ${s.dir === "bull" ? "bullish" : "bearish"} ${s.asset} signal, ${s.confidence}% confidence. View details.` },
    el("div", { class: "card__head" },
      el("div", {},
        el("div", { class: "card__ticker" }, s.ticker),
        el("div", { class: "card__name" }, s.name)
      ),
      dirBadge(s.dir)
    ),
    spark,
    el("div", { class: "card__setup" }, s.contract),
    el("div", { class: "card__row" }, el("span", {}, "Entry"), el("strong", {}, money(s.entry))),
    el("div", { class: "card__row" }, el("span", {}, "Target"), el("strong", { class: "up" }, money(s.target))),
    el("div", { class: "card__row" }, el("span", {}, "Stop"), el("strong", { class: "down" }, money(s.stop))),
    el("div", { class: "confidence" },
      el("div", { class: "confidence__label" }, el("span", {}, "AI confidence"), el("strong", {}, `${s.confidence}%`)),
      el("div", { class: "confidence__track" }, el("div", { class: "confidence__fill", style: `--v:${s.confidence}%` }))
    ),
    el("div", { class: "card__foot" },
      el("span", { class: "chip" }, s.asset === "option" ? "Option" : "Stock"),
      el("span", {}, `R/R ${riskReward(s).toFixed(1)}×`),
      el("span", { class: "link" }, "Why? →")
    )
  );
  card.addEventListener("click", () => openSignal(s));
  return card;
}

function renderBoard() {
  const list = SIGNALS
    .filter((s) => state.asset === "all" || s.asset === state.asset)
    .filter((s) => state.dir === "all" || s.dir === state.dir)
    .sort((a, b) => {
      if (state.sort === "ticker") return a.ticker.localeCompare(b.ticker);
      if (state.sort === "rr") return riskReward(b) - riskReward(a);
      return b.confidence - a.confidence;
    });

  $("#board").replaceChildren(...list.map(signalCard));
  $("#board-empty").hidden = list.length > 0;
}

function initBoard() {
  $$(".seg").forEach((group) => {
    group.addEventListener("click", (e) => {
      const btn = e.target.closest(".seg__btn");
      if (!btn) return;
      $$(".seg__btn", group).forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      state[group.dataset.filter] = btn.dataset.value;
      renderBoard();
    });
  });
  $("#sort-select").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderBoard();
  });
  renderBoard();
}

/* ---------- Signal modal ---------- */
function openSignal(s) {
  const modal = $("#signal-modal");
  $("#modal-title").textContent = s.ticker;
  $("#modal-sub").textContent = `${s.name} · ${s.contract}`;
  $("#modal-dir").replaceWith(Object.assign(dirBadge(s.dir), { id: "modal-dir" }));
  drawChart($("#modal-chart"), seriesFor(s, 60), colorFor(s.dir));

  const stat = (label, value, cls = "") => el("div", {}, el("span", {}, label), el("strong", { class: cls }, value));
  $("#modal-stats").replaceChildren(
    stat("Entry", money(s.entry)),
    stat("Target", money(s.target), "up"),
    stat("Stop", money(s.stop), "down"),
    stat("Confidence", `${s.confidence}%`),
    stat("Risk / reward", `${riskReward(s).toFixed(1)}×`),
    stat("Horizon", s.horizon),
    stat("Type", s.asset === "option" ? "Option" : "Stock"),
    stat("Direction", s.dir === "bull" ? "Bullish" : "Bearish", s.dir === "bull" ? "up" : "down")
  );

  const maxWeight = Math.max(...s.factors.map(([, w]) => w));
  $("#modal-factors").replaceChildren(...s.factors.map(([label, weight]) =>
    el("li", { class: "factor" },
      el("span", {}, label),
      el("span", { class: "factor__w" }, `+${weight} pts`),
      el("span", { class: "factor__bar" }, el("i", { style: `--v:${(weight / maxWeight) * 100}%` }))
    )
  ));

  modal.showModal();
}

function initModal() {
  const modal = $("#signal-modal");
  // Close when clicking the backdrop.
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
}

/* ---------- Signal replays ---------- */
// Real events with actual daily closes, as traded before later splits (Yahoo Finance).
// Implied volatility per session is an assumption; premiums and Greeks come from Black-Scholes.
const RULES = { target: 0.5, stop: -0.35, maxSessions: 5 };

const REPLAYS = [
  { ticker: "NVDA", name: "NVIDIA Corp.", dir: "bull", put: false, strike: 400, expiry: "2023-06-16",
    newsDate: "2023-05-24", entryDate: "2023-05-25",
    news: { src: "NVIDIA Q1 FY2024 results · May 24, 2023 · after the close", text: "Guides next-quarter revenue to about $11 billion, roughly $4 billion above analyst estimates, on AI data-centre demand." },
    why: ["Earnings gap held: closed +24.4% at $379.80", "Volume 3.7× its recent daily average", "Guidance beat, not just an earnings beat", ["Closed mid-range, below the $394.80 high", "warn"]],
    iv: [0.5, 0.49, 0.48, 0.48, 0.47, 0.47],
    lesson: "Delta did the work. The stock's $21 rise outweighed five calendar days of theta and a small IV dip; buying after the event, when IV had already come down, kept vega from hurting much.",
    closes: [["2023-05-01", 289.1], ["2023-05-02", 282.1], ["2023-05-03", 278.02], ["2023-05-04", 275.62], ["2023-05-05", 286.8], ["2023-05-08", 291.51], ["2023-05-09", 285.71], ["2023-05-10", 288.85], ["2023-05-11", 285.78], ["2023-05-12", 283.4], ["2023-05-15", 289.53], ["2023-05-16", 292.13], ["2023-05-17", 301.78], ["2023-05-18", 316.78], ["2023-05-19", 312.64], ["2023-05-22", 311.76], ["2023-05-23", 306.88], ["2023-05-24", 305.38], ["2023-05-25", 379.8], ["2023-05-26", 389.46], ["2023-05-30", 401.11], ["2023-05-31", 378.34], ["2023-06-01", 397.7], ["2023-06-02", 393.27]] },
  { ticker: "CRWD", name: "CrowdStrike Holdings", dir: "bear", put: true, strike: 290, expiry: "2024-08-16",
    newsDate: "2024-07-19", entryDate: "2024-07-19",
    news: { src: "Global IT outage · July 19, 2024 · before the open", text: "A faulty CrowdStrike Falcon update crashes about 8.5 million Windows computers, grounding flights and disrupting banks and hospitals." },
    why: ["Fell 11.1% to $304.96 on the outage", "Volume 13.3× its recent daily average", "Already down 9.1% in the three sessions before", "Fallout (customer claims, lawsuits) still unknown"],
    iv: [0.55, 0.65, 0.63, 0.62, 0.6, 0.58],
    lesson: "Two Greeks paid at once: negative delta profited from Monday's 13% drop, and rising fear lifted IV, so vega added to the gain.",
    closes: [["2024-07-01", 392.15], ["2024-07-02", 385.05], ["2024-07-03", 387.18], ["2024-07-05", 389.68], ["2024-07-08", 390.71], ["2024-07-09", 385.88], ["2024-07-10", 374.45], ["2024-07-11", 370.43], ["2024-07-12", 371.32], ["2024-07-15", 377.37], ["2024-07-16", 369.05], ["2024-07-17", 354.94], ["2024-07-18", 343.05], ["2024-07-19", 304.96], ["2024-07-22", 263.91], ["2024-07-23", 268.88], ["2024-07-24", 258.14], ["2024-07-25", 254.15], ["2024-07-26", 256.16]] },
  { ticker: "META", name: "Meta Platforms", dir: "bull", put: false, strike: 195, expiry: "2023-02-17",
    newsDate: "2023-02-01", entryDate: "2023-02-02",
    news: { src: "Meta Q4 2022 results · Feb 1, 2023 · after the close", text: "Calls 2023 its “year of efficiency”, cuts its expense outlook and adds $40 billion to its share buyback." },
    why: ["Earnings gap held: closed +23.3% at $188.77", "Volume 5.2× its recent daily average", ["Closed mid-range, well below the $197.16 high", "warn"], ["Short-dated: 15 days to expiry, heavy theta", "warn"]],
    iv: [0.45, 0.44, 0.42, 0.41, 0.4, 0.4],
    lesson: "The stock slipped only 1.4%, yet the call lost about half its value: delta, theta and a dip in IV all worked against it. Short-dated calls need the move to come fast, and the stop kept it from running toward zero.",
    closes: [["2023-01-12", 136.71], ["2023-01-13", 136.98], ["2023-01-17", 135.36], ["2023-01-18", 133.02], ["2023-01-19", 136.15], ["2023-01-20", 139.37], ["2023-01-23", 143.27], ["2023-01-24", 143.14], ["2023-01-25", 141.5], ["2023-01-26", 147.3], ["2023-01-27", 151.74], ["2023-01-30", 147.06], ["2023-01-31", 148.97], ["2023-02-01", 153.12], ["2023-02-02", 188.77], ["2023-02-03", 186.53], ["2023-02-06", 186.06], ["2023-02-07", 191.62], ["2023-02-08", 183.43], ["2023-02-09", 177.92], ["2023-02-10", 174.15]] },
];

// Standard normal CDF (Abramowitz-Stegun 7.1.26), accurate to about 1e-7.
function normCdf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(x * x) / 2);
  return x >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}
const normPdf = (x) => Math.exp(-(x * x) / 2) / Math.sqrt(2 * Math.PI);

// Black-Scholes price and Greeks. Theta is per calendar day, vega per 1 point of IV.
function blackScholes({ spot, strike, dte, iv, put, rate = 0.05 }) {
  const t = dte / 365;
  const d1 = (Math.log(spot / strike) + (rate + (iv * iv) / 2) * t) / (iv * Math.sqrt(t));
  const d2 = d1 - iv * Math.sqrt(t);
  const disc = strike * Math.exp(-rate * t);
  const call = spot * normCdf(d1) - disc * normCdf(d2);
  const decay = -(spot * normPdf(d1) * iv) / (2 * Math.sqrt(t));
  return {
    price: put ? call - spot + disc : call,
    delta: put ? normCdf(d1) - 1 : normCdf(d1),
    gamma: normPdf(d1) / (spot * iv * Math.sqrt(t)),
    theta: (put ? decay + rate * disc * normCdf(-d2) : decay - rate * disc * normCdf(d2)) / 365,
    vega: (spot * normPdf(d1) * Math.sqrt(t)) / 100,
  };
}

const DAY_MS = 86400000;
const shortDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });
const longDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const signed = (n, digits = 2) => (n < 0 ? "−" : "+") + Math.abs(n).toFixed(digits);
const usd = (n) => (n < 0 ? "−$" : "+$") + Math.round(Math.abs(n)).toLocaleString("en-CA");

// Walk the position close by close and exit on the first target, stop or time limit.
function runReplay(r) {
  const start = r.closes.findIndex(([d]) => d === r.entryDate);
  const expiry = Date.parse(r.expiry + "T00:00:00Z");
  const sessions = [];
  for (let i = 0; i <= RULES.maxSessions && start + i < r.closes.length; i++) {
    const [date, spot] = r.closes[start + i];
    const dte = Math.round((expiry - Date.parse(date + "T00:00:00Z")) / DAY_MS);
    const opt = blackScholes({ spot, strike: r.strike, dte, iv: r.iv[i], put: r.put });
    const ret = i ? opt.price / sessions[0].price - 1 : 0;
    const exit = i === 0 ? null : ret >= RULES.target ? "Target" : ret <= RULES.stop ? "Stop" : i === RULES.maxSessions ? "Time" : null;
    sessions.push({ date, spot, dte, iv: r.iv[i], ret, exit, ...opt });
    if (exit) break;
  }
  return { start, sessions, first: sessions[0], last: sessions[sessions.length - 1] };
}

function replayChart(r, run) {
  const [w, h, padL, padR, padT, padB] = [640, 230, 8, 52, 22, 26];
  const prices = r.closes.map(([, c]) => c);
  const min = Math.min(...prices) * 0.98, max = Math.max(...prices) * 1.02;
  const x = (i) => padL + (i / (r.closes.length - 1)) * (w - padL - padR);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (h - padT - padB);
  const node = (tag, attrs) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const text = (attrs, str) => Object.assign(node("text", attrs), { textContent: str });

  const svg = node("svg", { class: "replay__chart", viewBox: `0 0 ${w} ${h}`, role: "img",
    "aria-label": `${r.ticker} daily closes from ${longDate(r.closes[0][0])} to ${longDate(r.closes.at(-1)[0])}` });
  const endIdx = run.start + run.sessions.length - 1;
  const accent = run.last.ret < 0 ? "#f87171" : "#22c55e";

  for (let k = 0; k <= 3; k++) {
    const v = min + ((max - min) * k) / 3;
    svg.append(node("line", { x1: padL, x2: w - padR, y1: y(v), y2: y(v), stroke: "#243049", "stroke-width": 1 }),
      text({ x: w - padR + 6, y: y(v) + 4 }, "$" + Math.round(v)));
  }
  for (const i of [0, Math.floor((r.closes.length - 1) / 2), r.closes.length - 1])
    svg.append(text({ x: x(i), y: h - 6, "text-anchor": i === 0 ? "start" : i === r.closes.length - 1 ? "end" : "middle" }, shortDate(r.closes[i][0])));

  svg.append(node("rect", { x: x(run.start), y: padT, width: Math.max(x(endIdx) - x(run.start), 2), height: h - padT - padB, fill: accent, opacity: 0.1 }));
  const newsIdx = r.closes.findIndex(([d]) => d === r.newsDate);
  svg.append(node("line", { x1: x(newsIdx), x2: x(newsIdx), y1: padT - 8, y2: h - padB, stroke: "#6c8cff", "stroke-dasharray": "4 4" }),
    text({ x: x(newsIdx) - 4, y: padT - 10, "text-anchor": "end", class: "lbl", fill: "#6c8cff" }, "News"));

  const line = prices.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  svg.append(node("path", { d: line, fill: "none", stroke: "#e8ecf5", "stroke-width": 2, "stroke-linejoin": "round" }));
  svg.append(node("path", { d: line.split(" ").slice(run.start, endIdx + 1).join(" ").replace(/^L/, "M"), fill: "none", stroke: accent, "stroke-width": 3.5, "stroke-linejoin": "round" }));

  for (const [i, label, color] of [[run.start, "Entry", "#22d3a6"], [endIdx, "Exit", accent]]) {
    // Label the higher point above and the lower one below so the two never collide.
    const above = prices[i] === Math.max(prices[run.start], prices[endIdx]);
    svg.append(node("circle", { cx: x(i), cy: y(prices[i]), r: 5, fill: color, stroke: "#0a0e17", "stroke-width": 2 }),
      text({ x: x(i) + (label === "Exit" ? -8 : 8), y: y(prices[i]) + (above ? -10 : 18), "text-anchor": label === "Exit" ? "end" : "start", class: "lbl", fill: color },
        `${label} $${prices[i].toFixed(2)}`));
  }
  return svg;
}

function renderReplay(r) {
  const run = runReplay(r);
  const { first, last, sessions } = run;
  const side = r.put ? "put" : "call";
  const contract = `$${r.strike} ${side} · ${shortDate(r.expiry)} expiry`;
  const pnl = (last.price - first.price) * 100;
  const cls = (n) => (n < 0 ? "down" : "up");
  const exitText = { Target: `Target hit (+${RULES.target * 100}%)`, Stop: `Stop hit (${RULES.stop * 100}%)`, Time: "Time stop" }[last.exit];

  const phone = el("article", { class: "phone", "aria-label": `${r.ticker} replayed alert` },
    el("div", { class: "phone__bar" }, el("span", {}, longDate(r.entryDate)), el("span", { class: "tag" }, "REPLAY")),
    el("div", { class: "push" },
      el("img", { src: "assets/favicon.svg", alt: "", width: 36, height: 36 }),
      el("div", {},
        el("div", { class: "push__top" }, el("span", {}, "AlphOpt"), el("span", {}, "At the close")),
        el("p", { class: "push__title" }, `${r.dir === "bull" ? "▲" : "▼"} ${r.ticker} ${contract}`),
        el("p", { class: "push__body" }, `New ${r.dir === "bull" ? "bullish" : "bearish"} options signal. Entry about ${money(first.price)}.`))),
    el("div", { class: "sig-hero" },
      el("div", { class: "sig-hero__head" },
        el("div", {}, el("div", { class: "sig-hero__ticker" }, r.ticker), el("div", { class: "muted small" }, contract)),
        dirBadge(r.dir)),
      el("div", { class: "news" }, el("div", { class: "news__src" }, r.news.src), el("p", {}, r.news.text)),
      el("div", { class: "sig-hero__stats", style: "margin-top:0.9rem" },
        el("div", {}, el("span", { class: "muted small" }, "Entry"), el("strong", {}, money(first.price))),
        el("div", {}, el("span", { class: "muted small" }, "Target"), el("strong", { class: "up" }, money(first.price * (1 + RULES.target)))),
        el("div", {}, el("span", { class: "muted small" }, "Stop"), el("strong", { class: "down" }, money(first.price * (1 + RULES.stop))))),
      el("ul", { class: "why-list" }, ...r.why.map((w) => Array.isArray(w) ? el("li", { class: w[1] }, w[0]) : el("li", {}, w)))));

  const greekRow = (sym, name, key, fmt) =>
    el("tr", {}, el("td", {}, `${sym} ${name}`), ...sessions.map((s) => el("td", {}, fmt(s[key]))));
  const ledger = el("table", { class: "ledger" },
    el("thead", {}, el("tr", {}, el("th", { scope: "col" }, "At the close"), ...sessions.map((s) => el("th", { scope: "col" }, shortDate(s.date))))),
    el("tbody", {},
      el("tr", {}, el("td", {}, "Stock"), ...sessions.map((s) => el("td", {}, money(s.spot)))),
      el("tr", {}, el("td", {}, "Option"), ...sessions.map((s) => el("td", {}, money(s.price)))),
      el("tr", {}, el("td", {}, "Position P&L"), ...sessions.map((s) =>
        el("td", { class: s.ret ? cls(s.ret) : "" }, s.ret ? `${signed(s.ret * 100, 0)}%` : "Open",
          s.exit ? el("span", { class: `tag${s.exit === "Stop" ? " tag--stop" : ""}` }, s.exit.toUpperCase()) : null))),
      greekRow("Δ", "Delta", "delta", (v) => signed(v)),
      greekRow("Γ", "Gamma", "gamma", (v) => v.toFixed(3)),
      greekRow("Θ", "Theta / day", "theta", (v) => signed(v * 100, 0)),
      greekRow("ν", "Vega / IV pt", "vega", (v) => signed(v * 100, 0)),
      greekRow("", "IV (assumed)", "iv", (v) => `${Math.round(v * 100)}%`),
      el("tr", {}, el("td", {}, "Days to expiry"), ...sessions.map((s) => el("td", {}, s.dte)))));

  const main = el("div", { class: "replay__main" },
    el("section", { class: "panel" },
      el("div", { class: "panel__head" },
        el("h3", {}, `${r.ticker} · ${r.name}`),
        el("div", { class: "legend" },
          el("span", {}, el("i", { style: "background:#6c8cff" }), "News"),
          el("span", {}, el("i", { style: `background:${last.ret < 0 ? "#f87171" : "#22c55e"}` }), "Position held"))),
      replayChart(r, run),
      el("div", { class: "result" },
        el("div", {}, el("span", {}, "Stock"), el("strong", { class: cls(last.spot - first.spot) }, `${signed((last.spot / first.spot - 1) * 100, 1)}%`)),
        el("div", {}, el("span", {}, "Option"), el("strong", { class: cls(last.ret) }, `${signed(last.ret * 100, 0)}%`)),
        el("div", { class: "result__big" }, el("span", {}, "P&L per contract"), el("strong", { class: cls(pnl) }, usd(pnl))),
        el("div", {}, el("span", {}, "Exit"), el("strong", { style: "font-size:0.95rem" }, `${exitText}, ${shortDate(last.date)}`)))),
    el("section", { class: "panel" },
      el("div", { class: "panel__head" }, el("h3", {}, "Position and Greeks, close by close"),
        el("span", { class: "muted small" }, "Theta and vega in $ per contract")),
      el("div", { class: "ledger-wrap" }, ledger),
      el("p", { class: "replay__lesson" }, el("strong", {}, "What the Greeks show: "), r.lesson)));

  $("#replay").replaceChildren(phone, main);
}

function initReplays() {
  const tabs = REPLAYS.map((r, i) => {
    const { first, last } = runReplay(r);
    const pnl = (last.price - first.price) * 100;
    const tab = el("button", { class: "replay-tab", type: "button", role: "tab", "aria-selected": String(i === 0), "aria-controls": "replay" },
      el("span", {}, el("b", {}, r.ticker), el("small", {}, `${longDate(r.newsDate)} · ${r.put ? "Put" : "Call"}`)),
      el("strong", { class: pnl < 0 ? "down" : "up" }, usd(pnl)));
    tab.addEventListener("click", () => {
      $$(".replay-tab").forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      renderReplay(r);
    });
    return tab;
  });
  $("#replay-tabs").replaceChildren(...tabs);
  renderReplay(REPLAYS[0]);
}

/* ---------- Pricing toggle ---------- */
function initBilling() {
  $$(".billing__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const period = btn.dataset.billing;
      $$(".billing__btn").forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      $$(".plan__amt").forEach((amt) => { amt.textContent = "$" + amt.dataset[period]; });
    });
  });
}

/* ---------- Waitlist ---------- */
// Formspree form ID (the part after /f/ in the form's endpoint URL).
const FORMSPREE_ID = "xljbelzj";

function initWaitlist() {
  const form = $("#waitlist-form");
  const input = $("#email");
  const button = $("button[type=submit]", form);
  const msg = $("#waitlist-msg");

  const show = (text, ok) => {
    msg.textContent = text;
    msg.className = "waitlist__msg " + (ok ? "is-ok" : "is-err");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!input.checkValidity()) {
      input.setAttribute("aria-invalid", "true");
      show("Please enter a valid email address.", false);
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");

    if (!FORMSPREE_ID) {
      show("Sign-ups open soon. Please check back shortly.", false);
      return;
    }

    button.disabled = true;
    try {
      // Formspree returns JSON instead of redirecting when sent FormData with this Accept header.
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      show("You're on the list! We'll be in touch soon.", true);
    } catch {
      show("Something went wrong. Please try again later.", false);
    } finally {
      button.disabled = false;
    }
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = $$(".section__head, .step, .feature, .plan, .faq details");
  if (!("IntersectionObserver" in window)) return;
  targets.forEach((t) => t.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: "0px 0px -60px 0px" });
  targets.forEach((t) => io.observe(t));
}

document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  initNav();
  initHero();
  initBoard();
  initReplays();
  initModal();
  initBilling();
  initWaitlist();
  initReveal();
});
