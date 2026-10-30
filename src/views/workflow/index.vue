<template>
  <div class="app-container">
    <div class="page-title">
      Workflows
      <el-tooltip
        v-if="forwarding" content="Workflows are stored per node — this list shows the registry on the forwarded node. Turn off 'Forward to host' to switch." placement="right"
      >
        <el-tag size="small" type="warning" effect="plain" class="node-tag">node: {{ forwarding }}</el-tag>
      </el-tooltip>
    </div>
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
    <el-row class="fill-row">
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
            {{ formatEmpty(scope.row.owner_display_name || scope.row.owner) }}
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
            <el-tooltip content="View / Edit YAML" placement="top">
              <el-button size="small" :icon="Document" circle aria-label="View or edit workflow YAML" @click="openViewYaml(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Run" placement="top">
              <el-button size="small" type="success" :icon="VideoPlay" circle aria-label="Run workflow" @click="openRun(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Runs history" placement="top">
              <el-button size="small" type="warning" :icon="List" circle aria-label="Runs history" @click="openRuns(scope.row)" />
            </el-tooltip>
            <el-tooltip content="Monitor latest run" placement="top">
              <el-button size="small" type="primary" :icon="Monitor" circle aria-label="Monitor latest run" @click="openMonitor(scope.row)" />
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

    <!-- View / edit YAML -->
    <el-drawer v-model="isShowYaml" size="50%">
      <template #header>
        <span><el-icon><Document /></el-icon>&nbsp;&nbsp;{{ yamlName }}</span>
      </template>
      <div v-loading="yamlLoading" class="yaml-wrap">
        <textarea v-model="yamlContent" class="yaml-box" :readonly="yamlLoading"></textarea>
      </div>
      <template #footer>
        <el-button @click="isShowYaml = false">
          Cancel
        </el-button>
        <el-button type="primary" :loading="yamlSaving" @click="saveYaml">
          Save
        </el-button>
      </template>
    </el-drawer>

    <!-- Run inputs dialog -->
    <el-dialog v-model="isShowRun" :title="`Run — ${runName}`" width="520px">
      <el-form v-loading="inputsLoading" label-width="140px">
        <el-form-item
          v-for="(param, key) in inputsSpec" :key="key" :label="key"
          :required="normParam(param).required"
        >
          <el-switch v-if="normParam(param).type === 'boolean'" v-model="inputsForm[key]" />
          <el-input-number v-else-if="normParam(param).type === 'number'" v-model="inputsForm[key]" />
          <el-input v-else v-model="inputsForm[key]" :placeholder="normParam(param).description || ''" />
          <div v-if="normParam(param).description" class="input-desc">
            {{ normParam(param).description }}
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

        <!-- nested run detail (self-contained RunDetail component) -->
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
      isShowAdd: false,
      addContent: "",
      addLoading: false,
      isShowYaml: false,
      yamlSaving: false,
      yamlName: "",
      yamlContent: "",
      yamlLoading: false,
      isShowRun: false,
      runName: "",
      inputsSpec: {},
      inputsForm: {},
      inputsLoading: false,
      runLoading: false,
      isShowRuns: false,
      runsName: "",
      runs: [],
      runsLoading: false,
      isShowDetail: false,
      detailRunId: "",
      // monitor latest run (live)
      isShowMonitor: false,
      monitorName: "",
      monitorRunId: "",
      monitorLoading: false
    };
  },
  computed: {
    // active forward target ("host:port") or "" — workflows are stored per node
    forwarding() {
      return this.$store.getters.forwarding || "";
    }
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
        case "cancelled": return "info";
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

    openMonitor(row) {
      if (!row) return;
      this.monitorName = row.name;
      this.monitorRunId = "";
      this.monitorLoading = true;
      this.isShowMonitor = true;
      workflow.listRuns(this, row.name).then(runs => {
        const list = runs || [];
        // prefer the active run; else newest by started_at (epoch number or ISO string).
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

    // a rerun inside Monitor created a new run -> follow it
    onMonitorRerun(newRunId) {
      if (newRunId) this.monitorRunId = newRunId;
    },

    // Scenario-A batch/DAG example; the session auto-creates per run keyed by run_id.
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
        // surface the engine's reason instead of failing silently
        ElMessage.error("Save failed: " + ((e && e.message) || "unknown error"));
      });
    },

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

    // Saving an existing name re-registers in place; run history is kept and
    // the server rejects a YAML whose `name:` differs from the drawer's.
    saveYaml() {
      if (!this.yamlContent.trim()) {
        ElMessage.warning("YAML content is empty");
        return;
      }
      this.yamlSaving = true;
      workflow.addWorkflow(this, this.yamlName, this.yamlContent).then(() => {
        this.yamlSaving = false;
        this.isShowYaml = false;
        this.fetchData();
      }, () => {
        this.yamlSaving = false;
      });
    },

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
          const p = this.normParam(spec[k]);
          if (p.type === "boolean") form[k] = p.def === true || p.def === "true";
          else if (p.type === "number") form[k] = p.def !== undefined && p.def !== "" ? Number(p.def) : 0;
          else form[k] = p.def !== undefined && p.def !== null ? String(p.def) : "";
        });
        this.inputsForm = form;
        this.isShowRun = true;
      }, () => {
        this.inputsLoading = false;
      });
    },
    // The engine serializes InputParam with lowercase json tags (type/required/
    // default/description); accept both cases so prefill/type/required keep working.
    normParam(p) {
      p = p || {};
      return {
        type: p.type || p.Type,
        required: p.required === true || p.Required === true,
        def: p.default !== undefined ? p.default : p.Default,
        description: p.description || p.Description || ""
      };
    },
    submitRun() {
      // Block empty required inputs; a cleared optional input with a default is
      // omitted so the engine's default applies (an empty string would be sent
      // as a present key and defeat the default).
      const inputs = {};
      for (const k of Object.keys(this.inputsForm)) {
        const p = this.normParam(this.inputsSpec[k]);
        const v = this.inputsForm[k];
        const empty = v === "" || v === undefined || v === null;
        if (empty && p.required) {
          ElMessage.warning(`Input "${k}" is required — please provide a value.`);
          return;
        }
        if (!empty) inputs[k] = String(v);
        else if (p.def === undefined) inputs[k] = ""; // optional, no default: present-but-empty (historical contract)
      }
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

    removeWorkflow(row) {
      if (!row) return;
      ElMessageBox.confirm(`Do you want to remove the workflow <${row.name}>?`, "Delete workflow", {
        confirmButtonText: "Confirm", cancelButtonText: "Cancel", type: "warning"
      }).then(() => {
        workflow.removeWorkflow(this, row.name).then(() => {
          this.fetchData();
        }, () => {});
      }).catch(() => {});
    },

    openRuns(row) {
      if (!row) return;
      this.runsName = row.name;
      this.runs = [];
      this.isShowRuns = true;
      this.refreshRuns();
    },
    // reset the nested run-detail so it unmounts (stops polling) when Runs closes
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

.page-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.node-tag {
  cursor: help;
}

/* keep table links (Name, Run ID) on one line; the cell handles ellipsis */
:deep(.el-table .el-link) {
  white-space: nowrap;
}

/* Flex-fill: page fills app-main; the table row fills the rest. No pixel heights. */
.app-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.app-container > .el-row.fill-row {
  flex: 1 1 auto;
  min-height: 0;
  margin-bottom: 0;
  /* el-row is a wrapping row-flex container: a height:100% child inside it resolves
     against content height and overflows. Block layout keeps the percentage chain
     so the table's horizontal scrollbar pins to the bottom of the viewport. */
  display: block;
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

/* Native textarea YAML editor; scoped works (the textarea carries the scope id through teleport). */
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
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background-color: var(--console-bg);
  color: var(--console-fg);
  font-family: var(--mono-font);
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
