# AlphOpt-site

Marketing / showcase site for **AlphOpt**, an app that turns AI-detected market signals into clear, explainable stock and options ideas.

Plain HTML, CSS and JavaScript. No build step or dependencies.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly in a browser also works.

## Structure

```
index.html          Page markup (hero, how it works, signal board, features, pricing, FAQ, waitlist)
css/styles.css      All styles; design tokens at the top (:root)
js/main.js          Signal data, board filtering/sorting, signal detail modal, pricing toggle, waitlist form
assets/favicon.svg  Logo mark
```

## Customizing

- **Signals:** edit the `SIGNALS` array at the top of `js/main.js`. All current signals are sample data. Swap this for a fetch from the real AlphOpt API when it's ready.
- **Waitlist:** set `WAITLIST_ENDPOINT` in `js/main.js` to a backend URL that accepts `POST {"email": "..."}`. Until then, the form only shows a confirmation and stores nothing.
- **Pricing:** plan amounts live in the `data-monthly` / `data-yearly` attributes in `index.html`.
- **Colours:** change `--brand`, `--brand-2`, etc. in `:root` in `css/styles.css`.

## Deploy

Any static host works (GitHub Pages, Netlify, Cloudflare Pages, S3). Serve the repository root.
