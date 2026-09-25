<template>
  <div class="run-detail">
    <!-- runs history (standalone mode only) -->
    <template v-if="!runId">
      <div class="page-title">Runs &mdash; {{ workflow }}</div>
      <el-row>
        <el-button-group>
          <el-button type="primary" :icon="Refresh" @click="fetchRuns">
            Refresh
          </el-button>
          <el-button :icon="Back" :disabled="!internalRunId" @click="backToRuns">
            Back to runs
          </el-button>
        </el-button-group>
      </el-row>

      <el-row v-show="!internalRunId">
        <el-table
          v-loading="runsLoading" :data="runs" element-loading-text="Loading" border style="width: 100%"
          highlight-current-row
        >
          <el-table-column label="Run ID" min-width="220">
            <template #default="scope">
              <el-link underline="always" @click="openRun(scope.row)">
                {{ scope.row.run_id }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="Status" width="120">
            <template #default="scope">
              <el-tag :type="statusTagType(scope.row.status)">
                {{ scope.row.status || "-" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Source" width="110">
            <template #default="scope">
              {{ formatEmpty(scope.row.source) }}
            </template>
          </el-table-column>
          <el-table-column label="Actor" width="120">
            <template #default="scope">
              {{ formatEmpty(scope.row.actor) }}
            </template>
          </el-table-column>
          <el-table-column label="Started At" width="200">
            <template #default="scope">
              {{ scope.row.started_at ? formatToLocalIso(scope.row.started_at) : "-" }}
            </template>
          </el-table-column>
          <el-table-column label="Duration" width="110">
            <template #default="scope">
              {{ formatDuration(scope.row.duration) }}
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </template>

    <!-- single-run detail -->
    <div v-if="effectiveRunId" v-loading="detailLoading" class="run-detail">
      <div class="run-head">
        <span class="rid">{{ effectiveRunId }}</span>
        <el-tag :type="statusTagType(runStatus)">{{ runStatus || "-" }}</el-tag>
        <el-tag v-if="pollTimer" type="warning" effect="plain">● live</el-tag>
        <span class="sp"></span>
        <el-button size="small" type="success" :icon="VideoPlay" @click="onRerun">
          Rerun
        </el-button>
        <el-button size="small" type="warning" :icon="Close" :disabled="runStatus !== 'running' && runStatus !== 'pending'" @click="onCancel">
          Cancel
        </el-button>
      </div>

      <!-- jobs / pruned-run info (scrolls) -->
      <div class="section-title"><span>Jobs</span></div>
      <div class="run-jobs">
        <template v-if="!hasJobs">
          <el-alert
            type="info" :closable="false"
            title="Detailed job/step data is not available for this run (it may have been pruned). Step logs and the flow log are disabled."
          />
          <json-viewer :value="detail || {}" :expand-depth="3" copyable boxed sort />
        </template>
        <template v-else>
          <div v-for="job in orderedJobs" :key="job.name" class="job-block">
            <div class="job-head">
              <el-tag :type="statusTagType(job.status)">
                {{ job.status || "-" }}
              </el-tag>
              <span class="job-name">{{ job.name }}</span>
              <span v-if="job.node" class="job-node">node: {{ job.node }}</span>
              <span v-if="job.finished_at" class="job-node">finished: {{ formatToLocalIso(job.finished_at) }}</span>
            </div>
            <el-table :data="job.steps" border size="small" style="width: 100%">
              <el-table-column label="Step" min-width="180">
                <template #default="scope">
                  <el-link underline="always" @click="openStepLog(job.name, scope.row.name)">
                    {{ scope.row.name }}
                  </el-link>
                </template>
              </el-table-column>
              <el-table-column label="Status" width="120">
                <template #default="scope">
                  <el-tag :type="statusTagType(scope.row.status)">
                    {{ scope.row.status || "-" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Exit" width="80">
                <template #default="scope">
                  {{ formatEmpty(scope.row.exit_code) }}
                </template>
              </el-table-column>
              <el-table-column label="Agent" width="110">
                <template #default="scope">
                  <el-tooltip
                    v-if="agentAppFor(job.name, scope.row.name)" placement="top"
                    :content="`This step calls LLM agent: ${agentAppFor(job.name, scope.row.name)}`"
                  >
                    <el-tag size="small" type="primary" effect="plain">LLM Agent</el-tag>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </div>

      <!-- flow log (fills remaining height) -->
      <div class="run-log">
        <div class="section-title"><span>Flow Log</span></div>
        <textarea ref="flowBox" v-model="flowLog" readonly class="log-box" placeholder="No flow log."></textarea>
      </div>
    </div>

    <!-- step stdout drawer -->
    <el-drawer v-model="stepLogVisible" size="50%" append-to-body @close="stopStepLog">
      <template #header>
        <span>{{ stepLogTitle }}</span>
        <el-tag v-if="stepLogTimer" type="warning" effect="plain" size="small" style="margin-left: 8px">● live</el-tag>
      </template>
      <div v-loading="stepLogLoading" class="detail-card">
        <textarea ref="stepBox" v-model="stepLog" readonly class="log-box log-box--tall" placeholder="No stdout for this step."></textarea>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import yaml from "js-yaml";
import workflow from "@/services/workflow";
import { formatEmpty, formatToLocalIso } from "@/utils";
import { markRaw } from "vue";
import { ElMessageBox } from "element-plus";
import { Refresh, Back, Close, VideoPlay } from "@element-plus/icons-vue";

export default {
  name: "WorkflowRunDetail",
  props: {
    workflow: { type: String, required: true },
    // when provided, render only the single-run detail (host owns the runs table)
    runId: { type: String, default: "" }
  },
  emits: ["changed", "rerun"],
  data() {
    return {
      Refresh: markRaw(Refresh),
      Back: markRaw(Back),
      Close: markRaw(Close),
      VideoPlay: markRaw(VideoPlay),

      runs: [],
      runsLoading: false,

      // standalone-mode selection (no runId prop)
      internalRunId: "",
      internalRunRow: null,

      detail: null, // run_detail payload (RunRecord or degraded RunIndex)
      detailLoading: false,

      flowLog: "",

      stepLogVisible: false,
      stepLogLoading: false,
      stepLog: "",
      stepLogTitle: "",
      stepLogJob: "",
      stepLogStep: "",
      stepLogTimer: null,

      // live monitoring: re-fetch while the run is active
      pollTimer: null,

      // jobName -> { stepName -> app } from the workflow YAML, to flag llm-agent steps
      stepApps: {}
    };
  },
  computed: {
    effectiveRunId() {
      return this.runId || this.internalRunId;
    },
    runStatus() {
      return (this.detail && this.detail.status) || (this.internalRunRow && this.internalRunRow.status) || "";
    },
    // RunRecord has a .jobs map; pruned/old runs degrade to RunIndex (no jobs)
    hasJobs() {
      return !!(this.detail && this.detail.jobs && typeof this.detail.jobs === "object");
    },
    // jobs/steps sorted by name; no fabricated `needs` edges (the record has no DAG topology)
    orderedJobs() {
      if (!this.hasJobs) return [];
      return Object.keys(this.detail.jobs)
        .sort()
        .map(jobName => {
          const job = this.detail.jobs[jobName] || {};
          const stepsMap = job.steps || {};
          const steps = Object.keys(stepsMap)
            .sort()
            .map(stepName => ({ name: stepName, ...stepsMap[stepName] }));
          return {
            name: jobName,
            status: job.status,
            node: job.node,
            finished_at: job.finished_at,
            steps
          };
        });
    }
  },
  watch: {
    runId: {
      immediate: true,
      handler(id) {
        if (id) this.fetchDetail();
        else this.stopMonitor();
      }
    }
  },
  created() {
    if (!this.runId) this.fetchRuns();
    this.loadStepApps();
  },
  unmounted() {
    this.stopMonitor();
    this.stopStepLog();
  },
  methods: {
    formatEmpty,
    formatToLocalIso,

    statusTagType(status) {
      switch ((status || "").toLowerCase()) {
        case "success":
          return "success";
        case "failure":
          return "danger";
        case "cancelled":
          return "info";
        case "running":
          return "warning";
        case "pending":
        case "skipped":
        default:
          return "info";
      }
    },

    formatDuration(d) {
      if (d === undefined || d === null || d === 0) return "-";
      return `${Math.round(d)}s`;
    },

    // Map steps to the App their `message` calls, to flag LLM-agent steps; best-effort.
    loadStepApps() {
      workflow.getWorkflow(this, this.workflow).then(text => {
        const map = {};
        try {
          const doc = yaml.load(text) || {};
          const jobs = doc.jobs || {};
          Object.keys(jobs).forEach(jobName => {
            const stepsDef = (jobs[jobName] || {}).steps;
            const perStep = {};
            const collect = (name, def) => {
              const app = def && def.message && def.message.app;
              if (name && app) perStep[name] = app;
            };
            if (Array.isArray(stepsDef)) {
              stepsDef.forEach(s => collect(s && s.name, s));
            } else if (stepsDef && typeof stepsDef === "object") {
              Object.keys(stepsDef).forEach(name => collect(name, stepsDef[name]));
            }
            map[jobName] = perStep;
          });
        } catch { /* malformed YAML -> no badges */ }
        this.stepApps = map;
      }).catch(() => { /* no read permission / not found -> no badges */ });
    },

    // target App name if this step drives a Scenario-A llm-agent, else null
    agentAppFor(jobName, stepName) {
      const app = this.stepApps[jobName] && this.stepApps[jobName][stepName];
      if (!app || app.includes("-sess-")) return null;
      return (app === "llm-agent" || app.startsWith("llm-agent-")) ? app : null;
    },


    fetchRuns() {
      this.runsLoading = true;
      workflow
        .listRuns(this, this.workflow)
        .then(runs => {
          this.runs = runs || [];
        })
        .catch(() => {
          // onError already toasted
        })
        .finally(() => {
          this.runsLoading = false;
        });
    },

    openRun(row) {
      this.internalRunRow = row;
      this.internalRunId = row.run_id;
      this.fetchDetail();
    },

    backToRuns() {
      this.stopMonitor();
      this.internalRunId = "";
      this.internalRunRow = null;
      this.detail = null;
      this.flowLog = "";
    },

    // silent=true (live monitor): refresh in place without clearing the view/spinner
    fetchDetail(silent = false) {
      const runId = this.effectiveRunId;
      if (!runId) return;
      if (!silent) {
        this.detailLoading = true;
        this.flowLog = "";
        this.detail = null;
      }
      workflow
        .getRunDetail(this, this.workflow, runId)
        .then(detail => {
          this.detail = detail || {};
          // flow log is only present for non-pruned runs
          if (this.hasJobs) {
            this.fetchLog();
          }
          this.scheduleMonitor();
        })
        .catch(() => {})
        .finally(() => {
          if (!silent) this.detailLoading = false;
        });
    },

    // Live follow: refresh while active, stop at terminal status; single re-armed timeout.
    scheduleMonitor() {
      this.stopMonitor();
      const st = (this.runStatus || "").toLowerCase();
      if (st === "running" || st === "pending") {
        this.pollTimer = setTimeout(() => {
          if (this.effectiveRunId) this.fetchDetail(true);
        }, 2500);
      }
    },

    stopMonitor() {
      if (this.pollTimer) {
        clearTimeout(this.pollTimer);
        this.pollTimer = null;
      }
    },

    fetchLog() {
      const runId = this.effectiveRunId;
      if (!runId || !this.hasJobs) return;
      workflow
        .getLog(this, this.workflow, runId)
        .then(log => {
          this.flowLog = log || "";
          // tail: keep the latest lines in view
          this.$nextTick(() => {
            const el = this.$refs.flowBox;
            if (el) el.scrollTop = el.scrollHeight;
          });
        })
        .catch(() => {
          // "log not found" already toasted
          this.flowLog = "";
        });
    },

    openStepLog(job, step) {
      if (!this.effectiveRunId) return;
      this.stepLogJob = job;
      this.stepLogStep = step;
      this.stepLogTitle = `${job} / ${step}`;
      this.stepLog = "";
      this.stepLogVisible = true;
      this.stepLogLoading = true;
      this.fetchStepLog(false);
    },

    // silent=true: live re-poll without spinner/transient blanking
    fetchStepLog(silent = false) {
      const runId = this.effectiveRunId;
      if (!runId || !this.stepLogJob) return;
      workflow
        .getStepLog(this, this.workflow, runId, this.stepLogJob, this.stepLogStep)
        .then(out => {
          this.stepLog = out || "";
          this.$nextTick(() => {
            const el = this.$refs.stepBox;
            if (el) el.scrollTop = el.scrollHeight;
          });
        })
        .catch(() => {
          if (!silent) this.stepLog = "";
        })
        .finally(() => {
          this.stepLogLoading = false;
          this.scheduleStepLog();
        });
    },

    // Live follow of step stdout while the drawer is open and the run is active.
    scheduleStepLog() {
      this.stopStepLog();
      const st = (this.runStatus || "").toLowerCase();
      if (this.stepLogVisible && (st === "running" || st === "pending")) {
        this.stepLogTimer = setTimeout(() => this.fetchStepLog(true), 2500);
      }
    },

    stopStepLog() {
      if (this.stepLogTimer) {
        clearTimeout(this.stepLogTimer);
        this.stepLogTimer = null;
      }
    },

    onCancel() {
      const runId = this.effectiveRunId;
      if (!runId) return;
      ElMessageBox.confirm(
        `Cancel run ${runId}?`,
        "Confirm Cancel",
        { type: "warning", confirmButtonText: "Cancel Run", cancelButtonText: "Keep Running" }
      )
        .then(() => workflow.cancel(this, this.workflow, runId))
        .then(() => {
          this.fetchDetail();
          if (!this.runId) this.fetchRuns();
          this.$emit("changed");
        })
        .catch(() => {
          // user dismissed or already toasted
        });
    },

    onRerun() {
      const runId = this.effectiveRunId;
      if (!runId) return;
      ElMessageBox.confirm(
        `Rerun ${runId} with the same inputs?`,
        "Confirm Rerun",
        { type: "info", confirmButtonText: "Rerun", cancelButtonText: "Cancel" }
      )
        .then(() => workflow.rerun(this, this.workflow, runId))
        .then(res => {
          const newRunId = res && res.data && res.data.run_id;
          if (!this.runId) {
            // standalone: switch our own detail view to the new run
            this.fetchRuns();
            if (newRunId) {
              this.stopMonitor();
              this.internalRunRow = null;
              this.internalRunId = newRunId;
              this.fetchDetail();
            } else {
              this.backToRuns();
            }
          } else if (newRunId) {
            // prop-driven mode: the host owns the run_id, ask it to switch
            this.$emit("rerun", newRunId);
          }
          this.$emit("changed");
        })
        .catch(() => {});
    }
  }
};
</script>

<style lang="scss" scoped>
.el-row {
  margin-bottom: 8px;
}

/* single-run detail fills the drawer; jobs scroll, flow log takes the rest */
.run-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden; /* run-detail manages its own inner scroll; don't spill into the outer card */
}

.run-jobs {
  flex: 0 1 auto;
  overflow-y: auto;
  max-height: 50%;
  min-height: 0;
}

.run-log {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.run-log .log-box {
  flex: 1 1 auto;
  height: auto;
  min-height: 0; /* allow the textarea to shrink to the flex space (no overflow) */
}

/* run header: id + status + live + actions all on one line */
.run-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.run-head .rid {
  font-weight: 600;
}

.run-head .sp {
  flex: 1;
}

.job-block {
  margin-bottom: 14px;
}

.job-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.job-head .job-name {
  font-weight: 600;
}

.job-head .job-node {
  color: #909399;
  font-size: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding-left: 9px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-left: 3px solid #409eff;
}

.detail-card {
  height: calc(100vh - 77px) !important;
  overflow-y: auto;
}

/* native textarea log surface — full width, Shell console palette, compact */
.log-box {
  display: block;
  width: 100%;
  height: 220px;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #1b2948;
  border-radius: 4px;
  background-color: #001528;
  color: #bfcbd9;
  font-family: "Menlo", "Monaco", "Consolas", monospace;
  font-size: 12px;
  line-height: 1.5;
  resize: none;
  outline: none;
}

.log-box--tall {
  height: calc(100vh - 170px);
}
</style>
