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
  "cta.join": "即将推出",
  "nav.back": "← 返回 AlphOpt",
  "nav.home2": "首页",
  "privacy.title": "隐私政策 — AlphOpt",
  "terms.title": "使用条款 — AlphOpt",

  "hero.eyebrow": '<span class="pulse" aria-hidden="true"></span> 期权教育 · 风险优先',
  "hero.h1": '通过一个个真实事件，学习<span class="grad">期权究竟如何变动</span>。',
  "hero.lead": "AlphOpt 回放真实的市场事件，从意外的财报到市场抛售，并用浅显的语言逐日展示期权价格和希腊值如何变化，而且总是先讲风险。它的目的是帮助你学习，而不是告诉你该交易什么。",
  "hero.explore": "浏览案例研究 →",
  "hero.p1": "真实的历史事件",
  "hero.p2": "希腊值通俗易懂",
  "hero.p3": "亏损照实呈现",
  "hero.p4": "不提供交易推荐",
  "hero.prev": "上一个案例研究",
  "hero.next": "下一个案例研究",
  "hero.card": "AlphOpt 案例研究",
  "hero.note": '这是对过往事件的假设性回放，仅供教育用途，并非推荐。<a href="#cases">查看全部案例研究 →</a>',

  "focus.eyebrow": "我们涵盖的范围",
  "focus.h2": "十个标的，以及它们可能出现的问题",
  "focus.p1": "AlphOpt 只涵盖十只美国股票和 ETF，选择它们是因为它们的期权交易最为活跃，而不是因为我们预期它们会上涨。它们的价格被广泛报道，因此每一课都可以核实。",
  "focus.p2": "每一课都从风险讲起。规模大、知名度高并不意味着股票安全：2025 年 1 月，英伟达一天之内下跌了 17%，而这十只标的中任何一只的期权都可能失去全部价值。",
  "focus.label": "涵盖的股票和 ETF",
  "focus.spy": "标普500 ETF",
  "focus.qqq": "纳斯达克100 ETF",
  "focus.aapl": "苹果",
  "focus.nvda": "英伟达",
  "focus.tsla": "特斯拉",
  "focus.amzn": "亚马逊",
  "focus.msft": "微软",
  "focus.amd": "超威半导体",
  "focus.iwm": "罗素2000 ETF",
  "faq.q10": "AlphOpt 涵盖哪些股票？",
  "faq.a10": "十只：SPY、QQQ 和 IWM（ETF），以及苹果（AAPL）、亚马逊（AMZN）、AMD、Meta（META）、微软（MSFT）、英伟达（NVDA）和特斯拉（TSLA）。我们选择它们，是因为它们的期权是美国交易最活跃的之一，而不是因为我们预期它们会上涨或认为它们是好的投资。大型知名股票同样可能大幅下跌。",
  "how.eyebrow": "运作方式",
  "how.h2": "每个案例研究都遵循相同的三个步骤",
  "how.sub": "下面每一步都以一个真实事件为例：2025 年 1 月 27 日 DeepSeek 抛售潮中的英伟达。",
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
  "cases.note": "这些是对过往事件的假设性教育回放。当时 AlphOpt 尚不存在，也没有任何人被建议进行这些交易。股票价格、成交量和价格区间均为当时实际的每日数据，未按之后的拆股调整（来源：Yahoo Finance）。这些事件是因其教学价值而人工挑选的知名事件，并不代表典型的市场情况。每次回放都使用相同的固定规则，这些规则仅用于说明，亏损也包含在内。期权价格和希腊值是根据所示隐含波动率计算的 Black-Scholes 估算值（利率 5%）：SPY 使用 VIX 收盘值，其他为假设值，并非实际报价。假设性结果有其固有的局限：它们是事后编制的，没有反映真实交易、买卖价差、佣金或税费，因此实际结果会有所不同。每份合约 = 100 股。过往结果不能预测未来结果。",

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
  "feat.1a": "查看英伟达 DeepSeek 案例研究 →",
  "feat.2": "希腊值通俗易懂",
  "feat.2p": "把 Delta、Gamma、Theta 和 Vega 翻译成通俗的语言：每一个对期权价值产生了多少美元的影响。",
  "feat.3": "互动式希腊值实验室",
  "feat.3p": "调整股价、时间和波动率，观察期权如何重新定价。在投入任何资金之前先建立直觉。",
  "feat.3a": "打开希腊值实验室 →",
  "feat.4": "风险清晰可见",
  "feat.4p": "每个案例都展示期权最多可能亏损多少，以及时间损耗和波动率下降会多快地侵蚀它的价值。",
  "feat.4a": "看看 Theta 和隐含波动率如何拖累 META 看涨期权 →",
  "feat.5": "亏损照实呈现",
  "feat.5p": "案例研究保留了亏损案例：十一次中有七次亏损，并展示了导致亏损的希腊值。",
  "feat.5a": "查看全部十一个案例，包括亏损 →",
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
  "faq.a4": "不是。事件和股票价格是真实的：当时实际的每日收盘价、成交量和价格区间。交易是假设性的：我们事后对这些事件应用了相同的固定教学规则（+50% 目标、−35% 止损、最多五个交易日，在每个收盘时检查）。没有人进行过这些交易，当时 AlphOpt 也尚不存在。这些事件因其教学价值而被挑选，并非具有代表性的样本。期权价格和希腊值是模型估算值，并非实际报价。",
  "faq.q5": "期权有风险吗？",
  "faq.a5": "有。期权很复杂，可能在很短时间内（有时一天之内）失去全部价值，很多人交易期权会亏钱。交易期权之前，请阅读你的券商提供的期权风险披露文件，并确保你理解其内容。",
  "faq.q6": "我需要先懂期权吗？",
  "faq.a6": "不需要。每个案例都用通俗的语言解释合约：它的成本、最多可能亏损多少，以及股票需要怎样走。希腊值实验室让你探索“如果股价下跌会怎样？”或“如果过了一周会怎样？”",
  "faq.q7": "你们收集哪些数据？",
  "faq.a7": '只收集你为加入候补名单而提供的电子邮箱地址，以及你的同意记录。你的语言选择保存在你自己的浏览器中。没有广告、分析工具或跟踪 Cookie。详见<a href="privacy.html">隐私政策</a>。',

  "nav.plans": "方案",
  "nav.covered": "卖出期权",
  "cc.eyebrow": "策略讲解",
  "cc.h2": "卖出期权赚取收入，也有代价",
  "cc.intro": "备兑看涨和现金担保看跌都会预先付给你一笔权利金，作为你承担股票风险的回报。在同一股票、同一行权价和到期日下，两者的收益几乎相同，因此代价也相同：股价大跌造成的损失远超权利金，而你的收益有上限。下面的真实示例分别展示了两种策略的每一种可能结果。",
  "cc.h3": "备兑看涨",
  "csp.h3": "现金担保看跌",
  "csp.sub": "现金担保看跌是指预留足够买入 100 股的现金，同时卖出一份看跌期权，让买方有权在约定日期前按约定价格（行权价）把股票卖给你。你会预先收到一笔权利金。作为代价，如果股价跌破行权价，无论跌得多低，你都必须按行权价买入股票；如果股价大涨，你只能赚到权利金。下面三个真实示例使用了与备兑看涨相同的事件。",
  "csp.how1": "预留足够的现金，以便按行权价买入 100 股。以 $540 行权价的 SPY 为例，需要 $54,000，并在到期前一直被占用。",
  "csp.how2": "以低于当前股价的行权价卖出一份看跌期权，收取权利金。无论之后发生什么，这笔权利金都归你。",
  "csp.how3": "到期时，会出现三种情况之一：股价保持在行权价以上、大幅上涨，或者跌破行权价、你必须买入股票。",
  "cmp.csp": "现金担保看跌",
  "cmp.moneyCSP": "不受保护：如果股价跌破行权价，你必须按行权价买入股票",
  "cmp.returnCSP": "最多为权利金；如果股价收于行权价以下，你将亏损差价（扣除权利金后）",
  "cmp.riskCSP": "股价大幅下跌",
  "cc.sub": "备兑看涨是指持有 100 股股票，同时卖出一份看涨期权，让买方有权在约定日期前按约定价格（行权价）买走你的股票。你会预先收到一笔权利金。作为代价，股票下跌的风险仍由你承担，而高于行权价的涨幅则与你无关。下面三个真实示例分别展示了每一种可能的结果。",
  "cc.how1": "持有 100 股。一份期权合约对应 100 股，因此需要不少资金：2025 年 3 月买入 100 股 SPY 约需 $55,900。",
  "cc.how2": "以高于当前股价的行权价卖出一份看涨期权，收取权利金。无论之后发生什么，这笔权利金都归你。",
  "cc.how3": "到期时，会出现三种情况之一：股价停留在行权价以下、涨到行权价以上，或者下跌。",
  "cmp.h3": "备兑看涨、现金担保看跌与 GIC 对比",
  "cmp.cc": "备兑看涨",
  "cmp.gic": "GIC",
  "cmp.money": "你的本金",
  "cmp.moneyCC": "不受保护：你持有的股票可能贬值",
  "cmp.moneyGIC": "本金有保障；在 CDIC 成员机构购买的合资格 GIC，每个保险类别最高受保 $100,000",
  "cmp.return": "回报",
  "cmp.returnCC": "权利金加上股价变动，以行权价为上限；可能为负",
  "cmp.returnGIC": "固定利率，购买时确定",
  "cmp.risk": "最大风险",
  "cmp.riskCC": "股价大幅下跌",
  "cmp.riskGIC": "通货膨胀，以及资金在到期前被锁定",
  "cc.note": "这些是假设性的教育示例。股票价格为实际每日收盘价（来源：Yahoo Finance）。期权权利金是根据假设的隐含波动率（SPY 为 22%，META 和英伟达为 50%）计算的 Black-Scholes 估算值，并非实际报价，且未考虑波动率偏斜（低于股价的看跌期权通常更贵）。示例均持有至到期，未计入佣金、买卖价差、股息、提前行权、现金利息和税费，且是为展示每种可能结果而挑选的，并非具有代表性的样本。这里只展示现金担保看跌：在没有足够现金买入股票的情况下卖出看跌期权，亏损可能超过你预留的资金。GIC 利率仅为示意，并非报价。两种策略都可能亏损，也并不总能跑赢 GIC。本内容不构成使用任何一种策略的推荐。",
  "faq.q9": "备兑看涨或现金担保看跌风险低吗？",
  "faq.a9": "与 GIC 相比并不低。备兑看涨是你持有股票；现金担保看跌是你承诺按行权价买入股票。无论哪种，你都承担了股票的大部分下跌风险：权利金只能抵消一小部分跌幅，而你的收益有上限。在同一股票、同一行权价和到期日下，两者的收益几乎相同。两者都可能亏损，也都不总能跑赢 GIC。本页的示例展示了每一种结果。",
  "plans.eyebrow": "方案",
  "plans.h2": "免费学习，准备好了再深入。",
  "plans.sub": "计划中的上线价格。目前尚未开售，上线通知的注册即将开放。",
  "plans.free": "探索",
  "plans.freePrice": "免费",
  "plans.freeP": "本页的所有内容，永久免费。",
  "plans.free1": "全部历史案例研究",
  "plans.free2": "单个期权的希腊值实验室",
  "plans.free3": "通俗易懂的希腊值解释",
  "plans.learner": "学习者",
  "plans.mo": "/月",
  "plans.yearly": "或 CA$79/年（节省 27%）",
  "plans.l1": "包含“探索”的全部内容",
  "plans.l2": "循序渐进的期权课程，附测验",
  "plans.l3": "进阶实验室：价差、跨式等多腿组合的收益图",
  "plans.l4": "使用虚拟资金的练习模拟器，不进行真实交易",
  "plans.l5": "每月新增一个关于过往市场事件的案例研究",
  "plans.note": "任何方案都不包含交易推荐、信号、提醒或针对你个人的建议。你付费购买的是课程和工具，而不是关于交易什么的想法。价格以加元计，另加适用税费，上线前可能调整。购买前我们会展示完整条款，包括取消和退款规定。",
  "faq.q8": "AlphOpt 收费吗？",
  "faq.a8": "案例研究和基础希腊值实验室将保持免费。我们计划在上线时推出付费的“学习者”方案，提供系统课程、进阶工具和练习模拟器。目前尚未开售。付费永远不会买到交易推荐：所有方案都仅供教育用途。",
  "wait.h2": "AlphOpt 即将推出",
  "wait.lead": "上线通知的注册暂时关闭，即将重新开放，请稍后再来。",
  "wait.email": "电子邮箱地址",
  "wait.join": "加入候补名单",
  "wait.consent": '我同意接收 AlphOpt 的运营方 Aydenait 关于 AlphOpt 上线的电子邮件，并确认我已年满 18 岁。我可以随时退订。详见<a href="privacy.html">隐私政策</a>。',
  "wait.privacy": "我们只会用你的邮箱发送 AlphOpt 上线消息，绝不出售或分享。注册信息由美国服务商 Formspree 存储，因此你的邮箱可能会在美国处理。",
  "wait.sender": 'AlphOpt 由 Aydenait 运营 · <a href="mailto:contact@aydenait.com">contact@aydenait.com</a>',

  "footer.nav": "页脚导航",
  "footer.disclaimer": "<strong>重要提示：</strong>AlphOpt 是一款教育工具。本网站的任何内容都不构成投资、税务或法律建议，也不是买入或卖出任何证券或期权的推荐或招揽。AlphOpt 未在任何证券监管机构注册为顾问或交易商。期权涉及重大风险，并不适合所有投资者，并且可能到期时一文不值。案例研究是事后编制的、对过往事件的假设性回放；它们不反映实际交易，过往结果不能预测未来结果。公司名称和股票代码归其各自所有者所有，这些所有者与 AlphOpt 无关，也不为其背书。",
  "footer.rights": "AlphOpt 由 Aydenait 运营。保留所有权利。",
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
    "hero.count": "{i} / {n}",
    "hero.chart": "{ticker} daily closes, {from} to {to}",
    "hero.caption": "Daily closes · start {d1} at {p1}, end {d2} at {p2}",
    "entry": "Entry", "target": "Target", "stop": "Stop", "exit": "Exit",
    "hypo": "Hypothetical {pct}%",
    "ex.entry": "Example entry", "ex.target": "Example target", "ex.stop": "Example stop",
    "step.spotted": "The event · {date}",
    "step.news": "News", "step.newsVal": "DeepSeek AI sell-off",
    "step.stock": "Stock", "step.stockVal": "{pct}% to {price}",
    "step.volume": "Volume", "step.volumeVal": "{x}× normal",
    "step.picked": "Example contract", "step.contract": "Contract",
    "step.delta": "Delta", "step.deltaVal": "{x} per $1",
    "step.theta": "Theta", "step.thetaVal": "{x} / day",
    "step.alerted": "Outcome",
    "step.entryTarget": "Example entry → target", "step.result": "Result",
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
    "cc.outcome.kept": "Kept the premium", "cc.outcome.called": "Shares called away", "cc.outcome.fell": "Stock fell",
    "cc.when": "{days} days · {from} to {to}",
    "cc.chart": "{ticker} daily closes with the ${strike} strike",
    "cc.strike": "Strike ${strike}",
    "cc.bought": "Bought 100 shares", "cc.boughtVal": "{price} each ({total})",
    "cc.sold": "Sold 1 call", "cc.soldVal": "${strike} strike, expiring {date} · premium about {prem} a share ({total})",
    "cc.expiry": "At expiry",
    "cc.expiredVal": "{price} · below the strike, so the call expired worthless",
    "cc.calledVal": "{price} · above the strike, so the shares were sold at ${strike}",
    "cc.resCC": "Covered call", "cc.resStock": "Shares alone", "cc.resGic": "GIC at an illustrative {rate}% a year",
    "cmp.examples": "In the examples above ({lo}–{hi} days)",
    "cmp.range": "{lo} to {hi}",
    "cmp.gicRange": "{lo} to {hi} at an illustrative {rate}% a year",
    "csp.outcome.kept": "Kept the premium", "csp.outcome.missed": "Missed the rally", "csp.outcome.assigned": "Had to buy the shares",
    "csp.start": "Stock at start",
    "csp.cash": "Set aside cash", "csp.cashVal": "{total} to buy 100 shares at ${strike}",
    "csp.sold": "Sold 1 put",
    "csp.expiredVal": "{price} · above the strike, so the put expired worthless",
    "csp.assignedVal": "{price} · below the strike, so you bought 100 shares at ${strike}",
    "csp.res": "Cash-secured put", "csp.resStock": "Buying the shares instead",
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
    "hypo": "假设性 {pct}%",
    "ex.entry": "示例入场", "ex.target": "示例目标", "ex.stop": "示例止损",
    "step.spotted": "事件 · {date}",
    "step.news": "新闻", "step.newsVal": "DeepSeek 抛售潮",
    "step.stock": "股价", "step.stockVal": "{pct}% 至 {price}",
    "step.volume": "成交量", "step.volumeVal": "正常水平的 {x} 倍",
    "step.picked": "示例合约", "step.contract": "合约",
    "step.delta": "Delta", "step.deltaVal": "每 $1 变动 {x}",
    "step.theta": "Theta", "step.thetaVal": "{x} / 天",
    "step.alerted": "回放结果",
    "step.entryTarget": "示例入场 → 目标", "step.result": "结果",
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
    "cc.outcome.kept": "保留权利金", "cc.outcome.called": "股票被买走", "cc.outcome.fell": "股价下跌",
    "cc.when": "{days} 天 · {from}至{to}",
    "cc.chart": "{ticker} 每日收盘价及 ${strike} 行权价",
    "cc.strike": "行权价 ${strike}",
    "cc.bought": "买入 100 股", "cc.boughtVal": "每股 {price}（共 {total}）",
    "cc.sold": "卖出 1 份看涨期权", "cc.soldVal": "行权价 ${strike}，{date}到期 · 权利金约每股 {prem}（共 {total}）",
    "cc.expiry": "到期时",
    "cc.expiredVal": "{price} · 低于行权价，期权到期作废",
    "cc.calledVal": "{price} · 高于行权价，股票以 ${strike} 卖出",
    "cc.resCC": "备兑看涨", "cc.resStock": "仅持有股票", "cc.resGic": "GIC（示意年利率 {rate}%）",
    "cmp.examples": "上述示例（{lo}–{hi} 天）",
    "cmp.range": "{lo} 至 {hi}",
    "cmp.gicRange": "{lo} 至 {hi}（示意年利率 {rate}%）",
    "csp.outcome.kept": "保留权利金", "csp.outcome.missed": "错过涨幅", "csp.outcome.assigned": "被迫买入股票",
    "csp.start": "起始股价",
    "csp.cash": "预留现金", "csp.cashVal": "{total}，用于以 ${strike} 买入 100 股",
    "csp.sold": "卖出 1 份看跌期权",
    "csp.expiredVal": "{price} · 高于行权价，期权到期作废",
    "csp.assignedVal": "{price} · 低于行权价，你以 ${strike} 买入了 100 股",
    "csp.res": "现金担保看跌", "csp.resStock": "改为直接买入股票",
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
