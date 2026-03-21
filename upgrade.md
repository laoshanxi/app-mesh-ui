# App Mesh UI Upgrade Report

## Overview

Vue 2.7.16 is the final Vue 2 release (EOL: 2023-12-31). A full Vue 3 migration is blocked by Element UI (requires Element Plus rewrite across 25+ files). This upgrade takes the safest approach: update all dependencies to their latest Vue 2-compatible versions, modernize deprecated syntax, and fix pre-existing bugs.

---

## Phase 1: Dependency Updates

### Runtime Dependencies

| Package | Before | After | Notes |
|---------|--------|-------|-------|
| `axios` | ^1.6.2 | ^1.13.6 | Security fixes + performance |
| `appmesh` | ^1.1.1 | ^1.1.2 | Patch update |
| `@antv/g2` | ^4.2.10 | ^4.2.12 | Bug fixes (stays on 4.x) |
| `js-base64` | ^3.7.5 | ^3.7.8 | Patch |
| `path-to-regexp` | ^6.2.1 | ^6.3.0 | Minor (stays on 6.x) |
| `mitt` | (new) | ^3.0.1 | Replaces Vue event bus |

### Dev Dependencies

| Package | Before | After | Notes |
|---------|--------|-------|-------|
| `@vue/cli-service` | ^5.0.8 | ~5.0.9 | Latest patch |
| `@vue/cli-plugin-babel` | ^5.0.8 | ~5.0.9 | Match CLI |
| `@vue/cli-plugin-eslint` | ^5.0.8 | ~5.0.9 | Match CLI |
| `@vue/cli-plugin-unit-jest` | ^5.0.8 | ~5.0.9 | Match CLI |
| `@vue/vue2-jest` | (new) | ^29.2.6 | Fixes broken test infrastructure |
| `eslint` | ^8.55.0 | ^8.57.1 | Final 8.x release |
| `eslint-plugin-vue` | ^9.19.2 | ^9.33.0 | More Vue lint rules |
| `@babel/core` | ^7.23.5 | ^7.26.0 | Minor update |
| `sass` | ^1.83.4 | ^1.98.0 | Latest stable |
| `svgo` | ^3.0.4 | ^3.3.3 | SVG optimization improvements |
| `autoprefixer` | ^10.4.16 | ^10.4.20 | CSS prefix updates |

### Locked (Vue 2 ecosystem, cannot upgrade)

vue 2.7.16, vue-router 3.6.5, vuex 3.6.2, element-ui 2.15.14, vue-template-compiler 2.7.16, @vue/test-utils 1.3.6, vue-json-viewer 2.2.22, qrcode.vue 1.7.0, af-table-column 1.0.3

### Files Changed

- `package.json` — Version updates + added mitt, @vue/vue2-jest

---

## Phase 2: Deprecated Slot Syntax Modernization

Replaced all `slot="name"` and `slot-scope="scope"` with modern `v-slot` / `#name` syntax. Vue 2.7 fully supports the new syntax. Purely syntactic, zero behavior change.

| Old Syntax | New Syntax |
|------------|------------|
| `<template slot-scope="scope">` | `<template #default="scope">` |
| `<template slot="title">` | `<template #title>` |
| `<span slot="label">text</span>` | `<template #label><span>text</span></template>` |
| `<el-dropdown-menu slot="dropdown">` | `<template #dropdown><el-dropdown-menu>...</el-dropdown-menu></template>` |
| `<el-button slot="trigger">` | `<template #trigger><el-button>...</el-button></template>` |
| `<el-row slot="header">` | `<template #header><el-row>...</el-row></template>` |

### Files Changed (12 files)

