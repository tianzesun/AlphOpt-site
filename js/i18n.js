"use strict";

// English / Simplified Chinese support.
// Static text: elements marked data-i18n="key" (textContent), data-i18n-html="key" (trusted markup
// written in this file only) or data-i18n-attr="attr:key,attr:key". Their English comes from the
// HTML itself, so only Chinese lives in ZH_STATIC; a missing key falls back to the English.
// Text built in main.js goes through I18N.t(key, vars), using the STRINGS table below.

const ZH_STATIC = {
  "meta.title": "AlphOpt — AI 期权信号，希腊值一看就懂",
  "meta.desc": "AlphOpt 用 AI 解读新闻、价格走势和期权市场，并给出清晰的期权信号：合约、入场价、目标价和止损价，并用浅显的语言解释希腊值。",
  "skip": "跳到正文",
  "nav.home": "AlphOpt 首页",
  "nav.primary": "主导航",
  "nav.how": "运作方式",
  "nav.signals": "信号",
  "nav.cases": "回放",
  "nav.lab": "希腊值实验室",
  "nav.features": "功能",
  "nav.pricing": "价格",
  "nav.faq": "常见问题",
  "cta.early": "抢先体验",

  "hero.eyebrow": '<span class="pulse" aria-hidden="true"></span> AI 期权信号 · 希腊值详解',
  "hero.h1": '几秒钟内，知道<span class="grad">交易什么</span>以及<span class="grad">为什么</span>。',
  "hero.lead": "新闻一出，AlphOpt 的 AI 会解读价格走势、成交量、波动率和期权链，然后给你一份简短的期权信号清单。每个信号都写明合约、入场价、目标价和止损价，并用浅显的语言解释希腊值。",
  "hero.past": "查看过往信号 →",
  "hero.p1": "无需解读图表",
  "hero.p2": "每个信号都有解释",
  "hero.p3": "希腊值通俗易懂",
  "hero.p4": "风险一目了然",
  "hero.card": "AlphOpt 信号回放",
  "hero.note": '这是过往事件的回放，不是实时信号。<a href="#cases">查看全部回放 →</a>',
  "ticker.label": "信号回放结果",

  "how.eyebrow": "运作方式",
  "how.h2": "从新闻标题到期权信号，只需三步",
  "how.sub": "下面每一步都展示了它在一个真实事件中的表现：2024 年 7 月 19 日的 CrowdStrike 宕机事件。",
  "how.s1": "扫描",
  "how.s1p": "我们的模型持续监测美国股票及其期权链的价格、成交量、期权资金流、隐含波动率、财报日程和新闻情绪。",
  "how.s2": "评分与挑选",
  "how.s2p": "每个交易机会都会按信心度和风险回报比评分，弱势或过于拥挤的想法会被剔除。对留下来的机会，AI 会挑选希腊值与预期走势相匹配的行权价和到期日。",
  "how.s3": "行动",
  "how.s3p": "你会收到一张清晰易读的卡片：代码、方向、建议的行权价和到期日、入场价、目标价、止损价、希腊值以及背后的理由。最终决定永远由你来做。",

  "board.eyebrow": "信号看板",
  "board.h2": "所有回放信号，一览无余",
  "board.sub": "按结果或方向筛选，然后打开任意卡片查看包含希腊值的完整回放。<em>这些是过往事件的回放，不是实时推荐。</em>",
  "board.filter": "筛选信号",
  "board.all": "全部",
  "board.wins": "盈利",
  "board.losses": "亏损",
  "board.anyDir": "任意方向",
  "board.bull": "▲ 看涨",
  "board.bear": "▼ 看跌",
  "board.sortBy": "排序",
  "board.newest": "最新",
  "board.pnl": "盈亏",
  "board.ticker": "代码",
  "board.empty": "没有符合筛选条件的信号。",

  "cases.eyebrow": "信号回放",
  "cases.h2": "真实新闻，在 AlphOpt 中回放",
  "cases.sub": "选择一个事件，查看提醒、合约、希腊值，以及仓位逐日收盘的变化。",
  "cases.record": "回放战绩",
  "cases.tabs": "信号回放",
  "cases.note": "这些是用 AlphOpt 信号规则对过往事件的回放；当时 AlphOpt 尚未上线，也没有发布这些信号。股票价格、成交量和价格区间均为当时实际的每日数据，未按之后的拆股调整（来源：Yahoo Finance）。每次回放都使用相同规则，亏损也保留在记录中。期权价格和希腊值是根据所示隐含波动率计算的 Black-Scholes 估算值（利率 5%）：SPY 使用 VIX 收盘值，其他为假设值，并非实际报价。离场条件在每个收盘时检查，因此实际成交、买卖价差和盘中波动会有所不同。每份合约 = 100 股。过往业绩不代表未来表现。",

  "lab.eyebrow": "希腊值实验室",
  "lab.h2": "买入之前，先看清是什么在驱动你的期权",
  "lab.sub": "从回放中选择一份合约，然后调整股价、时间和波动率。观察它的价格和希腊值如何变化，并看清是哪个希腊值带来了盈利或亏损。",
  "lab.contract": "合约",
  "lab.spot": "股价",
  "lab.days": "已过天数",
  "lab.iv": "隐含波动率",
  "lab.presets": "情景预设",
  "lab.actual": "实际发生的情况",
  "lab.reset": "重置到入场",
  "lab.chartTitle": "期权价值与股价",
  "lab.today": '<i style="background:#22d3a6"></i>当前设置',
  "lab.expiry": '<i class="legend__dash"></i>到期时',
  "lab.greeksNow": "当前希腊值",
  "lab.drivers": "变化的驱动因素",
  "lab.perContract": "每份合约（美元）",
  "lab.note": "Black-Scholes 估算值，利率 5%，以每次回放的入场为起点。实际价格还取决于买卖价差、波动率偏斜和股息。",

  "feat.eyebrow": "为什么选择 AlphOpt",
  "feat.h2": "为不想整天盯盘的投资者打造",
  "feat.1": "可解释的 AI",
  "feat.1p": "不是黑箱。每个信号都列出驱动它的因素，让你了解“为什么”，再决定是否认同。",
  "feat.1a": "看看 CRWD 看跌信号为何触发 →",
  "feat.2": "期权变简单",
  "feat.2p": "我们建议具体的行权价和到期日，并把希腊值翻译成通俗的语言：你最多会亏多少，以及要怎样才能赚钱。",
  "feat.2a": "在希腊值实验室中调整股价 →",
  "feat.3": "风险优先",
  "feat.3p": "每张卡片首先展示止损价、最大亏损和风险回报比。仓位建议帮助你控制单个想法的规模。",
  "feat.3a": "看看止损如何限制了 META 的亏损 →",
  "feat.4": "智能提醒",
  "feat.4p": "当有新信号匹配你的自选列表，或持仓想法触及目标价或止损价时，你会收到通知。",
  "feat.5": "诚实的战绩",
  "feat.5p": "每个信号都保留在记录中，无论盈亏。我们的七次回放中有三次亏损，并展示了导致亏损的希腊值。",
  "feat.5a": "查看全部七次回放，包括亏损 →",
  "feat.6": "网页与手机",
  "feat.6p": "喝咖啡时在手机上查看当天的清单，再到电脑上深入了解细节。你的自选列表和提醒随处同步。",

  "price.eyebrow": "价格",
  "price.h2": "免费开始。物有所值时再升级。",
  "price.period": "计费周期",
  "price.monthly": "按月",
  "price.yearly": '按年 <span class="tag">免费两个月</span>',
  "price.mo": "/月",
  "price.starter.p": "先感受一下 AI 信号。",
  "price.starter.1": "每天 3 个期权信号",
  "price.starter.2": "延迟 30 分钟",
  "price.starter.3": "信号解释",
  "price.starter.4": "公开战绩",
  "price.starter.cta": "免费加入",
  "price.popular": "最受欢迎",
  "price.pro.p": "适合活跃的期权交易者。",
  "price.pro.1": "全部期权信号",
  "price.pro.2": "实时推送",
  "price.pro.3": "建议的行权价和到期日",
  "price.pro.4": "每个信号都有希腊值实验室",
  "price.pro.5": "自选列表提醒（推送和邮件）",
  "price.pro.6": "仓位规模助手",
  "price.elite.p": "为高阶用户提供更深入的数据。",
  "price.elite.1": "包含 Pro 的全部功能",
  "price.elite.2": "多腿期权策略",
  "price.elite.3": "自定义扫描器和筛选器",
  "price.elite.4": "信号导出和 API 访问",
  "price.elite.5": "优先支持",
  "price.join": "加入候补名单",
  "price.note": "价格以美元计。可随时取消。",

  "faq.h2": "常见问题解答",
  "faq.q1": "AlphOpt 是财务建议吗？",
  "faq.a1": "不是。AlphOpt 提供研究信号和教育信息。它并不了解你的财务状况、目标或风险承受能力。请务必自行研究，并在投资前考虑咨询持牌顾问。",
  "faq.q2": "我需要懂期权才能使用吗？",
  "faq.a2": "不需要。每张卡片都用通俗的语言解释合约：你需要支付多少、最多会亏多少，以及股票需要怎样走交易才能成功。希腊值实验室让你在买入前试一试“如果股价下跌会怎样？”或“如果我持有一周会怎样？”",
  "faq.q3": "这些回放是真实交易吗？",
  "faq.a3": "事件和股票价格是真实的：当时实际的每日收盘价、成交量和价格区间。交易是回放：我们把 AlphOpt 的规则（+50% 目标、−35% 止损、最多五个交易日，在每个收盘时检查）应用到这些事件上。当时 AlphOpt 尚未上线，也没有发布这些信号。期权价格和希腊值是模型估算值，并非实际报价。亏损也保留在内，方便你全面评判这些规则。",
  "faq.q4": "AI 如何挑选信号？",
  "faq.a4": "基于历史市场数据训练的模型，会结合技术形态、期权市场活动、波动率以及新闻和财报背景为每个交易机会评分。只有达到信心度和风险回报门槛的机会才会发布，并附上背后的主要因素。",
  "faq.q5": "AlphOpt 会替我下单吗？",
  "faq.a5": "不会。AlphOpt 从不接触你的券商账户。你阅读信号后，自行决定是否通过自己的券商操作。",
  "faq.q6": "覆盖哪些市场？",
  "faq.a6": "上线时，AlphOpt 覆盖在美国上市的股票和 ETF 及其上市期权。更多市场已在规划中。",

  "wait.h2": "新信号触发时，第一时间收到",
  "wait.lead": "加入候补名单，抢先体验 AlphOpt，并免费获得一个月 Pro。",
  "wait.email": "电子邮箱地址",
  "wait.privacy": "我们只会用你的邮箱发送 AlphOpt 上线消息。可随时退订。",

  "footer.nav": "页脚导航",
  "footer.disclaimer": "<strong>风险披露：</strong>投资股票和期权涉及重大亏损风险，并不适合所有投资者。期权可能到期时一文不值，你可能损失全部投资。AlphOpt 提供的信息仅供教育和研究用途，不构成投资、税务或法律建议。过往业绩不代表未来表现。本网站展示的信号是对过往事件的回放：它们展示的是在 AlphOpt 规则下这些事件会如何发展，并非 AlphOpt 实际发布的信号。其中的期权价格和希腊值为模型估算值。",
  "footer.rights": "保留所有权利。",
};

