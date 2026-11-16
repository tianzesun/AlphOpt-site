"use strict";

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

/* ---------- Language ---------- */
const t = I18N.t;
// A replay's text field in the current language (Chinese lives in each replay's `zh` object).
const tr = (r, field) => (I18N.lang === "zh" && r.zh?.[field]) || r[field];
const sideOf = (r) => t(r.put ? "put" : "call");
const contractOf = (r) => t("contract", { strike: r.strike, side: sideOf(r), date: shortDate(r.expiry) });

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

const dirBadge = (dir) =>
  el("span", { class: `dir dir--${dir}` }, t(dir));

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
    toggle.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
  };
  toggle.addEventListener("click", () => setOpen(!links.classList.contains("is-open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  setOpen(false);
  I18N.onChange(() => setOpen(links.classList.contains("is-open")));
}

/* ---------- Hero ---------- */
// The hero cycles through five replays, opening on a loss (Tesla: the stock ended flat but the call
// lost 37%). Three lose and two gain, close to the site's overall record, so visitors never see only winners.
const HERO_CASES = [["TSLA", "2024-10-23"], ["AAPL", "2024-06-10"], ["MSFT", "2025-01-29"], ["AMZN", "2024-08-01"], ["QQQ", "2024-08-05"]];
let heroIndex = 0;

function renderHero() {
  const [ticker, newsDate] = HERO_CASES[heroIndex];
  const r = REPLAYS.find((x) => x.ticker === ticker && x.newsDate === newsDate);
  $("#hero-count").textContent = t("hero.count", { i: heroIndex + 1, n: HERO_CASES.length });
  const { start, sessions, first, last } = runReplay(r);
  const pnl = (last.price - first.price) * 100;
  const cls = pnl < 0 ? "down" : "up";
  const shown = r.closes.slice(0, start + sessions.length + 2);

  $("#hero-date").textContent = t("hero.date", { date: longDate(r.entryDate) });
  $("#hero-tag").textContent = t("replay.tag");
  $("#hero-ticker").textContent = r.ticker;
  $("#hero-contract").textContent = contractOf(r);
  $("#hero-dir").replaceWith(Object.assign(dirBadge(r.dir), { id: "hero-dir" }));
  const chart = $("#hero-chart");
  drawChart(chart, shown.map(([, c]) => c), pnl < 0 ? "#f87171" : "#22d3a6");
  chart.setAttribute("aria-label", t("hero.chart", { ticker: r.ticker, from: shortDate(shown[0][0]), to: shortDate(shown.at(-1)[0]) }));
  $("#hero-caption").textContent = t("hero.caption", { d1: shortDate(r.entryDate), p1: money(first.spot), d2: shortDate(last.date), p2: money(last.spot) });

  const stat = (label, value, c = "") => el("div", {}, el("span", { class: "muted small" }, label), el("strong", { class: c }, value));
  $("#hero-stats").replaceChildren(
    stat(t("ex.entry"), money(first.price)),
    stat(t("ex.target"), money(first.price * (1 + RULES.target)), "up"),
    stat(t("ex.stop"), money(first.price * (1 + RULES.stop)), "down"));
  $("#hero-result").replaceChildren(
    el("span", {}, t("exitOn", { exit: t("exit." + last.exit), date: shortDate(last.date) })),
    el("strong", { class: cls }, t("hypo", { pct: signed(last.ret * 100, 0) })));
  $("#hero-why").replaceChildren(el("strong", {}, t("replay.lesson")), tr(r, "lesson"));
}

// Previous / next buttons, plus the left and right arrow keys while focus is in the card.
function initHeroNav() {
  const go = (step) => {
    heroIndex = (heroIndex + step + HERO_CASES.length) % HERO_CASES.length;
    renderHero();
  };
  $("#hero-prev").addEventListener("click", () => go(-1));
  $("#hero-next").addEventListener("click", () => go(1));
  $(".hero__visual").addEventListener("keydown", (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (!step) return;
    e.preventDefault();
    go(step);
  });
}

/* ---------- How it works ---------- */
// Fill each step's example from the NVIDIA DeepSeek replay so the numbers match the rest of the page.
function renderSteps() {
  const r = REPLAYS.find((x) => x.ticker === "NVDA" && x.newsDate === "2025-01-27");
  const { start, first, last } = runReplay(r);
  const prev = r.closes[start - 1][1];
  const pnl = (last.price - first.price) * 100;
  const list = (label, rows) => [
    el("p", { class: "step__ex-label" }, label),
    el("dl", {}, ...rows.map(([dt, dd, cls = ""]) => el("div", {}, el("dt", {}, dt), el("dd", { class: cls }, dd)))),
  ];
  $("#step-ex-1").replaceChildren(...list(t("step.spotted", { date: longDate(r.newsDate) }), [
    [t("step.news"), t("step.newsVal")],
    [t("step.stock"), t("step.stockVal", { pct: signed((first.spot / prev - 1) * 100, 1), price: money(first.spot) }), "down"],
    [t("step.volume"), t("step.volumeVal", { x: r.why[1].match(/([\d.]+)×/)[1] })],
  ]));
  $("#step-ex-2").replaceChildren(...list(t("step.picked"), [
    [t("step.contract"), `$${r.strike} ${sideOf(r)} · ${shortDate(r.expiry)}`],
    [t("step.delta"), t("step.deltaVal", { x: signed(first.delta) })],
    [t("step.theta"), t("step.thetaVal", { x: usd(first.theta * 100) })],
  ]));
  $("#step-ex-3").replaceChildren(...list(t("step.alerted"), [
    [t("step.entryTarget"), `${money(first.price)} → ${money(first.price * (1 + RULES.target))}`],
    [t("ex.stop"), money(first.price * (1 + RULES.stop)), "down"],
    [t("step.result"), t("hypo", { pct: signed(last.ret * 100, 0) }), pnl < 0 ? "down" : "up"],
  ]));
}

/* ---------- Signal board ---------- */
const state = { result: "all", dir: "all", sort: "date" };

function signalCard(r, run) {
  const { start, sessions, first, last } = run;
  const pnl = (last.price - first.price) * 100;
  const cls = pnl < 0 ? "down" : "up";
  const side = sideOf(r);

  const spark = document.createElementNS(SVG_NS, "svg");
  spark.setAttribute("class", "card__spark");
  spark.setAttribute("viewBox", "0 0 300 110");
  spark.setAttribute("preserveAspectRatio", "none");
  spark.setAttribute("aria-hidden", "true");
  drawChart(spark, r.closes.slice(0, start + sessions.length + 2).map(([, c]) => c), pnl < 0 ? "#f87171" : "#22c55e");

  const card = el("button", { class: "card", type: "button",
      "aria-label": t("card.aria", { ticker: r.ticker, side, date: longDate(r.newsDate), pct: signed(last.ret * 100, 0) }) },
    el("div", { class: "card__head" },
      el("div", {},
        el("div", { class: "card__ticker" }, r.ticker),
        el("div", { class: "card__name" }, tr(r, "name"))
      ),
      dirBadge(r.dir)
    ),
    spark,
    el("div", { class: "card__setup" }, contractOf(r)),
    el("div", { class: "card__row" }, el("span", {}, t("ex.entry")), el("strong", {}, money(first.price))),
    el("div", { class: "card__row" }, el("span", {}, t("ex.target")), el("strong", { class: "up" }, money(first.price * (1 + RULES.target)))),
    el("div", { class: "card__row" }, el("span", {}, t("ex.stop")), el("strong", { class: "down" }, money(first.price * (1 + RULES.stop)))),
    el("div", { class: "card__result" },
      el("strong", { class: cls }, t("hypo", { pct: signed(last.ret * 100, 0) })),
      el("span", {}, t("exitOn", { exit: t("exit." + last.exit), date: shortDate(last.date) }))
    ),
    el("div", { class: "card__foot" },
      el("span", { class: "chip" }, t(r.put ? "Put" : "Call")),
      el("span", {}, longDate(r.newsDate)),
      el("span", { class: "link" }, t("card.full"))
    )
  );
  card.addEventListener("click", () => showReplay(r));
  return card;
}

function renderBoard() {
  const list = REPLAYS
    .map((r) => ({ r, run: runReplay(r) }))
    .map((x) => ({ ...x, pnl: (x.run.last.price - x.run.first.price) * 100 }))
    .filter(({ pnl }) => state.result === "all" || (state.result === "win" ? pnl > 0 : pnl <= 0))
    .filter(({ r }) => state.dir === "all" || r.dir === state.dir)
    .sort((a, b) => {
      if (state.sort === "ticker") return a.r.ticker.localeCompare(b.r.ticker) || b.r.newsDate.localeCompare(a.r.newsDate);
      if (state.sort === "pnl") return b.pnl - a.pnl;
      return b.r.newsDate.localeCompare(a.r.newsDate);
    });

  $("#board").replaceChildren(...list.map(({ r, run }) => signalCard(r, run)));
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
    lesson: "China retaliated the next morning and SPY fell another 5.9%. Delta paid, and the VIX surging to 45 lifted the put further through vega. Three sessions after the exit, a tariff pause sent SPY up 10.5%, enough to erase the put's whole gain: a reminder of how quickly an option's value can reverse.",
    zh: {"name": "SPDR 标普500 ETF", "ivSource": "VIX 收盘值", "news": {"src": "美国关税公告 · 2025年4月2日 · 收盘后", "text": "白宫宣布对进口商品征收 10% 的基准关税，并对数十个国家征收高得多的税率。标普500指数录得自2020年以来最大单日跌幅。"}, "why": ["下跌 4.9% 至 $536.70", "收于当日最低点", "VIX 从 21.5 跳升至 30.0", "成交量为近期日均的 1.9 倍"], "lesson": "次日早上中国宣布反制，SPY 又下跌 5.9%。Delta 带来收益，VIX 飙升至 45 又通过 Vega 进一步推高看跌期权价格。离场三个交易日后，关税暂缓令 SPY 上涨 10.5%，足以抹去这份看跌期权的全部收益：这说明期权的价值可以多快地逆转。"},
    closes: [["2025-03-12", 558.87], ["2025-03-13", 551.42], ["2025-03-14", 562.81], ["2025-03-17", 567.15], ["2025-03-18", 561.02], ["2025-03-19", 567.13], ["2025-03-20", 565.49], ["2025-03-21", 563.98], ["2025-03-24", 574.08], ["2025-03-25", 575.46], ["2025-03-26", 568.59], ["2025-03-27", 567.08], ["2025-03-28", 555.66], ["2025-03-31", 559.39], ["2025-04-01", 560.97], ["2025-04-02", 564.52], ["2025-04-03", 536.7], ["2025-04-04", 505.28], ["2025-04-07", 504.38], ["2025-04-08", 496.48], ["2025-04-09", 548.62], ["2025-04-10", 524.58], ["2025-04-11", 533.94], ["2025-04-14", 539.12], ["2025-04-15", 537.61]] },
  { ticker: "NVDA", name: "NVIDIA Corp.", dir: "bear", put: true, strike: 110, expiry: "2025-02-21",
    newsDate: "2025-01-27", entryDate: "2025-01-27",
    news: { src: "DeepSeek sell-off · Jan 27, 2025 · before the open", text: "Chinese start-up DeepSeek's low-cost R1 AI model tops app-store charts, raising doubts about AI chip spending. NVIDIA posts the largest one-day loss of market value in U.S. history." },
    why: ["Fell 17.0% to $118.42", "Volume 3.7× its recent daily average", "Closed near the low (bottom 15% of the day's range)", ["IV spiked after the crash, so puts were expensive", "warn"]],
    iv: [0.6, 0.56, 0.55, 0.54, 0.53, 0.52],
    lesson: "Buying puts after a crash means paying for fear. NVIDIA rebounded 8.9% the next day, and the put lost on delta and on falling IV at once. The move came overnight, so a close-based stop could only exit at −69%, well past −35%.",
    zh: {"name": "英伟达", "news": {"src": "DeepSeek 抛售潮 · 2025年1月27日 · 开盘前", "text": "中国初创公司 DeepSeek 的低成本 R1 AI 模型登顶应用商店排行榜，引发市场对 AI 芯片支出的质疑。英伟达录得美国历史上最大的单日市值损失。"}, "why": ["下跌 17.0% 至 $118.42", "成交量为近期日均的 3.7 倍", "收盘接近最低点（位于当日区间底部 15%）", ["暴跌后隐含波动率飙升，看跌期权价格昂贵", "warn"]], "lesson": "暴跌后买入看跌期权，等于为恐慌买单。英伟达次日反弹 8.9%，看跌期权同时因 Delta 和隐含波动率回落而亏损。由于行情发生在隔夜，基于收盘价的止损只能在 −69% 离场，远超 −35%。"},
    closes: [["2025-01-02", 138.31], ["2025-01-03", 144.47], ["2025-01-06", 149.43], ["2025-01-07", 140.14], ["2025-01-08", 140.11], ["2025-01-10", 135.91], ["2025-01-13", 133.23], ["2025-01-14", 131.76], ["2025-01-15", 136.24], ["2025-01-16", 133.57], ["2025-01-17", 137.71], ["2025-01-21", 140.83], ["2025-01-22", 147.07], ["2025-01-23", 147.22], ["2025-01-24", 142.62], ["2025-01-27", 118.42], ["2025-01-28", 128.99], ["2025-01-29", 123.7], ["2025-01-30", 124.65], ["2025-01-31", 120.07], ["2025-02-03", 116.66], ["2025-02-04", 118.65]] },
  { ticker: "TSLA", name: "Tesla Inc.", dir: "bull", put: false, strike: 280, expiry: "2024-11-15",
    newsDate: "2024-10-23", entryDate: "2024-10-24",
    news: { src: "Tesla Q3 2024 results · Oct 23, 2024 · after the close", text: "Profit beats estimates, and Elon Musk forecasts 20–30% vehicle sales growth in 2025. The stock jumps 22%, its best day since 2013." },
    why: ["Earnings gap: closed +21.9% at $260.48", "Closed near the high (top 8% of the day's range)", "Volume 2.8× its recent daily average", ["Short-dated: 22 days to expiry, strike 7.5% away", "warn"]],
    iv: [0.55, 0.53, 0.52, 0.51, 0.5, 0.5],
    lesson: "The call was up 34% after one day but short of the +50% target. The stock then gave back the rally and ended almost flat (−0.4%), yet the call lost 37%: delta reversed and theta charged about $30 a day. Gains on short-dated calls can vanish fast.",
    zh: {"name": "特斯拉", "news": {"src": "特斯拉 2024 年第三季度财报 · 2024年10月23日 · 收盘后", "text": "利润超出预期，埃隆·马斯克预测 2025 年汽车销量增长 20–30%。股价大涨 22%，创 2013 年以来最佳单日表现。"}, "why": ["财报跳空：收涨 21.9% 至 $260.48", "收盘接近最高点（位于当日区间顶部 8%）", "成交量为近期日均的 2.8 倍", ["短期合约：距到期 22 天，行权价相差 7.5%", "warn"]], "lesson": "看涨期权一天后上涨 34%，但未达到 +50% 的目标。随后股价回吐涨幅，最终几乎持平（−0.4%），看涨期权却亏损 37%：Delta 反转，Theta 每天消耗约 $30。短期看涨期权的收益可能迅速消失。"},
    closes: [["2024-10-01", 258.02], ["2024-10-02", 249.02], ["2024-10-03", 240.66], ["2024-10-04", 250.08], ["2024-10-07", 240.83], ["2024-10-08", 244.5], ["2024-10-09", 241.05], ["2024-10-10", 238.77], ["2024-10-11", 217.8], ["2024-10-14", 219.16], ["2024-10-15", 219.57], ["2024-10-16", 221.33], ["2024-10-17", 220.89], ["2024-10-18", 220.7], ["2024-10-21", 218.85], ["2024-10-22", 217.97], ["2024-10-23", 213.65], ["2024-10-24", 260.48], ["2024-10-25", 269.19], ["2024-10-28", 262.51], ["2024-10-29", 259.52], ["2024-10-30", 257.55], ["2024-10-31", 249.85], ["2024-11-01", 248.98], ["2024-11-04", 242.84]] },
  { ticker: "NVDA", name: "NVIDIA Corp.", dir: "bull", put: false, strike: 400, expiry: "2023-06-16",
    newsDate: "2023-05-24", entryDate: "2023-05-25",
    news: { src: "NVIDIA Q1 FY2024 results · May 24, 2023 · after the close", text: "Guides next-quarter revenue to about $11 billion, roughly $4 billion above analyst estimates, on AI data-centre demand." },
    why: ["Earnings gap held: closed +24.4% at $379.80", "Volume 3.7× its recent daily average", "Guidance beat, not just an earnings beat", ["Closed mid-range, below the $394.80 high", "warn"]],
    iv: [0.5, 0.49, 0.48, 0.48, 0.47, 0.47],
    lesson: "Delta did the work. The stock's $21 rise outweighed five calendar days of theta and a small IV dip; buying after the event, when IV had already come down, kept vega from hurting much.",
    zh: {"name": "英伟达", "news": {"src": "英伟达 2024 财年第一季度财报 · 2023年5月24日 · 收盘后", "text": "受 AI 数据中心需求推动，公司预计下季度营收约 110 亿美元，比分析师预期高出约 40 亿美元。"}, "why": ["财报跳空站稳：收涨 24.4% 至 $379.80", "成交量为近期日均的 3.7 倍", "超预期的是业绩指引，而不只是盈利", ["收于区间中部，低于 $394.80 的最高点", "warn"]], "lesson": "Delta 发挥了主要作用。股价上涨 $21，抵消了五个日历日的 Theta 损耗和隐含波动率的小幅回落；在事件之后、隐含波动率已回落时买入，让 Vega 的拖累很小。"},
    closes: [["2023-05-01", 289.1], ["2023-05-02", 282.1], ["2023-05-03", 278.02], ["2023-05-04", 275.62], ["2023-05-05", 286.8], ["2023-05-08", 291.51], ["2023-05-09", 285.71], ["2023-05-10", 288.85], ["2023-05-11", 285.78], ["2023-05-12", 283.4], ["2023-05-15", 289.53], ["2023-05-16", 292.13], ["2023-05-17", 301.78], ["2023-05-18", 316.78], ["2023-05-19", 312.64], ["2023-05-22", 311.76], ["2023-05-23", 306.88], ["2023-05-24", 305.38], ["2023-05-25", 379.8], ["2023-05-26", 389.46], ["2023-05-30", 401.11], ["2023-05-31", 378.34], ["2023-06-01", 397.7], ["2023-06-02", 393.27]] },
  { ticker: "META", name: "Meta Platforms", dir: "bull", put: false, strike: 195, expiry: "2023-02-17",
    newsDate: "2023-02-01", entryDate: "2023-02-02",
    news: { src: "Meta Q4 2022 results · Feb 1, 2023 · after the close", text: "Calls 2023 its “year of efficiency”, cuts its expense outlook and adds $40 billion to its share buyback." },
    why: ["Earnings gap held: closed +23.3% at $188.77", "Volume 5.2× its recent daily average", ["Closed mid-range, well below the $197.16 high", "warn"], ["Short-dated: 15 days to expiry, heavy theta", "warn"]],
    iv: [0.45, 0.44, 0.42, 0.41, 0.4, 0.4],
    lesson: "The stock slipped only 1.4%, yet the call lost about half its value: delta, theta and a dip in IV all worked against it. Short-dated calls need the move to come fast, and the stop kept it from running toward zero.",
    zh: {"name": "Meta Platforms", "news": {"src": "Meta 2022 年第四季度财报 · 2023年2月1日 · 收盘后", "text": "将 2023 年定为“效率之年”，下调支出预期，并增加 400 亿美元股票回购。"}, "why": ["财报跳空站稳：收涨 23.3% 至 $188.77", "成交量为近期日均的 5.2 倍", ["收于区间中部，远低于 $197.16 的最高点", "warn"], ["短期合约：距到期 15 天，Theta 损耗大", "warn"]], "lesson": "股价仅下跌 1.4%，看涨期权却损失约一半价值：Delta、Theta 和隐含波动率回落同时不利。短期看涨期权需要行情尽快到来，止损避免了它继续跌向零。"},
    closes: [["2023-01-12", 136.71], ["2023-01-13", 136.98], ["2023-01-17", 135.36], ["2023-01-18", 133.02], ["2023-01-19", 136.15], ["2023-01-20", 139.37], ["2023-01-23", 143.27], ["2023-01-24", 143.14], ["2023-01-25", 141.5], ["2023-01-26", 147.3], ["2023-01-27", 151.74], ["2023-01-30", 147.06], ["2023-01-31", 148.97], ["2023-02-01", 153.12], ["2023-02-02", 188.77], ["2023-02-03", 186.53], ["2023-02-06", 186.06], ["2023-02-07", 191.62], ["2023-02-08", 183.43], ["2023-02-09", 177.92], ["2023-02-10", 174.15]] },
  { ticker: "QQQ", name: "Invesco QQQ Trust", dir: "bear", put: true, strike: 420, expiry: "2024-08-30",
    newsDate: "2024-08-05", entryDate: "2024-08-05",
    news: { src: "Global market sell-off · Aug 5, 2024 · before the open", text: "Japan's Nikkei falls 12.4%, its worst day since 1987, as a Bank of Japan rate hike and weak U.S. jobs data unwind trades funded in yen. The VIX briefly tops 65." },
    why: ["Fell 3.0% to $435.37", "Volume 2.0× its recent daily average", ["Closed well off the low (63% of the day's range)", "warn"], ["IV spiked in the sell-off, so puts were expensive", "warn"]],
    iv: [0.32, 0.27, 0.27, 0.23, 0.21, 0.2],
    lesson: "Buying puts in a panic means paying peak prices for fear. QQQ bounced 1.0% the next day and implied volatility fell from 32% to 27%, so delta and vega both worked against the put, and it hit the −35% stop in one session. A week later QQQ was 3.7% above the entry.",
    zh: {"name": "景顺纳斯达克100 ETF", "news": {"src": "全球市场抛售 · 2024年8月5日 · 开盘前", "text": "日本央行加息叠加疲弱的美国就业数据，引发以日元融资的交易平仓，日经指数暴跌 12.4%，创 1987 年以来最大单日跌幅。VIX 一度突破 65。"}, "why": ["下跌 3.0% 至 $435.37", "成交量为近期日均的 2.0 倍", ["收盘远离最低点（位于当日区间的 63%）", "warn"], ["抛售中隐含波动率飙升，看跌期权价格昂贵", "warn"]], "lesson": "在恐慌中买入看跌期权，等于以最高价为恐惧买单。QQQ 次日反弹 1.0%，隐含波动率从 32% 降至 27%，Delta 和 Vega 同时对看跌期权不利，一个交易日内就触及 −35% 的止损。一周后，QQQ 比入场时高出 3.7%。"},
    closes: [["2024-07-15", 496.15], ["2024-07-16", 496.34], ["2024-07-17", 481.77], ["2024-07-18", 479.49], ["2024-07-19", 475.24], ["2024-07-22", 482.32], ["2024-07-23", 480.62], ["2024-07-24", 463.38], ["2024-07-25", 458.27], ["2024-07-26", 462.97], ["2024-07-29", 463.9], ["2024-07-30", 457.53], ["2024-07-31", 471.07], ["2024-08-01", 459.66], ["2024-08-02", 448.75], ["2024-08-05", 435.37], ["2024-08-06", 439.53], ["2024-08-07", 434.77], ["2024-08-08", 448.07], ["2024-08-09", 450.41], ["2024-08-12", 451.38], ["2024-08-13", 462.58], ["2024-08-14", 462.73], ["2024-08-15", 474.42], ["2024-08-16", 475.03], ["2024-08-19", 481.27], ["2024-08-20", 480.26]] },
  { ticker: "IWM", name: "iShares Russell 2000 ETF", dir: "bull", put: false, strike: 245, expiry: "2024-11-29",
    newsDate: "2024-11-05", entryDate: "2024-11-06",
    news: { src: "U.S. election · Nov 5, 2024 · results overnight", text: "Donald Trump wins the U.S. presidential election. Small-company stocks, seen as gaining most from tax cuts and lighter regulation, lead the rally: IWM jumps 5.8%." },
    why: ["Jumped 5.8% to $237.22", "Closed near the high (top 7% of the day's range)", "Volume 3.5× its recent daily average", ["Already up 3.0% in the three sessions before", "warn"]],
    iv: [0.22, 0.21, 0.21, 0.2, 0.2, 0.2],
    lesson: "The big move came overnight, before the call was bought, so the call needed the rally to continue. IWM was up 1.9% three sessions later and the call gained 23%, but the next day gave it back: four sessions after entry IWM was just 0.1% higher, and time decay had pushed the call to the −35% stop.",
    zh: {"name": "iShares 罗素2000 ETF", "news": {"src": "美国大选 · 2024年11月5日 · 结果于隔夜公布", "text": "唐纳德·特朗普赢得美国总统大选。被视为最能受益于减税和放松监管的小型公司股票领涨：IWM 大涨 5.8%。"}, "why": ["大涨 5.8% 至 $237.22", "收盘接近最高点（位于当日区间顶部 7%）", "成交量为近期日均的 3.5 倍", ["此前三个交易日已累计上涨 3.0%", "warn"]], "lesson": "大涨发生在隔夜、买入看涨期权之前，因此这份期权需要涨势延续。三个交易日后 IWM 上涨 1.9%，看涨期权上涨 23%，但次日涨幅全部回吐：入场四个交易日后 IWM 仅高出 0.1%，时间损耗把看涨期权推到了 −35% 的止损。"},
    closes: [["2024-10-16", 226.74], ["2024-10-17", 226.12], ["2024-10-18", 225.65], ["2024-10-21", 222.1], ["2024-10-22", 221.26], ["2024-10-23", 219.24], ["2024-10-24", 219.72], ["2024-10-25", 218.89], ["2024-10-28", 222.46], ["2024-10-29", 221.74], ["2024-10-30", 221.44], ["2024-10-31", 217.76], ["2024-11-01", 218.98], ["2024-11-04", 220.09], ["2024-11-05", 224.23], ["2024-11-06", 237.22], ["2024-11-07", 236.38], ["2024-11-08", 238.12], ["2024-11-11", 241.7], ["2024-11-12", 237.46], ["2024-11-13", 235.11], ["2024-11-14", 231.94], ["2024-11-15", 228.48], ["2024-11-18", 228.93], ["2024-11-19", 230.63], ["2024-11-20", 230.93], ["2024-11-21", 234.44]] },
  { ticker: "AAPL", name: "Apple Inc.", dir: "bull", put: false, strike: 215, expiry: "2024-07-05",
    newsDate: "2024-06-10", entryDate: "2024-06-11",
    news: { src: "Apple WWDC · June 10, 2024", text: "Apple unveils Apple Intelligence, its AI features, including ChatGPT in Siri. The stock slips 1.9% on the day, then jumps 7.3% the next to a record high." },
    why: ["Jumped 7.3% to a record $207.15", "Closed at the day's high", "Volume 3.3× its recent daily average", ["Short-dated: 24 days to expiry, strike 3.8% away", "warn"]],
    iv: [0.25, 0.24, 0.23, 0.22, 0.22, 0.21],
    lesson: "Delta did the work, helped by gamma: Apple rose another 2.9% the next day, and as it climbed the call's delta grew from 0.31 to 0.47, so the call gained 78% and hit the target in one session. That same leverage works just as fast in reverse.",
    zh: {"name": "苹果", "news": {"src": "苹果 WWDC · 2024年6月10日", "text": "苹果发布 AI 功能 Apple Intelligence，并将 ChatGPT 接入 Siri。股价当天下跌 1.9%，次日大涨 7.3%，创历史新高。"}, "why": ["大涨 7.3% 至创纪录的 $207.15", "收于当日最高点", "成交量为近期日均的 3.3 倍", ["短期合约：距到期 24 天，行权价相差 3.8%", "warn"]], "lesson": "Delta 发挥了主要作用，Gamma 又起到放大效果：苹果次日再涨 2.9%，随着股价上涨，看涨期权的 Delta 从 0.31 升至 0.47，期权上涨 78%，一个交易日内就触及目标。同样的杠杆在反方向也会同样迅速地起作用。"},
    closes: [["2024-05-20", 191.04], ["2024-05-21", 192.35], ["2024-05-22", 190.9], ["2024-05-23", 186.88], ["2024-05-24", 189.98], ["2024-05-28", 189.99], ["2024-05-29", 190.29], ["2024-05-30", 191.29], ["2024-05-31", 192.25], ["2024-06-03", 194.03], ["2024-06-04", 194.35], ["2024-06-05", 195.87], ["2024-06-06", 194.48], ["2024-06-07", 196.89], ["2024-06-10", 193.12], ["2024-06-11", 207.15], ["2024-06-12", 213.07], ["2024-06-13", 214.24], ["2024-06-14", 212.49], ["2024-06-17", 216.67], ["2024-06-18", 214.29], ["2024-06-20", 209.68], ["2024-06-21", 207.49], ["2024-06-24", 208.14], ["2024-06-25", 209.07]] },
  { ticker: "AMZN", name: "Amazon.com Inc.", dir: "bear", put: true, strike: 160, expiry: "2024-08-23",
    newsDate: "2024-08-01", entryDate: "2024-08-02",
    news: { src: "Amazon Q2 2024 results · Aug 1, 2024 · after the close", text: "Sales and the third-quarter forecast come in below expectations, and Amazon signals heavy AI spending. The stock falls 8.8% the next day as weak U.S. jobs data hits the whole market." },
    why: ["Fell 8.8% to $167.90", "Volume 3.3× its recent daily average", "Weak U.S. jobs report hit the whole market the same day", ["Closed well off the low (top 11% of the day's range)", "warn"]],
    iv: [0.4, 0.45, 0.4, 0.36, 0.33, 0.31],
    lesson: "The global sell-off the next session did the work: Amazon fell another 4.1% on August 5, the put's delta grew from −0.28 to −0.45, and the jump in fear lifted implied volatility, so the put gained 93% and hit its target. By August 12 the stock had recovered most of that day's fall.",
    zh: {"name": "亚马逊", "news": {"src": "亚马逊 2024 年第二季度财报 · 2024年8月1日 · 收盘后", "text": "销售额和第三季度业绩指引低于预期，亚马逊还表示将大举投入 AI。次日疲弱的美国就业数据拖累整个市场，股价下跌 8.8%。"}, "why": ["下跌 8.8% 至 $167.90", "成交量为近期日均的 3.3 倍", "同日疲弱的美国就业报告拖累整个市场", ["收盘远离最低点（位于当日区间顶部 11%）", "warn"]], "lesson": "下一个交易日的全球抛售带来了收益：8 月 5 日亚马逊再跌 4.1%，看跌期权的 Delta 从 −0.28 增至 −0.45，恐慌情绪推高隐含波动率，期权上涨 93% 并触及目标。到 8 月 12 日，股价已收复当天的大部分跌幅。"},
    closes: [["2024-07-12", 194.49], ["2024-07-15", 192.72], ["2024-07-16", 193.02], ["2024-07-17", 187.93], ["2024-07-18", 183.75], ["2024-07-19", 183.13], ["2024-07-22", 182.55], ["2024-07-23", 186.41], ["2024-07-24", 180.83], ["2024-07-25", 179.85], ["2024-07-26", 182.5], ["2024-07-29", 183.2], ["2024-07-30", 181.71], ["2024-07-31", 186.98], ["2024-08-01", 184.07], ["2024-08-02", 167.9], ["2024-08-05", 161.02], ["2024-08-06", 161.93], ["2024-08-07", 162.77], ["2024-08-08", 165.8], ["2024-08-09", 166.94], ["2024-08-12", 166.8], ["2024-08-13", 170.23], ["2024-08-14", 170.1], ["2024-08-15", 177.59], ["2024-08-16", 177.06]] },
  { ticker: "MSFT", name: "Microsoft Corp.", dir: "bear", put: true, strike: 400, expiry: "2025-02-21",
    newsDate: "2025-01-29", entryDate: "2025-01-30",
    news: { src: "Microsoft Q2 FY2025 results · Jan 29, 2025 · after the close", text: "Growth at Azure, Microsoft's cloud business, slows to 31%, a little below expectations, while spending on AI data centres keeps climbing." },
    why: ["Fell 6.2% to $414.99", "Closed near the low (bottom 19% of the day's range)", "Volume 2.5× its recent daily average", ["22 days to expiry, strike 3.6% away", "warn"]],
    iv: [0.26, 0.24, 0.24, 0.23, 0.23, 0.22],
    lesson: "The stock barely moved after the drop: four sessions later it was 0.4% lower. With no further fall, delta had little to work with while theta cost about $18 a day and implied volatility eased, and the put hit the −35% stop. A put needs the next move, not the last one.",
    zh: {"name": "微软", "news": {"src": "微软 2025 财年第二季度财报 · 2025年1月29日 · 收盘后", "text": "微软云业务 Azure 的增速放缓至 31%，略低于预期，而 AI 数据中心的支出仍在攀升。"}, "why": ["下跌 6.2% 至 $414.99", "收盘接近最低点（位于当日区间底部 19%）", "成交量为近期日均的 2.5 倍", ["距到期 22 天，行权价相差 3.6%", "warn"]], "lesson": "大跌之后股价几乎不动：四个交易日后仅低 0.4%。没有进一步下跌，Delta 无从发挥，而 Theta 每天消耗约 $18，隐含波动率也有所回落，看跌期权触及 −35% 的止损。看跌期权需要的是下一次下跌，而不是已经发生的那次。"},
    closes: [["2025-01-08", 424.56], ["2025-01-10", 418.95], ["2025-01-13", 417.19], ["2025-01-14", 415.67], ["2025-01-15", 426.31], ["2025-01-16", 424.58], ["2025-01-17", 429.03], ["2025-01-21", 428.5], ["2025-01-22", 446.2], ["2025-01-23", 446.71], ["2025-01-24", 444.06], ["2025-01-27", 434.56], ["2025-01-28", 447.2], ["2025-01-29", 442.33], ["2025-01-30", 414.99], ["2025-01-31", 415.06], ["2025-02-03", 410.92], ["2025-02-04", 412.37], ["2025-02-05", 413.29], ["2025-02-06", 415.82], ["2025-02-07", 409.75], ["2025-02-10", 412.22], ["2025-02-11", 411.44], ["2025-02-12", 409.04], ["2025-02-13", 410.54], ["2025-02-14", 408.43]] },
  { ticker: "AMD", name: "Advanced Micro Devices", dir: "bear", put: true, strike: 140, expiry: "2024-11-22",
    newsDate: "2024-10-29", entryDate: "2024-10-30",
    news: { src: "AMD Q3 2024 results · Oct 29, 2024 · after the close", text: "Data-centre sales more than double, but the fourth-quarter forecast only matches expectations, disappointing investors who had bid the stock up ahead of the report." },
    why: ["Fell 10.6% to $148.60", "Closed near the low (bottom 10% of the day's range)", "Volume 2.3× its recent daily average", "Had risen 8.3% in the three sessions before"],
    iv: [0.5, 0.48, 0.47, 0.46, 0.46, 0.45],
    lesson: "The put was up 47% after two sessions, just short of the +50% target, as AMD kept sliding. Then the stock rebounded around the U.S. election, and at the five-session time limit the put was down 14%. Under fixed rules, nearly hitting a target counts for nothing.",
    zh: {"name": "超威半导体", "news": {"src": "AMD 2024 年第三季度财报 · 2024年10月29日 · 收盘后", "text": "数据中心销售额增长一倍多，但第四季度业绩指引仅与预期持平，令财报前推高股价的投资者失望。"}, "why": ["下跌 10.6% 至 $148.60", "收盘接近最低点（位于当日区间底部 10%）", "成交量为近期日均的 2.3 倍", "此前三个交易日已累计上涨 8.3%"], "lesson": "随着 AMD 持续下滑，看跌期权在两个交易日后上涨 47%，离 +50% 的目标只差一点。随后股价在美国大选前后反弹，到五个交易日的时间限制时，看跌期权下跌 14%。在固定规则下，差一点触及目标毫无意义。"},
    closes: [["2024-10-09", 171.02], ["2024-10-10", 164.18], ["2024-10-11", 167.89], ["2024-10-14", 165.27], ["2024-10-15", 156.64], ["2024-10-16", 156.13], ["2024-10-17", 156.25], ["2024-10-18", 155.97], ["2024-10-21", 157.9], ["2024-10-22", 154.09], ["2024-10-23", 152.91], ["2024-10-24", 153.44], ["2024-10-25", 156.23], ["2024-10-28", 159.92], ["2024-10-29", 166.25], ["2024-10-30", 148.6], ["2024-10-31", 144.07], ["2024-11-01", 141.86], ["2024-11-04", 140.71], ["2024-11-05", 141.66], ["2024-11-06", 145.1], ["2024-11-07", 149.82], ["2024-11-08", 147.95], ["2024-11-11", 147.35], ["2024-11-12", 143.63], ["2024-11-13", 139.3], ["2024-11-14", 138.84]] },
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
const shortDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString(I18N.locale(), { month: "short", day: "numeric", timeZone: "UTC" });
const longDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString(I18N.locale(), { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const signed = (n, digits = 2) => (n < 0 ? "−" : "+") + Math.abs(n).toFixed(digits);
const usd = (n) => (Math.round(n) === 0 ? "$" : n < 0 ? "−$" : "+$") + Math.round(Math.abs(n)).toLocaleString("en-CA");

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
    "aria-label": t("chart.aria", { ticker: r.ticker, from: longDate(r.closes[0][0]), to: longDate(r.closes.at(-1)[0]) }) });
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
    text({ x: x(newsIdx) - 4, y: padT - 10, "text-anchor": "end", class: "lbl", fill: "#6c8cff" }, t("chart.news")));

  const line = prices.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  svg.append(node("path", { d: line, fill: "none", stroke: "#e8ecf5", "stroke-width": 2, "stroke-linejoin": "round" }));
  svg.append(node("path", { d: line.split(" ").slice(run.start, endIdx + 1).join(" ").replace(/^L/, "M"), fill: "none", stroke: accent, "stroke-width": 3.5, "stroke-linejoin": "round" }));

  for (const [i, label, color] of [[run.start, "Entry", "#22d3a6"], [endIdx, "Exit", accent]]) {
    // Label the higher point above and the lower one below so the two never collide.
    const above = prices[i] === Math.max(prices[run.start], prices[endIdx]);
    svg.append(node("circle", { cx: x(i), cy: y(prices[i]), r: 5, fill: color, stroke: "#0a0e17", "stroke-width": 2 }),
      text({ x: x(i) + (label === "Exit" ? -8 : 8), y: y(prices[i]) + (above ? -10 : 18), "text-anchor": label === "Exit" ? "end" : "start", class: "lbl", fill: color },
        `${t(label === "Exit" ? "exit" : "entry")} $${prices[i].toFixed(2)}`));
  }
  return svg;
}

