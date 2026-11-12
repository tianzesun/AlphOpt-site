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

/* ---------- Income calculator ---------- */
// Normal quantiles for 12 equally likely months: a bumpy path that still ends exactly at
// the chosen 12-month move, so the call cap bites in the big up-months as it would in reality.
const MONTH_Z = [-1.732, -1.15, -0.812, -0.549, -0.319, -0.105, 0.105, 0.319, 0.549, 0.812, 1.15, 1.732];

// Simplified 12-month model: each month a one-month call is sold at `strike` above the
// price, capping that month's gain, and the premium is reinvested. Ignores dividends,
// taxes, commissions and early assignment.
function incomeScenario({ amount, gic, premium, strike, vol, move }) {
  const drift = Math.log(1 + move) / 12;
  const monthlyVol = vol / Math.sqrt(12);
  let coveredCall = amount;
  for (const z of MONTH_Z) {
    coveredCall *= Math.min(Math.exp(drift + monthlyVol * z), 1 + strike) + premium;
  }
  return [
    ["GIC", amount * gic],
    ["Covered call", coveredCall - amount],
    ["Stock only", amount * move],
  ];
}

function initIncomeCalc() {
  const form = $("#calc-form");
  const range = $("#calc-move");
  const presets = $$(".calc__presets button");
  const fmt = (n) => (n < 0 ? "−" : "+") + "$" + Math.round(Math.abs(n)).toLocaleString("en-CA");
  const pct = (n) => (n < 0 ? "−" : "+") + Math.abs(n * 100).toFixed(1) + "%";

  const render = () => {
    const num = (name, fallback) => {
      const v = parseFloat(form.elements[name].value);
      return Number.isFinite(v) && v >= 0 ? v : fallback;
    };
    const inputs = {
      amount: num("amount", 0),
      gic: num("gic", 0) / 100,
      premium: num("premium", 0) / 100,
      strike: num("strike", 0) / 100,
      vol: num("vol", 0) / 100,
      move: Number(range.value) / 100,
    };
    $("#calc-move-out").textContent = (inputs.move > 0 ? "+" : "") + range.value + "%";
    presets.forEach((b) => b.classList.toggle("is-active", b.dataset.move === range.value));

    const results = incomeScenario(inputs);
    const maxAbs = Math.max(...results.map(([, v]) => Math.abs(v)), 1);
    $("#calc-bars").replaceChildren(...results.map(([label, value]) => {
      const share = inputs.amount ? value / inputs.amount : 0;
      const text = `${fmt(value)} (${pct(share)})`;
      return el("li", { class: "bar", title: `${label}: ${text}` },
        el("span", { class: "bar__label" }, label),
        el("span", { class: "bar__track" },
          el("span", { class: `bar__fill bar__fill--${value < 0 ? "loss" : "gain"}`, style: `width:${(Math.abs(value) / maxAbs) * 50}%` })),
        el("span", { class: "bar__value" }, text)
      );
    }));

    const [[, gicGain], [, ccGain], [, stockGain]] = results;
    const diff = ccGain - gicGain;
    const summary = [
      "In this scenario, covered calls ",
      el("strong", {}, diff >= 0 ? `earn ${fmt(diff).slice(1)} more` : `earn ${fmt(diff).slice(1)} less`),
      " than the GIC",
    ];
    if (ccGain < 0) summary.push(" and lose money: the premium only partly offsets the stock's fall");
    else if (stockGain > ccGain) summary.push(", but trail simply holding the stock because the upside is capped");
    summary.push(".");
    $("#calc-summary").replaceChildren(...summary);
  };

  form.addEventListener("input", render);
  form.addEventListener("submit", (e) => e.preventDefault());
  presets.forEach((b) => b.addEventListener("click", () => { range.value = b.dataset.move; render(); }));
  render();
}