const STRINGS = {
  en: {
    "menu.open": "Open menu",
    "menu.close": "Close menu",
    "lang.switch": "切换到中文",
    "bull": "▲ Bullish",
    "bear": "▼ Bearish",
    "put": "put", "call": "call",
    "PUT": "PUT", "CALL": "CALL",
    "Put": "Put", "Call": "Call",
    "contract": "${strike} {side} · {date} expiry",
    "exit.Target": "Target hit", "exit.Stop": "Stop hit", "exit.Time": "Time stop",
    "exitPct.Target": "Target hit ({pct}%)", "exitPct.Stop": "Stop hit ({pct}%)",
    "tag.Target": "TARGET", "tag.Stop": "STOP", "tag.Time": "TIME",
    "exitOn": "{exit}, {date}",
    "hero.date": "Signal replay · {date}",
    "hero.chart": "{ticker} daily closes, {from} to {to}",
    "hero.caption": "Daily closes · bought {d1} at {p1}, sold {d2} at {p2}",
    "entry": "Entry", "target": "Target", "stop": "Stop", "exit": "Exit",
    "why": "Why: ",
    "whySep": "; ", "whyEnd": ".",
    "step.spotted": "Spotted · {date}",
    "step.news": "News", "step.newsVal": "Global IT outage",
    "step.stock": "Stock", "step.stockVal": "{pct}% to {price}",
    "step.volume": "Volume", "step.volumeVal": "{x}× normal",
    "step.picked": "Picked", "step.contract": "Contract",
    "step.delta": "Delta", "step.deltaVal": "{x} per $1",
    "step.theta": "Theta", "step.thetaVal": "{x} / day",
    "step.alerted": "Alerted at the close",
    "step.entryTarget": "Entry → target", "step.result": "Result",
    "card.aria": "{ticker} {side} replay from {date}, {pct}%. Open the full replay.",
    "card.full": "Full replay →",
    "chart.aria": "{ticker} daily closes from {from} to {to}",
    "chart.news": "News",
    "replay.aria": "{ticker} replayed alert",
    "replay.tag": "REPLAY",
    "replay.atClose": "At the close",
    "replay.push": "New {dir} options signal. Entry about {price}.",
    "replay.bullish": "bullish", "replay.bearish": "bearish",
    "ledger.stock": "Stock", "ledger.option": "Option", "ledger.pnl": "Position P&L", "ledger.open": "Open",
    "ledger.delta": "Delta", "ledger.gamma": "Gamma", "ledger.theta": "Theta / day", "ledger.vega": "Vega / IV pt",
    "ledger.iv": "IV ({src})", "ledger.assumed": "assumed", "ledger.dte": "Days to expiry",
    "legend.held": "Position held",
    "result.stock": "Stock", "result.option": "Option", "result.pnl": "P&L per contract",
    "replay.ledgerTitle": "Position and Greeks, close by close",
    "replay.ledgerUnit": "Theta and vega in $ per contract",
    "replay.lesson": "What the Greeks show: ",
    "replay.toLab": "Try this contract in the Greeks lab →",
    "record.replays": " replays", "record.wins": " wins", "record.losses": " losses",
    "record.net": "Net ", "record.per": " per contract",
    "lab.option": "${strike} {side} · {date}",
    "lab.daysOut": "{days} · {left} left",
    "lab.stock": "{ticker} stock",
    "lab.optionEntry": "Option (entry {price})",
    "lab.return": "Return",
    "lab.gains": "gains", "lab.loses": "loses",
    "lab.delta": "If {ticker} rises $1, this {side} {dir} about {amt}",
    "lab.gamma": "Each $1 move shifts delta by {x}",
    "lab.theta": "Time decay costs about {amt} per contract per day",
    "lab.vega": "Each 1-point change in IV moves it {amt} per contract",
    "lab.other": "Other", "lab.total": "Total",
    "lab.strike": "Strike ${strike}",
    "lab.aria": "Option value from ${lo} to ${hi} stock price; currently {price} at {spot}",
    "wait.invalid": "Please enter a valid email address.",
    "wait.soon": "Sign-ups open soon. Please check back shortly.",
    "wait.ok": "You're on the list! We'll be in touch soon.",
    "wait.err": "Something went wrong. Please try again later.",
  },
  zh: {
    "menu.open": "打开菜单",
    "menu.close": "关闭菜单",
    "lang.switch": "Switch to English",
    "bull": "▲ 看涨",
    "bear": "▼ 看跌",
    "put": "看跌期权", "call": "看涨期权",
    "PUT": "看跌", "CALL": "看涨",
    "Put": "看跌", "Call": "看涨",
    "contract": "${strike} {side} · {date}到期",
    "exit.Target": "触及目标", "exit.Stop": "触及止损", "exit.Time": "到期离场",
    "exitPct.Target": "触及目标（{pct}%）", "exitPct.Stop": "触及止损（{pct}%）",
    "tag.Target": "目标", "tag.Stop": "止损", "tag.Time": "到期",
    "exitOn": "{exit}，{date}",
    "hero.date": "信号回放 · {date}",
    "hero.chart": "{ticker} 每日收盘价，{from}至{to}",
    "hero.caption": "每日收盘价 · {d1}以 {p1} 买入，{d2}以 {p2} 卖出",
    "entry": "入场", "target": "目标", "stop": "止损", "exit": "离场",
    "why": "理由：",
    "whySep": "；", "whyEnd": "。",
    "step.spotted": "发现 · {date}",
    "step.news": "新闻", "step.newsVal": "全球 IT 宕机",
    "step.stock": "股价", "step.stockVal": "{pct}% 至 {price}",
    "step.volume": "成交量", "step.volumeVal": "正常水平的 {x} 倍",
    "step.picked": "挑选", "step.contract": "合约",
    "step.delta": "Delta", "step.deltaVal": "每 $1 变动 {x}",
    "step.theta": "Theta", "step.thetaVal": "{x} / 天",
    "step.alerted": "收盘时发出提醒",
    "step.entryTarget": "入场 → 目标", "step.result": "结果",
    "card.aria": "{ticker} {side}回放，{date}，{pct}%。打开完整回放。",
    "card.full": "完整回放 →",
    "chart.aria": "{ticker} 每日收盘价，{from}至{to}",
    "chart.news": "新闻",
    "replay.aria": "{ticker} 回放提醒",
    "replay.tag": "回放",
    "replay.atClose": "收盘时",
    "replay.push": "新的{dir}期权信号。入场价约 {price}。",
    "replay.bullish": "看涨", "replay.bearish": "看跌",
    "ledger.stock": "股价", "ledger.option": "期权", "ledger.pnl": "仓位盈亏", "ledger.open": "建仓",
    "ledger.delta": "Delta", "ledger.gamma": "Gamma", "ledger.theta": "Theta / 天", "ledger.vega": "Vega / 每点 IV",
    "ledger.iv": "IV（{src}）", "ledger.assumed": "假设值", "ledger.dte": "距到期天数",
    "legend.held": "持仓期间",
    "result.stock": "股价", "result.option": "期权", "result.pnl": "每份合约盈亏",
    "replay.ledgerTitle": "仓位与希腊值，逐日收盘",
    "replay.ledgerUnit": "Theta 和 Vega 以每份合约美元计",
    "replay.lesson": "希腊值告诉我们：",
    "replay.toLab": "在希腊值实验室中试试这份合约 →",
    "record.replays": " 次回放", "record.wins": " 次盈利", "record.losses": " 次亏损",
    "record.net": "净 ", "record.per": " / 每份合约",
    "lab.option": "${strike} {side} · {date}",
    "lab.daysOut": "{days} 天 · 剩余 {left} 天",
    "lab.stock": "{ticker} 股价",
    "lab.optionEntry": "期权（入场 {price}）",
    "lab.return": "回报率",
    "lab.gains": "增加", "lab.loses": "减少",
    "lab.delta": "若 {ticker} 上涨 $1，这份{side}约{dir} {amt}",
    "lab.gamma": "股价每变动 $1，Delta 改变 {x}",
    "lab.theta": "时间损耗每天约 {amt} / 每份合约",
    "lab.vega": "IV 每变动 1 个点，价值变动 {amt} / 每份合约",
    "lab.other": "其他", "lab.total": "合计",
    "lab.strike": "行权价 ${strike}",
    "lab.aria": "股价从 ${lo} 到 ${hi} 时的期权价值；当前股价 {spot} 时为 {price}",
    "wait.invalid": "请输入有效的电子邮箱地址。",
    "wait.soon": "即将开放注册，请稍后再来。",
    "wait.ok": "你已加入候补名单！我们会尽快与你联系。",
    "wait.err": "出了点问题，请稍后再试。",
  },
};

