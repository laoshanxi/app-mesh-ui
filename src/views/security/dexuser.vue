<template>
  <div class="app-container dexuser-container">
    <div class="page-title">Users</div>
    <el-alert
      v-if="available === false" type="warning" :closable="false" show-icon
      title="The bundled user administration UI (dexuser) is not reachable"
    >
      <p>
        The dexuser System App serves on loopback only (default http://127.0.0.1:6064) and is proxied
        at /dexuser/ by the UI gateway. It is unavailable when the App is stopped, built without the
        admin UI, or the gateway cannot reach the daemon host.
      </p>
      <p>Direct access through SSH port forwarding:</p>
      <pre>ssh -L 6064:127.0.0.1:6064 &lt;host&gt;</pre>
    </el-alert>
    <iframe
      v-else-if="available" class="dexuser-frame" src="/dexuser/admin?section=passwords"
      title="User administration"
    />
    <div v-else v-loading="true" class="dexuser-loading" element-loading-text="Loading" />
  </div>
</template>

<script>
// Embeds the bundled dexuser administration UI (users, clients, sessions, MFA) served by the
// dexuser System App. dexuser requires an authenticated session: the engine bearer token is
// exchanged for its HttpOnly session cookie via POST /dexuser/session before the iframe loads
// (an iframe cannot send the SPA's Authorization header itself). Menu access is gated by the
// principal-set permission and the gateway proxies it under /dexuser/.
import { ensureFreshToken } from "@/utils/oidc";

export default {
  name: "DexUserAdmin",
  data() {
    return {
      available: null,
    };
  },
  async mounted() {
    try {
      // ensureFreshToken() reuses the SPA token chain (proactive refresh near
      // expiry), same as every other API call; credentials: "same-origin"
      // stores the returned HttpOnly cookie for the iframe's requests.
      // A later session expiry surfaces as dexuser's own error page inside the
      // frame; re-running this POST (e.g. on iframe 401) is a future addition.
      const token = await ensureFreshToken();
      const res = await fetch("/dexuser/session", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "same-origin",
      });
      this.available = res.ok;
    } catch {
      this.available = false;
    }
  },
};
</script>

<style scoped>
.dexuser-container {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.dexuser-frame {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  border: 0;
}

.dexuser-loading {
  flex: 1 1 auto;
}
</style>
