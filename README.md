# AlphOpt-site

Site for **AlphOpt**, an options-education tool: real market events replayed as case studies, with the Greeks explained in plain English. Educational only; it does not give trade recommendations.

Live at <https://tianzesun.github.io/AlphOpt-site/>.

Plain HTML, CSS and JavaScript. No build step or dependencies.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

## Structure

```
index.html            Page markup (hero, how it works, case study library, replays, Greeks lab, features, FAQ, waitlist)
privacy.html          Privacy policy (English and Chinese)
terms.html            Terms of use (English and Chinese)
css/styles.css        All styles; design tokens at the top (:root)
js/i18n.js            English / Chinese text and the language switch
js/main.js            Replay data and engine, Black-Scholes pricing, and every interactive section
assets/favicon.svg    Logo mark
assets/og-image.png   1200x630 link-preview image
```

## Case studies

Every case study on the site comes from the `REPLAYS` array in `js/main.js`: the hero card, case study library, replays, How it works examples and Greeks lab.

- **Real data:** each replay holds a real news event and the stock's actual daily closes from Yahoo Finance, as traded at the time (before later splits). The "why" reasons come from that data too.
- **Model estimates:** option premiums and Greeks come from Black-Scholes (`blackScholes`) using the per-session `iv` values. These are assumptions, except SPY, which uses VIX closes. They are not recorded quotes.
- **Rules:** `runReplay` applies the same exit rules to every replay (`RULES`: +50% target, −35% stop, five sessions at most, checked at each close). Results, including losses, are computed rather than chosen.
- **Adding a replay:** add an entry with real closes around the event, then check the site's wording: the record line updates itself, but copy such as "three losses out of seven" does not.

The replays are labelled as hypothetical, historical examples everywhere: AlphOpt did not exist at the time, and no one was advised to make these trades.

## Languages (English / 中文)

The 中文 / EN button in the nav switches the whole page between English and Simplified Chinese without reloading. The choice is saved in `localStorage`; first-time visitors whose browser language is Chinese start in Chinese, and `?lang=zh` or `?lang=en` in the URL forces one.

- **Page text:** elements in `index.html` carry `data-i18n="key"` (or `data-i18n-html` for markup, `data-i18n-attr` for attributes). The English stays in the HTML; the Chinese is in `ZH_STATIC` in `js/i18n.js`.
- **Generated text:** strings built in `js/main.js` go through `t("key", vars)`, defined in `STRINGS.en` / `STRINGS.zh` in `js/i18n.js`.
- **Replays:** each entry in `REPLAYS` has a `zh` object (name, news, why, lesson). Translate it when adding a replay.
- **Legal pages:** `privacy.html` and `terms.html` hold both languages as `data-lang="en"` / `data-lang="zh"` blocks; only the current one is shown. Keep the two in step, and update the "Last updated" date.

## Customizing

- **Waitlist:** sign-ups go to Formspree. Set `FORMSPREE_ID` in `js/main.js` to your form ID.
- **Colours:** change `--brand`, `--brand-2`, etc. in `:root` in `css/styles.css`.
- **Preview image:** `assets/og-image.png` shows the headline only, with no results or returns. Keep it free of performance figures.

## Compliance rules for this site

AlphOpt is not registered with any securities regulator, so the site must stay educational:

- No trade recommendations, signals, alerts or "what to buy" wording, and nothing tailored to a visitor's situation.
- No paid plans or pricing.
- Hypothetical results stay next to their disclosures; no headline returns or profit totals in marketing copy or images.
- Waitlist sign-ups need the consent checkbox (CASL). The privacy policy must match what is actually collected.
- Legal pages contain a `[contact email]` placeholder that must be replaced before collecting sign-ups.

## Deploy

Any static host works (GitHub Pages, Netlify, Cloudflare Pages, S3). Serve the repository root.
