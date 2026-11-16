"use strict";

// English / Simplified Chinese support.
// Whole blocks: data-lang="en" / data-lang="zh" show only in that language (used by the legal pages).
// Static text: elements marked data-i18n="key" (textContent), data-i18n-html="key" (trusted markup
// written in this file only) or data-i18n-attr="attr:key,attr:key". Their English comes from the
// HTML itself, so only Chinese lives in ZH_STATIC; a missing key falls back to the English.
// Text built in main.js goes through I18N.t(key, vars), using the STRINGS table below.

const ZH_STATIC = {
  "meta.title": "AlphOpt — 通过真实市场事件学习期权",
  "meta.desc": "AlphOpt 是一款期权教育工具。回放真实的市场事件，了解期权价格和希腊值如何变化，并在希腊值实验室中动手尝试。仅供教育用途，不构成投资建议。",
  "skip": "跳到正文",
  "banner": "仅为教育内容。不构成投资建议，也不是买入或卖出任何证券的推荐。",
  "nav.home": "AlphOpt 首页",
  "nav.primary": "主导航",
  "nav.how": "运作方式",
  "nav.signals": "案例研究",
  "nav.cases": "回放",
  "nav.lab": "希腊值实验室",
  "nav.features": "功能",
  "nav.faq": "常见问题",
  "nav.privacy": "隐私",
  "nav.terms": "条款",
  "cta.join": "加入候补名单",
  "nav.back": "← 返回 AlphOpt",
  "nav.home2": "首页",
  "privacy.title": "隐私政策 — AlphOpt",
  "terms.title": "使用条款 — AlphOpt",

  "hero.eyebrow": '<span class="pulse" aria-hidden="true"></span> 期权教育 · 真实市场事件',
  "hero.h1": '通过一个个真实事件，学习<span class="grad">期权究竟如何变动</span>。',
  "hero.lead": "AlphOpt 回放真实的市场事件，从意外的财报到市场抛售，并用浅显的语言逐日展示期权价格和希腊值如何变化。它的目的是帮助你学习，而不是告诉你该交易什么。",
  "hero.explore": "浏览案例研究 →",
  "hero.p1": "真实的历史事件",
  "hero.p2": "希腊值通俗易懂",
  "hero.p3": "亏损照实呈现",
  "hero.p4": "不提供交易推荐",
  "hero.card": "AlphOpt 案例研究",
  "hero.note": '这是对过往事件的假设性回放，仅供教育用途，并非推荐。<a href="#cases">查看全部案例研究 →</a>',

  "how.eyebrow": "运作方式",
  "how.h2": "每个案例研究都遵循相同的三个步骤",
  "how.sub": "下面每一步都以一个真实事件为例：2024 年 7 月 19 日的 CrowdStrike 宕机事件。",
  "how.s1": "事件",
  "how.s1p": "我们从一条真实的新闻标题，以及该股票当时实际的每日价格、成交量和交易区间出发。",
  "how.s2": "示例合约",
  "how.s2p": "我们挑选一份示例期权，并对每个案例使用相同的固定规则：+50% 目标、−35% 止损、最多五个交易日。这些规则只是教学工具，并不是我们推荐的策略。",
  "how.s3": "教训",
  "how.s3p": "我们用 Black-Scholes 模型估算期权在每个收盘时的价值，并展示是哪些希腊值带来了盈利或亏损，帮助你理解期权的表现。",

  "board.eyebrow": "案例研究库",
  "board.h2": "所有案例研究，一览无余",
  "board.sub": "按结果或方向筛选，然后打开任意卡片查看包含希腊值的完整回放。<em>这些是假设性的历史示例，仅供教育用途，并非推荐。</em>",
  "board.filter": "筛选案例研究",
  "board.all": "全部",
  "board.wins": "盈利",
  "board.losses": "亏损",
  "board.anyDir": "任意方向",
  "board.bull": "▲ 看涨",
  "board.bear": "▼ 看跌",
  "board.sortBy": "排序",
  "board.newest": "最新",
  "board.pnl": "结果",
  "board.ticker": "代码",
  "board.empty": "没有符合筛选条件的案例研究。",

  "cases.eyebrow": "回放",
  "cases.h2": "真实新闻，逐日收盘回放",
  "cases.sub": "选择一个事件，查看示例合约、它的希腊值，以及它的价值如何逐日变化。",
  "cases.record": "案例研究结果",
  "cases.tabs": "案例研究",
  "cases.note": "这些是对过往事件的假设性教育回放。当时 AlphOpt 尚不存在，也没有任何人被建议进行这些交易。股票价格、成交量和价格区间均为当时实际的每日数据，未按之后的拆股调整（来源：Yahoo Finance）。每次回放都使用相同的固定规则，这些规则仅用于说明，亏损也包含在内。期权价格和希腊值是根据所示隐含波动率计算的 Black-Scholes 估算值（利率 5%）：SPY 使用 VIX 收盘值，其他为假设值，并非实际报价。假设性结果有其固有的局限：它们是事后编制的，没有反映真实交易、买卖价差、佣金或税费，因此实际结果会有所不同。每份合约 = 100 股。过往结果不能预测未来结果。",

  "lab.eyebrow": "希腊值实验室",
  "lab.h2": "看清是什么在驱动期权价格",
  "lab.sub": "从案例研究中选择一份合约，然后调整股价、时间和波动率。观察它的价格和希腊值如何变化，并看清是哪个希腊值驱动了变化。",
  "lab.contract": "合约",
  "lab.spot": "股价",
  "lab.days": "已过天数",
  "lab.iv": "隐含波动率",
  "lab.presets": "情景预设",
  "lab.actual": "实际发生的情况",
  "lab.reset": "重置到起点",
  "lab.chartTitle": "期权价值与股价",
  "lab.today": '<i style="background:#22d3a6"></i>当前设置',
  "lab.expiry": '<i class="legend__dash"></i>到期时',
  "lab.greeksNow": "当前希腊值",
  "lab.drivers": "变化的驱动因素",
  "lab.perContract": "每份合约（美元）",
  "lab.note": "这是一个用于学习的简化模型：Black-Scholes 估算值，利率 5%，以每个案例研究的第一个收盘为起点。实际期权价格还取决于买卖价差、波动率偏斜、股息和提前行权。",

  "feat.eyebrow": "为什么选择 AlphOpt",
  "feat.h2": "帮助你理解期权，而不是告诉你该交易什么",
  "feat.1": "真实事件，真实价格",
  "feat.1p": "每个案例研究都基于一条真实的新闻标题和该股票实际的每日价格，因此每个教训都与市场的真实表现一致。",
  "feat.1a": "查看 CrowdStrike 案例研究 →",
  "feat.2": "希腊值通俗易懂",
  "feat.2p": "把 Delta、Gamma、Theta 和 Vega 翻译成通俗的语言：每一个对期权价值产生了多少美元的影响。",
  "feat.3": "互动式希腊值实验室",
  "feat.3p": "调整股价、时间和波动率，观察期权如何重新定价。在投入任何资金之前先建立直觉。",
  "feat.3a": "打开希腊值实验室 →",
  "feat.4": "风险清晰可见",
  "feat.4p": "每个案例都展示期权最多可能亏损多少，以及时间损耗和波动率下降会多快地侵蚀它的价值。",
  "feat.4a": "看看 Theta 和隐含波动率如何拖累 META 看涨期权 →",
  "feat.5": "亏损照实呈现",
  "feat.5p": "案例研究保留了亏损案例：七次中有三次亏损，并展示了导致亏损的希腊值。",
  "feat.5a": "查看全部七个案例，包括亏损 →",
  "feat.6": "不提供推荐",
  "feat.6p": "AlphOpt 从不告诉你买入或卖出什么，从不询问你的财务状况，也从不连接你的券商账户。",

  "faq.h2": "常见问题解答",
  "faq.q1": "AlphOpt 是投资建议吗？",
  "faq.a1": "不是。AlphOpt 是一款教育工具，通过历史示例解释期权和希腊值的表现。它不推荐买入或卖出任何证券，不考虑你的财务状况、目标或风险承受能力，也不能替代注册专业人士的建议。",
  "faq.q2": "AlphOpt 是否在证券监管机构注册？",
  "faq.a2": "没有。AlphOpt 未在加拿大、美国或其他任何地区的证券监管机构注册为顾问或交易商。它只提供一般性教育内容，不就买卖证券向任何人提供建议。如需针对你个人情况的建议，请咨询注册顾问。",
  "faq.q3": "AlphOpt 会告诉我该交易什么吗？",
  "faq.a3": "不会。AlphOpt 不发布交易想法、信号或提醒。案例研究是为讲解期权表现而挑选的历史示例，不是供你照做的交易。",
  "faq.q4": "这些案例研究是真实交易吗？",
  "faq.a4": "不是。事件和股票价格是真实的：当时实际的每日收盘价、成交量和价格区间。交易是假设性的：我们事后对这些事件应用了相同的固定教学规则（+50% 目标、−35% 止损、最多五个交易日，在每个收盘时检查）。没有人进行过这些交易，当时 AlphOpt 也尚不存在。期权价格和希腊值是模型估算值，并非实际报价。",
  "faq.q5": "期权有风险吗？",
  "faq.a5": "有。期权很复杂，可能在很短时间内（有时一天之内）失去全部价值，很多人交易期权会亏钱。交易期权之前，请阅读你的券商提供的期权风险披露文件，并确保你理解其内容。",
  "faq.q6": "我需要先懂期权吗？",
  "faq.a6": "不需要。每个案例都用通俗的语言解释合约：它的成本、最多可能亏损多少，以及股票需要怎样走。希腊值实验室让你探索“如果股价下跌会怎样？”或“如果过了一周会怎样？”",
  "faq.q7": "你们收集哪些数据？",
  "faq.a7": '只收集你为加入候补名单而提供的电子邮箱地址，以及你的同意记录。你的语言选择保存在你自己的浏览器中。没有广告、分析工具或跟踪 Cookie。详见<a href="privacy.html">隐私政策</a>。',

  "wait.h2": "抢先体验 AlphOpt",
  "wait.lead": "加入候补名单，在 AlphOpt 期权教育应用上线时收到通知。",
  "wait.email": "电子邮箱地址",
  "wait.join": "加入候补名单",
  "wait.consent": '我同意接收 AlphOpt 关于其上线的电子邮件，并确认我已年满 18 岁。我可以随时退订。详见<a href="privacy.html">隐私政策</a>。',
  "wait.privacy": "我们只会用你的邮箱发送 AlphOpt 上线消息，绝不出售或分享。注册信息由美国服务商 Formspree 存储，因此你的邮箱可能会在美国处理。",

  "footer.nav": "页脚导航",
  "footer.disclaimer": "<strong>重要提示：</strong>AlphOpt 是一款教育工具。本网站的任何内容都不构成投资、税务或法律建议，也不是买入或卖出任何证券或期权的推荐或招揽。AlphOpt 未在任何证券监管机构注册为顾问或交易商。期权涉及重大风险，并不适合所有投资者，并且可能到期时一文不值。案例研究是事后编制的、对过往事件的假设性回放；它们不反映实际交易，过往结果不能预测未来结果。公司名称和股票代码归其各自所有者所有，这些所有者与 AlphOpt 无关，也不为其背书。",
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
    "hero.date": "Case study · {date}",
    "hero.chart": "{ticker} daily closes, {from} to {to}",
    "hero.caption": "Daily closes · start {d1} at {p1}, end {d2} at {p2}",
    "entry": "Entry", "target": "Target", "stop": "Stop", "exit": "Exit",
    "why": "Setup: ",
    "whySep": "; ", "whyEnd": ".",
    "step.spotted": "The event · {date}",
    "step.news": "News", "step.newsVal": "Global IT outage",
    "step.stock": "Stock", "step.stockVal": "{pct}% to {price}",
    "step.volume": "Volume", "step.volumeVal": "{x}× normal",
    "step.picked": "Example contract", "step.contract": "Contract",
    "step.delta": "Delta", "step.deltaVal": "{x} per $1",
    "step.theta": "Theta", "step.thetaVal": "{x} / day",
    "step.alerted": "Outcome",
    "step.entryTarget": "Entry → target", "step.result": "Result",
    "card.aria": "{ticker} {side} case study from {date}, {pct}%. Open the full replay.",
    "card.full": "Full replay →",
    "chart.aria": "{ticker} daily closes from {from} to {to}",
    "chart.news": "News",
    "replay.aria": "{ticker} case study",
    "replay.tag": "HISTORICAL",
    "replay.atClose": "At the close",
    "ledger.stock": "Stock", "ledger.option": "Option", "ledger.pnl": "Hypothetical P&L", "ledger.open": "Open",
    "ledger.delta": "Delta", "ledger.gamma": "Gamma", "ledger.theta": "Theta / day", "ledger.vega": "Vega / IV pt",
    "ledger.iv": "IV ({src})", "ledger.assumed": "assumed", "ledger.dte": "Days to expiry",
    "legend.held": "Position held",
    "result.stock": "Stock", "result.option": "Option", "result.pnl": "Hypothetical P&L per contract",
    "replay.ledgerTitle": "Position and Greeks, close by close",
    "replay.ledgerUnit": "Theta and vega in $ per contract",
    "replay.lesson": "What the Greeks show: ",
    "replay.toLab": "Try this contract in the Greeks lab →",
    "record.replays": " case studies", "record.wins": " gains", "record.losses": " losses",
    "lab.option": "${strike} {side} · {date}",
    "lab.daysOut": "{days} · {left} left",
    "lab.stock": "{ticker} stock",
    "lab.optionEntry": "Option (start {price})",
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
    "wait.consent": "Please tick the box to agree to receive launch emails.",
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
    "hero.date": "案例研究 · {date}",
    "hero.chart": "{ticker} 每日收盘价，{from}至{to}",
    "hero.caption": "每日收盘价 · 起点 {d1} {p1}，终点 {d2} {p2}",
    "entry": "入场", "target": "目标", "stop": "止损", "exit": "离场",
    "why": "背景：",
    "whySep": "；", "whyEnd": "。",
    "step.spotted": "事件 · {date}",
    "step.news": "新闻", "step.newsVal": "全球 IT 宕机",
    "step.stock": "股价", "step.stockVal": "{pct}% 至 {price}",
    "step.volume": "成交量", "step.volumeVal": "正常水平的 {x} 倍",
    "step.picked": "示例合约", "step.contract": "合约",
    "step.delta": "Delta", "step.deltaVal": "每 $1 变动 {x}",
    "step.theta": "Theta", "step.thetaVal": "{x} / 天",
    "step.alerted": "回放结果",
    "step.entryTarget": "入场 → 目标", "step.result": "盈亏",
    "card.aria": "{ticker} {side}案例研究，{date}，{pct}%。打开完整回放。",
    "card.full": "完整回放 →",
    "chart.aria": "{ticker} 每日收盘价，{from}至{to}",
    "chart.news": "新闻",
    "replay.aria": "{ticker} 案例研究",
    "replay.tag": "历史案例",
    "replay.atClose": "收盘时",
    "ledger.stock": "股价", "ledger.option": "期权", "ledger.pnl": "假设性盈亏", "ledger.open": "建仓",
    "ledger.delta": "Delta", "ledger.gamma": "Gamma", "ledger.theta": "Theta / 天", "ledger.vega": "Vega / 每点 IV",
    "ledger.iv": "IV（{src}）", "ledger.assumed": "假设值", "ledger.dte": "距到期天数",
    "legend.held": "持仓期间",
    "result.stock": "股价", "result.option": "期权", "result.pnl": "每份合约假设性盈亏",
    "replay.ledgerTitle": "仓位与希腊值，逐日收盘",
    "replay.ledgerUnit": "Theta 和 Vega 以每份合约美元计",
    "replay.lesson": "希腊值告诉我们：",
    "replay.toLab": "在希腊值实验室中试试这份合约 →",
    "record.replays": " 个案例研究", "record.wins": " 次盈利", "record.losses": " 次亏损",
    "lab.option": "${strike} {side} · {date}",
    "lab.daysOut": "{days} 天 · 剩余 {left} 天",
    "lab.stock": "{ticker} 股价",
    "lab.optionEntry": "期权（起点 {price}）",
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
    "wait.consent": "请勾选方框，同意接收上线邮件。",
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
    for (const block of document.querySelectorAll("[data-lang]")) block.hidden = block.dataset.lang !== api.lang;
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
