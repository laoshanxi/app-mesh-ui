import { getClient, getWorkflowToken } from '@/utils/appmeshClient'
import { ElMessage } from 'element-plus'

// "workflow" is the trigger app name; all engine ops go through the Task API — no workflow REST API.
const TRIGGER_APP = 'workflow'

// run_task wrapper for the Workflow engine. AUTH: the engine authenticates from a `token` field
// INSIDE the task payload (not the HTTP bearer) — the same Dex access token; daemon mints nothing.
// run_task may resolve to an object or a JSON string -> parse defensively.
function parse(raw) {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return { status: 'error', message: raw }
  }
}

// 200 + status:"error" = auth problem (bearer passed) — used to refresh the payload token and retry.
function isAuthError(res) {
  return res && res.status === 'error' && /token|auth|unauthor|expired|forbidden/i.test(res.message || '')
}

async function send(action, extra, timeout, token) {
  const raw = await getClient().run_task(TRIGGER_APP, { action, token, ...extra }, timeout)
  return parse(raw)
}

async function call(action, extra = {}, timeout = 60) {
  let token = await getWorkflowToken()
  let res = await send(action, extra, timeout, token)

  if (isAuthError(res)) {
    token = await getWorkflowToken()
    if (token) res = await send(action, extra, timeout, token)
  }

  if (!res || res.status === 'error') {
    throw new Error((res && res.message) || 'Workflow request failed')
  }
  return res // { status: 'ok', message?, data? }
}

export default {
  // ---- list / state-mutating-into-vueComp ----

  // workflow_list -> data: WorkflowListItem[]; writes vueComp.list, toggles listLoading.
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

  // workflow_get {workflow} -> data: raw YAML string.
  getWorkflow(vueComp, workflow) {
    return call('workflow_get', { workflow }).then(res => res.data)
  },

  // workflow_inputs -> data: map<inputKey, InputParam> (PascalCase keys; {} when none).
  getInputs(vueComp, workflow) {
    return call('workflow_inputs', { workflow }).then(res => res.data || {})
  },

  // runs {workflow} -> data: RunIndex[] (newest first).
  listRuns(vueComp, workflow) {
    return call('runs', { workflow }).then(res => res.data || [])
  },

  // run_detail -> data: RunRecord (has .jobs) or degraded RunIndex — branch on data.jobs.
  getRunDetail(vueComp, workflow, runId) {
    return call('run_detail', { workflow, run_id: runId }, 120).then(res => res.data)
  },

  // log -> data: full flow.log (throws "log not found" if absent).
  getLog(vueComp, workflow, runId) {
    return call('log', { workflow, run_id: runId }, 120).then(res => res.data)
  },

  // step_log -> data: step stdout (throws "step log not found" if empty).
  getStepLog(vueComp, workflow, runId, job, step) {
    return call('step_log', { workflow, run_id: runId, job, step }, 120).then(res => res.data)
  },

  // ---- mutations (RETURN the promise; caller toasts + refreshes) ----

  // workflow_add {workflow, content}; YAML `name:` must equal `workflow`.
  addWorkflow(vueComp, workflow, content) {
    return call('workflow_add', { workflow, content }).then(res => {
      ElMessage.success(res.message || 'workflow registered')
      return res
    })
  },

  // workflow_rm {workflow}.
  removeWorkflow(vueComp, workflow) {
    return call('workflow_rm', { workflow }).then(res => {
      ElMessage.success(res.message || 'workflow removed')
      return res
    })
  },

  // run {workflow, inputs} -> data: {run_id}; inputs values are strings (stringify first).
  run(vueComp, workflow, inputs) {
    return call('run', { workflow, inputs }, 60).then(res => {
      const id = res.data && res.data.run_id
      ElMessage.success(`Run started: ${id}`)
      return res
    })
  },

  // cancel {workflow, run_id}; works on RUNNING and PENDING runs.
  cancel(vueComp, workflow, runId) {
    return call('cancel', { workflow, run_id: runId }).then(res => {
      ElMessage.success(res.message || 'cancelled')
      return res
    })
  },

  // rerun -> data: {run_id} (NEW id, reuses inputs).
  rerun(vueComp, workflow, runId) {
    return call('rerun', { workflow, run_id: runId }, 60).then(res => {
      const id = res.data && res.data.run_id
      ElMessage.success(`Rerun started: ${id}`)
      return res
    })
  },
}
