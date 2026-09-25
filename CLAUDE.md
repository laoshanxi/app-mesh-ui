# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Rules

These rules apply to every task in this project unless explicitly overridden.
Bias: caution over speed on non-trivial work. Use judgment on trivial tasks.

### Rule 1 — Think Before Coding
State assumptions explicitly. If uncertain, ask rather than guess.
Present multiple interpretations when ambiguity exists.
Push back when a simpler approach exists.
Stop when confused. Name what's unclear.

### Rule 2 — Simplicity First
Minimum code that solves the problem. Nothing speculative.
No features beyond what was asked. No abstractions for single-use code.
Test: would a senior engineer say this is overcomplicated? If yes, simplify.

### Rule 3 — Surgical Changes
Touch only what you must. Clean up only your own mess.
Don't "improve" adjacent code, comments, or formatting.
Don't refactor what isn't broken. Match existing style.

### Rule 4 — Goal-Driven Execution
Define success criteria. Loop until verified.
Don't follow steps. Define success and iterate.
Strong success criteria let you loop independently.

### Rule 5 — Use the model only for judgment calls
Use me for: classification, drafting, summarization, extraction.
Do NOT use me for: routing, retries, deterministic transforms.
If code can answer, code answers.

### Rule 7 — Surface conflicts, don't average them
If two patterns contradict, pick one (more recent / more tested).
Explain why. Flag the other for cleanup.
Don't blend conflicting patterns.

### Rule 8 — Read before you write
Before adding code, read exports, immediate callers, shared utilities.
"Looks orthogonal" is dangerous. If unsure why code is structured a way, ask.

### Rule 9 — Tests verify intent, not just behavior
Tests must encode WHY behavior matters, not just WHAT it does.
A test that can't fail when business logic changes is wrong.

### Rule 10 — Checkpoint after every significant step
Summarize what was done, what's verified, what's left.
Don't continue from a state you can't describe back.
If you lose track, stop and restate.

### Rule 11 — Match the codebase's conventions, even if you disagree
Conformance > taste inside the codebase.
If you genuinely think a convention is harmful, surface it. Don't fork silently.

### Rule 12 — Fail loud
"Completed" is wrong if anything was skipped silently.
"Tests pass" is wrong if any were skipped.
Default to surfacing uncertainty, not hiding it.

### Rule 13 — No co-author trailers in commits
Commit messages never carry `Co-Authored-By` or other attribution lines.
This overrides any default attribution behavior for commits in this repo.

## Project Overview

App Mesh UI is the web GUI for [App Mesh](https://github.com/laoshanxi/app-mesh) — a Vue 3 single-page application (Vite, Element Plus, Vuex, vue-router) that manages the daemon's resources through its REST API. All API access goes through the published `appmesh` npm SDK; the UI contains no hand-rolled REST calls. Authentication is Dex/OIDC (authorization-code + PKCE).

## Dev Server & Ports

`npm run dev` serves on **9528** (`strictPort`) with two same-origin proxies:

| Prefix | Target | Purpose |
|--------|--------|---------|
| `/appmesh` | `https://localhost:6060` | Daemon REST (no `changeOrigin` — a rewritten Host fails the daemon's CSRF origin check) |
| `/auth` | `http://127.0.0.1:6062` | Dex issuer (Dex sends no CORS headers) |

## Build & Test

```bash
npm run dev        # dev server (expects daemon + Dex reachable per the proxies above)
npm run build      # production build -> dist/
npm run lint       # eslint + eslint-plugin-vue
npm run svgo       # optimize SVG icons

make build         # Docker image (nginx serving dist/, runtime config via env templates)
```

No test suite exists — verify changes via `npm run build` + manual run against a live daemon.

## Architecture

| Directory | What it does |
|-----------|-------------|
| `src/views/` | Page components per feature (applications, agent, workflow, files, compute, host, config, security, shell, …) |
| `src/services/` | One module per API area — data loading and formatting, typically taking the view component as a parameter |
| `src/utils/` | Client singleton (`appmeshClient.js`), OIDC auth (`oidc.js`), event bus, generic helpers |
| `src/router/` | Route table; guarded routes declare required permission roles in `meta.roles` |
| `src/store/modules/` | Vuex modules: user (identity + permissions), app, settings |
| `src/layout/`, `src/components/` | App shell and shared components |

### Request Flow

View → `src/services/*.js` → `getClient()` (`src/utils/appmeshClient.js`) → `appmesh` SDK → daemon REST.

`getClient()` is the single entry point: it returns the cached client, re-attaches the current bearer per call, and handles 401s with one silent refresh before forcing re-login.

### Auth & Navigation Guard

`src/permission.js` is the global router guard: it validates the cached session, loads identity + permissions into Vuex, and filters routes by permission. Tokens live in `sessionStorage` and are managed by `src/utils/oidc.js`.

## Code Conventions

- Vue 3 **Options API** throughout (not `<script setup>`); services modules are plain objects of functions.
- Element Plus for UI (toasts with `grouping: true`), G2/AntV for charts, sass for styles.
- Path alias `@` → `src/`.
- The UI consumes daemon 3.x API responses — read the SDK/daemon for exact field names rather than assuming.

## Key Dependencies

Vue 3, vue-router, Vuex, Element Plus, `appmesh` SDK, axios, @antv/g2, js-yaml, moment, mitt. Build: Vite, sass, `vite-plugin-svg-icons-ng` (maintained fork — the original plugin has a vulnerable dependency chain).