let currentReplay = 0;

function renderReplay(r) {
  currentReplay = REPLAYS.indexOf(r);
  const run = runReplay(r);
  const { first, last, sessions } = run;
  const contract = contractOf(r);
  const news = tr(r, "news");
  const pnl = (last.price - first.price) * 100;
  const cls = (n) => (n < 0 ? "down" : "up");
  const exitText = last.exit === "Target" ? t("exitPct.Target", { pct: "+" + RULES.target * 100 })
    : last.exit === "Stop" ? t("exitPct.Stop", { pct: RULES.stop * 100 }) : t("exit.Time");

  const phone = el("article", { class: "phone", "aria-label": t("replay.aria", { ticker: r.ticker }) },
    el("div", { class: "phone__bar" }, el("span", {}, longDate(r.entryDate)), el("span", { class: "tag" }, t("replay.tag"))),
    el("div", { class: "sig-hero" },
      el("div", { class: "sig-hero__head" },
        el("div", {}, el("div", { class: "sig-hero__ticker" }, r.ticker), el("div", { class: "muted small" }, contract)),
        dirBadge(r.dir)),
      el("div", { class: "news" }, el("div", { class: "news__src" }, news.src), el("p", {}, news.text)),
      el("div", { class: "sig-hero__stats", style: "margin-top:0.9rem" },
        el("div", {}, el("span", { class: "muted small" }, t("ex.entry")), el("strong", {}, money(first.price))),
        el("div", {}, el("span", { class: "muted small" }, t("ex.target")), el("strong", { class: "up" }, money(first.price * (1 + RULES.target)))),
        el("div", {}, el("span", { class: "muted small" }, t("ex.stop")), el("strong", { class: "down" }, money(first.price * (1 + RULES.stop))))),
      el("ul", { class: "why-list" }, ...tr(r, "why").map((w) => Array.isArray(w) ? el("li", { class: w[1] }, w[0]) : el("li", {}, w)))));

  const greekRow = (sym, name, key, fmt) =>
    el("tr", {}, el("td", {}, `${sym} ${name}`), ...sessions.map((s) => el("td", {}, fmt(s[key]))));
  const ledger = el("table", { class: "ledger" },
    el("thead", {}, el("tr", {}, el("th", { scope: "col" }, t("replay.atClose")), ...sessions.map((s) => el("th", { scope: "col" }, shortDate(s.date))))),
    el("tbody", {},
      el("tr", {}, el("td", {}, t("ledger.stock")), ...sessions.map((s) => el("td", {}, money(s.spot)))),
      el("tr", {}, el("td", {}, t("ledger.option")), ...sessions.map((s) => el("td", {}, money(s.price)))),
      el("tr", {}, el("td", {}, t("ledger.pnl")), ...sessions.map((s) =>
        el("td", { class: s.ret ? cls(s.ret) : "" }, s.ret ? `${signed(s.ret * 100, 0)}%` : t("ledger.open"),
          s.exit ? el("span", { class: `tag${s.exit === "Stop" ? " tag--stop" : ""}` }, t("tag." + s.exit)) : null))),
      greekRow("Δ", t("ledger.delta"), "delta", (v) => signed(v)),
      greekRow("Γ", t("ledger.gamma"), "gamma", (v) => v.toFixed(3)),
      greekRow("Θ", t("ledger.theta"), "theta", (v) => signed(v * 100, 0)),
      greekRow("ν", t("ledger.vega"), "vega", (v) => signed(v * 100, 0)),
      greekRow("", t("ledger.iv", { src: tr(r, "ivSource") || t("ledger.assumed") }), "iv", (v) => `${Math.round(v * 100)}%`),
      el("tr", {}, el("td", {}, t("ledger.dte")), ...sessions.map((s) => el("td", {}, s.dte)))));

  const main = el("div", { class: "replay__main" },
    el("section", { class: "panel" },
      el("div", { class: "panel__head" },
        el("h3", {}, `${r.ticker} · ${tr(r, "name")}`),
        el("div", { class: "legend" },
          el("span", {}, el("i", { style: "background:#6c8cff" }), t("chart.news")),
          el("span", {}, el("i", { style: `background:${last.ret < 0 ? "#f87171" : "#22c55e"}` }), t("legend.held")))),
      replayChart(r, run),
      el("div", { class: "result" },
        el("div", {}, el("span", {}, t("result.stock")), el("strong", { class: cls(last.spot - first.spot) }, `${signed((last.spot / first.spot - 1) * 100, 1)}%`)),
        el("div", {}, el("span", {}, t("result.option")), el("strong", { class: cls(last.ret) }, `${signed(last.ret * 100, 0)}%`)),
        el("div", { class: "result__big" }, el("span", {}, t("result.pnl")), el("strong", { class: cls(pnl) }, usd(pnl))),
        el("div", {}, el("span", {}, t("exit")), el("strong", { style: "font-size:0.95rem" }, t("exitOn", { exit: exitText, date: shortDate(last.date) }))))),
    el("section", { class: "panel" },
      el("div", { class: "panel__head" }, el("h3", {}, t("replay.ledgerTitle")),
        el("span", { class: "muted small" }, t("replay.ledgerUnit"))),
      el("div", { class: "ledger-wrap" }, ledger),
      el("p", { class: "replay__lesson" }, el("strong", {}, t("replay.lesson")), tr(r, "lesson")),
      el("a", { class: "btn btn--ghost btn--sm replay__lab", href: "#lab", "data-replay": REPLAYS.indexOf(r) }, t("replay.toLab"))));

  $("#replay").replaceChildren(phone, main);
}

