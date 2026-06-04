<template>
  <div class="agent-chat">
    <div class="mode-bar">
      <el-radio-group v-model="mode" size="small">
        <el-radio-button value="batch">Quick answer</el-radio-button>
        <el-radio-button value="interactive">Live chat</el-radio-button>
      </el-radio-group>
    </div>

    <Interactive v-if="mode === 'interactive'" />

    <el-card v-else class="chat-card">
      <template #header>
        <div class="toolbar">
          <el-select
            v-model="selectedAgent" filterable placeholder="Select agent" :loading="agentsLoading"
            class="agent-select" @change="onAgentChange"
          >
            <el-option v-for="a in agents" :key="a.name" :label="a.name" :value="a.name" />
          </el-select>
          <span class="spacer" />
          <el-button size="small" :disabled="!selectedAgent" @click="newSession">New Session</el-button>
        </div>
      </template>

      <div class="chat-body">
        <div ref="scroller" class="messages">
          <div v-if="!messages.length" class="empty">
            <template v-if="!agentsLoading && !agents.length">
              No agents available yet — ask an admin to set one up in <b>Agents</b>.
            </template>
            <template v-else>Pick an agent and send a message to get a full answer.</template>
          </div>
          <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
            <div class="bubble">
              <pre>{{ m.content }}</pre>
              <div v-if="m.meta" class="meta">
                iterations: {{ m.meta.iterations }} · turn: {{ m.meta.turn_tokens }} tokens
              </div>
            </div>
          </div>
        </div>

        <div class="composer">
          <textarea
            v-model="input" class="input-area" :disabled="sending || !selectedAgent"
            aria-label="Message input"
            placeholder="Type a message… (Ctrl/Cmd+Enter to send)" @keydown="onKeydown"
          ></textarea>
          <el-button type="primary" :loading="sending" :disabled="!canSend" @click="send">Send</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ElMessageBox } from "element-plus";
import agentService from "@/services/agent";
import Interactive from "./Interactive.vue";

export default {
  name: "AgentChat",
  components: { Interactive },
  data() {
    return {
      mode: "batch",
      agents: [],
      agentsLoading: false,
      selectedAgent: "",
      sessionId: "",
      messages: [],
      input: "",
      sending: false,
      prevAgent: "",
    };
  },
  computed: {
    canSend() {
      return !!this.selectedAgent && !!this.input.trim() && !this.sending;
    },
  },
  mounted() {
    agentService.listChatAgents(this);
  },
  beforeUnmount() {
    if (this.selectedAgent && this.sessionId) {
      agentService.closeSession(this.selectedAgent, this.sessionId);
    }
  },
  methods: {
    onKeydown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.send();
      }
    },
    async onAgentChange() {
      // Switching agents abandons the current conversation — confirm if there's history.
      if (this.messages.length) {
        try {
          await ElMessageBox.confirm(
            "Switching agents will clear this conversation. Continue?",
            "Switch agent",
            { type: "warning", confirmButtonText: "Switch", cancelButtonText: "Cancel" }
          );
        } catch {
          this.selectedAgent = this.prevAgent; // user cancelled — revert the dropdown
          return;
        }
      }
      if (this.sessionId) {
        const prev = this.prevAgent || this.selectedAgent;
        if (prev) agentService.closeSession(prev, this.sessionId);
      }
      this.resetSession();
      this.prevAgent = this.selectedAgent;
    },
    newSession() {
      if (this.sessionId) agentService.closeSession(this.selectedAgent, this.sessionId);
      this.resetSession();
    },
    resetSession() {
      this.sessionId = "";
      this.messages = [];
    },
    ensureSession() {
      // A session id is caller-chosen; session_send get-or-creates it (no session_open).
      if (!this.sessionId) {
        this.sessionId = agentService.genSessionId();
        this.prevAgent = this.selectedAgent;
      }
      return this.sessionId;
    },
    async send() {
      if (!this.canSend) return;
      const text = this.input.trim();
      this.input = "";
      this.messages.push({ role: "user", content: text });
      this.scrollToBottom();
      this.sending = true;
      try {
        await this.ensureSession();
        const data = await agentService.sendMessage(this.selectedAgent, this.sessionId, text);
        this.messages.push({
          role: "assistant",
          content: data.answer || "",
          meta: { iterations: data.iterations, turn_tokens: data.turn_tokens },
        });
      } catch (e) {
        const msg = e.message || "request failed";
        if (/session not found|not found/i.test(msg)) {
          this.sessionId = ""; // expired/closed — the next send opens a fresh session
          this.messages.push({ role: "error", content: "Session expired. Send again to start a new one." });
        } else {
          this.messages.push({ role: "error", content: "Failed: " + msg });
        }
      } finally {
        this.sending = false;
        this.scrollToBottom();
      }
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
/* Flex-fill: app-main is a flex column, so the page flexes to fill the content
   area; no pixel heights -> can't overflow or leave a bottom gap. */
.agent-chat {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  padding: 10px;
  box-sizing: border-box;
}

.chat-card {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.chat-card :deep(.el-card__body) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden; /* push scrolling down to .messages; defeat EP default overflow:auto */
}

.chat-card :deep(.el-card__header) {
  padding: 10px 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar .agent-select {
  width: 220px;
}

.spacer {
  flex: 1;
}

.mode-bar {
  margin-bottom: 8px;
}

.chat-body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
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
  margin-top: 40px;
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

.bubble .meta {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.composer {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
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
