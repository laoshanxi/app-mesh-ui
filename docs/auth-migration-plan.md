# Auth Migration Plan — Dex OIDC + Principal RBAC

Date: 2026-08-30. Target: adapt this GUI to backend commits `e3fd6c72 (oidc-dex)`
and `054b794f (AUTH_ROLE)` in the `app-mesh` repository (branch `feature/dex`).

## 1. Backend changes that break the GUI

The daemon removed the legacy local auth stack and moved to Dex-only OIDC:

- Removed endpoints: `POST /appmesh/login`, `POST /appmesh/auth`,
  `POST /appmesh/self/logoff`, `POST /appmesh/token/renew`, all `/appmesh/totp/*`,
  all `/appmesh/user*` management endpoints, cookie auth, `BasicAuth`/`BearerAuth`
  schemes.
- New endpoints (OpenAPI 3.0.0):
  - `GET /appmesh/auth/config` — public; returns
    `{issuer, resource, audience, public_client_id, scopes, flows, first_admin_enrollment}`.
    `flows` is `["authorization_code_pkce","device_code"]`, plus `"password"` in
    builtin auth mode.
  - `GET /appmesh/principal/self` — verified `Principal`
    (`principal_id, kind, issuer, subject, display_name, email, connector_id, status,
    execution_user, roles, permissions`).
  - `GET /appmesh/principal/self/permissions` — effective permission strings.
  - `GET /appmesh/principals` — map `principal_id → Principal` (needs `principal-list`).
  - `POST/DELETE /appmesh/principal/{principal_id}` — overlay update
    (body keys `status, execution_user, roles`) / tombstone (204)
    (need `principal-set` / `principal-delete`).
  - `GET /appmesh/roles`, `POST/DELETE /appmesh/role/{role}` (body = array of
    permission strings), `GET /appmesh/permissions`.
  - `POST /appmesh/auth/enroll-first-admin` — loopback-only; a remote browser
    cannot call it. Show guidance only.
- JS SDK `appmesh` 1.x → 3.0.0 (published on npm): removed `login`, `logout`,
  `validate_totp`, user CRUD, TOTP helpers, `TotpRequiredError`; keeps aliases
  `get_current_user`, `get_user_permissions`; adds `get_auth_config`,
  `get_current_principal`, `list_principals`, `update_principal`,
  `delete_principal`, `set_bearer_token` (in-memory bearer only; no cookies).
- Dex (issuer `http://127.0.0.1:6062/auth`) is proxied to the public surface only
  through the Go Agent on the issuer path `/auth/*`. The static browser client
  `appmesh-web` (public, PKCE) has redirect URI `<surface>/oauth/callback`.
  Nothing serves `/oauth/callback` server-side — the SPA must own that route.
- Error shape: every error body is `{"message": string}`. 401 = token
  missing/expired (refresh or re-login); 403 = valid token, lacking permission
  (do NOT log out); 503 = auth service unreachable (retry).
- Password grant (builtin mode): `POST {issuer}/token`,
  `grant_type=password`, Basic `client_id:""`, scope must include
  `audience:server:client_id:appmesh-api`. Dex local identities are full emails
  (e.g. `admin@appmesh.local`).
- Cluster (AUTH_ROLE): forwarded requests (`X-Target-Host`) carry the same bearer;
  anonymous forwarding is limited to `GET /appmesh/auth/config` and
  `GET /.well-known/oauth-protected-resource`; `authorization.yaml` is node-local,
  so permissions can differ per node; HTTP `X-Target-Host` works through the Go
  Agent only.

## 2. GUI changes

### A. Auth layer (new `src/utils/oidc.js`)
- Fetch and cache `/appmesh/auth/config`.
- Browser-reachable auth base = same-origin issuer path
  (`window.location.origin + new URL(issuer).pathname`), served by nginx → Agent → Dex.
- Password grant login when `flows` contains `"password"`.
- Authorization-code + PKCE redirect flow (client `appmesh-web`) otherwise.
- Token store in `sessionStorage` (`access_token`, `refresh_token`, `expires_at`);
  restore and refresh on boot; refresh on 401 once; clear on logout.
- Feed access token to the SDK via `set_bearer_token()`.

### B. Login page (`src/views/login/index.vue`)
- Drop TOTP UI, `TotpRequiredError` import, dead `Totp/TotpChallenge/Audience` fields.
- Email + password form (password grant); redirect to Dex authorize URL when
  password grant is not advertised.
- New callback view (`src/views/login/callback.vue`) + `/oauth/callback` route.

