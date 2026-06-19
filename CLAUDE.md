# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A React SPA that runs a 35-question Ayurveda Prakriti (dosha) quiz, scores it into Vata/Pitta/Kapha, and renders a personalized lifestyle guide. The frontend is deployed as a static site to GitHub Pages (`https://RAJASREE-GORREPATI.github.io/prakriti_project/`); all quiz/lifestyle content is static JSON, with no backend involved.

The one exception is the **AI Coach** chat feature, which needs a live LLM call and therefore has its own small Cloudflare Worker backend (`worker/`) — see the dedicated section below. Everything else in the app remains backend-free.

This is two independent npm projects in one repo: the root (Vite/React frontend) and `worker/` (Cloudflare Worker). They are deployed separately and have separate `package.json`/`node_modules`.

## Commands

### Frontend (repo root)
```
npm run dev       # start Vite dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # eslint .
npm run deploy    # build + publish dist/ to gh-pages (runs predeploy build automatically)
```

### AI Coach Worker (`worker/`)
```
cd worker
npm install
npm run dev       # wrangler dev — local Worker on http://127.0.0.1:8787
npm run deploy    # wrangler deploy — publishes to the live Worker URL
wrangler secret put ANTHROPIC_API_KEY   # one-time / on rotation; never commit the key
```
For local Worker testing, create `worker/.dev.vars` with `ANTHROPIC_API_KEY=...` (gitignored, never commit). There is no test suite configured anywhere in this repo.

## Architecture

**Navigation is a single state machine, not a router.** `App.jsx` holds `page` (`'intro' | 'quiz' | 'results' | 'guide' | 'coach'`) and `prevPage` in `useState`, and every screen is conditionally rendered inline. The Coach page returns to whichever page it was opened from via `prevPage`. There is no `react-router` — adding routes means adding to this switch, not new route files.

**Scoring flow:** `Quiz.jsx` accumulates `{ dosha, score }` per question into a `scores = { vata, pitta, kapha }` totals object, then calls `onComplete(scores)` which bubbles up to `App.jsx` and is passed down to `Results`, `LifestyleGuide`, and `Coach`. `doshaUtils.js#calculatePrakriti(scores)` is the single source of truth for turning raw totals into a constitution:
- Converts to percentages.
- If top and bottom dosha are within 10 points → `tridoshic`.
- Else if top two doshas are within 15 points → `dual` (e.g. `vata-pitta`), with `dominant`/`dual` set.
- Else → `single`, dominant only.

Any component that needs the dosha result calls `calculatePrakriti(scores)` itself rather than receiving a derived prop — `Results.jsx`, `LifestyleGuide.jsx`, and `Coach.jsx` all do this independently. `scores` can be all-zero (user opened Coach without taking the quiz) — `calculatePrakriti` returns `null` in that case, and callers must handle it.

**Content is entirely data-driven from `src/data/*.json`** (questions, dosha profiles, dincharya, ritucharya, diet, exercise). Components are thin renderers keyed by `dominant` dosha — e.g. `LifestyleGuide/*Tab.jsx` components each just index into their respective JSON by dosha name. When changing copy/content, edit the JSON, not the component. When changing structure, the JSON shape and every consumer of that file must change together — there are now **three** independent consumers of this data: the `*Tab.jsx` components, `utils/generatePDF.js`, and `worker/src/doshaContext.js` (see below). Check `project_writeup.md` section 2 for the documented shape of each file before reorganizing it.

**PDF export (`utils/generatePDF.js`) is hand-built with jsPDF primitives**, not a DOM screenshot (html2canvas was deliberately rejected — see `project_writeup.md` Iteration 5). It re-imports the same JSON data the lifestyle guide components use and lays out text/sections manually with manual page-break checks (`checkPage`). If you change the shape of `dincharya.json`, `diet_recommendations.json`, `exercise_recommendations.json`, or `ritucharya.json`, update the relevant `*Tab.jsx`, `generatePDF.js`, **and** `worker/src/doshaContext.js` — none of them share rendering/extraction logic.

