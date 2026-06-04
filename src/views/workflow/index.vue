<template>
  <div class="app-container">
    <el-row style="color: #909399">
      <h4>Workflows</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button type="primary" :icon="Plus" @click="btnClick('add')">
          Add
        </el-button>
        <el-button type="danger" :icon="Delete" :disabled="!isSelected" @click="removeWorkflow(currentRow)">
          Delete
        </el-button>
      </el-button-group>
    </el-row>
    <el-row>
      <el-table
        ref="wfTable" :key="tableKey" v-loading="listLoading" :data="list" element-loading-text="Loading" border
        style="width: 100%" height="100%" class="fix-table" :fit="true" highlight-current-row
        @current-change="currentRowChange"
      >
        <el-table-column label="Name" width="240" show-overflow-tooltip>
          <template #default="scope">
            <el-link underline="always" @click="openViewYaml(scope.row)">
              {{ scope.row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Owner" width="130">
          <template #default="scope">
            {{ formatEmpty(scope.row.owner) }}
          </template>
        </el-table-column>
        <el-table-column label="Last Run" width="110">
          <template #default="scope">
            <el-tag v-if="scope.row.last_run_status" :type="statusTagType(scope.row.last_run_status)">
              {{ scope.row.last_run_status }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Last Run At" min-width="180">
          <template #default="scope">
            <el-link
              v-if="scope.row.last_run_at" underline="always" title="Monitor latest run"
              @click="openMonitor(scope.row)"
            >
              {{ formatToLocalIso(scope.row.last_run_at) }}
            </el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="190" align="center">
          <template #default="scope">
            <el-tooltip content="View YAML" placement="top">
              <el-button size="small" :icon="Document" circle @click="openViewYaml(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Run" placement="top">
              <el-button size="small" type="success" :icon="VideoPlay" circle @click="openRun(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Runs" placement="top">
              <el-button size="small" type="warning" :icon="List" circle @click="openRuns(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Monitor latest run" placement="top">
              <el-button size="small" type="primary" :icon="Monitor" circle @click="openMonitor(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <!-- Add workflow (YAML editor) -->
    <el-drawer v-model="isShowAdd" size="50%">
      <template #header><span>Add Workflow</span></template>
      <textarea v-model="addContent" class="yaml-box" placeholder="Paste workflow YAML here"></textarea>
      <template #footer>
        <el-button @click="loadAgentExample">
          Load LLM Agent example
        </el-button>
        <el-button @click="isShowAdd = false">
          Cancel
        </el-button>
        <el-button type="primary" :loading="addLoading" @click="submitAdd">
          Save
        </el-button>
      </template>
    </el-drawer>

    <!-- View YAML (read-only) -->
    <el-drawer v-model="isShowYaml" size="50%">
      <template #header>
        <span><el-icon><Document /></el-icon>&nbsp;&nbsp;{{ yamlName }}</span>
      </template>
      <div v-loading="yamlLoading" class="yaml-wrap">
        <textarea v-model="yamlContent" class="yaml-box" readonly></textarea>
      </div>
    </el-drawer>

    <!-- Run inputs dialog -->
    <el-dialog v-model="isShowRun" :title="`Run — ${runName}`" width="520px">
      <el-form v-loading="inputsLoading" label-width="140px">
        <el-form-item
          v-for="(param, key) in inputsSpec" :key="key" :label="key"
          :required="param.Required === true"
        >
          <el-switch v-if="param.Type === 'boolean'" v-model="inputsForm[key]" />
          <el-input-number v-else-if="param.Type === 'number'" v-model="inputsForm[key]" />
          <el-input v-else v-model="inputsForm[key]" :placeholder="param.Description || ''" />
          <div v-if="param.Description" class="input-desc">
            {{ param.Description }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isShowRun = false">
          Cancel
        </el-button>
        <el-button type="success" :loading="runLoading" @click="submitRun">
          Run
        </el-button>
      </template>
    </el-dialog>

    <!-- Runs history + run detail -->
    <el-drawer v-model="isShowRuns" size="50%" destroy-on-close @close="closeRuns">
      <template #header>
        <span><el-icon><List /></el-icon>&nbsp;&nbsp;Runs — {{ runsName }}</span>
      </template>
      <div class="detail-card">
        <el-row>
          <el-button size="small" :icon="Refresh" @click="refreshRuns">
            Refresh
          </el-button>
        </el-row>
        <el-table v-loading="runsLoading" :data="runs" border style="width: 100%">
          <el-table-column label="Run ID" min-width="150">
            <template #default="scope">
              <el-link underline="always" @click="openRunDetail(scope.row)">
                {{ scope.row.run_id }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="Status" width="100">
            <template #default="scope">
              <el-tag :type="statusTagType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Started At" min-width="160">
            <template #default="scope">
              {{ scope.row.started_at ? formatToLocalIso(scope.row.started_at) : "-" }}
            </template>
          </el-table-column>
          <el-table-column label="Duration" width="90">
            <template #default="scope">
              {{ scope.row.duration ? `${Math.round(scope.row.duration)}s` : "-" }}
            </template>
          </el-table-column>
        </el-table>

        <!-- Run detail (nested) — delegated to the self-contained RunDetail component -->
        <el-drawer v-model="isShowDetail" size="50%" append-to-body destroy-on-close>
          <template #header>
            <span>Run {{ detailRunId }}</span>
          </template>
          <div class="detail-card">
            <run-detail
              v-if="isShowDetail && detailRunId" :workflow="runsName" :run-id="detailRunId"
              @changed="refreshRuns"
            />
          </div>
        </el-drawer>
      </div>
    </el-drawer>

    <!-- Monitor: live detail of the latest run -->
    <el-drawer v-model="isShowMonitor" size="50%" append-to-body destroy-on-close>
      <template #header>
        <span><el-icon><monitor /></el-icon>&nbsp;&nbsp;Monitor — {{ monitorName }}</span>
      </template>
      <div v-loading="monitorLoading" class="detail-card">
        <run-detail
          v-if="isShowMonitor && monitorRunId" :workflow="monitorName" :run-id="monitorRunId"
          @rerun="onMonitorRerun"
        />
        <el-empty v-else-if="!monitorLoading" description="No runs yet — trigger a Run first" />
      </div>
    </el-drawer>
  </div>
</template>

<script>
import yaml from "js-yaml";
import { ElMessage, ElMessageBox } from "element-plus";
import { markRaw } from "vue";
import {
  Plus, Delete, Document, VideoPlay, List, Refresh, Monitor
} from "@element-plus/icons-vue";
import workflow from "@/services/workflow";
import { formatEmpty, formatToLocalIso } from "@/utils";
import RunDetail from "./RunDetail.vue";

export default {
  components: { Document, List, Monitor, RunDetail },
  data() {
    return {
      Plus: markRaw(Plus), Delete: markRaw(Delete), Document: markRaw(Document),
      VideoPlay: markRaw(VideoPlay), List: markRaw(List), Refresh: markRaw(Refresh),
      Monitor: markRaw(Monitor),
      tableKey: 0,
      list: null,
      listLoading: true,
      currentRow: null,
      isSelected: false,
      // add
      isShowAdd: false,
      addContent: "",
      addLoading: false,
      // view yaml
      isShowYaml: false,
      yamlName: "",
      yamlContent: "",
      yamlLoading: false,
      // run
      isShowRun: false,
      runName: "",
      inputsSpec: {},
      inputsForm: {},
      inputsLoading: false,
      runLoading: false,
      // runs
      isShowRuns: false,
      runsName: "",
      runs: [],
      runsLoading: false,
      // run detail
      isShowDetail: false,
      detailRunId: "",
      // monitor latest run (live)
      isShowMonitor: false,
      monitorName: "",
      monitorRunId: "",
      monitorLoading: false
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    formatEmpty,
    formatToLocalIso,
    fetchData() {
      workflow.listWorkflows(this);
    },
    statusTagType(status) {
      switch (status) {
        case "success": return "success";
        case "failure": return "danger";
        case "running": return "primary";
        case "cancelled": return "warning";
        case "skipped": return "info";
        case "pending": return "info";
        default: return "info";
      }
    },
    currentRowChange(row) {
      this.currentRow = row;
      this.isSelected = !!row;
    },
    btnClick(action) {
      switch (action) {
        case "add":
          this.addContent = "name: my-workflow\njobs:\n  build:\n    steps:\n      - name: hello\n        command: echo hello\n";
          this.isShowAdd = true;
          return;
        case "viewYaml":
          this.openViewYaml(this.currentRow);
          return;
        case "run":
          this.openRun(this.currentRow);
          return;
        case "runs":
          this.openRuns(this.currentRow);
          return;
        case "remove":
          this.removeWorkflow(this.currentRow);
          return;
      }
    },

    // ---- Monitor (open the latest run's live detail) ----
    openMonitor(row) {
      if (!row) return;
      this.monitorName = row.name;
      this.monitorRunId = "";
      this.monitorLoading = true;
      this.isShowMonitor = true;
      workflow.listRuns(this, row.name).then(runs => {
        const list = runs || [];
        // prefer the active run; otherwise the newest by started_at (order isn't guaranteed).
        // started_at may be an epoch number or an ISO string -> parse numerically either way.
        const ts = v => {
          const n = Number(v);
          return Number.isFinite(n) && v ? n : (Date.parse(v) || 0);
        };
        const active = list.find(r => r.status === "running" || r.status === "pending");
        const newest = list.slice().sort((a, b) => ts(b.started_at) - ts(a.started_at))[0];
        const pick = active || newest;
        this.monitorRunId = pick ? pick.run_id : "";
        this.monitorLoading = false;
      }).catch(() => {
        this.monitorLoading = false;
      });
    },

    // rerun from inside the Monitor drawer created a new run -> follow it
    onMonitorRerun(newRunId) {
      if (newRunId) this.monitorRunId = newRunId;
    },

    // ---- Add ----
    // Fill the editor with a runnable Scenario-A (batch/DAG) example that drives llm-agent.
    // Scenario B (interactive/streaming) is NOT a DAG concept, so there is no DAG form of it.
    // The session is created on first use keyed by ${{ workflow.run_id }} (the agent does
    // get-or-create), so the author never manages a session id.
    loadAgentExample() {
      this.addContent = [
        "name: llm-agent-demo",
        "# Scenario A (batch): a DAG `message` step calls the shared llm-agent App.",
        "# The agent session is created automatically per run (session_id = the run id) —",
        "# there is no session id to open or pass in.",
        "on:",
        "  manual:",
        "    inputs:",
        "      q:",
        "        type: string",
        "        default: \"hello\"",
        "jobs:",
        "  chat:",
        "    steps:",
        "      - name: ask",
        "        message:",
        "          app: llm-agent              # the shared Scenario-A App",
        "          payload: '{\"action\":\"session_send\",\"session_id\":\"${{ workflow.run_id }}\",\"input\":\"${{ inputs.q }}\"}'",
        ""
      ].join("\n");
      this.isShowAdd = true;
      ElMessage.info("This example creates its agent session automatically per run — just set q and run it.");
    },
    submitAdd() {
      let name;
      try {
        const doc = yaml.load(this.addContent);
        name = doc && doc.name;
      } catch {
        name = null;
      }
      if (!name) {
        ElMessageBox.alert("Workflow YAML must contain a top-level 'name:' field.", "Invalid YAML", { type: "error" });
        return;
      }
      this.addLoading = true;
      workflow.addWorkflow(this, name, this.addContent).then(() => {
        this.addLoading = false;
        this.isShowAdd = false;
        this.fetchData();
      }, (e) => {
        this.addLoading = false;
        // Surface the engine's reason instead of failing silently (was: swallowed).
        ElMessage.error("Save failed: " + ((e && e.message) || "unknown error"));
      });
    },

    // ---- View YAML ----
    openViewYaml(row) {
      if (!row) return;
      this.yamlName = row.name;
      this.yamlContent = "";
      this.yamlLoading = true;
      this.isShowYaml = true;
      workflow.getWorkflow(this, row.name).then(content => {
        this.yamlContent = content || "";
        this.yamlLoading = false;
      }, () => {
        this.yamlLoading = false;
      });
    },

    // ---- Run ----
    openRun(row) {
      if (!row) return;
      this.runName = row.name;
      this.inputsSpec = {};
      this.inputsForm = {};
      this.inputsLoading = true;
      workflow.getInputs(this, row.name).then(spec => {
        this.inputsLoading = false;
        const keys = Object.keys(spec || {});
        if (keys.length === 0) {
          ElMessageBox.confirm(`Run workflow <${row.name}>?`, "Run", {
            confirmButtonText: "Run", cancelButtonText: "Cancel", type: "info"
          }).then(() => {
            this.doRun(row.name, {});
          }).catch(() => {});
          return;
        }
        this.inputsSpec = spec;
        const form = {};
        keys.forEach(k => {
          const p = spec[k];
          if (p.Type === "boolean") form[k] = p.Default === true || p.Default === "true";
          else if (p.Type === "number") form[k] = p.Default !== undefined ? Number(p.Default) : 0;
          else form[k] = p.Default !== undefined ? String(p.Default) : "";
        });
        this.inputsForm = form;
        this.isShowRun = true;
      }, () => {
        this.inputsLoading = false;
      });
    },
    submitRun() {
      const inputs = {};
      Object.keys(this.inputsForm).forEach(k => {
        inputs[k] = String(this.inputsForm[k]);
      });
      this.runLoading = true;
      this.doRun(this.runName, inputs).finally(() => {
        this.runLoading = false;
        this.isShowRun = false;
      });
    },
    doRun(name, inputs) {
      return workflow.run(this, name, inputs).then(() => {
        this.fetchData();
      }, () => {});
    },

    // ---- Remove ----
    removeWorkflow(row) {
      if (!row) return;
      ElMessageBox.confirm(`Do you want to remove the workflow <${row.name}>?`, "Tooltip", {
        confirmButtonText: "Confirm", cancelButtonText: "Cancel", type: "warning"
      }).then(() => {
        workflow.removeWorkflow(this, row.name).then(() => {
          this.fetchData();
        }, () => {});
      }).catch(() => {});
    },

    // ---- Runs ----
    openRuns(row) {
      if (!row) return;
      this.runsName = row.name;
      this.runs = [];
      this.isShowRuns = true;
      this.refreshRuns();
    },
    // reset the nested run-detail so it unmounts (stops its polling) when Runs closes
    closeRuns() {
      this.isShowDetail = false;
      this.detailRunId = "";
    },
    refreshRuns() {
      this.runsLoading = true;
      workflow.listRuns(this, this.runsName).then(runs => {
        this.runs = runs || [];
        this.runsLoading = false;
      }, () => {
        this.runsLoading = false;
      });
    },

    // ---- Run detail ----
    // The single-run detail (jobs/steps, flow log, step stdout, cancel/rerun)
    // is rendered by the self-contained RunDetail component.
    openRunDetail(row) {
      this.detailRunId = row.run_id;
      this.isShowDetail = true;
    }
  }
};
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 8px;
}

/* keep table links (Name, Run ID) on one line; the cell handles ellipsis */
:deep(.el-table .el-link) {
  white-space: nowrap;
}

/* Flex-fill: app-main is a flex column, so this page flexes to fill the
   content area; the table row then flexes to fill what's left below the
   title/toolbar. No pixel heights -> can't overflow or leave a bottom gap. */
.app-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.app-container > .el-row:last-child {
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 0;
}

:deep(.fix-table) {
  height: 100% !important;
}

.detail-card {
  height: 100%;
  overflow-y: auto;
}

.input-desc {
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

/* Native textarea for the YAML editor/viewer: full width, fills the drawer height,
   clean monospace box. Scoped works here because the textarea is our own element
   (it carries the scope id and travels with the drawer's teleport). */
.yaml-wrap {
  width: 100%;
  height: 100%;
}

.yaml-box {
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border: 1px solid #1b2948;
  border-radius: 6px;
  background-color: #001528;
  color: #bfcbd9;
  font-family: "Menlo", "Monaco", "Consolas", monospace;
  font-size: 13px;
  line-height: 1.7;
  tab-size: 2;
  white-space: pre;
  resize: none;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35);
}

.yaml-box::placeholder {
  color: #5a6b7a;
}

.yaml-box:focus {
  border-color: #409eff;
}
</style>
