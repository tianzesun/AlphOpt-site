# AlphOpt-site

Marketing / showcase site for **AlphOpt**, an app that turns AI-detected market signals into clear, explainable options signals, with the Greeks in plain English.

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
index.html            Page markup (hero, how it works, signal board, replays, Greeks lab, features, pricing, FAQ, waitlist)
css/styles.css        All styles; design tokens at the top (:root)
js/main.js            Replay data and engine, Black-Scholes pricing, and every interactive section
assets/favicon.svg    Logo mark
assets/og-image.png   1200x630 link-preview image
```

## Signal replays

Every signal on the site comes from the `REPLAYS` array in `js/main.js`: the hero card, ticker strip, signal board, replays, How it works examples and Greeks lab.

- **Real data:** each replay holds a real news event and the stock's actual daily closes from Yahoo Finance, as traded at the time (before later splits). The "why" reasons come from that data too.
- **Model estimates:** option premiums and Greeks come from Black-Scholes (`blackScholes`) using the per-session `iv` values. These are assumptions, except SPY, which uses VIX closes. They are not recorded quotes.
- **Rules:** `runReplay` applies the same exit rules to every replay (`RULES`: +50% target, −35% stop, five sessions at most, checked at each close). Results, including losses, are computed rather than chosen.
- **Adding a replay:** add an entry with real closes around the event, then check the site's wording: the record line updates itself, but copy such as "three losses out of seven" does not.

The replays are labelled as replays everywhere: AlphOpt had not launched and did not publish these signals.

## Customizing

- **Waitlist:** sign-ups go to Formspree. Set `FORMSPREE_ID` in `js/main.js` to your form ID.
- **Pricing:** plan amounts live in the `data-monthly` / `data-yearly` attributes in `index.html`.
- **Colours:** change `--brand`, `--brand-2`, etc. in `:root` in `css/styles.css`.
- **Preview image:** `assets/og-image.png` shows the CRWD replay and the record. Regenerate it if those change.

## Deploy

Any static host works (GitHub Pages, Netlify, Cloudflare Pages, S3). Serve the repository root.
