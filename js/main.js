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
// Set to your form backend (e.g. a serverless function) to collect sign-ups.
const WAITLIST_ENDPOINT = "";

function initWaitlist() {
  const form = $("#waitlist-form");
  const input = $("#email");
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

    if (WAITLIST_ENDPOINT) {
      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: input.value.trim() }),
        });
        if (!res.ok) throw new Error(String(res.status));
      } catch {
        show("Something went wrong. Please try again later.", false);
        return;
      }
    }
    form.reset();
    show("You're on the list! We'll be in touch soon.", true);
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
  initModal();
  initBilling();
  initWaitlist();
  initReveal();
});
