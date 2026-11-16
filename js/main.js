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
// The hero card shows one real replay (NVIDIA's May 2023 guidance beat) rather than sample data.
function renderHero() {
  const r = REPLAYS.find((x) => x.ticker === "NVDA" && x.newsDate === "2023-05-24");
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
  const why = tr(r, "why").filter((w) => !Array.isArray(w));
  $("#hero-why").replaceChildren(el("strong", {}, t("why")),
    (I18N.lang === "zh" ? why : why.map((w) => w.charAt(0).toLowerCase() + w.slice(1))).join(t("whySep")) + t("whyEnd"));
}

/* ---------- How it works ---------- */
// Fill each step's example from the CRWD replay so the numbers match the rest of the page.
function renderSteps() {
  const r = REPLAYS.find((x) => x.ticker === "CRWD");
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
  { ticker: "CRWD", name: "CrowdStrike Holdings", dir: "bear", put: true, strike: 290, expiry: "2024-08-16",
    newsDate: "2024-07-19", entryDate: "2024-07-19",
    news: { src: "Global IT outage · July 19, 2024 · before the open", text: "A faulty CrowdStrike Falcon update crashes about 8.5 million Windows computers, grounding flights and disrupting banks and hospitals." },
    why: ["Fell 11.1% to $304.96 on the outage", "Volume 13.3× its recent daily average", "Already down 9.1% in the three sessions before", "Fallout (customer claims, lawsuits) still unknown"],
    iv: [0.55, 0.65, 0.63, 0.62, 0.6, 0.58],
    lesson: "Two Greeks paid at once: negative delta profited from Monday's 13% drop, and rising fear lifted IV, so vega added to the gain.",
    zh: {"name": "CrowdStrike", "news": {"src": "全球 IT 宕机 · 2024年7月19日 · 开盘前", "text": "CrowdStrike Falcon 的一次错误更新导致约 850 万台 Windows 电脑崩溃，航班停飞，银行和医院的业务受到干扰。"}, "why": ["受宕机影响下跌 11.1% 至 $304.96", "成交量为近期日均的 13.3 倍", "此前三个交易日已累计下跌 9.1%", "后续影响（客户索赔、诉讼）仍不明朗"], "lesson": "两个希腊值同时带来收益：负 Delta 从周一 13% 的跌幅中获利，恐慌情绪推高隐含波动率，Vega 进一步增加了收益。"},
    closes: [["2024-07-01", 392.15], ["2024-07-02", 385.05], ["2024-07-03", 387.18], ["2024-07-05", 389.68], ["2024-07-08", 390.71], ["2024-07-09", 385.88], ["2024-07-10", 374.45], ["2024-07-11", 370.43], ["2024-07-12", 371.32], ["2024-07-15", 377.37], ["2024-07-16", 369.05], ["2024-07-17", 354.94], ["2024-07-18", 343.05], ["2024-07-19", 304.96], ["2024-07-22", 263.91], ["2024-07-23", 268.88], ["2024-07-24", 258.14], ["2024-07-25", 254.15], ["2024-07-26", 256.16]] },
  { ticker: "NVDA", name: "NVIDIA Corp.", dir: "bull", put: false, strike: 400, expiry: "2023-06-16",
    newsDate: "2023-05-24", entryDate: "2023-05-25",
    news: { src: "NVIDIA Q1 FY2024 results · May 24, 2023 · after the close", text: "Guides next-quarter revenue to about $11 billion, roughly $4 billion above analyst estimates, on AI data-centre demand." },
    why: ["Earnings gap held: closed +24.4% at $379.80", "Volume 3.7× its recent daily average", "Guidance beat, not just an earnings beat", ["Closed mid-range, below the $394.80 high", "warn"]],
    iv: [0.5, 0.49, 0.48, 0.48, 0.47, 0.47],
    lesson: "Delta did the work. The stock's $21 rise outweighed five calendar days of theta and a small IV dip; buying after the event, when IV had already come down, kept vega from hurting much.",
    zh: {"name": "英伟达", "news": {"src": "英伟达 2024 财年第一季度财报 · 2023年5月24日 · 收盘后", "text": "受 AI 数据中心需求推动，公司预计下季度营收约 110 亿美元，比分析师预期高出约 40 亿美元。"}, "why": ["财报跳空站稳：收涨 24.4% 至 $379.80", "成交量为近期日均的 3.7 倍", "超预期的是业绩指引，而不只是盈利", ["收于区间中部，低于 $394.80 的最高点", "warn"]], "lesson": "Delta 发挥了主要作用。股价上涨 $21，抵消了五个日历日的 Theta 损耗和隐含波动率的小幅回落；在事件之后、隐含波动率已回落时买入，让 Vega 的拖累很小。"},
    closes: [["2023-05-01", 289.1], ["2023-05-02", 282.1], ["2023-05-03", 278.02], ["2023-05-04", 275.62], ["2023-05-05", 286.8], ["2023-05-08", 291.51], ["2023-05-09", 285.71], ["2023-05-10", 288.85], ["2023-05-11", 285.78], ["2023-05-12", 283.4], ["2023-05-15", 289.53], ["2023-05-16", 292.13], ["2023-05-17", 301.78], ["2023-05-18", 316.78], ["2023-05-19", 312.64], ["2023-05-22", 311.76], ["2023-05-23", 306.88], ["2023-05-24", 305.38], ["2023-05-25", 379.8], ["2023-05-26", 389.46], ["2023-05-30", 401.11], ["2023-05-31", 378.34], ["2023-06-01", 397.7], ["2023-06-02", 393.27]] },
  { ticker: "KRE", name: "SPDR S&P Regional Banking ETF", dir: "bear", put: true, strike: 50, expiry: "2023-04-21",
    newsDate: "2023-03-08", entryDate: "2023-03-09",
    news: { src: "SVB Financial · Mar 8, 2023 · after the close", text: "Silicon Valley Bank sells $21 billion of securities at a $1.8 billion loss and seeks to raise $2.25 billion, sparking fears of deposit runs at regional banks." },
    why: ["Fell 8.1% to $53.02 as SVB's losses spread to regional banks", "Closed at the day's low", "Volume 7.5× its recent daily average", "Fifth drop in six sessions"],
    iv: [0.4, 0.5, 0.65, 0.6, 0.6, 0.55],
    lesson: "Delta and vega together: regulators shut SVB the next day, KRE fell another 4.4%, and rising fear pushed IV up, doubling a cheap put in one session.",
    zh: {"name": "SPDR 标普地区银行 ETF", "news": {"src": "SVB 金融集团 · 2023年3月8日 · 收盘后", "text": "硅谷银行以 18 亿美元的亏损出售 210 亿美元证券，并寻求融资 22.5 亿美元，引发市场对地区银行挤兑的担忧。"}, "why": ["SVB 的亏损波及地区银行，下跌 8.1% 至 $53.02", "收于当日最低点", "成交量为近期日均的 7.5 倍", "六个交易日内第五次下跌"], "lesson": "Delta 与 Vega 共同发力：监管机构次日关闭 SVB，KRE 再跌 4.4%，恐慌情绪推高隐含波动率，一份便宜的看跌期权在一个交易日内翻倍。"},
    closes: [["2023-02-15", 64.01], ["2023-02-16", 62.88], ["2023-02-17", 63.2], ["2023-02-21", 61.73], ["2023-02-22", 61.43], ["2023-02-23", 61.67], ["2023-02-24", 61.68], ["2023-02-27", 61.66], ["2023-02-28", 61.56], ["2023-03-01", 61.19], ["2023-03-02", 59.64], ["2023-03-03", 60.38], ["2023-03-06", 59.93], ["2023-03-07", 58.0], ["2023-03-08", 57.7], ["2023-03-09", 53.02], ["2023-03-10", 50.69], ["2023-03-13", 44.45], ["2023-03-14", 45.38], ["2023-03-15", 44.64], ["2023-03-16", 46.21], ["2023-03-17", 43.44], ["2023-03-20", 43.56], ["2023-03-21", 46.07]] },
  { ticker: "META", name: "Meta Platforms", dir: "bull", put: false, strike: 195, expiry: "2023-02-17",
    newsDate: "2023-02-01", entryDate: "2023-02-02",
    news: { src: "Meta Q4 2022 results · Feb 1, 2023 · after the close", text: "Calls 2023 its “year of efficiency”, cuts its expense outlook and adds $40 billion to its share buyback." },
    why: ["Earnings gap held: closed +23.3% at $188.77", "Volume 5.2× its recent daily average", ["Closed mid-range, well below the $197.16 high", "warn"], ["Short-dated: 15 days to expiry, heavy theta", "warn"]],
    iv: [0.45, 0.44, 0.42, 0.41, 0.4, 0.4],
    lesson: "The stock slipped only 1.4%, yet the call lost about half its value: delta, theta and a dip in IV all worked against it. Short-dated calls need the move to come fast, and the stop kept it from running toward zero.",
    zh: {"name": "Meta Platforms", "news": {"src": "Meta 2022 年第四季度财报 · 2023年2月1日 · 收盘后", "text": "将 2023 年定为“效率之年”，下调支出预期，并增加 400 亿美元股票回购。"}, "why": ["财报跳空站稳：收涨 23.3% 至 $188.77", "成交量为近期日均的 5.2 倍", ["收于区间中部，远低于 $197.16 的最高点", "warn"], ["短期合约：距到期 15 天，Theta 损耗大", "warn"]], "lesson": "股价仅下跌 1.4%，看涨期权却损失约一半价值：Delta、Theta 和隐含波动率回落同时不利。短期看涨期权需要行情尽快到来，止损避免了它继续跌向零。"},
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
  renderSteps();
  initBoard();
  initReplays();
  initReplayLinks();
  initLab();
  initWaitlist();
  initReveal();
  // Redraw everything built in JavaScript when the language changes (the lab redraws itself).
  I18N.onChange(() => {
    renderHero();
    renderSteps();
    renderBoard();
    renderReplayTabs();
    $("#waitlist-msg").textContent = "";
  });
});