// Builds the replay tabs and record lines; called again when the language changes.
function renderReplayTabs() {
  const tabs = REPLAYS.map((r, i) => {
    const { first, last } = runReplay(r);
    const pnl = (last.price - first.price) * 100;
    const selected = i === currentReplay;
    const tab = el("button", { class: "replay-tab", type: "button", role: "tab", "aria-selected": String(selected), "aria-controls": "replay", tabindex: selected ? "0" : "-1" },
      el("span", {}, el("b", {}, r.ticker), el("small", {}, `${longDate(r.newsDate)} · ${t(r.put ? "Put" : "Call")}`)),
      el("strong", { class: pnl < 0 ? "down" : "up" }, `${signed(last.ret * 100, 0)}%`));
    tab.addEventListener("click", () => {
      $$(".replay-tab").forEach((b) => {
        b.setAttribute("aria-selected", String(b === tab));
        b.tabIndex = b === tab ? 0 : -1;
      });
      renderReplay(r);
    });
    return tab;
  });
  const results = REPLAYS.map((r) => { const { first, last } = runReplay(r); return (last.price - first.price) * 100; });
  const wins = results.filter((v) => v > 0).length;
  $("#replay-record").replaceChildren(
    el("span", {}, el("strong", {}, REPLAYS.length), t("record.replays")),
    el("span", {}, el("strong", { class: "up" }, wins), t("record.wins")),
    el("span", {}, el("strong", { class: "down" }, REPLAYS.length - wins), t("record.losses")));
  $("#replay-tabs").replaceChildren(...tabs);
  renderReplay(REPLAYS[currentReplay]);
}

