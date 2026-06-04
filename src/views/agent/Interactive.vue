<template>
  <div class="interactive">
    <!-- session sidebar -->
    <div class="sessions">
      <div class="sessions-head">
        <el-select
          v-model="template" filterable size="small" placeholder="Agent" :loading="agentsLoading"
          class="tpl-select"
        >
          <el-option v-for="a in agents" :key="a.name" :label="a.name" :value="a.name" />
        </el-select>
        <el-button size="small" type="primary" :loading="creating" :disabled="!template" @click="newSession">
          + New
        </el-button>
      </div>
      <div class="session-list">
        <div v-if="!sessions.length" class="empty-side">No live chats yet.</div>
        <div
          v-for="s in sessions" :key="s.sid" class="session-item"
          :class="{ active: s.sid === activeSid, ended: s.ended }"
          @click="activeSid = s.sid"
        >
          <div class="s-title">
            <el-tag size="small" :type="s.ended ? 'info' : 'success'">
              {{ s.ended ? "ended" : "active" }}
            </el-tag>
            <span class="s-name">{{ s.template }}</span>
          </div>
          <el-icon class="s-close" title="End chat" @click.stop="closeSession(s)"><Close /></el-icon>
        </div>
      </div>
    </div>

    <!-- conversation -->
    <div class="conversation">
      <template v-if="active">
        <div class="conv-head">
          <span class="conv-name">{{ active.template }}</span>
          <el-tag v-if="active.ended" size="small" type="info">ended</el-tag>
          <span class="spacer" />
        </div>
        <div ref="scroller" class="messages">
          <div v-for="(m, i) in active.messages" :key="i" class="msg" :class="m.role">
            <div class="bubble">
              <pre>{{ m.content }}<span v-if="m.streaming" class="caret">▋</span></pre>
            </div>
          </div>
        </div>
        <div class="composer">
          <textarea
            v-model="active.input" class="input-area" :disabled="active.sending"
            aria-label="Message input"
            placeholder="Type a message… (Ctrl/Cmd+Enter to send)" @keydown="onKeydown"
          ></textarea>
          <el-button type="primary" :loading="active.sending" :disabled="!canSend" @click="send">Send</el-button>
        </div>
      </template>
      <div v-else class="empty">
        <template v-if="creating">Starting your chat…</template>
        <template v-else-if="!agentsLoading && !agents.length">
          No agents available yet — ask an admin to set one up in <b>Agents</b>.
        </template>
        <template v-else>Choose an agent and click <b>+ New</b> to start a live, streaming chat.</template>
      </div>
    </div>

    <!-- Credential prompt — secrets aren't cloned from the template, so each session
         re-enters the provider credential (its kind depends on the template's provider). -->
    <el-dialog v-model="keyVisible" :title="`Enter your ${credLabel}`" width="460px" align-center>
      <p style="color: #909399; margin-top: 0">
        Enter your {{ credLabel }} to start the chat — it's stored
        encrypted and used only for this conversation.
        <template v-if="templateProvider === 'vertex'">
          (Vertex uses ADC; leave blank if the host provides credentials.)
        </template>
      </p>
      <el-input
        v-model="pendingKey" type="password" show-password autocomplete="new-password"
        :placeholder="credLabel"
      />
      <template #footer>
        <el-button @click="keyVisible = false">Cancel</el-button>
        <el-button
          type="primary" :loading="creating"
          :disabled="!pendingKey && templateProvider !== 'vertex'" @click="confirmKey"
        >
          Create
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Close } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import agentService from "@/services/agent";

