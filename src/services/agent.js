import { getClient } from '@/utils/appmeshClient'
import { ElMessage, ElMessageBox } from 'element-plus'

/**
 * LLM Agent service (UI ↔ the llm-agent App).
 *
 * AUTH: the daemon authorizes `run_task` via the logged-in session's RBAC; the agent
 * reads no token from the payload, so none is sent. Worker access is further gated by
 * the worker App's owner-permission.
 *
 * Covers Scenario A (batch chat against the shared `llm-agent` App) and provisioning +
 * driving Scenario B (interactive streaming) worker Apps. The agent's model/provider is
 * chosen via env (Anthropic / Bedrock / Vertex / a gateway) — see providerEnv / GATEWAY_PRESETS.
 */

// llm-agent Scenario-A App naming convention + metadata tag (see app-mesh llm-agent README).
const AGENT_METADATA_TYPE = 'llm-agent-system'
const SESSION_WORKER_MARK = '-sess-'

// Names that hold secrets — never written to plain `env` (only sec_env). The regex also
// catches custom secret-ish names a user might type into Advanced env. AWS_ACCESS_KEY_ID is
// deliberately NOT secret (it is an identifier, like a username), so it lives in env.
const SECRET_ENV_NAMES = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'AWS_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN']
function isSecretEnvName(name) {
  return SECRET_ENV_NAMES.includes(name) || /(SECRET|TOKEN|PASSWORD|CREDENTIAL|API_KEY|PRIVATE_KEY)/i.test(name)
}

// Non-secret provider env carried from a Scenario-A template to its session workers,
// so an interactive worker talks to the same model/provider as its template. Secrets
// are NOT here (the daemon strips encrypted sec_env from responses) — they are re-entered.
// AWS_ACCESS_KEY_ID is here (non-secret id) so static-key Bedrock workers get it; only the
// secret key is re-entered per worker.
const WORKER_INHERIT_ENV = [
  'LLMAGENT_PROVIDER', 'LLMAGENT_MODEL', 'ANTHROPIC_BASE_URL',
  'CLAUDE_CODE_USE_BEDROCK', 'AWS_REGION', 'AWS_ACCESS_KEY_ID',
  'CLAUDE_CODE_USE_VERTEX', 'CLOUD_ML_REGION', 'ANTHROPIC_VERTEX_PROJECT_ID'
]

// Convenience presets for the `gateway` provider — providers that ship a native
// Anthropic-compatible endpoint, so no separate translating proxy is needed. `aliases`
// map Claude Code's model slots (used by quick/subagent calls) onto the provider's models
// so those calls don't fall back to a Claude id the endpoint won't serve. Endpoints/models
// per the providers' own Claude Code docs (DeepSeek api-docs; Alibaba Model Studio); all
// fields stay editable after a preset fills them. The credential is always entered by hand.
const GATEWAY_PRESETS = [
  { key: 'custom', label: 'Custom', baseUrl: '', model: '', aliases: null },
  {
    key: 'deepseek', label: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/anthropic', model: 'deepseek-v4-pro[1m]',
    aliases: {
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'deepseek-v4-pro[1m]',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'deepseek-v4-pro[1m]',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'deepseek-v4-flash',
      CLAUDE_CODE_SUBAGENT_MODEL: 'deepseek-v4-flash'
    }
  },
  {
    key: 'qwen-bj-payg', label: 'Qwen — Beijing (Pay-as-you-go)',
    baseUrl: 'https://dashscope.aliyuncs.com/apps/anthropic', model: 'qwen3.7-max',
    aliases: {
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'qwen3.7-max',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'qwen3.7-max',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'qwen3.6-flash',
      CLAUDE_CODE_SUBAGENT_MODEL: 'qwen3.6-flash'
    }
  },
  {
    key: 'qwen-bj-token', label: 'Qwen — Beijing (Token Plan, Team Edition)',
    baseUrl: 'https://token-plan.cn-beijing.maas.aliyuncs.com/apps/anthropic', model: 'qwen3.7-max',
    aliases: {
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'qwen3.7-max',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'qwen3.7-max',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'qwen3.6-flash',
      CLAUDE_CODE_SUBAGENT_MODEL: 'qwen3.6-flash'
    }
  },
  {
    key: 'glm', label: 'GLM — Zhipu (open.bigmodel.cn)',
    baseUrl: 'https://open.bigmodel.cn/api/anthropic', model: 'glm-5.2[1m]',
    aliases: {
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'glm-5.2[1m]',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'glm-5.2[1m]',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'glm-4.5-air',
      CLAUDE_CODE_SUBAGENT_MODEL: 'glm-4.5-air',
      CLAUDE_CODE_AUTO_COMPACT_WINDOW: '1000000' // GLM-5.2 1M context (needs the [1m] suffix)
    }
  },
  {
    key: 'minimax', label: 'MiniMax — China (api.minimaxi.com)',
    baseUrl: 'https://api.minimaxi.com/anthropic', model: 'MiniMax-M3[1m]',
    aliases: {
      ANTHROPIC_DEFAULT_OPUS_MODEL: 'MiniMax-M3[1m]',
      ANTHROPIC_DEFAULT_SONNET_MODEL: 'MiniMax-M3[1m]',
      ANTHROPIC_DEFAULT_HAIKU_MODEL: 'MiniMax-M3[1m]',
      CLAUDE_CODE_SUBAGENT_MODEL: 'MiniMax-M3[1m]',
      CLAUDE_CODE_AUTO_COMPACT_WINDOW: '1000000' // M3 has a 1M context window
    }
  }
]