function initReplays() {
  renderReplayTabs();
  // Arrow keys, Home and End move between tabs, as for any ARIA tablist.
  $("#replay-tabs").addEventListener("keydown", (e) => {
    const tabs = $$(".replay-tab");
    const i = tabs.indexOf(document.activeElement);
    const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (i < 0 || next === undefined) return;
    e.preventDefault();
    const tab = tabs[(next + tabs.length) % tabs.length];
    tab.click();
    tab.focus();
  });
}

// Links elsewhere on the page can open a specific replay by its news date.
function initReplayLinks() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-open-replay]");
    if (!link) return;
    const r = REPLAYS.find((x) => x.newsDate === link.dataset.openReplay);
    if (!r) return;
    e.preventDefault();
    showReplay(r);
  });
}

function showReplay(r) {
  const tab = $$(".replay-tab")[REPLAYS.indexOf(r)];
  tab.click();
  tab.focus({ preventScroll: true });
  $("#replay-tabs").scrollIntoView({ block: "start" });
}

/* ---------- Greeks lab ---------- */
// Reprices a replay's contract as the stock, time and IV move, and splits the change by Greek.
function labChart(svg, base, now, cur, put) {
  const [w, h, padL, padR, padT, padB] = [640, 240, 8, 56, 12, 26];
  const lo = base.spot * 0.7, hi = base.spot * 1.3, steps = 80;
  const xs = Array.from({ length: steps + 1 }, (_, i) => lo + ((hi - lo) * i) / steps);
  const expiry = xs.map((v) => Math.max(put ? base.strike - v : v - base.strike, 0));
  const today = xs.map((v) => blackScholes({ ...cur.inputs, spot: v }).price);
  const maxY = Math.max(...expiry, ...today) * 1.08;
  const x = (v) => padL + ((v - lo) / (hi - lo)) * (w - padL - padR);
  const y = (v) => padT + (1 - v / maxY) * (h - padT - padB);
  const node = (tag, attrs) => {
    const n = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  const text = (attrs, str) => Object.assign(node("text", attrs), { textContent: str });
  const path = (vals) => vals.map((v, i) => `${i ? "L" : "M"}${x(xs[i]).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  svg.replaceChildren();
  for (let k = 0; k <= 3; k++) {
    const v = (maxY * k) / 3;
    svg.append(node("line", { x1: padL, x2: w - padR, y1: y(v), y2: y(v), stroke: "#243049" }),
      text({ x: w - padR + 6, y: y(v) + 4 }, "$" + v.toFixed(v < 10 ? 1 : 0)));
  }
  for (const [v, label, anchor] of [[lo, "$" + Math.round(lo), "start"], [base.strike, t("lab.strike", { strike: base.strike }), "middle"], [hi, "$" + Math.round(hi), "end"]])
    svg.append(text({ x: x(v), y: h - 6, "text-anchor": anchor }, label));
  svg.append(node("line", { x1: x(base.spot), x2: x(base.spot), y1: padT, y2: h - padB, stroke: "#6c8cff", "stroke-dasharray": "4 4" }),
    text({ x: x(base.spot) + 5, y: padT + 10, fill: "#6c8cff" }, t("entry")));
  svg.append(node("path", { d: path(expiry), fill: "none", stroke: "#94a0b8", "stroke-width": 1.5, "stroke-dasharray": "5 5" }));
  svg.append(node("path", { d: path(today), fill: "none", stroke: "#22d3a6", "stroke-width": 2.5 }));
  svg.append(node("line", { x1: padL, x2: w - padR, y1: y(now.price), y2: y(now.price), stroke: "#e8ecf5", "stroke-opacity": 0.25, "stroke-dasharray": "2 4" }));
  svg.append(node("circle", { cx: x(cur.inputs.spot), cy: y(cur.price), r: 6, fill: cur.price >= now.price ? "#22c55e" : "#f87171", stroke: "#0a0e17", "stroke-width": 2 }));
  svg.setAttribute("aria-label", t("lab.aria", { lo: Math.round(lo), hi: Math.round(hi), price: money(cur.price), spot: money(cur.inputs.spot) }));
}

function initLab() {
  const select = $("#lab-contract");
  const [spotIn, daysIn, ivIn] = [$("#lab-spot"), $("#lab-days"), $("#lab-iv")];
  const contracts = REPLAYS.map((r) => {
    const { first, last } = runReplay(r);
    return {
      r,
      base: { spot: first.spot, strike: r.strike, dte: first.dte, iv: first.iv, put: r.put },
      // Slider positions that reproduce the replay's actual exit.
      actual: { spot: (last.spot / first.spot - 1) * 100, days: first.dte - last.dte, iv: (last.iv - first.iv) * 100 },
    };
  });
  const presets = $$("[data-preset]");
  const fillOptions = () => {
    const value = select.value;
    select.replaceChildren(...contracts.map(({ r }, i) =>
      el("option", { value: i }, `${r.ticker} ${t("lab.option", { strike: r.strike, side: sideOf(r), date: longDate(r.entryDate) })}`)));
    if (value) select.value = value;
  };
  fillOptions();

  const render = () => {
    const { r, base } = contracts[select.value];
    const side = sideOf(r);
    const now = blackScholes(base);
    const move = Number(spotIn.value) / 100, days = Number(daysIn.value), ivPts = Number(ivIn.value);
    const inputs = { ...base, spot: base.spot * (1 + move), dte: base.dte - days, iv: Math.max(0.05, base.iv + ivPts / 100) };
    const cur = { ...blackScholes(inputs), inputs };

    $("#lab-spot-out").textContent = `${money(inputs.spot)} (${signed(move * 100, 1)}%)`;
    $("#lab-days-out").textContent = t("lab.daysOut", { days, left: inputs.dte });
    $("#lab-iv-out").textContent = `${Math.round(inputs.iv * 100)}%`;

    const pnl = (cur.price - now.price) * 100;
    const ret = cur.price / now.price - 1;
    const cls = (n) => (n < 0 ? "down" : n > 0 ? "up" : "");
    $("#lab-result").replaceChildren(
      el("div", {}, el("span", {}, t("lab.stock", { ticker: r.ticker })), el("strong", {}, money(inputs.spot))),
      el("div", {}, el("span", {}, t("lab.optionEntry", { price: money(now.price) })), el("strong", {}, money(cur.price))),
      el("div", { class: "result__big" }, el("span", {}, t("result.pnl")), el("strong", { class: cls(pnl) }, usd(pnl))),
      el("div", {}, el("span", {}, t("lab.return")), el("strong", { class: cls(ret) }, `${signed(ret * 100, 0)}%`)));

    labChart($("#lab-chart"), base, now, cur, r.put);

    const dollar = (n) => money(Math.abs(n));
    const rises = t(cur.delta >= 0 ? "lab.gains" : "lab.loses");
    $("#lab-greeks").replaceChildren(
      el("li", {}, el("b", {}, "Δ"), el("strong", {}, signed(cur.delta)), el("span", {}, t("lab.delta", { ticker: r.ticker, side, dir: rises, amt: dollar(cur.delta) }))),
      el("li", {}, el("b", {}, "Γ"), el("strong", {}, cur.gamma.toFixed(3)), el("span", {}, t("lab.gamma", { x: cur.gamma.toFixed(3) }))),
      el("li", {}, el("b", {}, "Θ"), el("strong", {}, signed(cur.theta)), el("span", {}, t("lab.theta", { amt: dollar(cur.theta * 100) }))),
      el("li", {}, el("b", {}, "ν"), el("strong", {}, signed(cur.vega)), el("span", {}, t("lab.vega", { amt: dollar(cur.vega * 100) }))));

    // Second-order Taylor expansion from the entry Greeks; whatever it misses is shown as "Other".
    const dS = inputs.spot - base.spot;
    const parts = [
      ["Δ Delta", now.delta * dS * 100],
      ["Γ Gamma", 0.5 * now.gamma * dS * dS * 100],
      ["Θ Theta", now.theta * days * 100],
      ["ν Vega", now.vega * ivPts * 100],
    ];
    parts.push([t("lab.other"), pnl - parts.reduce((a, [, v]) => a + v, 0)]);
    const maxAbs = Math.max(...parts.map(([, v]) => Math.abs(v)), Math.abs(pnl), 1);
    const row = (label, v, extra = "") =>
      el("li", { class: `driver ${extra}` },
        el("span", {}, label),
        el("span", { class: "driver__track" },
          el("span", { class: `driver__fill driver__fill--${v < 0 ? "loss" : "gain"}`, style: `width:${(Math.abs(v) / maxAbs) * 50}%` })),
        el("span", { class: `driver__val ${cls(Math.round(v))}` }, usd(v)));
    $("#lab-drivers").replaceChildren(...parts.map(([l, v]) => row(l, v)), row(t("lab.total"), pnl, "driver--total"));
  };

  const applyPreset = (name) => {
    const { base, actual } = contracts[select.value];
    daysIn.max = base.dte - 1;
    const v = name === "actual" ? actual : { spot: 0, days: 0, iv: 0 };
    [spotIn.value, daysIn.value, ivIn.value] = [v.spot, v.days, v.iv];
    presets.forEach((b) => b.classList.toggle("is-active", b.dataset.preset === name));
    render();
  };
  const reset = () => applyPreset("actual");
  presets.forEach((b) => b.addEventListener("click", () => applyPreset(b.dataset.preset)));
  select.addEventListener("change", reset);
  // "Try this contract" links in the replays preselect their contract here.
  $("#replay").addEventListener("click", (e) => {
    const link = e.target.closest("[data-replay]");
    if (!link) return;
    select.value = link.dataset.replay;
    reset();
  });
  $("#lab-form").addEventListener("input", (e) => {
    if (e.target === select) return;
    presets.forEach((b) => b.classList.remove("is-active"));
    render();
  });
  $("#lab-form").addEventListener("submit", (e) => e.preventDefault());
  I18N.onChange(() => { fillOptions(); render(); });
  reset();
}

/* ---------- Selling options: covered calls and cash-secured puts ---------- */
// Real closes from REPLAYS, held to expiry and settled at the closing price. Premiums are
// Black-Scholes estimates from an assumed IV. The puts reuse the covered calls' three windows to
// show how alike the two strategies are. The GIC rate is illustrative, not a quote.
const GIC_RATE = 0.03;
const COVERED = [
  { ticker: "SPY", from: "2025-03-12", to: "2025-04-02", strike: 575, iv: 0.22,
    lesson: "The call expired worthless, so the premium was kept on top of a small rise in the shares. But the shares stayed fully exposed: the next day, after the U.S. tariff announcement, SPY fell 4.9%, more than four times the premium.",
    zh: { lesson: "期权到期作废，因此在股票小幅上涨之外还保留了权利金。但股票的风险敞口丝毫未减：次日美国宣布关税后，SPY 下跌 4.9%，是权利金的四倍多。" } },
  { ticker: "META", from: "2023-01-12", to: "2023-02-10", strike: 145, iv: 0.5,
    lesson: "The stock jumped after earnings, so the shares were sold at the $145 strike and the gain stopped there. Holding the shares alone made almost three times as much: the cap cost most of the rally.",
    zh: { lesson: "财报后股价大涨，股票以 $145 的行权价被买走，收益到此为止。仅持有股票的收益几乎是三倍：收益上限让你错过了大部分涨幅。" } },
  { ticker: "NVDA", from: "2025-01-02", to: "2025-01-31", strike: 145, iv: 0.5,
    lesson: "The call expired worthless and the premium was kept, but it made up for less than a third of the fall after the DeepSeek sell-off. A covered call cushions a drop; it does not protect you from one.",
    zh: { lesson: "期权到期作废，权利金得以保留，但它只抵消了 DeepSeek 抛售后跌幅的不到三分之一。备兑看涨只能缓冲下跌，并不能保护你免受下跌的影响。" } },
];
// Each put states its outcome because the lesson is written for it; putRun warns if the data disagree.
const PUTS = [
  { ticker: "SPY", from: "2025-03-12", to: "2025-04-02", strike: 540, iv: 0.22, outcome: "kept",
    lesson: "SPY stayed above the $540 strike, so the put expired worthless and the premium was kept: 0.8% on the $54,000 set aside, a little less than simply owning the shares. Timing mattered: the next day, after the U.S. tariff announcement, SPY fell 4.9% to $536.70, below the strike.",
    zh: { lesson: "SPY 始终高于 $540 的行权价，因此看跌期权到期作废，权利金得以保留：相对预留的 $54,000 回报 0.8%，略低于直接持有股票。时机很关键：次日美国宣布关税后，SPY 下跌 4.9% 至 $536.70，已低于行权价。" } },
  { ticker: "META", from: "2023-01-12", to: "2023-02-10", strike: 130, iv: 0.5, outcome: "missed",
    lesson: "The stock never fell to the $130 strike, so the put expired worthless and earned its 3.4% premium. But the stock rose 27.4% after earnings: selling a put caps your gain at the premium, however far the stock climbs.",
    zh: { lesson: "股价始终没有跌到 $130 的行权价，看跌期权到期作废，赚取了 3.4% 的权利金。但财报后股价上涨了 27.4%：卖出看跌期权的收益以权利金为上限，无论股价涨多高。" } },
  { ticker: "NVDA", from: "2025-01-02", to: "2025-01-31", strike: 130, iv: 0.5, outcome: "assigned",
    lesson: "The stock fell below the $130 strike, so the put was exercised and the shares had to be bought at $130 while they traded at $120.07. Because the strike started 6% below the price, the loss was smaller than holding the shares, but it was still 2.5 times the premium earned.",
    zh: { lesson: "股价跌破 $130 的行权价，看跌期权被行权，你必须以 $130 买入当时仅值 $120.07 的股票。由于行权价比起始股价低 6%，亏损小于直接持有股票，但仍是所收权利金的 2.5 倍。" } },
];
const TONE = { kept: "good", called: "warn", missed: "warn", fell: "bad", assigned: "bad" };

// The stock's closes between the two dates, and the option's premium on the first one.
function optionWindow(c, put) {
  const r = REPLAYS.find((x) => x.ticker === c.ticker && x.closes.some(([d]) => d === c.from) && x.closes.some(([d]) => d === c.to));
  const i0 = r.closes.findIndex(([d]) => d === c.from), i1 = r.closes.findIndex(([d]) => d === c.to);
  const s0 = r.closes[i0][1], sT = r.closes[i1][1];
  const days = Math.round((Date.parse(c.to) - Date.parse(c.from)) / DAY_MS);
  return { r, path: r.closes.slice(i0, i1 + 1).map(([, v]) => v), s0, sT, days,
    premium: blackScholes({ spot: s0, strike: c.strike, dte: days, iv: c.iv, put }).price,
    stockRet: sT / s0 - 1, stockUsd: (sT - s0) * 100, gicRet: (GIC_RATE * days) / 365 };
}

// Own 100 shares and sell a call: above the strike at expiry, the shares are sold at the strike.
function coveredRun(c) {
  const w = optionWindow(c, false);
  const called = w.sT > c.strike;
  const gain = (called ? c.strike - w.s0 : w.sT - w.s0) + w.premium;
  return { ...w, called, outcome: called ? "called" : w.sT >= w.s0 ? "kept" : "fell", ret: gain / w.s0, usd: gain * 100 };
}

// Set aside strike × 100 in cash and sell a put: below the strike at expiry, the shares are bought at the strike.
function putRun(c) {
  const w = optionWindow(c, true);
  const assigned = w.sT < c.strike;
  if (assigned !== (c.outcome === "assigned")) console.warn(`PUTS: ${c.ticker} outcome "${c.outcome}" does not match the closes`);
  const gain = w.premium - (assigned ? c.strike - w.sT : 0);
  return { ...w, assigned, outcome: c.outcome, ret: gain / c.strike, usd: gain * 100 };
}

// Daily closes with the strike as a dashed line, scaled so both always fit.
function coveredChart(path, strike, ticker) {
  const [w, h, pad] = [300, 110, 10];
  const min = Math.min(...path, strike), max = Math.max(...path, strike);
  const x = (i) => (i / (path.length - 1)) * w;
  const y = (v) => h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
  const svg = document.createElementNS(SVG_NS, "svg");
  for (const [k, v] of Object.entries({ class: "cc-card__chart", viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", role: "img",
    "aria-label": t("cc.chart", { ticker, strike }) })) svg.setAttribute(k, v);
  const line = document.createElementNS(SVG_NS, "path");
  line.setAttribute("d", path.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" "));
  for (const [k, v] of Object.entries({ fill: "none", stroke: "#e8ecf5", "stroke-width": 2, "vector-effect": "non-scaling-stroke" })) line.setAttribute(k, v);
  const level = document.createElementNS(SVG_NS, "line");
  for (const [k, v] of Object.entries({ x1: 0, x2: w, y1: y(strike), y2: y(strike), stroke: "#fbbf24", "stroke-dasharray": "5 5", "vector-effect": "non-scaling-stroke" })) level.setAttribute(k, v);
  svg.append(level, line);
  return svg;
}

function renderCovered() {
  const pct = (v, d = 1) => `${signed(v * 100, d)}%`;
  const whole = (n) => "$" + Math.round(n).toLocaleString("en-CA");
  const cls = (v) => (v < 0 ? "down" : "up");
  const hypo = (x) => `${t("hypo", { pct: signed(x.ret * 100, 1) })} · ${usd(x.usd)}`;
  const shares = (x) => `${pct(x.stockRet)} · ${usd(x.stockUsd)}`;
  const gic = (x) => [t("cc.resGic", { rate: GIC_RATE * 100 }), pct(x.gicRet, 2), ""];
  const sold = (c, x) => t("cc.soldVal", { strike: c.strike, date: shortDate(c.to), prem: money(x.premium), total: whole(x.premium * 100) });
  const card = (c, x, badge, rows, results) => el("article", { class: "cc-card" },
    el("span", { class: `cc-card__badge cc-card__badge--${TONE[x.outcome]}` }, badge),
    el("div", { class: "cc-card__head" }, el("b", {}, c.ticker), el("span", { class: "muted small" }, tr(x.r, "name"))),
    el("p", { class: "muted small cc-card__when" }, t("cc.when", { days: x.days, from: longDate(c.from), to: longDate(c.to) })),
    coveredChart(x.path, c.strike, c.ticker),
    el("p", { class: "cc-card__legend small" }, el("i"), t("cc.strike", { strike: c.strike })),
    el("dl", { class: "cc-card__steps" }, ...rows.map(([dt, dd]) => el("div", {}, el("dt", {}, dt), el("dd", {}, dd)))),
    el("div", { class: "cc-card__results" }, ...results.map(([label, value, k]) => el("div", {}, el("span", {}, label), el("strong", { class: k }, value)))),
    el("p", { class: "cc-card__lesson" }, tr(c, "lesson")));

  const calls = COVERED.map((c) => [c, coveredRun(c)]);
  $("#cc-cards").replaceChildren(...calls.map(([c, x]) => card(c, x, t("cc.outcome." + x.outcome), [
    [t("cc.bought"), t("cc.boughtVal", { price: money(x.s0), total: whole(x.s0 * 100) })],
    [t("cc.sold"), sold(c, x)],
    [t("cc.expiry"), t(x.called ? "cc.calledVal" : "cc.expiredVal", { price: money(x.sT), strike: c.strike })],
  ], [[t("cc.resCC"), hypo(x), cls(x.ret)], [t("cc.resStock"), shares(x), cls(x.stockRet)], gic(x)])));

  const puts = PUTS.map((c) => [c, putRun(c)]);
  $("#csp-cards").replaceChildren(...puts.map(([c, x]) => card(c, x, t("csp.outcome." + x.outcome), [
    [t("csp.start"), money(x.s0)],
    [t("csp.cash"), t("csp.cashVal", { total: whole(c.strike * 100), strike: c.strike })],
    [t("csp.sold"), sold(c, x)],
    [t("cc.expiry"), t(x.assigned ? "csp.assignedVal" : "csp.expiredVal", { price: money(x.sT), strike: c.strike })],
  ], [[t("csp.res"), hypo(x), cls(x.ret)], [t("csp.resStock"), shares(x), cls(x.stockRet)], gic(x)])));

  const all = [...calls, ...puts].map(([, x]) => x);
  const span = (xs, d) => ({ lo: pct(Math.min(...xs), d), hi: pct(Math.max(...xs), d) });
  $("#cmp-examples").textContent = t("cmp.examples", { lo: Math.min(...all.map((x) => x.days)), hi: Math.max(...all.map((x) => x.days)) });
  $("#cc-range").textContent = t("cmp.range", span(calls.map(([, x]) => x.ret)));
  $("#csp-range").textContent = t("cmp.range", span(puts.map(([, x]) => x.ret)));
  $("#gic-range").textContent = t("cmp.gicRange", { ...span(all.map((x) => x.gicRet), 2), rate: GIC_RATE * 100 });
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
      show(t("wait.invalid"), false);
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    // Express consent is required before we store an email (Canada's anti-spam law, CASL).
    const consent = $("#consent");
    if (!consent.checked) {
      consent.setAttribute("aria-invalid", "true");
      show(t("wait.consent"), false);
      consent.focus();
      return;
    }
    consent.removeAttribute("aria-invalid");
    $("#consent-lang").value = I18N.lang;

    if (!FORMSPREE_ID) {
      show(t("wait.soon"), false);
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
      show(t("wait.ok"), true);
    } catch {
      show(t("wait.err"), false);
    } finally {
      button.disabled = false;
    }
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const targets = $$(".section__head, .step, .feature, .faq details");
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
  renderHero();
  initHeroNav();
  renderSteps();
  initBoard();
  initReplays();
  initReplayLinks();
  initLab();
  renderCovered();
  initWaitlist();
  initReveal();
  // Redraw everything built in JavaScript when the language changes (the lab redraws itself).
  I18N.onChange(() => {
    renderHero();
    renderSteps();
    renderBoard();
    renderReplayTabs();
    renderCovered();
    $("#waitlist-msg").textContent = "";
  });
});