export default {
  name: "AgentInteractive",
  components: { Close },
  data() {
    return {
      agents: [],
      agentsLoading: false,
      selectedAgent: "", // written by the shared listChatAgents helper; unused here (we use `template`)
      template: "",
      sessions: [],
      activeSid: "",
      creating: false,
      // credential prompt (provider-specific; vertex skips it — uses ADC)
      keyVisible: false,
      pendingKey: "",
    };
  },
  computed: {
    active() {
      return this.sessions.find(s => s.sid === this.activeSid) || null;
    },
    canSend() {
      return this.active && !!this.active.input.trim() && !this.active.sending;
    },
    // The selected template's provider drives which credential a new session re-enters.
    templateProvider() {
      const app = this.agents.find(a => a.name === this.template);
      return agentService.envToMap(app && app.env).LLMAGENT_PROVIDER || "anthropic";
    },
    credLabel() {
      switch (this.templateProvider) {
        case "gateway": return "gateway auth token";
        case "bedrock": return "AWS secret access key";
        case "vertex": return "credential";
        default: return "Claude API key";
      }
    },
  },
  mounted() {
    agentService.listChatAgents(this).then(agents => {
      if (!this.template && agents.length) {
        const def = agents.find(a => a.name === "llm-agent");
        this.template = def ? def.name : agents[0].name;
      }
    });
  },
  beforeUnmount() {
    // Best-effort cleanup of every open worker on navigation away.
    this.sessions.forEach(s => agentService.closeWorker(s.name, s.sid));
  },
  methods: {
    onKeydown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.send();
      }
    },
    newSession() {
      if (!this.template) return;
      // Vertex uses ADC — there's no static credential to enter, so skip the prompt.
      if (this.templateProvider === "vertex") { this.provision(""); return; }
      this.pendingKey = "";
      this.keyVisible = true; // each session re-enters its provider credential
    },
    confirmKey() {
      this.keyVisible = false;
      this.provision(this.pendingKey);
    },
    async provision(apiKey) {
      this.creating = true;
      try {
        const owner = this.$store.getters.name;
        const built = await agentService.createWorker(this.template, owner, apiKey);
        this.sessions.push({
          sid: built.sid,
          name: built.name,
          template: this.template,
          messages: [],
          input: "",
          sending: false,
          outPos: 0,
        });
        this.activeSid = built.sid;
      } catch (e) {
        ElMessage.error("Create session failed: " + e.message);
      } finally {
        this.creating = false;
        this.pendingKey = "";
      }
    },
    async send() {
      const s = this.active;
      if (!s || !s.input.trim() || s.sending) return;
      const text = s.input.trim();
      s.input = "";
      s.messages.push({ role: "user", content: text });
      const reply = { role: "assistant", content: "", streaming: true };
      s.messages.push(reply);
      s.sending = true;
      this.scrollToBottom();
      try {
        const { meta, position } = await agentService.sendInteractive(
          s.name, s.sid, text,
          (chunk) => { reply.content += chunk; this.scrollToBottom(); },
          s.outPos
        );
        s.outPos = position;
        // Fallback: if streaming produced nothing, show the final answer from metadata.
        if (!reply.content && meta.answer) reply.content = meta.answer;
      } catch (e) {
        const msg = e.message || "request failed";
        const ended = /session not found|not found|no such app|404/i.test(msg);
        reply.content = (reply.content ? reply.content + "\n" : "") +
          (ended ? "Session ended — close it and start a new chat." : "Failed: " + msg);
        reply.role = "error";
        if (ended) s.ended = true;
      } finally {
        reply.streaming = false;
        s.sending = false;
        this.scrollToBottom();
      }
    },
    closeSession(s) {
      agentService.closeWorker(s.name, s.sid);
      this.sessions = this.sessions.filter(x => x.sid !== s.sid);
      if (this.activeSid === s.sid) {
        this.activeSid = this.sessions.length ? this.sessions[0].sid : "";
      }
      ElMessage.success("Session closed.");
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.scroller;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
.interactive {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.sessions {
  width: 220px;
  border-right: 1px solid #ebeef5;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.sessions-head {
  display: flex;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid #ebeef5;
}

.tpl-select {
  flex: 1;
  min-width: 0;
}

.session-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.empty-side {
  color: #c0c4cc;
  font-size: 13px;
  text-align: center;
  margin-top: 20px;
}

.session-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.session-item.active {
  background-color: #ecf5ff;
}

.session-item.ended {
  opacity: 0.55;
}

.session-item .s-title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.s-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.s-close {
  color: #c0c4cc;
}

.s-close:hover {
  color: #f56c6c;
}

.conversation {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.conv-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
}

.conv-name {
  font-weight: 600;
}

.spacer {
  flex: 1;
}

.messages {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
}

.empty {
  color: #909399;
  text-align: center;
  margin-top: 60px;
}

.msg {
  display: flex;
  margin-bottom: 12px;
}

.msg.user {
  justify-content: flex-end;
}

.msg .bubble {
  max-width: 78%;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #fff;
  border: 1px solid #ebeef5;
}

.msg.user .bubble {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.msg.error .bubble {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

.bubble pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 14px;
}

.caret {
  animation: blink 1s steps(2, start) infinite;
}

@keyframes blink {
  to {
    visibility: hidden;
  }
}

.composer {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border-top: 1px solid #ebeef5;
  background-color: #fff;
}

.input-area {
  flex: 1;
  height: 60px;
  box-sizing: border-box;
  resize: none;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.input-area:focus {
  border-color: #409eff;
}
</style>