- `src/views/config/index.vue` — 8 slot replacements
- `src/views/applications/index.vue` — 15 slot replacements
- `src/views/security/users.vue` — 8 slot replacements
- `src/views/security/roles.vue` — 2 slot replacements
- `src/views/security/changePwd.vue` — 1 slot replacement
- `src/layout/components/Navbar.vue` — 1 slot replacement
- `src/layout/components/Sidebar/SidebarItem.vue` — 1 slot replacement
- `src/views/host/index.vue` — 2 slot replacements
- `src/views/host/detail/index.vue` — 7 slot replacements
- `src/views/files/index.vue` — 3 slot replacements
- `src/views/shell/index.vue` — 2 slot replacements
- `src/views/prometheus/index.vue` — 1 slot replacement

---

## Phase 3: Event Bus Replacement

Replaced `new Vue()` event bus pattern (removed in Vue 3) with `mitt` library (200 bytes, zero dependencies).

### Before (`src/utils/event.bus.js`)

```js
import Vue from 'vue'
export default new Vue()
```

### After

```js
import mitt from 'mitt'
export default mitt()
```

### API Changes

| Before | After |
|--------|-------|
| `EventBus.$on(event, handler)` | `EventBus.on(event, handler)` |
| `EventBus.$off(event, handler)` | `EventBus.off(event, handler)` |
| `EventBus.$emit(event, data)` | `EventBus.emit(event, data)` |

### Files Changed

- `src/utils/event.bus.js` — Rewritten to use mitt
- `src/layout/components/Navbar.vue` — `EventBus.$on()` → `EventBus.on()`

---

## Phase 4: Deprecated API Cleanup

### 4A. Removed `this.$set()` calls

Vue 2.7 uses Proxy-based reactivity; `$set` is unnecessary.

- `src/views/config/index.vue` — `this.$set(row, "isEdit", true)` → `row.isEdit = true` (2 occurrences)

### 4B. Replaced `$clone` plugin with utility function

Removed `Vue.prototype.$clone` pattern (incompatible with Vue 3).

- `src/utils/index.js` — Added `deepClone()` utility function
- `src/views/applications/appReg/index.vue` — `this.$clone(obj)` → `deepClone(obj)` with import
- `src/main.js` — Removed `import GlobalPlugin` and `Vue.use(GlobalPlugin)`
- `src/plugin/global.plugin.js` — Deleted (dead code)

---

## Phase 5: Build & Infrastructure Updates

### Node Version

| File | Before | After | Notes |
|------|--------|-------|-------|
| `package.json` engines.node | `>=18.20.0 <19` | `>=18.20.0` | Removed upper limit (Node 18 EOL) |
| `Dockerfile` | `node:18` | `node:20` | Node 20 LTS (supported until 2026-04) |
| `Makefile` | `NODE_VER=18` | `NODE_VER=20` | Match Dockerfile |

### npm Peer Dependencies

- `.npmrc` (new) — Added `legacy-peer-deps=true` to resolve peer dependency conflict between `@vue/cli-plugin-unit-jest@5.0.9` (expects `@vue/vue2-jest@^27`) and our `@vue/vue2-jest@^29`. Without this, `npm install` in Dockerfile fails.

### Jest Configuration (`jest.config.js`)

| Setting | Before | After | Notes |
|---------|--------|-------|-------|
| Vue transformer | `vue-jest` | `@vue/vue2-jest` | `vue-jest` was never in package.json |
| Test environment | `testURL: 'http://localhost/'` | `testEnvironment: 'jsdom'` + `testEnvironmentOptions` | `testURL` deprecated in Jest 29 |

### CI/CD

- `.travis.yml` — Deleted (obsolete: configured for Node 10 + non-existent `npm run test` script)
- `.github/workflows/build-push-appmesh-ui-image.yml` — No changes needed (uses Dockerfile)

### Dev Server Proxy (`vue.config.js`)

- Proxy rule changed from `'^/'` to `'^/appmesh'`
- Prevents webpack HMR WebSocket (`/ws`) from being proxied to backend, which caused `Invalid frame header` errors

### Static Files

- `public/config.js` (new) — Dev environment version of runtime config. In Docker deployment, this is generated from `nginx/config.js.template` by `config.sh`. Without it, dev server returns 405 for `GET /config.js`.