// Env keys any preset manages — the union of all presets' alias keys. Applying a preset
// replaces exactly these (so switching presets is clean); user-added Advanced env is kept.
const PRESET_MANAGED_KEYS = [...new Set(
  GATEWAY_PRESETS.flatMap(p => (p.aliases ? Object.keys(p.aliases) : []))
)]

function parseMaybeJson(raw) {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return { status: 'error', message: raw }
  }
}

// metadata may arrive as an object or a JSON string -> normalize to an object.
function appMetadata(app) {
  const m = app && app.metadata
  if (!m) return {}
  if (typeof m === 'string') {
    try { return JSON.parse(m) } catch { return {} }
  }
  return typeof m === 'object' ? m : {}
}

// A Scenario-A agent App: tagged metadata, or named `llm-agent`,
// excluding per-session worker Apps (`*-sess-*`, Scenario B).
function isAgentApp(app) {
  const name = app && app.name
  if (!name) return false
  if (name.includes(SESSION_WORKER_MARK)) return false
  if (appMetadata(app).type === AGENT_METADATA_TYPE) return true
  return name === 'llm-agent' || name.startsWith('llm-agent-')
}

// Any llm-agent-related App, including session workers — for the Management list.
function isAgentRelated(app) {
  const name = app && app.name
  if (!name) return false
  if (appMetadata(app).type === AGENT_METADATA_TYPE) return true
  return name === 'llm-agent' || name.startsWith('llm-agent-')
}

// The engine returns a 200 body with status:"error" for auth problems (the daemon-level
// cookie auth already passed). Detect those so we can refresh the payload token and retry.
// run_task against an agent App. The daemon authorizes the call (RBAC via the logged-in
// session); llm-agent reads no token from the payload, so none is sent.
async function call(appName, payload, timeout = 120) {
  const res = parseMaybeJson(await getClient().run_task(appName, payload, timeout))
  if (!res || res.status === 'error') {
    throw new Error((res && res.message) || 'Agent request failed')
  }
  return res // { status: 'ok', data?: ... }
}

