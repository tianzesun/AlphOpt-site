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
// The hero card shows one real replay (NVIDIA's May 2023 guidance beat) rather than sample data.
function initHero() {
  const r = REPLAYS.find((x) => x.ticker === "NVDA" && x.newsDate === "2023-05-24");
  const { start, sessions, first, last } = runReplay(r);
  const side = r.put ? "put" : "call";
  const pnl = (last.price - first.price) * 100;
  const cls = pnl < 0 ? "down" : "up";
  const exitText = { Target: "Target hit", Stop: "Stop hit", Time: "Time stop" }[last.exit];
  const shown = r.closes.slice(0, start + sessions.length + 2);

  $("#hero-date").textContent = `Signal replay · ${longDate(r.entryDate)}`;
  $("#hero-ticker").textContent = r.ticker;
  $("#hero-contract").textContent = `$${r.strike} ${side} · ${shortDate(r.expiry)} expiry`;
  $("#hero-dir").replaceWith(Object.assign(dirBadge(r.dir), { id: "hero-dir" }));
  const chart = $("#hero-chart");
  drawChart(chart, shown.map(([, c]) => c), pnl < 0 ? "#f87171" : "#22d3a6");
  chart.setAttribute("aria-label", `${r.ticker} daily closes, ${shortDate(shown[0][0])} to ${shortDate(shown.at(-1)[0])}`);
  $("#hero-caption").textContent = `Daily closes · bought ${shortDate(r.entryDate)} at ${money(first.spot)}, sold ${shortDate(last.date)} at ${money(last.spot)}`;

  const stat = (label, value, c = "") => el("div", {}, el("span", { class: "muted small" }, label), el("strong", { class: c }, value));
  $("#hero-stats").replaceChildren(
    stat("Entry", money(first.price)),
    stat("Target", money(first.price * (1 + RULES.target)), "up"),
    stat("Stop", money(first.price * (1 + RULES.stop)), "down"));
  $("#hero-result").replaceChildren(
    el("span", {}, `${exitText}, ${shortDate(last.date)}`),
    el("strong", { class: cls }, `${signed(last.ret * 100, 0)}% · ${usd(pnl)}`));
  $("#hero-why").replaceChildren(el("strong", {}, "Why: "),
    r.why.filter((w) => !Array.isArray(w)).map((w) => w.charAt(0).toLowerCase() + w.slice(1)).join("; ") + ".");

  const track = $("#ticker-track");
  const items = REPLAYS.map((x) => {
    const { first, last } = runReplay(x);
    const pnl = (last.price - first.price) * 100;
    return el("span", { class: "ticker__item" },
      el("b", {}, x.ticker),
      el("span", { class: x.dir === "bull" ? "up" : "down" }, `${x.dir === "bull" ? "▲" : "▼"} ${x.put ? "PUT" : "CALL"}`),
      el("span", { class: "muted" }, longDate(x.newsDate)),
      el("span", { class: pnl < 0 ? "down" : "up" }, `${signed(last.ret * 100, 0)}% · ${usd(pnl)}`)
    );
  });
  // Seven replays are narrower than wide screens, so each marquee half holds the list twice.
  const half = [...items, ...items.map((n) => n.cloneNode(true))];
  half.slice(items.length).forEach((n) => n.setAttribute("aria-hidden", "true"));
  // Duplicate the list so the CSS marquee loops seamlessly.
  track.append(...half, ...half.map((n) => {
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
  { ticker: "SPY", name: "SPDR S&P 500 ETF", dir: "bear", put: true, strike: 510, expiry: "2025-05-16",
    newsDate: "2025-04-02", entryDate: "2025-04-03", ivSource: "VIX close",
    news: { src: "U.S. tariff announcement · Apr 2, 2025 · after the close", text: "The White House announces a 10% baseline tariff on imports plus much higher rates on dozens of countries. The S&P 500 has its worst day since 2020." },
    why: ["Fell 4.9% to $536.70", "Closed at the day's low", "VIX jumped from 21.5 to 30.0", "Volume 1.9× its recent daily average"],
    iv: [0.3002, 0.4531, 0.4698, 0.5233, 0.3362, 0.4072],
    lesson: "China retaliated the next morning and SPY fell another 5.9%. Delta paid, and the VIX surging to 45 lifted the put further through vega. Three sessions after the exit, a tariff pause sent SPY up 10.5%, so holding past the target would have given the whole gain back.",
    closes: [["2025-03-12", 558.87], ["2025-03-13", 551.42], ["2025-03-14", 562.81], ["2025-03-17", 567.15], ["2025-03-18", 561.02], ["2025-03-19", 567.13], ["2025-03-20", 565.49], ["2025-03-21", 563.98], ["2025-03-24", 574.08], ["2025-03-25", 575.46], ["2025-03-26", 568.59], ["2025-03-27", 567.08], ["2025-03-28", 555.66], ["2025-03-31", 559.39], ["2025-04-01", 560.97], ["2025-04-02", 564.52], ["2025-04-03", 536.7], ["2025-04-04", 505.28], ["2025-04-07", 504.38], ["2025-04-08", 496.48], ["2025-04-09", 548.62], ["2025-04-10", 524.58], ["2025-04-11", 533.94], ["2025-04-14", 539.12], ["2025-04-15", 537.61]] },
  { ticker: "NVDA", name: "NVIDIA Corp.", dir: "bear", put: true, strike: 110, expiry: "2025-02-21",
    newsDate: "2025-01-27", entryDate: "2025-01-27",
    news: { src: "DeepSeek sell-off · Jan 27, 2025 · before the open", text: "Chinese start-up DeepSeek's low-cost R1 AI model tops app-store charts, raising doubts about AI chip spending. NVIDIA posts the largest one-day loss of market value in U.S. history." },
    why: ["Fell 17.0% to $118.42", "Volume 3.7× its recent daily average", "Closed near the low (bottom 15% of the day's range)", ["IV spiked after the crash, so puts were expensive", "warn"]],
    iv: [0.6, 0.56, 0.55, 0.54, 0.53, 0.52],
    lesson: "Buying puts after a crash means paying for fear. NVIDIA rebounded 8.9% the next day, and the put lost on delta and on falling IV at once. The move came overnight, so a close-based stop could only exit at −69%, well past −35%.",
    closes: [["2025-01-02", 138.31], ["2025-01-03", 144.47], ["2025-01-06", 149.43], ["2025-01-07", 140.14], ["2025-01-08", 140.11], ["2025-01-10", 135.91], ["2025-01-13", 133.23], ["2025-01-14", 131.76], ["2025-01-15", 136.24], ["2025-01-16", 133.57], ["2025-01-17", 137.71], ["2025-01-21", 140.83], ["2025-01-22", 147.07], ["2025-01-23", 147.22], ["2025-01-24", 142.62], ["2025-01-27", 118.42], ["2025-01-28", 128.99], ["2025-01-29", 123.7], ["2025-01-30", 124.65], ["2025-01-31", 120.07], ["2025-02-03", 116.66], ["2025-02-04", 118.65]] },
  { ticker: "TSLA", name: "Tesla Inc.", dir: "bull", put: false, strike: 280, expiry: "2024-11-15",
    newsDate: "2024-10-23", entryDate: "2024-10-24",
    news: { src: "Tesla Q3 2024 results · Oct 23, 2024 · after the close", text: "Profit beats estimates, and Elon Musk forecasts 20–30% vehicle sales growth in 2025. The stock jumps 22%, its best day since 2013." },
    why: ["Earnings gap: closed +21.9% at $260.48", "Closed near the high (top 8% of the day's range)", "Volume 2.8× its recent daily average", ["Short-dated: 22 days to expiry, strike 7.5% away", "warn"]],
    iv: [0.55, 0.53, 0.52, 0.51, 0.5, 0.5],
    lesson: "The call was up 34% after one day but short of the +50% target. The stock then gave back the rally and ended almost flat (−0.4%), yet the call lost 37%: delta reversed and theta charged about $30 a day. Gains on short-dated calls can vanish fast.",
    closes: [["2024-10-01", 258.02], ["2024-10-02", 249.02], ["2024-10-03", 240.66], ["2024-10-04", 250.08], ["2024-10-07", 240.83], ["2024-10-08", 244.5], ["2024-10-09", 241.05], ["2024-10-10", 238.77], ["2024-10-11", 217.8], ["2024-10-14", 219.16], ["2024-10-15", 219.57], ["2024-10-16", 221.33], ["2024-10-17", 220.89], ["2024-10-18", 220.7], ["2024-10-21", 218.85], ["2024-10-22", 217.97], ["2024-10-23", 213.65], ["2024-10-24", 260.48], ["2024-10-25", 269.19], ["2024-10-28", 262.51], ["2024-10-29", 259.52], ["2024-10-30", 257.55], ["2024-10-31", 249.85], ["2024-11-01", 248.98], ["2024-11-04", 242.84]] },
  { ticker: "CRWD", name: "CrowdStrike Holdings", dir: "bear", put: true, strike: 290, expiry: "2024-08-16",
    newsDate: "2024-07-19", entryDate: "2024-07-19",
    news: { src: "Global IT outage · July 19, 2024 · before the open", text: "A faulty CrowdStrike Falcon update crashes about 8.5 million Windows computers, grounding flights and disrupting banks and hospitals." },
    why: ["Fell 11.1% to $304.96 on the outage", "Volume 13.3× its recent daily average", "Already down 9.1% in the three sessions before", "Fallout (customer claims, lawsuits) still unknown"],
    iv: [0.55, 0.65, 0.63, 0.62, 0.6, 0.58],
    lesson: "Two Greeks paid at once: negative delta profited from Monday's 13% drop, and rising fear lifted IV, so vega added to the gain.",
    closes: [["2024-07-01", 392.15], ["2024-07-02", 385.05], ["2024-07-03", 387.18], ["2024-07-05", 389.68], ["2024-07-08", 390.71], ["2024-07-09", 385.88], ["2024-07-10", 374.45], ["2024-07-11", 370.43], ["2024-07-12", 371.32], ["2024-07-15", 377.37], ["2024-07-16", 369.05], ["2024-07-17", 354.94], ["2024-07-18", 343.05], ["2024-07-19", 304.96], ["2024-07-22", 263.91], ["2024-07-23", 268.88], ["2024-07-24", 258.14], ["2024-07-25", 254.15], ["2024-07-26", 256.16]] },
  { ticker: "NVDA", name: "NVIDIA Corp.", dir: "bull", put: false, strike: 400, expiry: "2023-06-16",
    newsDate: "2023-05-24", entryDate: "2023-05-25",
    news: { src: "NVIDIA Q1 FY2024 results · May 24, 2023 · after the close", text: "Guides next-quarter revenue to about $11 billion, roughly $4 billion above analyst estimates, on AI data-centre demand." },
    why: ["Earnings gap held: closed +24.4% at $379.80", "Volume 3.7× its recent daily average", "Guidance beat, not just an earnings beat", ["Closed mid-range, below the $394.80 high", "warn"]],
    iv: [0.5, 0.49, 0.48, 0.48, 0.47, 0.47],
    lesson: "Delta did the work. The stock's $21 rise outweighed five calendar days of theta and a small IV dip; buying after the event, when IV had already come down, kept vega from hurting much.",
    closes: [["2023-05-01", 289.1], ["2023-05-02", 282.1], ["2023-05-03", 278.02], ["2023-05-04", 275.62], ["2023-05-05", 286.8], ["2023-05-08", 291.51], ["2023-05-09", 285.71], ["2023-05-10", 288.85], ["2023-05-11", 285.78], ["2023-05-12", 283.4], ["2023-05-15", 289.53], ["2023-05-16", 292.13], ["2023-05-17", 301.78], ["2023-05-18", 316.78], ["2023-05-19", 312.64], ["2023-05-22", 311.76], ["2023-05-23", 306.88], ["2023-05-24", 305.38], ["2023-05-25", 379.8], ["2023-05-26", 389.46], ["2023-05-30", 401.11], ["2023-05-31", 378.34], ["2023-06-01", 397.7], ["2023-06-02", 393.27]] },
  { ticker: "KRE", name: "SPDR S&P Regional Banking ETF", dir: "bear", put: true, strike: 50, expiry: "2023-04-21",
    newsDate: "2023-03-08", entryDate: "2023-03-09",
    news: { src: "SVB Financial · Mar 8, 2023 · after the close", text: "Silicon Valley Bank sells $21 billion of securities at a $1.8 billion loss and seeks to raise $2.25 billion, sparking fears of deposit runs at regional banks." },
    why: ["Fell 8.1% to $53.02 as SVB's losses spread to regional banks", "Closed at the day's low", "Volume 7.5× its recent daily average", "Fifth drop in six sessions"],
    iv: [0.4, 0.5, 0.65, 0.6, 0.6, 0.55],
    lesson: "Delta and vega together: regulators shut SVB the next day, KRE fell another 4.4%, and rising fear pushed IV up, doubling a cheap put in one session.",
    closes: [["2023-02-15", 64.01], ["2023-02-16", 62.88], ["2023-02-17", 63.2], ["2023-02-21", 61.73], ["2023-02-22", 61.43], ["2023-02-23", 61.67], ["2023-02-24", 61.68], ["2023-02-27", 61.66], ["2023-02-28", 61.56], ["2023-03-01", 61.19], ["2023-03-02", 59.64], ["2023-03-03", 60.38], ["2023-03-06", 59.93], ["2023-03-07", 58.0], ["2023-03-08", 57.7], ["2023-03-09", 53.02], ["2023-03-10", 50.69], ["2023-03-13", 44.45], ["2023-03-14", 45.38], ["2023-03-15", 44.64], ["2023-03-16", 46.21], ["2023-03-17", 43.44], ["2023-03-20", 43.56], ["2023-03-21", 46.07]] },
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
      greekRow("", `IV (${r.ivSource || "assumed"})`, "iv", (v) => `${Math.round(v * 100)}%`),
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
  const results = REPLAYS.map((r) => { const { first, last } = runReplay(r); return (last.price - first.price) * 100; });
  const wins = results.filter((v) => v > 0).length;
  const net = results.reduce((a, b) => a + b, 0);
  $("#replay-record").replaceChildren(
    el("span", {}, el("strong", {}, REPLAYS.length), " replays"),
    el("span", {}, el("strong", { class: "up" }, wins), " wins"),
    el("span", {}, el("strong", { class: "down" }, REPLAYS.length - wins), " losses"),
    el("span", {}, "Net ", el("strong", { class: net < 0 ? "down" : "up" }, usd(net)), " per contract"));
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