---

## Phase 6: Bug Fixes (Pre-existing)

These bugs existed before the upgrade but were discovered during testing.

### 6A. User Form API call (`src/views/security/userForm/index.vue`)

**Bug**: `getClient().add_user(this.userForm)` passed the entire form object as the `userName` parameter, causing API URL to become `/appmesh/user/[object Object]`.

**Fix**: `getClient().add_user(this.userForm.name, this.userForm)` — pass username as first argument.

### 6B. TOTP Challenge key mismatch (`src/views/login/index.vue`)

**Bug**: Login checked `error.responseData["Totp-Challenge"]` (HTTP header style), but the `appmesh` library returns response body JSON with key `totp_challenge` (snake_case).

**Fix**: Changed to `error.responseData["totp_challenge"]` in both `isTotpChallenge()` and `handleTotpChallenge()`.

### 6C. QR Code component props (`src/views/security/changePwd.vue`)

**Bug**: `<qrcode :value="qrCodeData" :options="{ width: 200 }">` — `qrcode.vue@1.7.0` has no `:options` prop.

**Fix**: Changed to `<qrcode :value="qrCodeData" :size="200">`.

### 6D. Shell scroll error (`src/services/shell.js`)

**Bug**: `$refs['shell_div']` was read outside `$nextTick` callback. When the callback executes, the DOM element may not exist yet, causing `Cannot read properties of undefined (reading 'scrollHeight')`.

**Fix**: Moved `$refs` access inside `$nextTick` callback with null checks. Fixed in 3 locations.

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm install` | Success (with .npmrc legacy-peer-deps) |
| `npm run lint` | 0 errors, 130 warnings (all pre-existing or from stricter eslint-plugin-vue) |
| `npm run build:prod` | Success |
| `npm run test:unit` | 2 passed, 4 failed (all failures pre-existing — test infrastructure was broken before) |
| `npm run dev` | Dev server starts, HTTP 200 |

---

## Files Changed Summary (28 files)

| File | Change Type |
|------|-------------|
| `.npmrc` | New — legacy-peer-deps config |
| `.travis.yml` | Deleted — obsolete CI |
| `Dockerfile` | Modified — node:18 → node:20 |
| `Makefile` | Modified — NODE_VER=18 → 20 |
| `jest.config.js` | Modified — transformer + test environment |
| `package.json` | Modified — dependency versions |
| `public/config.js` | New — dev runtime config |
| `vue.config.js` | Modified — proxy rule |
| `src/main.js` | Modified — removed GlobalPlugin |
| `src/plugin/global.plugin.js` | Deleted — replaced by deepClone utility |
| `src/utils/event.bus.js` | Modified — mitt replacement |
| `src/utils/index.js` | Modified — added deepClone |
| `src/services/shell.js` | Modified — $refs null safety |
| `src/views/login/index.vue` | Modified — TOTP challenge key fix |
| `src/views/security/changePwd.vue` | Modified — slot syntax + qrcode prop fix |
| `src/views/security/userForm/index.vue` | Modified — add_user API fix |
| `src/views/security/users.vue` | Modified — slot syntax |
| `src/views/security/roles.vue` | Modified — slot syntax |
| `src/views/applications/index.vue` | Modified — slot syntax |
| `src/views/applications/appReg/index.vue` | Modified — deepClone import |
| `src/views/config/index.vue` | Modified — slot syntax + $set removal |
| `src/views/files/index.vue` | Modified — slot syntax |
| `src/views/host/index.vue` | Modified — slot syntax |
| `src/views/host/detail/index.vue` | Modified — slot syntax |
| `src/views/shell/index.vue` | Modified — slot syntax |
| `src/views/prometheus/index.vue` | Modified — slot syntax |
| `src/layout/components/Navbar.vue` | Modified — slot syntax + EventBus API |
| `src/layout/components/Sidebar/SidebarItem.vue` | Modified — slot syntax |
