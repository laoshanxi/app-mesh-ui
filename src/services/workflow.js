import { getClient, getWorkflowToken, captureWorkflowToken } from '@/utils/appmeshClient'
import { ElMessage } from 'element-plus'

// "workflow" is the trigger app name (WORKFLOW_TRIGGER_APP). All Workflow engine
// operations are driven through the App Mesh Task API; there is NO workflow REST API.
const TRIGGER_APP = 'workflow'

/**
 * Centralized run_task wrapper for the Workflow engine.
 *
 * AUTH: the Workflow engine authenticates the caller from a `token` field INSIDE the
 * task payload (task_handler.go authenticate(): empty token -> "token required"), NOT
 * from the HTTP auth cookie. The cookie only authenticates the run_task call to the
 * daemon; the daemon forwards the payload to the engine unchanged (it does not inject a
 * token). The session JWT is in an HttpOnly cookie JS cannot read, so we attach the JWT
 * captured at login (see appmeshClient.captureWorkflowToken) — exactly as the Python/CLI
 * samples do via `_get_access_token()`.
 *
 * run_task may resolve to either an object or a JSON string -> parse defensively.
 * On status === 'error', throw new Error(message); getClient().onError shows the
 * toast and handles 401 on the rejected promise.
 *
 * @param {string} action  - one of the documented engine actions
 * @param {object} [extra]  - additional payload fields (workflow, run_id, job, step, inputs, content)
 * @param {number} [timeout] - task timeout in seconds
 * @returns {Promise<{status:string, message?:string, data?:*}>}
 */
// run_task may resolve to an object or a JSON string -> parse defensively.
function parse(raw) {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return { status: 'error', message: raw }
  }
}

// The engine returns a 200 body with status:"error" for auth problems (the daemon-level
// cookie auth already passed). Detect those so we can refresh the payload token and retry.
function isAuthError(res) {
  return res && res.status === 'error' && /token|auth|unauthor|expired|forbidden/i.test(res.message || '')
}

async function send(action, extra, timeout, token) {
  const raw = await getClient().run_task(TRIGGER_APP, { action, token, ...extra }, timeout)
  return parse(raw)
}

async function call(action, extra = {}, timeout = 60) {
  // The engine authenticates from a `token` in the payload (not the HTTP cookie). The token is
  // captured at login; on a restored session / reload it's null, and a cached token can expire.
  let token = getWorkflowToken() || (await captureWorkflowToken())
  let res = await send(action, extra, timeout, token)

  // One re-capture + retry on an auth error (expired / restored-session token).
  if (isAuthError(res)) {
    token = await captureWorkflowToken()
    if (token) res = await send(action, extra, timeout, token)
  }

  if (!res || res.status === 'error') {
    throw new Error((res && res.message) || 'Workflow request failed')
  }
  return res // { status: 'ok', message?, data? }
}

export default {
  // ---- list / state-mutating-into-vueComp ----

  // workflow_list {} -> data: WorkflowListItem[] (always an array)
  // Writes vueComp.list, toggles vueComp.listLoading. No return value relied upon.
  listWorkflows(vueComp) {
    vueComp.listLoading = true
    call('workflow_list', {}).then(
      res => {
        vueComp.list = res.data || []
        vueComp.listLoading = false
      },
      () => {
        vueComp.listLoading = false // onError already showed the toast
      }
    )
  },

  // ---- fetch-on-demand (RETURN the promise; caller places data) ----

  // workflow_get {workflow} -> data: string (raw YAML). Returns Promise<string>.
  getWorkflow(vueComp, workflow) {
    return call('workflow_get', { workflow }).then(res => res.data)
  },

  // workflow_inputs {workflow} -> data: map<inputKey, InputParam> ({} when none).
  // NOTE: InputParam keys are PascalCase (Type/Required/Default/Description).
  // Returns Promise<object> (the map).
  getInputs(vueComp, workflow) {
    return call('workflow_inputs', { workflow }).then(res => res.data || {})
  },

  // runs {workflow} -> data: RunIndex[] (newest first; runs[0] = latest; always an array).
  // Returns Promise<RunIndex[]>.
  listRuns(vueComp, workflow) {
    return call('runs', { workflow }).then(res => res.data || [])
  },

  // run_detail {workflow, run_id} -> data: RunRecord (has .jobs) OR degraded RunIndex (no .jobs).
  // Polymorphic: caller must branch on presence of data.jobs. Returns Promise<object>.
  getRunDetail(vueComp, workflow, runId) {
    // longer timeout: detail can be large for big runs
    return call('run_detail', { workflow, run_id: runId }, 120).then(res => res.data)
  },

  // log {workflow, run_id} -> data: string (full flow.log). Throws "log not found" if absent.
  // Returns Promise<string>.
  getLog(vueComp, workflow, runId) {
    return call('log', { workflow, run_id: runId }, 120).then(res => res.data)
  },

  // step_log {workflow, run_id, job, step} -> data: string (step stdout).
  // Throws "step log not found" if empty/missing. Returns Promise<string>.
  getStepLog(vueComp, workflow, runId, job, step) {
    return call('step_log', { workflow, run_id: runId, job, step }, 120).then(res => res.data)
  },

  // ---- mutations (RETURN the promise; caller toasts + refreshes) ----

  // workflow_add {workflow, content} -> message "workflow registered" (no data).
  // content must parse and its YAML `name:` must equal `workflow`.
  // Returns Promise<{status,message}>.
  addWorkflow(vueComp, workflow, content) {
    return call('workflow_add', { workflow, content }).then(res => {
      ElMessage.success(res.message || 'workflow registered')
      return res
    })
  },

  // workflow_rm {workflow} -> message "workflow removed" (no data).
  // Returns Promise<{status,message}>.
  removeWorkflow(vueComp, workflow) {
    return call('workflow_rm', { workflow }).then(res => {
      ElMessage.success(res.message || 'workflow removed')
      return res
    })
  },

  // run {workflow, inputs} -> message "running"|"pending"; data: { run_id }.
  // inputs is map<string,string> (stringify number/boolean before sending).
  // Returns Promise<{status,message,data:{run_id}}>.
  run(vueComp, workflow, inputs) {
    return call('run', { workflow, inputs }, 60).then(res => {
      const id = res.data && res.data.run_id
      ElMessage.success(`Run ${res.message || 'started'}: ${id}`)
      return res
    })
  },

  // cancel {workflow, run_id} -> message "cancelled" (no data).
  // Only works on RUNNING runs; pending/queued cannot be cancelled by id (engine errors).
  // Returns Promise<{status,message}>.
  cancel(vueComp, workflow, runId) {
    return call('cancel', { workflow, run_id: runId }).then(res => {
      ElMessage.success(res.message || 'cancelled')
      return res
    })
  },

  // rerun {workflow, run_id} -> message "running"|"pending"; data: { run_id } (NEW id, reuses inputs).
  // Returns Promise<{status,message,data:{run_id}}>.
  rerun(vueComp, workflow, runId) {
    return call('rerun', { workflow, run_id: runId }, 60).then(res => {
      const id = res.data && res.data.run_id
      ElMessage.success(`Rerun ${res.message || 'started'}: ${id}`)
      return res
    })
  },
}