/* ---------- Case studies ---------- */
// Real events and real daily closes (as traded, before later splits). The implied
// volatilities are assumptions; premiums and Greeks come from the Black-Scholes model.
const CASES = [
  { ticker: "NVDA", dir: "bull", outcome: "win", put: false, strike: 400, expiry: "Jun 16, 2023",
    news: { date: "May 24, 2023, after the close", text: "NVIDIA guides next-quarter revenue to about $11 billion, roughly $4 billion above Wall Street estimates, on AI data-centre demand. The stock gaps up 24% the next day." },
    signal: "Post-earnings drift: price holds the gap all day, call volume stays heavy, and IV is already falling after the event, so calls are cheaper than they were the day before.",
    entry: { date: "May 25", spot: 379.8, dte: 22, iv: 0.5 },
    exit: { date: "May 30", spot: 401.11, dte: 17, iv: 0.48, reason: "Target hit as NVIDIA briefly tops a $1 trillion market value" },
    lesson: "Delta did the work: the stock's $21 rise far outweighed five days of theta and a small dip in IV. Buying after the gap, once IV had already come down, kept vega from hurting much." },
  { ticker: "CRWD", dir: "bear", outcome: "win", put: true, strike: 290, expiry: "Aug 16, 2024",
    news: { date: "July 19, 2024, before the open", text: "A faulty CrowdStrike Falcon update crashes about 8.5 million Windows computers worldwide, grounding flights and disrupting banks and hospitals. The stock falls 11%." },
    signal: "Negative-news momentum: the sell-off closes near the day's low, put volume surges, and the headline risk (lawsuits, customer losses) is still unpriced.",
    entry: { date: "July 19", spot: 304.96, dte: 28, iv: 0.55 },
    exit: { date: "July 22", spot: 263.92, dte: 25, iv: 0.65, reason: "Target hit as the stock drops another 13% on Monday" },
    lesson: "Two Greeks paid at once: negative delta profited from the drop, and rising fear lifted IV, so vega added to the gain." },
  { ticker: "META", dir: "bull", outcome: "loss", put: false, strike: 195, expiry: "Feb 17, 2023",
    news: { date: "Feb 1, 2023, after the close", text: "Meta calls 2023 its “year of efficiency”, cuts its cost outlook and adds $40 billion to its share buyback. The stock jumps 23% the next day." },
    signal: "Same post-earnings drift setup as NVDA: strong close at the highs and heavy call buying.",
    entry: { date: "Feb 2", spot: 188.77, dte: 15, iv: 0.45 },
    exit: { date: "Feb 6", spot: 186.06, dte: 11, iv: 0.42, reason: "Time stop: no follow-through after two sessions" },
    lesson: "The stock slipped only 1.4%, yet the call lost about half its value: delta, four days of theta and a dip in IV all worked against it. Short-dated calls need the move to come quickly, and the time stop cut the loss at about half the premium instead of letting it run toward zero." },
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

function caseCard(c) {
  const opt = (leg) => blackScholes({ ...leg, strike: c.strike, put: c.put });
  const [start, end] = [opt(c.entry), opt(c.exit)];
  const perContract = (end.price - start.price) * 100;
  const ret = end.price / start.price - 1;
  const stockMove = c.exit.spot / c.entry.spot - 1;
  const signed = (n, digits = 2) => (n < 0 ? "−" : "+") + Math.abs(n).toFixed(digits);
  const usd = (n) => (n < 0 ? "−" : "+") + "$" + Math.round(Math.abs(n)).toLocaleString("en-CA");
  const side = c.put ? "put" : "call";

  const greek = (sym, name, value, plain) =>
    el("li", { class: "greek" },
      el("span", { class: "greek__sym", title: name }, sym),
      el("span", { class: "greek__val" }, value),
      el("span", { class: "greek__plain" }, plain));

  const step = (label, date, body) =>
    el("li", {}, el("span", { class: "case__when" }, label, " · ", date), el("p", {}, body));

  return el("article", { class: `case case--${c.outcome}` },
    el("div", { class: "case__head" },
      el("div", {},
        el("div", { class: "case__ticker" }, c.ticker),
        el("div", { class: "muted small" }, `$${c.strike} ${side} · expires ${c.expiry} · ${c.entry.dte} DTE at entry`)),
      dirBadge(c.dir)),
    el("ol", { class: "case__timeline" },
      step("News", c.news.date, c.news.text),
      step("Signal", `${c.entry.date} close, stock ${money(c.entry.spot)}`,
        `${c.signal} Buy the $${c.strike} ${side} at about ${money(start.price)} (${money(start.price * 100)} per contract).`),
      step("Exit", `${c.exit.date} close, stock ${money(c.exit.spot)}`,
        `${c.exit.reason}. The ${side} is worth about ${money(end.price)}.`)),
    el("h4", {}, "Greeks at entry"),
    el("ul", { class: "greeks" },
      greek("Δ", "Delta", signed(start.delta), `Option moves about ${money(Math.abs(start.delta))} per $1 move in the stock`),
      greek("Γ", "Gamma", start.gamma.toFixed(3), `Delta changes by ${start.gamma.toFixed(3)} per $1 move, so gains speed up if the stock keeps going`),
      greek("Θ", "Theta", signed(start.theta), `Loses about ${money(Math.abs(start.theta) * 100)} per contract each day from time decay`),
      greek("ν", "Vega", signed(start.vega), `Changes by ${money(start.vega * 100)} per contract for each 1-point change in IV`),
      greek("IV", "Implied volatility", `${Math.round(c.entry.iv * 100)}% → ${Math.round(c.exit.iv * 100)}%`, "Assumed implied volatility at entry and exit")),
    el("div", { class: "case__result" },
      el("div", {}, el("span", {}, "Stock"), el("strong", { class: stockMove < 0 ? "down" : "up" }, `${signed(stockMove * 100, 1)}%`)),
      el("div", {}, el("span", {}, "Option"), el("strong", { class: ret < 0 ? "down" : "up" }, `${signed(ret * 100, 0)}%`)),
      el("div", {}, el("span", {}, "Per contract"), el("strong", { class: perContract < 0 ? "down" : "up" }, usd(perContract)))),
    el("p", { class: "case__lesson" }, el("strong", {}, "Lesson: "), c.lesson)
  );
}

function initCases() {
  $("#case-list").replaceChildren(...CASES.map(caseCard));
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
  const targets = $$(".section__head, .step, .strategy, .case, .feature, .plan, .faq details");
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
  initIncomeCalc();
  initCases();
  initModal();
  initBilling();
  initWaitlist();
  initReveal();
});