export default {
  // ---- gateway presets (admin register form) ----

  // Named gateway providers that ship a native Anthropic-compatible endpoint.
  gatewayPresets() { return GATEWAY_PRESETS },

  // Apply a preset to the guided form in place: fill baseUrl/model and replace the
  // preset-managed Advanced env entries, preserving any user-added ones. Fields the user
  // has already edited (`edited.baseUrl` / `edited.model`) are left untouched — defaults
  // only fill what the user hasn't typed. 'custom' just drops the managed entries.
  applyGatewayPreset(form, key, edited = {}) {
    const p = GATEWAY_PRESETS.find(x => x.key === key)
    if (!p) return
    const kept = (form.extraEnv || []).filter(e => !PRESET_MANAGED_KEYS.includes(e.name))
    if (!p.aliases) {
      // 'custom': no managed aliases. Clear preset-filled (un-edited) baseUrl/model so no
      // stale value from a previously selected preset lingers; keep anything the user typed.
      form.extraEnv = kept
      if (!edited.baseUrl) form.baseUrl = ''
      if (!edited.model) form.model = ''
      return
    }
    if (!edited.baseUrl) form.baseUrl = p.baseUrl
    if (!edited.model) form.model = p.model
    const added = Object.entries(p.aliases).map(([name, value]) => ({ name, value }))
    form.extraEnv = [...added, ...kept]
  },

  // Drop all preset-managed env entries (model-slot aliases, compact window) from extraEnv —
  // used when leaving the gateway provider so they don't pollute a Claude/Bedrock/Vertex App.
  stripPresetEnv(extraEnv) {
    return (extraEnv || []).filter(e => !PRESET_MANAGED_KEYS.includes(e.name))
  },

  // Default model id suggested when a provider is picked (gateway models come from presets).
  defaultModelFor(provider) {
    return {
      anthropic: 'claude-opus-4-8',
      bedrock: 'anthropic.claude-opus-4-8',
      vertex: 'claude-opus-4-8'
    }[provider] || ''
  },

  // ---- chat (Scenario A) ----

  // List Scenario-A agent Apps for the chat target dropdown. Writes vueComp.agents and
  // defaults vueComp.selectedAgent. Returns the promise so callers can chain (e.g. to
  // default a separate `template` field).
  listChatAgents(vueComp) {
    vueComp.agentsLoading = true
    return getClient().list_apps().then(
      data => {
        vueComp.agents = (data || []).filter(isAgentApp)
        vueComp.agentsLoading = false
        if (!vueComp.selectedAgent && vueComp.agents.length) {
          const def = vueComp.agents.find(a => a.name === 'llm-agent')
          vueComp.selectedAgent = def ? def.name : vueComp.agents[0].name
        }
        return vueComp.agents
      },
      () => { vueComp.agentsLoading = false; return [] }
    )
  },

  // session_send -> data: { answer, iterations, turn_tokens }. The session id is
  // caller-chosen (genSessionId); an unknown id is get-or-created on first use.
  sendMessage(appName, sessionId, input, limits = {}) {
    const payload = { action: 'session_send', session_id: sessionId, input }
    if (limits.max_iterations) payload.max_iterations = parseInt(limits.max_iterations, 10)
    return call(appName, payload).then(res => res.data || {})
  },

  // session_close -> best-effort; never throws so cleanup paths stay quiet.
  closeSession(appName, sessionId) {
    return call(appName, { action: 'session_close', session_id: sessionId }).catch(() => {})
  },

  // ---- management ----

  // List all llm-agent-related Apps (Scenario-A Apps + session workers). Writes vueComp.list.
  listAgentApps(vueComp) {
    vueComp.listLoading = true
    getClient().list_apps().then(
      data => {
        vueComp.list = (data || []).filter(isAgentRelated)
        vueComp.listLoading = false
      },
      () => { vueComp.listLoading = false }
    )
  },

  enableApp(vueComp, name) {
    return getClient().enable_app(name).then(() => {
      ElMessage.success(`Agent <${name}> enabled.`)
      this.listAgentApps(vueComp)
    }, () => {})
  },

  disableApp(vueComp, name) {
    return getClient().disable_app(name).then(() => {
      ElMessage.success(`Agent <${name}> disabled.`)
      this.listAgentApps(vueComp)
    }, () => {})
  },

  removeApp(vueComp, name) {
    return ElMessageBox.confirm(`Remove agent App <${name}>?`, 'Tooltip', {
      confirmButtonText: 'Confirm', cancelButtonText: 'Cancel', type: 'warning'
    }).then(() => getClient().delete_app(name).then(() => {
      ElMessage.success(`Agent <${name}> removed.`)
      this.listAgentApps(vueComp)
    }, () => {})).catch(() => {})
  },

  // Load an agent App's stdout (from the start, up to 256 KB) for the Management drawer.
  // Writes vueComp.output.
  loadOutput(vueComp, name) {
    return getClient().get_app_output(name, 0, 0, 262144).then(
      out => { vueComp.output = (out && out.output) || '' },
      () => { vueComp.output = '' }
    )
  },

  // ---- admin: register a Scenario-A agent App ----

  // Map the guided form to the env Claude Code reads to pick a model/provider, split into
  // regular `env` (config) and `secEnv` (credentials). Secrets ALWAYS go to secEnv so the
  // daemon stores them encrypted — never to env, logs, or responses. The Claude Agent SDK
  // inherits the App's process env and passes it through to the bundled Claude Code CLI.
  //
  // Claude Code has no native OpenAI/Gemini support: non-Anthropic models must go through
  // an Anthropic-Messages-API-compatible gateway (the `gateway` provider) — base URL +
  // auth token, with the gateway's own model name in LLMAGENT_MODEL.
  providerEnv(form) {
    const env = { LLMAGENT_PROVIDER: form.provider || 'anthropic' }
    const secEnv = {}
    if (form.model) env.LLMAGENT_MODEL = form.model
    switch (form.provider) {
      case 'bedrock':
        env.CLAUDE_CODE_USE_BEDROCK = '1'
        if (form.awsRegion) env.AWS_REGION = form.awsRegion
        // Access key id is an identifier, not a secret → env, so workers inherit it
        // (only the secret key is re-entered per worker). The secret stays in sec_env.
        if (form.awsAccessKeyId) env.AWS_ACCESS_KEY_ID = form.awsAccessKeyId
        if (form.awsSecretAccessKey) secEnv.AWS_SECRET_ACCESS_KEY = form.awsSecretAccessKey
        break
      case 'vertex':
        env.CLAUDE_CODE_USE_VERTEX = '1'
        if (form.vertexRegion) env.CLOUD_ML_REGION = form.vertexRegion
        if (form.vertexProject) env.ANTHROPIC_VERTEX_PROJECT_ID = form.vertexProject
        break
      case 'gateway':
        if (form.baseUrl) env.ANTHROPIC_BASE_URL = form.baseUrl
        if (form.authToken) secEnv.ANTHROPIC_AUTH_TOKEN = form.authToken
        break
      case 'anthropic':
      default:
        if (form.baseUrl) env.ANTHROPIC_BASE_URL = form.baseUrl
        if (form.apiKey) secEnv.ANTHROPIC_API_KEY = form.apiKey
        break
    }
    return { env, secEnv }
  },

  // Build the App definition from the guided form. Credentials go into `sec_env`
  // (a NAME->value map) so the daemon stores them encrypted; they are NEVER placed in
  // `env`, logged, or echoed back (the daemon strips encrypted sec_env from responses).
  buildAgentApp(form) {
    const { env, secEnv } = this.providerEnv(form)
    env.LLMAGENT_WORKSPACE_DIR = form.workspaceDir || './llm-agent-workspace'
    // Escape hatch for provider knobs not in the guided form (e.g. ANTHROPIC_DEFAULT_*_MODEL,
    // GOOGLE_APPLICATION_CREDENTIALS). Guarded: a secret-looking name is dropped (never leaks
    // to plaintext env — use the credential fields), and guided/provider keys win over it.
    ;(form.extraEnv || []).forEach(e => {
      if (e && e.name && !isSecretEnvName(e.name) && !(e.name in env)) env[e.name] = e.value
    })

    const app = {
      name: form.name,
      description: form.description || 'llm-agent — Claude Agent SDK handler',
      command: form.command || 'python3 -m llm_agent --server 127.0.0.1:6059',
      working_dir: form.workingDir,
      status: 1,
      behavior: { exit: 'restart' },
      metadata: { type: AGENT_METADATA_TYPE },
      env
    }
    if (Object.keys(secEnv).length) app.sec_env = secEnv
    return app
  },

  // Register (or update) a Scenario-A agent App via add_app. Returns Promise.
  registerAgentApp(vueComp, form) {
    const app = this.buildAgentApp(form)
    return getClient().add_app(app.name, app).then(() => {
      ElMessage.success(`Agent <${app.name}> registered.`)
      this.listAgentApps(vueComp)
    }, () => {})
  },

  // ---- Scenario B: interactive streaming session worker ----

  // env may come back as a NAME->value map or an array of {name,value} -> normalize to a map.
  envToMap(env) {
    if (!env) return {}
    if (Array.isArray(env)) {
      const m = {}
      env.forEach(e => { if (e && e.name != null) m[e.name] = e.value })
      return m
    }
    return typeof env === 'object' ? { ...env } : {}
  },

  // App-name-safe, short, unique-enough session id.
  genSessionId() {
    const rnd = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 8)
      : Math.floor(Math.random() * 1e9).toString(36)
    return 's' + Date.now().toString(36) + rnd.slice(0, 6)
  },

  // Pick the sec_env var name for a worker's re-entered credential, by the template's
  // provider. Bedrock needs two keys but a worker re-enters only one — we store the secret
  // key and rely on AWS_ACCESS_KEY_ID coming from the worker's env/instance role; Vertex
  // uses ADC (no static secret). For those, prefer instance-role/ADC over static keys.
  workerSecretEnv(tEnv, secret) {
    switch (tEnv.LLMAGENT_PROVIDER) {
      case 'gateway': return { ANTHROPIC_AUTH_TOKEN: secret }
      case 'bedrock': return { AWS_SECRET_ACCESS_KEY: secret }
      case 'vertex': return {} // ADC-based; no static secret to re-enter
      default: return { ANTHROPIC_API_KEY: secret }
    }
  },

  // Build a Scenario-B worker App by cloning deploy params from a Scenario-A template App.
  // Provider config (non-secret) is carried over from the template; secrets are NOT in the
  // template (the daemon strips encrypted sec_env), so each worker re-enters its credential
  // via sec_env (encrypted), routed to the right var by the template's provider.
  buildWorkerApp(templateApp, sid, owner, secret) {
    const tEnv = this.envToMap(templateApp.env)
    const workspace = tEnv.LLMAGENT_WORKSPACE_DIR || './llm-agent-workspace'
    const name = `${templateApp.name}-sess-${sid}`

    const env = {
      LLMAGENT_WORKSPACE_DIR: workspace,
      LLMAGENT_SESSION_IDLE_MINUTES: '30',
      LLMAGENT_SESSION_MAX_HOURS: '8'
    }
    // Carry the provider config + any gateway model-slot aliases (so a worker's subagent/
    // quick calls hit the same provider model, not a Claude id the endpoint won't serve).
    ;[...WORKER_INHERIT_ENV, ...PRESET_MANAGED_KEYS].forEach(k => { if (tEnv[k] != null) env[k] = tEnv[k] })

    const app = {
      name,
      description: `llm-agent interactive worker (session=${sid})`,
      command: `python3 -m llm_agent --session-worker --session-id=${sid} --server=127.0.0.1:6059`,
      working_dir: templateApp.working_dir,
      owner, // session owner — the daemon's owner-permission gates access
      status: 1,
      permission: 11, // owner(+admin) only
      stdout_cache_num: 1000, // let polling catch up to recent tokens
      behavior: { exit: 'remove' }, // worker exit -> daemon removes the App
      metadata: { type: AGENT_METADATA_TYPE },
      env
    }
    const secEnv = secret ? this.workerSecretEnv(tEnv, secret) : {}
    if (Object.keys(secEnv).length) app.sec_env = secEnv
    return { app, name, sid }
  },

  // Best-effort wait until a just-created worker App is running (has a pid / is healthy),
  // so the first session_send doesn't race worker startup. Never throws; returns ready?.
  async waitWorkerReady(name, timeoutMs = 6000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      try {
        const app = await getClient().get_app(name)
        if (app && (app.pid || app.health === 0)) return true
      } catch { /* not visible yet */ }
      await new Promise(r => setTimeout(r, 400))
    }
    return false
  },

  // Create a worker: fetch the Scenario-A template, clone, add_app, wait for readiness.
  // Returns the built descriptor.
  async createWorker(templateName, owner, apiKey) {
    const template = await getClient().get_app(templateName)
    const built = this.buildWorkerApp(template, this.genSessionId(), owner, apiKey)
    await getClient().add_app(built.name, built.app)
    await this.waitWorkerReady(built.name)
    return built // { app, name, sid }
  },

  // One stdout poll from `position`. Returns { text, position, exitCode }.
  // 64 KB per read (vs the SDK's 10 KB default) so a fast token burst isn't chunked thin.
  async pollOutput(worker, position) {
    const out = await getClient().get_app_output(worker, position, 0, 65536)
    return {
      text: out.output || '',
      position: out.outPosition != null ? out.outPosition : position,
      exitCode: out.exitCode
    }
  },

  // Run one interactive turn: stream the worker's STDOUT into onToken (browsers can't TCP
  // subscribe, so we poll get_app_output advancing `position`) while run_task drives the turn.
  // Returns { meta, position }. Throws if the turn errors (e.g. worker gone -> 404).
  async sendInteractive(worker, sid, input, onToken, startPos = 0) {
    let pos = startPos
    let done = false
    const turn = call(worker, { action: 'session_send', session_id: sid, input, stream: true }, 300)
    turn.catch(() => {}).finally(() => { done = true })

    while (!done) {
      try {
        const r = await this.pollOutput(worker, pos)
        if (r.text) onToken(r.text)
        pos = r.position
      } catch { /* transient poll error; the turn promise governs completion */ }
      await new Promise(res => setTimeout(res, 250))
    }
    // Final drain: keep reading until the position stops advancing, so a large
    // end-of-turn burst isn't truncated by get_app_output's per-read size cap.
    try {
      for (let i = 0; i < 100; i++) {
        const r = await this.pollOutput(worker, pos)
        if (!r.text || r.position === pos) break
        onToken(r.text)
        pos = r.position
      }
    } catch { /* ignore */ }

    const res = await turn // throws on turn error
    return { meta: (res && res.data) || {}, position: pos }
  },

  // Close a session: session_close makes the worker exit -> exit:remove deletes the App.
  // Best-effort; never throws (used on explicit close, agent switch, and page unload).
  closeWorker(worker, sid) {
    return call(worker, { action: 'session_close', session_id: sid }, 30).catch(() => {})
  }
}