### C. User store (`src/store/modules/user.js`)
- `login` → OIDC password grant, then principal/permissions fetch.
- `getInfo` → `get_current_principal` (use `display_name`; no avatar claim).
- `logout` → clear tokens + local session (optional Dex `end_session_endpoint`).

### D. Client wiring (`src/utils/appmeshClient.js`, `src/services/workflow.js`)
- Remove `captureWorkflowToken()` (`POST /appmesh/token/renew` no longer exists);
  task payload token = current OIDC access token.
- `onError`: 401 → one silent refresh + retry, then re-login; 403/503 → message only.

### E. Security views
- `users.vue` + `userForm/` → replaced by a Principal page: list overlays, edit
  `status/execution_user/roles`, tombstone (with 403-on-owned-apps handling).
- `changePwd.vue` deleted (password/MFA are IdP operations); Security menu default
  redirect updated.
- `roles.vue` / `permissions/` kept; permission picker restricted to
  `GET /appmesh/permissions`; `appmesh-admin` cannot be deleted (backend enforces).
- Route guards: `user-list` → `principal-list`; action buttons gated by
  `principal-set` / `principal-delete`; roles pages keep `role-view` / `role-set`.

### F. Deployment (`nginx/default.conf.template`)
- Port split: 6060 is the web's appmesh service (`/appmesh/` →
  `APP_MESH_API_URL`); Dex traffic goes to the authentication service itself
  (`/auth/` → `APP_MESH_AUTH_URL`, default `http://127.0.0.1:6062`). The
  same-origin `/auth/` proxy is required because Dex sends no CORS headers and
  an https page cannot call an http issuer (mixed content). No WSS (6058)
  anywhere in the web client.
- `/oauth/callback` → SPA route (`try_files`).

### G. Cleanup
- Delete `mock/` (dead, still serves the old `/user/login` model) and `mockjs` dep.
- Drop `HttpStatus.PRECONDITION_REQUIRED` (428 TOTP challenge) usage.

## 3. Open items
- Verify PKCE flow end-to-end against a live stack (nginx `/auth/` proxy chain).
- The OAuth redirect/popup flow requires Dex's registered `web_callback`
  (auth-stack.yaml) to equal `<UI origin>/oauth/callback` — e.g.
  `http://localhost:9528/oauth/callback` for local dev.
- Login page offers both modes: password form (builtin mode only, advertised by
  `flows`) and "Login with provider" (authorization code + PKCE in a popup
  window, same-tab redirect fallback; the popup relays the code via postMessage
  and the opener completes the exchange).
- Dex login page branding is hardcoded in the dex.yaml template:
  `frontend.issuer: App Mesh` and `frontend.logoURL: https://127.0.0.1:6060/logo.svg`
  (keep the logo URL in sync with web_callback's origin; the web UI serves
  /logo.svg from its public assets). The tab favicon remains Dex's (hardcoded
  in Dex templates; only a full `frontend.dir` override could change it).
- First-admin enrollment must run on the owner host (CLI); GUI shows guidance when
  `first_admin_enrollment.available` is true.

## 4. Test plan
- `npm install`, `npm run lint`, `npm run build` must pass.
- Runtime: full stack (daemon + Dex + Agent + nginx) → login as
  `admin@appmesh.local`, verify principals page, roles page, workflow actions,
  token refresh after `expires_in`, logout.

## 5. Verification results (2026-08-30)
Verified against the live local stack (daemon :6060, Dex :6062):
- `GET /appmesh/auth/config` — fields match `oidc.js` (`public_client_id` is
  `appmesh-cli`; `flows` includes `password` in builtin mode; scopes include
  the audience scope).
- Refresh grant (`grant_type=refresh_token`, `client_id` in form body) works;
  `expires_in=899`; Dex keeps the same refresh token inside `reuseInterval`.
- Bearer accepted by `/appmesh/principal/self`, `/principal/self/permissions`,
  `/principals`, `/roles`, `/permissions` — response shapes match the new views
  (`display_name`, `principal_id`, roles array, role→permissions map).
- `computePrincipalId` (sha256 of issuer + NUL + subject) matches a live
  principal id — the overlay "New" form computes the correct key.
- Vite dev: `/oauth/callback` serves the SPA, `/appmesh` and `/auth` proxies
  reach the daemon and Dex.
- `npm run lint` (0 new warnings) and `npm run build` pass.

Not yet verified in a real browser: the interactive password login (form →
store → principal load), the PKCE redirect round-trip, and the workflow
payload token inside the app. The Docker image build (`make build`) was not
run.
