<template>
  <div class="app-container">
    <el-row style="color: #909399">
      <h4>Agents</h4>
    </el-row>
    <el-row>
      <el-button-group>
        <el-button type="primary" :icon="Plus" @click="openRegister">Register Agent</el-button>
        <el-button :icon="Refresh" @click="fetchData">Refresh</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="success" :icon="Open" :disabled="!isSelected || isEnabled" @click="enable">Enable</el-button>
        <el-button type="warning" :icon="TurnOff" :disabled="!isSelected || !isEnabled" @click="disable">Disable</el-button>
        <el-button type="danger" :icon="Delete" :disabled="!isSelected" @click="remove">Delete</el-button>
      </el-button-group>
    </el-row>

    <el-row>
      <el-table
        ref="agentTable" v-loading="listLoading" :data="list" border style="width: 100%" height="100%"
        class="fix-table" highlight-current-row show-overflow-tooltip @current-change="currentRowChange"
      >
        <el-table-column label="Name" min-width="220">
          <template #default="scope">
            <el-link underline="always" @click="showOutput(scope.row)">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="Type" min-width="120">
          <template #default="scope">
            <el-tag size="small" :type="isWorker(scope.row) ? 'warning' : 'primary'">
              {{ isWorker(scope.row) ? 'Session (B)' : 'Batch (A)' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Owner" min-width="100">
          <template #default="scope">{{ formatEmpty(scope.row.owner) }}</template>
        </el-table-column>
        <el-table-column label="State" min-width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? 'Enabled' : 'Disabled' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Health" min-width="90">
          <template #default="scope">
            <el-icon v-if="scope.row.health === 0" style="color: #85ce61; font-size: 18px; vertical-align: middle">
              <SuccessFilled />
            </el-icon>
            <el-icon v-else style="color: #f56c6c; font-size: 18px; vertical-align: middle"><WarningFilled /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="Memory" min-width="90">
          <template #default="scope">{{ formatMemory(scope.row.memory) }}</template>
        </el-table-column>
      </el-table>
    </el-row>

    <!-- Register dialog (admin). Credentials are sent to sec_env (encrypted); never logged. -->
    <el-dialog v-model="registerVisible" title="Register Agent App" width="600px" align-center>
      <el-form ref="regForm" :model="form" :rules="rules" label-width="140px">
        <el-form-item label="Provider" prop="provider">
          <el-select v-model="form.provider" style="width: 100%" @change="onProviderChange">
            <el-option label="Anthropic API (Claude)" value="anthropic" />
            <el-option label="Amazon Bedrock (Claude on Bedrock)" value="bedrock" />
            <el-option label="Google Vertex AI (Claude on Vertex)" value="vertex" />
            <el-option label="Custom Gateway (Gemini / Nova / OpenAI / DeepSeek / Qwen / GLM / MiniMax …)" value="gateway" />
          </el-select>
        </el-form-item>
        <el-form-item label="App Name" prop="name">
          <el-input v-model="form.name" placeholder="llm-agent" />
        </el-form-item>
        <el-form-item label="Working Dir" prop="workingDir">
          <el-input v-model="form.workingDir" placeholder="/opt/appmesh/lib/llm-agent (contains llm_agent package)" />
        </el-form-item>

        <el-form-item label="Model">
          <el-input v-model="form.model" :placeholder="modelPlaceholder" @input="userEdited.model = true" />
        </el-form-item>

        <!-- Anthropic API -->
        <template v-if="form.provider === 'anthropic'">
          <el-form-item label="API Key" prop="apiKey">
            <el-input
              v-model="form.apiKey" type="password" show-password autocomplete="new-password"
              placeholder="ANTHROPIC_API_KEY — stored encrypted (sec_env), not displayed afterwards"
            />
          </el-form-item>
          <el-form-item label="Base URL">
            <el-input
              v-model="form.baseUrl" placeholder="optional — ANTHROPIC_BASE_URL (proxy / gateway)"
              @input="userEdited.baseUrl = true"
            />
          </el-form-item>
        </template>

        <!-- Custom gateway: non-Claude models reached via an Anthropic-compatible endpoint -->
        <template v-else-if="form.provider === 'gateway'">
          <el-form-item label="Preset">
            <el-select v-model="form.gatewayPreset" style="width: 100%" @change="applyPreset(true)">
              <el-option
                v-for="p in gatewayPresets" :key="p.key" :label="p.label" :value="p.key"
              />
            </el-select>
          </el-form-item>
          <el-alert
            type="info" :closable="false" show-icon style="margin-bottom: 12px"
            title="Non-Claude models need an Anthropic-compatible endpoint"
            description="Presets (DeepSeek / Qwen / GLM / MiniMax) ship one natively — pick one and just enter the auth token. For others (OpenAI/Gemini), choose Custom and point Base URL at a translating gateway (e.g. LiteLLM proxy). Picking a preset fills the Model field above, Base URL, and the subagent/quick-call model aliases in Advanced env below."
          />
          <el-form-item label="Base URL" prop="baseUrl">
            <el-input
              v-model="form.baseUrl" placeholder="ANTHROPIC_BASE_URL — e.g. https://gateway.example.com"
              @input="userEdited.baseUrl = true"
            />
          </el-form-item>
          <el-form-item label="Auth Token" prop="authToken">
            <el-input
              v-model="form.authToken" type="password" show-password autocomplete="new-password"
              placeholder="ANTHROPIC_AUTH_TOKEN — gateway credential, stored encrypted (sec_env)"
            />
          </el-form-item>
        </template>

        <!-- Amazon Bedrock -->
        <template v-else-if="form.provider === 'bedrock'">
          <el-form-item label="AWS Region" prop="awsRegion">
            <el-input v-model="form.awsRegion" placeholder="AWS_REGION — e.g. us-east-1" />
          </el-form-item>
          <el-form-item label="Access Key ID">
            <el-input
              v-model="form.awsAccessKeyId"
              placeholder="optional — AWS_ACCESS_KEY_ID (an identifier, stored in env). Empty = use an instance role."
            />
          </el-form-item>
          <el-form-item label="Secret Access Key">
            <el-input
              v-model="form.awsSecretAccessKey" type="password" show-password autocomplete="new-password"
              placeholder="optional — AWS_SECRET_ACCESS_KEY (sec_env)"
            />
          </el-form-item>
        </template>

        <!-- Google Vertex AI -->
        <template v-else-if="form.provider === 'vertex'">
          <el-alert
            type="info" :closable="false" show-icon style="margin-bottom: 12px"
            title="Vertex uses Application Default Credentials (ADC)"
            description="Mount a service-account key and set GOOGLE_APPLICATION_CREDENTIALS to its path via Advanced env below, or rely on the host's ADC."
          />
          <el-form-item label="GCP Project" prop="vertexProject">
            <el-input v-model="form.vertexProject" placeholder="ANTHROPIC_VERTEX_PROJECT_ID" />
          </el-form-item>
          <el-form-item label="Region" prop="vertexRegion">
            <el-input v-model="form.vertexRegion" placeholder="CLOUD_ML_REGION — e.g. us-east5" />
          </el-form-item>
        </template>

        <!-- Advanced: non-secret extra env (escape hatch for knobs not covered above) -->
        <el-form-item label="Advanced env">
          <div style="width: 100%">
            <div style="color: #909399; font-size: 12px; line-height: 1.5; margin-bottom: 6px">
              Non-secret config only. Secret-looking names (key / token / secret) are dropped on save —
              put credentials in the fields above so they're encrypted.
            </div>
            <div v-for="(e, i) in form.extraEnv" :key="i" style="display: flex; gap: 8px; margin-bottom: 6px">
              <el-input v-model="e.name" placeholder="NAME" style="flex: 1" />
              <el-input v-model="e.value" placeholder="value (non-secret)" style="flex: 2" />
              <el-button :icon="Delete" @click="form.extraEnv.splice(i, 1)" />
            </div>
            <el-button size="small" :icon="Plus" @click="form.extraEnv.push({ name: '', value: '' })">
              Add env var
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="Description">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="registerVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="registering" @click="submitRegister">Register</el-button>
      </template>
    </el-dialog>

    <!-- Output drawer -->
    <el-drawer v-model="outputVisible" :title="`Output — ${outputName}`" size="50%">
      <pre class="output-pre">{{ output || 'No output.' }}</pre>
    </el-drawer>
  </div>
</template>

<script>
import { markRaw } from "vue";
import { Plus, Delete, Open, TurnOff, Refresh, SuccessFilled, WarningFilled } from "@element-plus/icons-vue";
import agentService from "@/services/agent";
import { formatEmpty, formatMemory } from "@/utils";

export default {
  name: "AgentManage",
  components: { SuccessFilled, WarningFilled },
  data() {
    return {
      Plus: markRaw(Plus), Delete: markRaw(Delete), Open: markRaw(Open),
      TurnOff: markRaw(TurnOff), Refresh: markRaw(Refresh),
      list: [],
      listLoading: false,
      currentRow: null,
      registerVisible: false,
      registering: false,
      outputVisible: false,
      outputName: "",
      output: "",
      form: this.emptyForm(),
      // Tracks whether the user has typed in a field, so preset/provider selection only
      // fills defaults the user hasn't supplied (never clobbers manual input).
      userEdited: { model: false, baseUrl: false },
    };
  },
  computed: {
    isSelected() { return !!this.currentRow; },
    isEnabled() { return this.currentRow && this.currentRow.status === 1; },
    gatewayPresets() { return agentService.gatewayPresets(); },
    // Required fields depend on the selected provider (e.g. Anthropic needs an API key;
    // a gateway needs base URL + auth token; Bedrock/Vertex can rely on roles/ADC).
    rules() {
      const req = (msg) => [{ required: true, message: msg, trigger: "blur" }];
      const r = {
        name: req("App name is required"),
        workingDir: req("Working dir is required"),
        provider: req("Provider is required"),
      };
      if (this.form.provider === "anthropic") {
        r.apiKey = req("Claude API key is required");
      } else if (this.form.provider === "gateway") {
        r.baseUrl = req("Gateway base URL is required");
        r.authToken = req("Gateway auth token is required");
      } else if (this.form.provider === "bedrock") {
        r.awsRegion = req("AWS region is required");
      } else if (this.form.provider === "vertex") {
        r.vertexProject = req("GCP project is required");
        r.vertexRegion = req("Region is required");
      }
      return r;
    },
    modelPlaceholder() {
      switch (this.form.provider) {
        case "gateway": return "the model your gateway serves, e.g. gpt-4o";
        case "bedrock": return "Bedrock model id, e.g. anthropic.claude-opus-4-8";
        case "vertex": return "Vertex model id, e.g. claude-opus-4-8";
        default: return "optional, e.g. claude-opus-4-8 (default: the CLI's configured model)";
      }
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    formatEmpty, formatMemory,
    emptyForm() {
      return {
        name: "", workingDir: "", provider: "anthropic", model: "", description: "",
        apiKey: "", baseUrl: "",                              // anthropic / gateway base url
        gatewayPreset: "custom",                              // gateway provider preset
        authToken: "",                                        // gateway
        awsRegion: "", awsAccessKeyId: "", awsSecretAccessKey: "", // bedrock
        vertexProject: "", vertexRegion: "",                  // vertex
        extraEnv: [],                                         // non-secret extra env
      };
    },
    // Preset dropdown changed by the user (explicit=true): authoritative — reset the edit
    // flags so the preset re-fills Base URL / Model even if a prior selection filled them.
    applyPreset(explicit) {
      if (explicit === true) { this.userEdited.model = false; this.userEdited.baseUrl = false; }
      agentService.applyGatewayPreset(this.form, this.form.gatewayPreset, this.userEdited);
    },
    // Provider picked: for gateway, re-apply the selected preset so Model/Base URL stay
    // consistent with it; for the others, drop any preset alias env left over from gateway
    // and suggest the provider's default model (only if the user hasn't typed one).
    onProviderChange() {
      if (this.form.provider === "gateway") { this.applyPreset(); return; }
      this.form.extraEnv = agentService.stripPresetEnv(this.form.extraEnv);
      if (!this.userEdited.model) this.form.model = agentService.defaultModelFor(this.form.provider);
    },
    isWorker(row) { return row.name && row.name.includes("-sess-"); },
    fetchData() { agentService.listAgentApps(this); },
    currentRowChange(row) { this.currentRow = row; },
    enable() { agentService.enableApp(this, this.currentRow.name); },
    disable() { agentService.disableApp(this, this.currentRow.name); },
    remove() { agentService.removeApp(this, this.currentRow.name); },
    openRegister() {
      this.form = this.emptyForm();
      this.userEdited = { model: false, baseUrl: false };
      this.registerVisible = true;
      this.$nextTick(() => this.$refs.regForm && this.$refs.regForm.clearValidate());
    },
    submitRegister() {
      this.$refs.regForm.validate((valid) => {
        if (!valid) return;
        this.registering = true;
        agentService.registerAgentApp(this, this.form)
          .then(() => { this.registerVisible = false; })
          .finally(() => { this.registering = false; });
      });
    },
    showOutput(row) {
      this.outputName = row.name;
      this.output = "";
      this.outputVisible = true;
      agentService.loadOutput(this, row.name);
    },
  },
};
</script>

<style scoped>
.el-row {
  margin-bottom: 8px;
}

/* Flex-fill: page flexes to fill app-main, the table row fills what's left below
   the title/toolbar — no pixel heights, so no bottom gap. */
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

.output-pre {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, Menlo, Courier, monospace;
  font-size: 13px;
  margin: 0;
}
</style>