const I18N = (() => {
  const KEY = "alphopt-lang";
  const listeners = [];
  const original = new Map(); // element -> English text/markup/attributes from the HTML

  const pick = () => {
    const param = new URLSearchParams(location.search).get("lang");
    if (param === "zh" || param === "en") return param;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "zh" || saved === "en") return saved;
    } catch { /* storage blocked */ }
    return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
  };

  const api = {
    lang: pick(),
    locale: () => (api.lang === "zh" ? "zh-CN" : "en-CA"),
    t(key, vars = {}) {
      const str = STRINGS[api.lang][key] ?? STRINGS.en[key] ?? key;
      return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    },
    onChange(fn) { listeners.push(fn); },
    set(lang) {
      if (lang === api.lang) return;
      api.lang = lang;
      try { localStorage.setItem(KEY, lang); } catch { /* storage blocked */ }
      apply();
      listeners.forEach((fn) => fn(lang));
    },
  };

  function apply() {
    const zh = api.lang === "zh";
    document.documentElement.lang = zh ? "zh-CN" : "en";
    for (const node of document.querySelectorAll("[data-i18n], [data-i18n-html], [data-i18n-attr]")) {
      if (!original.has(node)) {
        const attrs = {};
        for (const pair of (node.dataset.i18nAttr || "").split(",").filter(Boolean)) {
          const [attr] = pair.split(":");
          attrs[attr] = node.getAttribute(attr);
        }
        original.set(node, { text: node.textContent, html: node.innerHTML, attrs });
      }
      const orig = original.get(node);
      if (node.dataset.i18n) {
        node.textContent = (zh && ZH_STATIC[node.dataset.i18n]) || orig.text;
      } else if (node.dataset.i18nHtml) {
        // Markup comes only from ZH_STATIC above or the page's own HTML, never from user input.
        node.innerHTML = (zh && ZH_STATIC[node.dataset.i18nHtml]) || orig.html;
      }
      for (const pair of (node.dataset.i18nAttr || "").split(",").filter(Boolean)) {
        const [attr, key] = pair.split(":");
        node.setAttribute(attr, (zh && ZH_STATIC[key]) || orig.attrs[attr]);
      }
    }
    const btn = document.getElementById("lang-toggle");
    if (btn) {
      btn.textContent = zh ? "EN" : "中文";
      btn.lang = zh ? "en" : "zh-CN";
      btn.setAttribute("aria-label", api.t("lang.switch"));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    apply();
    document.getElementById("lang-toggle")?.addEventListener("click", () => api.set(api.lang === "zh" ? "en" : "zh"));
  });
  return api;
})();