**Dosha color tokens** (`DOSHA_COLORS`, `DOSHA_BG`, `DOSHA_BORDER`) are centralized in `doshaUtils.js` and reused across components and the PDF generator (as RGB triples) instead of a Tailwind theme/design system — keep new dosha-colored UI consistent with these rather than inventing new hex values inline.

**Styling is Tailwind v4** via `@tailwindcss/vite` — no `tailwind.config.js`, no `@tailwind` directives. Colors are mostly arbitrary-value hex literals inline (e.g. `bg-[#faf7f2]`) rather than theme tokens, matching the existing earthy palette (cream background, terracotta `#c0704a` accent, sage green, muted blue).

**Vite `base` is set to `/prakriti_project/`** in `vite.config.js` for GitHub Pages — required for asset paths to resolve correctly once deployed under that subpath. This must stay in sync with the `homepage` field in `package.json` and with the repo name on GitHub — if either the GitHub repo or the GH Pages account is renamed, all three (`vite.config.js` `base`, `package.json` `homepage`, and the Worker's `ALLOWED_ORIGINS` in `worker/src/index.js`) need to be updated together.

### AI Coach (Cloudflare Worker backend)

`Coach.jsx` is a chat UI, not a static page. It computes `prakriti` from `scores` (same pattern as above) and calls `askCoach({ messages, prakriti })` from `src/utils/coachApi.js` — the frontend **never** calls the Anthropic API directly; `coachApi.js` is the only thing that talks to the Worker, and `COACH_API_URL` inside it is the deployed Worker URL.

The Worker (`worker/src/index.js`):
- Restricts CORS to the GH Pages origin + `localhost:5173`, validates the request body, and caps chat history to the last 20 messages.
- Builds the system prompt via `worker/src/doshaContext.js#buildDoshaContext()`, which imports the same `src/data/*.json` files the frontend uses (relative import — single source of truth) but **extracts only the user's dominant dosha's branch** from each file (plus a dual-dosha blurb and a tridoshic-aware note when relevant), instead of sending the full ~75KB knowledge base on every request. `dosha_questions.json` (quiz-only) is never read by the Worker.
- The system prompt explicitly states the user's Prakriti result and percentages as given facts and instructs the model never to ask the user what their dosha is or whether they've taken the assessment — this was a real bug (the model would re-ask despite having the data) and the fix lives entirely in the prompt text in `doshaContext.js`.
- Calls `claude-haiku-4-5` via `@anthropic-ai/sdk` — chosen deliberately over a larger model because the Worker endpoint is public (anyone with the URL can call it), so cost/abuse exposure was treated as a real constraint. No `thinking` or `effort` params are sent (both error on Haiku 4.5).
- `max_tokens: 4096`; the prompt also instructs the model to keep multi-day plans concise (3-4 lines/day) and self-paginate very long answers rather than getting cut off — if it's still truncated, the Worker appends a "response continues" note rather than returning a silently-truncated reply.
- The Claude API key is a Cloudflare secret (`ANTHROPIC_API_KEY`, set via `wrangler secret put`) — it is never in source control, never in `wrangler.toml`, and never shipped in the frontend bundle. This was the core reason the Worker exists at all rather than calling Claude from the browser.
- Requires `compatibility_flags = ["nodejs_compat"]` in `wrangler.toml` — the Anthropic SDK needs Node's `fs`/`path` shims under Workers.

Replies render via `react-markdown` + `remark-gfm` in `Coach.jsx` (`markdownComponents`), with Tailwind-styled overrides (including tables) matching the rest of the app's palette — when touching reply rendering, keep new element overrides consistent with the existing earthy-palette classes rather than introducing a typography plugin.

`worker/.wrangler` and `worker/node_modules` are excluded from both `.gitignore` and `eslint.config.js`'s `globalIgnores` — Wrangler's local dev bundle output was previously getting picked up by `eslint .` and needs to stay excluded.
